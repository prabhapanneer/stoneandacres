import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { StoreApiService } from '../../../../services/store-api.service';
import { environment } from '../../../../../environments/environment';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { CartlistService } from '../../../../services/cartlist.service';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-quote-order-details',
  templateUrl: './quote-order-details.component.html',
  styleUrls: ['./quote-order-details.component.scss']
})

export class QuoteOrderDetailsComponent implements OnInit {

  pageLoader: boolean;
  item_list: any = [];
  orderForm: any = { gst: {} };
  company_address: any = {}; billing_address: any = {};
  environment: any = environment;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  sub_total: any;
  tempSubTotal: any; cartQty: any = 0;
  unique_product_list: any = [];
  checkout_details: any = {};

  constructor(
    private cartService: CartlistService, private api: ApiService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object,
    public cc: CurrencyConversionService, private storeApi: StoreApiService, public cs: CommonService
  ) { }

  ngOnInit() {
    if(this.cs.customer_token) {
      this.pageLoader = true;
      this.api.USER_DETAILS().subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status && result.data.checkout_details?.item_list?.length) {
          let bInd = result.data.address_list.findIndex(obj => obj.billing_address);
          if(bInd!=-1) {
            this.billing_address = result.data.address_list[bInd];
            this.checkout_details = result.data.checkout_details;
            if(result.data.gst) this.orderForm.gst = result.data.gst;
            this.setOrderDetails();
          }
          else this.router.navigate(["/"]);
        }
        else this.router.navigate(["/"]);
      });
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("by_cd")) {
      this.checkout_details = this.cs.decode(sessionStorage.getItem("by_cd"));
      if(this.checkout_details.item_list?.length) {
        this.billing_address = this.checkout_details.company_address;
        this.setOrderDetails();
      }
      else this.router.navigate(["/"]);
    }
    else this.router.navigate(["/"]);
  }

  setOrderDetails() {
    this.item_list = this.checkout_details.item_list;
    this.company_address = this.checkout_details.company_address;
    this.item_list.forEach(obj => {
      obj.final_price = this.cc.CALC_INR_WITH_AC(obj.final_price);
      obj.revised_final_price = obj.final_price;
      if(obj.addon_price) {
        obj.addon_price = this.cc.CALC_INR_WITH_AC(obj.addon_price);
        obj.revised_addon_price = obj.addon_price;
      }
    });
    this.calcCartTotal();
  }

  decProductQty(index) {
    this.orderForm.cart_exceed_alert = false;
    if(this.item_list[index].additional_qty==0 && this.item_list[index].quantity>this.cs.min_qty[this.item_list[index].unit]) {
      this.item_list[index].unavailable = false;
      this.item_list[index].quantity -= this.cs.step_qty[this.item_list[index].unit];
      if((this.item_list[index].quantity % 1) != 0) this.item_list[index].quantity = parseFloat(this.item_list[index].quantity.toFixed(2));
      if(this.item_list[index].quantity < this.cs.min_qty[this.item_list[index].unit]) this.item_list[index].quantity = this.cs.min_qty[this.item_list[index].unit];
    }
    else this.item_list.splice(index, 1);
    // update item list
    this.cartService.updateCartList(this.item_list);
    this.checkout_details.item_list = this.item_list;
    if(this.cs.customer_token) this.api.USER_UPDATE({ checkout_details: this.checkout_details }).subscribe(result => { });
    else if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("by_cd", this.cs.encode(this.checkout_details));
  }

  calcCartTotal() {
    this.sub_total = 0; this.cartQty = 0;
    for(let obj of this.item_list) {
      this.sub_total += (obj.final_price * obj.quantity);
      // cart qty
      if(obj.unit=="Pcs") {
        this.cartQty += obj.quantity;
        obj.tempFinalPrice = this.cc.CALC_WO_AC(obj.final_price*obj.quantity);
      }
      else {
        this.cartQty += 1;
        this.sub_total += obj.addon_price;
        obj.tempFinalPrice = this.cc.CALC_WO_AC((obj.final_price*obj.quantity)+obj.addon_price);
      }
    }
    this.tempSubTotal = this.cc.CALC_WO_AC(this.sub_total);
  }

  onCreateQuotation() {
    this.orderForm.submit = true;
    this.unique_product_list = [];
    // construct unique product list to check products availability
    this.orderForm.cart_product_unavailable_alert = false;
    this.item_list.forEach(x => {
      let index = this.unique_product_list.findIndex(obj => obj.product_id==x.product_id && JSON.stringify(obj.variant_types)==JSON.stringify(x.variant_types));
      if(index!=-1) this.unique_product_list[index].quantity += x.quantity;
      else this.unique_product_list.push({ product_id: x.product_id, quantity: x.quantity, unit: x.unit, variant_types: x.variant_types });
    });
    // validate all products are available
    this.storeApi.CHECK_STOCK_AVAILABILITY({ store_id: this.cs.store_id, item_list: this.unique_product_list }).subscribe(result => {
      if(result.status) {
        this.unique_product_list = result.list;
        // if all products are available then, place order
        if(this.unique_product_list.findIndex(object => object.unavailable) == -1) {
          // order details
          let checkoutDetails = this.orderForm;
          checkoutDetails.store_id = this.cs.store_id;
          checkoutDetails.company_address = this.company_address;
          checkoutDetails.billing_address = this.billing_address;
          checkoutDetails.item_list = this.item_list;
          checkoutDetails.sub_total = this.sub_total;
          checkoutDetails.final_price = this.sub_total;
          checkoutDetails.currency_type = this.cs.selected_currency.country_code;
          // create order
          this.api.CREATE_QUOTATION(checkoutDetails).subscribe(result => {
            this.orderForm.submit = false;
            if(result.status) this.router.navigate(["/checkout/order-summary/quotation/"+result.data.order_id]);
            else console.log("response", result);
          });
        }
        else {
          this.orderForm.submit = false;
          this.orderForm.cart_product_unavailable_alert = true;
          if(this.unique_product_list.length) {
            for(let item of this.item_list) {
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
        this.orderForm.submit = false;
        console.log("response", result);
      }
    });   
  }

}