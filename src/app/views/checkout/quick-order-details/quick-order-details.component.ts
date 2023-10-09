import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/api.service';
import { CheckoutService } from '../../../services/checkout.service';
import { CommonService } from '../../../services/common.service';
import { CurrencyConversionService } from '../../../services/currency-conversion.service';

@Component({
  selector: 'app-quick-order-details',
  templateUrl: './quick-order-details.component.html',
  styleUrls: ['./quick-order-details.component.scss']
})

export class QuickOrderDetailsComponent implements OnInit {

  pageLoader: boolean;
  item_list: any = []; orderForm: any = {};
  shipping_address: any; billing_address: any;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  quickOrderData: any = {}; checkoutDetails: any = {};
  redirectRoute: string; errorMsg: string;
  subscription: Subscription; fnCalled: boolean;

  constructor(
    private router: Router, private activeRoute: ActivatedRoute, public cs: CommonService, public cc: CurrencyConversionService,
    @Inject(PLATFORM_ID) private platformId: Object, private cApi: CheckoutService, private api: ApiService
  ) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      if(!this.fnCalled) this.getData();
    });
  }

  ngOnInit(): void {
    this.pageLoader = true;
    if(this.cs.selected_currency && !this.fnCalled) this.getData();
  }

  getData() {
    this.fnCalled = true;
    this.activeRoute.params.subscribe((params: Params) => {
      if(params['id']) {
        this.pageLoader = true; delete this.redirectRoute;
        this.cApi.QUICK_ORDER_DETAILS({ store_id: this.cs.store_id, _id: params['id'], currency_type: this.cs.selected_currency.country_code }).subscribe(result => {
          if(result.status) {
            this.quickOrderData = result.qo_data;
            this.orderForm = result.order_data;
            this.orderForm.manualDiscAmount = 0; this.orderForm.tempManualDiscAmount = 0;
            this.orderForm.dispGiftWrappingCharges = this.cc.CALC(this.cs.application_setting.gift_wrapping_charges);
            this.item_list = this.orderForm.item_list;
            this.item_list.forEach((obj, index) => {
              obj.cart_id = index+1;
              if(obj.unit=="Pcs") obj.temp_final_price = this.cc.CALC_WO_AC(obj.final_price*obj.quantity);
              else obj.temp_final_price = this.cc.CALC_WO_AC((obj.final_price*obj.quantity)+obj.addon_price);
            });
            this.orderForm.tempSubTotal = this.cc.CALC_WO_AC(this.orderForm.sub_total);
            // packaging charges
            this.orderForm.packaging_charges = 0; this.orderForm.tempPackagingCharges = 0;
            if(this.cs.store_details.packaging_charges && this.cs.store_details.packaging_charges.value>0) {
              let packConfig = this.cs.store_details.packaging_charges;
              if(packConfig.type=='percentage') {
                this.orderForm.packaging_charges = Math.ceil(this.orderForm.selling_sub_total*(packConfig.value/100));
                if(packConfig.min_package_amt > this.orderForm.packaging_charges) this.orderForm.packaging_charges = packConfig.min_package_amt;
              }
              else this.orderForm.packaging_charges = this.cc.CALC_INR_WITH_AC(packConfig.value);
              this.orderForm.tempPackagingCharges = this.cc.CALC_WO_AC(this.orderForm.packaging_charges);
            }
            // discount
            if(this.quickOrderData.disc_status && this.quickOrderData.disc_config) {
              let discConfig = this.quickOrderData.disc_config;
              if(discConfig.type=='amount') { this.orderForm.manualDiscAmount = discConfig.value; }
              else { this.orderForm.manualDiscAmount = parseFloat((this.orderForm.sub_total*(discConfig.value/100)).toFixed(2)); }
              if(this.orderForm.manualDiscAmount > this.orderForm.sub_total) { this.orderForm.manualDiscAmount = this.orderForm.sub_total; }
              this.orderForm.tempManualDiscAmount = this.cc.CALC_WO_AC(this.orderForm.manualDiscAmount);
            }
            this.checkoutDetails = { item_list: this.quickOrderData.item_list, order_type: 'delivery', quick_order_id: this.quickOrderData._id };
            if(this.cs.customer_token || this.cs.application_setting.guest_checkout) {
              if(this.cs.customer_token) {
                this.api.USER_DETAILS().subscribe(result => {
                  if(result.status) {
                    let addressList = result.data.address_list;
                    let shippingIndex = addressList.findIndex(obj => obj.shipping_address);
                    if(shippingIndex != -1) {
                      this.checkoutDetails.shipping_address = addressList[shippingIndex];
                      this.shipping_address = this.checkoutDetails.shipping_address;
                      let billingIndex = addressList.findIndex(obj => obj.billing_address);
                      this.billing_address = addressList[billingIndex];
                      // pincode verification
                      if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(this.checkoutDetails.shipping_address.pincode)==-1) {
                        // redirect to address list
                        this.checkoutNavigation(this.checkoutDetails, '/checkout/address-list/product');
                      }
                      else {
                        // shipping
                        if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
                          // redirect to delivery methods
                          this.checkoutNavigation(this.checkoutDetails, '/checkout/delivery-methods');
                        }
                        else {
                          let sendData: any = {
                            sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: this.checkoutDetails.shipping_address._id,
                            order_type: this.checkoutDetails.order_type, currency_type: this.cs.selected_currency.country_code, quick_order_id: this.checkoutDetails.quick_order_id
                          };
                          sendData.item_list = this.cs.getItemList(this.checkoutDetails.item_list);
                          this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                            if(result.status) {
                              this.checkoutDetails.shipping_method = result.data.shipping_method;
                              this.api.USER_UPDATE({ checkout_details: this.checkoutDetails }).subscribe(result => {
                                if(result.status) this.router.navigate(['/checkout/order-details/product']);
                                else {
                                  console.log("response", result);
                                  this.router.navigate(["/"]);
                                }
                              });
                            }
                            else this.checkoutNavigation(this.checkoutDetails, '/checkout/shipping-methods');
                          });
                        }
                      }
                    }
                    else this.checkoutNavigation(this.checkoutDetails, '/checkout/address-list/product');
                  }
                  else {
                    console.log("response", result);
                    this.router.navigate(["/"]);
                  }
                });
              }
              else if(isPlatformBrowser(this.platformId)) {
                if(sessionStorage.getItem("guest_token")) {
                  if(sessionStorage.getItem("by_ca")) {
                    let guestAddress = this.cs.decode(sessionStorage.getItem("by_ca"));
                    this.checkoutDetails.shipping_address = guestAddress;
                    this.shipping_address = this.checkoutDetails.shipping_address;
                    this.billing_address = this.checkoutDetails.shipping_address;
                    sessionStorage.setItem("by_cd", this.cs.encode(this.checkoutDetails));
                    // pincode verification
                    if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(this.checkoutDetails.shipping_address.pincode)==-1) {
                      // redirect to address list
                      this.setCheckoutDetails(this.checkoutDetails, "/checkout/address-list/product");
                    }
                    else {
                      // shipping
                      if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
                        // redirect to delivery methods
                        this.setCheckoutDetails(this.checkoutDetails, "/checkout/delivery-methods");
                      }
                      else {
                        let sendData: any = {
                          sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: this.checkoutDetails.shipping_address._id,
                          order_type: this.checkoutDetails.order_type, currency_type: this.cs.selected_currency.country_code, quick_order_id: this.checkoutDetails.quick_order_id
                        };
                        sendData.item_list = this.cs.getItemList(this.checkoutDetails.item_list);
                        this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                          if(result.status) {
                            this.checkoutDetails.shipping_method = result.data.shipping_method;
                            sessionStorage.setItem("by_cd", this.cs.encode(this.checkoutDetails));
                            sessionStorage.setItem("by_qo_cd", this.cs.encode(this.checkoutDetails));
                            this.router.navigate(['/checkout/order-details/product']);
                          }
                          else this.setCheckoutDetails(this.checkoutDetails, "/checkout/shipping-methods");
                        });
                      }
                    }
                  }
                  else this.setCheckoutDetails(this.checkoutDetails, "/checkout/address-list/product");
                }
                else this.setCheckoutDetails(this.checkoutDetails, "/guest-login");
              }
            }
            else this.pageLoader = false;
          }
          else {
            console.log("response", result);
            this.pageLoader = false;
            this.errorMsg = result.message;
          }
        });
      }
      else this.router.navigate(["/"]);
    });
  }

  checkoutNavigation(checkoutDetails, redirect) {
    this.api.USER_UPDATE({ checkout_details: checkoutDetails }).subscribe(result => {
      this.pageLoader = false;
      if(result.status) this.redirectRoute = redirect;
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
    });
  }

  setCheckoutDetails(checkoutDetails, redirect) {
    this.pageLoader = false;
    sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
    this.redirectRoute = redirect;
  }

  routeNavigate() {
    sessionStorage.setItem("by_qo_cd", this.cs.encode(this.checkoutDetails));
    this.router.navigate([this.redirectRoute]);
  }

}