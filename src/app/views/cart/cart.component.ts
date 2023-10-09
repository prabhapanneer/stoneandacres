import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { StoreApiService } from '../../services/store-api.service';
import { CartlistService } from '../../services/cartlist.service';
import { environment } from '../../../environments/environment';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import { CommonService } from '../../services/common.service';
declare const fbq: Function;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})

export class CartComponent implements OnInit {

  pageLoader: boolean; btnLoader: boolean;
  imgBaseUrl: string = environment.img_baseurl;
  list: any = []; cartTotal: any; cartWeight: any; cartQty: any;
  tempCartTotal: any; tempMinCheckoutValue: any;
  unique_product_list: any = []; addressList: any = [];
  cart_product_unavailable_alert: boolean;
  template_setting: any = environment.template_setting;
  subscription: Subscription;
  orderType: string = 'delivery'; pickupAddrIndex: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartlistService, public cc: CurrencyConversionService, public cs: CommonService,
    private router: Router, private storeApi: StoreApiService, private api: ApiService
  ) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      this.findCurrency();
    });
  }

  ngOnInit(): void {
    this.list = []; this.unique_product_list = [];
    // run in browser side(for overcome ssr 504 Gateway Error)
    if(isPlatformBrowser(this.platformId) && this.cs.cart_list.length) {
      this.pageLoader = true;
      this.storeApi.UPDATE_CARTLIST({ store_id: this.cs.store_id, cart_list: this.cs.cart_list }).subscribe(result => {
        if(result.status) {
          this.list = result.list;
          this.cartService.resetCartList(this.list);
          this.calcCartTotal();
          if(this.cs.customer_token) {
            this.api.USER_UPDATE({ cart_list: this.list, cart_updated_on: new Date(), cart_recovery: true }).subscribe(result => {
              if(result.status) this.addressList = result.data.address_list;
            });
          }
        }
        else console.log("response", result);
        setTimeout(() => {
          this.pageLoader = false;
          if(this.cs.store_properties.pickup_locations.length && this.cs.application_setting.disable_delivery) this.orderType = 'pickup';
        }, 500);
      });
    }
  }

  calcCartTotal() {
    this.cartTotal = 0; this.cartWeight = 0; this.cartQty = 0;
    if(this.list.length) {
      this.list.forEach((product) => {
        this.cartTotal += this.cc.CALC_INR_WITH_AC(product.final_price * product.quantity);
        this.cartWeight += (product.weight * product.quantity);
        if(product.unit=="Pcs") this.cartQty += product.quantity;
        else {
          this.cartQty += 1;
          this.cartTotal += this.cc.CALC_INR_WITH_AC(product.addon_price);
        }
      });
    }
    this.cartWeight = this.cartWeight.toFixed(2);
    this.cartWeight = parseFloat(this.cartWeight);
    this.tempCartTotal = this.cc.CALC_WO_AC(this.cartTotal);
    this.tempMinCheckoutValue = this.cc.CALC_WO_AC(this.cs.application_setting.min_checkout_value);
  }

  findCurrency() {
    for(let product of this.list) {
      product.temp_final_price = this.cc.CALC(product.final_price*product.quantity);
      if(product.unit!='Pcs') product.temp_final_price = this.cc.CALC((product.final_price*product.quantity)+product.addon_price);
    }
    this.calcCartTotal();
  }

  onCheckout() {
    if(this.cs.store_details?.sub_type=='order') this.orderCheckout();
    else this.quoteCheckout();
  }

  orderCheckout() {
    if(isPlatformBrowser(this.platformId) && this.cs.storeDataLoaded) {
      // fb tracking
      if(environment.facebook_pixel) {
        fbq('track', 'InitiateCheckout', {
          value: this.tempCartTotal, currency: this.cs.selected_currency.country_code
        });
      }
      sessionStorage.removeItem("by_qo_cd");
    }
    if(this.cs.customer_token || this.cs.application_setting.guest_checkout) {
      if(isPlatformBrowser(this.platformId)) sessionStorage.removeItem("by_cd");
      this.unique_product_list = []; this.btnLoader = true;
      this.cart_product_unavailable_alert = false;
      // construct unique product list to check products availability
      this.list.forEach(x => {
        let index = this.unique_product_list.findIndex(obj => obj.product_id==x.product_id && JSON.stringify(obj.variant_types)==JSON.stringify(x.variant_types));
        if(index!=-1) this.unique_product_list[index].quantity += x.quantity;
        else this.unique_product_list.push({ product_id: x.product_id, quantity: x.quantity, unit: x.unit, variant_types: x.variant_types });
      });
      this.storeApi.CHECK_STOCK_AVAILABILITY({ store_id: this.cs.store_id, item_list: this.unique_product_list }).subscribe(result => {
        if(result.status) {
          this.unique_product_list = result.list;
          // if all products are available
          if(this.unique_product_list.findIndex(object => object.unavailable) == -1)
          {
            if(this.cs.customer_token) {
              let checkoutDetails: any = { item_list: this.cs.cart_list, order_type: this.orderType };
              if(checkoutDetails.order_type=='pickup') {
                checkoutDetails.shipping_address = this.cs.store_properties.pickup_locations[this.pickupAddrIndex];
                let billingIndex = this.addressList.findIndex(obj => obj.billing_address);
                if(billingIndex != -1) {
                  checkoutDetails.billing_address = this.addressList[billingIndex];
                  this.checkoutNavigation(checkoutDetails, '/checkout/pickup-methods');
                }
                else {
                  // redirect to address list
                  this.checkoutNavigation(checkoutDetails, '/checkout/address-list/product');
                }
              }
              else {
                let shippingIndex = this.addressList.findIndex(obj => obj.shipping_address);
                if(shippingIndex != -1) {
                  checkoutDetails.shipping_address = this.addressList[shippingIndex];
                  // pincode verification
                  if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(checkoutDetails.shipping_address.pincode)==-1) {
                    // redirect to address list
                    this.checkoutNavigation(checkoutDetails, '/checkout/address-list/product');
                  }
                  else {
                    // shipping
                    if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
                      // redirect to delivery methods
                      this.checkoutNavigation(checkoutDetails, '/checkout/delivery-methods');
                    }
                    else {
                      let sendData: any = {
                        sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: checkoutDetails.shipping_address._id,
                        order_type: checkoutDetails.order_type, currency_type: this.cs.selected_currency.country_code
                      };
                      sendData.item_list = this.cs.getItemList(checkoutDetails.item_list);
                      this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                        if(result.status) {
                          checkoutDetails.shipping_method = result.data.shipping_method;
                          this.checkoutNavigation(checkoutDetails, '/checkout/order-details/product');
                        }
                        else {
                          // redirect to shipping page
                          this.checkoutNavigation(checkoutDetails, '/checkout/shipping-methods');
                        }
                      });
                    }
                  }
                }
                else {
                  // redirect to address list
                  this.checkoutNavigation(checkoutDetails, '/checkout/address-list/product');
                }
              }
            }
            else if(isPlatformBrowser(this.platformId)) {
              this.btnLoader = false;
              let checkoutDetails: any = { item_list: this.cs.cart_list, order_type: this.orderType };
              if(checkoutDetails.order_type=='pickup') {
                checkoutDetails.shipping_address = this.cs.store_properties.pickup_locations[this.pickupAddrIndex];
              }
              if(sessionStorage.getItem("guest_token")) {
                if(sessionStorage.getItem("by_ca")) {
                  let guestAddress = this.cs.decode(sessionStorage.getItem("by_ca"));
                  if(checkoutDetails.order_type=='pickup') {
                    checkoutDetails.billing_address = guestAddress;
                    sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                    this.router.navigate(["/checkout/pickup-methods"]);
                  }
                  else {
                    checkoutDetails.shipping_address = guestAddress;
                    sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                    // pincode verification
                    if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(checkoutDetails.shipping_address.pincode)==-1) {
                      // redirect to address list
                      this.router.navigate(["/checkout/address-list/product"]);
                    }
                    else {
                      // shipping
                      if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
                        // redirect to delivery methods
                        this.router.navigate(["/checkout/delivery-methods"]);
                      }
                      else {
                        let sendData: any = {
                          sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: checkoutDetails.shipping_address._id,
                          order_type: checkoutDetails.order_type, currency_type: this.cs.selected_currency.country_code
                        };
                        sendData.item_list = this.cs.getItemList(checkoutDetails.item_list);
                        this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                          if(result.status) {
                            checkoutDetails.shipping_method = result.data.shipping_method;
                            sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                            this.router.navigate(["/checkout/order-details/product"]);
                          }
                          else {
                            // redirect to shipping page
                            this.router.navigate(["/checkout/shipping-methods"]);
                          }
                        });
                      }
                    }
                  }
                }
                else {
                  sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                  this.router.navigate(["/checkout/address-list/product"]);
                }
              }
              else {
                sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                this.cs.after_login_event = { redirect: '/cart' }; // for go main login page from guest login
                this.router.navigate(["/guest-login"]);
              }
            }
          }
          // if some products unavailble
          else {
            this.btnLoader = false;
            this.cart_product_unavailable_alert = true;
            if(this.unique_product_list.length) {
              for(let item of this.list) {
                delete item.available_qty; delete item.unavailable;
                let index = this.unique_product_list.findIndex(object => object.product_id==item.product_id && object.unavailable);
                if(index!=-1) {
                  item.unavailable = true;
                  item.available_qty = this.unique_product_list[index].available_qty;
                }
              }
            }
          }
        }
        else {
          this.btnLoader = false;
          console.log("response", result);
        }
      });
    }
    else {
      this.cs.after_login_event = { redirect: '/cart' };
      this.router.navigate(["/account"]);
    }
  }

  quoteCheckout() {
    if(this.cs.customer_token || this.cs.application_setting.guest_checkout) {
      if(isPlatformBrowser(this.platformId)) sessionStorage.removeItem("by_cd");
      this.unique_product_list = []; this.btnLoader = true;
      this.cart_product_unavailable_alert = false;
      // construct unique product list to check products availability
      this.list.forEach(x => {
        let index = this.unique_product_list.findIndex(obj => obj.product_id==x.product_id && JSON.stringify(obj.variant_types)==JSON.stringify(x.variant_types));
        if(index!=-1) this.unique_product_list[index].quantity += x.quantity;
        else this.unique_product_list.push({ product_id: x.product_id, quantity: x.quantity, unit: x.unit, variant_types: x.variant_types });
      });
      this.storeApi.CHECK_STOCK_AVAILABILITY({ store_id: this.cs.store_id, item_list: this.unique_product_list }).subscribe(result => {
        if(result.status) {
          this.unique_product_list = result.list;
          // if all products are available
          if(this.unique_product_list.findIndex(object => object.unavailable) == -1)
          {
            if(this.cs.customer_token) {
              let checkoutDetails: any = { item_list: this.cs.cart_list };
              let billingIndex = this.addressList.findIndex(obj => obj.billing_address);
              let shippingIndex = this.addressList.findIndex(obj => obj.shipping_address);
              if(shippingIndex != -1 && billingIndex != -1) {
                checkoutDetails.company_address = this.addressList[shippingIndex];
                this.checkoutNavigation(checkoutDetails, '/checkout/order-details/quotation');
              }
              else this.checkoutNavigation(checkoutDetails, '/checkout/address-list/quotation');
            }
            else if(isPlatformBrowser(this.platformId)) {
              this.btnLoader = false;
              let checkoutDetails: any = { item_list: this.cs.cart_list };
              if(sessionStorage.getItem("guest_token")) {
                if(sessionStorage.getItem("by_ca")) {
                  checkoutDetails.company_address = this.cs.decode(sessionStorage.getItem("by_ca"));
                  sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                  this.router.navigate(["/checkout/order-details/quotation"]);
                }
                else {
                  sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                  this.router.navigate(["/checkout/address-list/quotation"]);
                }
              }
              else {
                sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                this.cs.after_login_event = { redirect: '/cart' }; // for go main login page from guest login
                this.router.navigate(["/guest-login"]);
              }
            }
          }
          // if some products unavailble
          else {
            this.btnLoader = false;
            this.cart_product_unavailable_alert = true;
            if(this.unique_product_list.length) {
              for(let item of this.list) {
                delete item.available_qty; delete item.unavailable;
                let index = this.unique_product_list.findIndex(object => object.product_id==item.product_id && object.unavailable);
                if(index!=-1) {
                  item.unavailable = true;
                  item.available_qty = this.unique_product_list[index].available_qty;
                }
              }
            }
          }
        }
        else {
          this.btnLoader = false;
          console.log("response", result);
        }
      });
    }
    else {
      this.cs.after_login_event = { redirect: '/cart' };
      this.router.navigate(["/account"]);
    }
  }
  
  checkoutNavigation(checkoutDetails, redirect) {
    this.api.USER_UPDATE({ checkout_details: checkoutDetails }).subscribe(result => {
      this.btnLoader = false;
      if(result.status) this.router.navigate([redirect]);
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
    });
  }

  incProductQuantity(index) {
    this.cart_product_unavailable_alert = false;
    this.list[index].quantity += this.cs.step_qty[this.list[index].unit];
    if((this.list[index].quantity % 1) != 0) this.list[index].quantity = parseFloat(this.list[index].quantity.toFixed(2));
    if(this.list[index].quantity > this.list[index].stock) this.list[index].quantity = this.list[index].stock;
    this.calcCartTotal();
    this.cartService.updateCartList(this.list);
  }
  decProductQuantity(index) {
    this.cart_product_unavailable_alert = false;
    if(this.list[index].quantity > this.cs.min_qty[this.list[index].unit]) {
      this.list[index].unavailable = false;
      this.list[index].quantity -= this.cs.step_qty[this.list[index].unit];
      if((this.list[index].quantity % 1) != 0) this.list[index].quantity = parseFloat(this.list[index].quantity.toFixed(2));
      if(this.list[index].quantity < this.cs.min_qty[this.list[index].unit]) this.list[index].quantity = this.cs.min_qty[this.list[index].unit];
      this.calcCartTotal();
      this.cartService.updateCartList(this.list);
    }
    else this.removeFromCart(index);
  }
  removeFromCart(index) {
    this.cart_product_unavailable_alert = false;
    this.list.splice(index, 1);
    this.calcCartTotal();
    this.cartService.updateCartList(this.list);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}