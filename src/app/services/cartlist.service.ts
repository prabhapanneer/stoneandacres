import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CurrencyConversionService } from './currency-conversion.service';
import { GlobalService } from './global.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})

export class CartlistService {

  constructor(
    private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private cs: CommonService,
    private cc: CurrencyConversionService, private gs: GlobalService
  ) {
    if(localStorage.getItem("by_cc")) {
      this.cs.cart_list = this.cs.decode(localStorage.getItem("by_cc"));
      this.findCurrency();
    }
  }

  USER_UPDATE(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/user/customer', x, httpOptions);
  }
  GUEST_USER_UPDATE(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/guest_user/details', x, httpOptions);
  }

  addToCart(x) {
    if(!this.cs.cart_list) this.cs.cart_list = [];
    let productDetails: any = {};
    productDetails.category_id = x.category_id;
    productDetails.product_id = x.product_id;
    productDetails.sku = x.sku;
    productDetails.name = x.name;
    productDetails.weight = x.weight;
    productDetails.quantity = x.quantity+x.additional_qty;
    productDetails.additional_qty = x.additional_qty;
    productDetails.unit = x.unit;
    productDetails.stock = x.stock;
    productDetails.selling_price = x.selling_price;
    productDetails.disc_status = x.disc_status;
    productDetails.disc_percentage = x.disc_percentage;
    productDetails.discounted_price = x.discounted_price;
    productDetails.addon_price = x.addon_price;
    productDetails.final_price = x.final_price;
    productDetails.addon_status = x.external_addon_status;
    if(productDetails.addon_status) productDetails.selected_addon = x.selected_addon;
    productDetails.customization_status = x.customization_status;
    if(productDetails.customization_status) productDetails.customized_model = x.customized_model;
    productDetails.variant_status = x.variant_status;
    productDetails.variant_types = [];
    if(x.hsn_code) productDetails.hsn_code = x.hsn_code;
    if(x.vendor_id) productDetails.vendor_id = x.vendor_id;
    if(productDetails.variant_status) {
      x.variant_types.forEach(element => {
        productDetails.variant_types.push({ name: element.name, value: element.value });
      });
    }
    if(x.taxrate_id) productDetails.taxrate_id = x.taxrate_id;
    productDetails.seo_status = x.seo_status;
    productDetails.seo_details = x.seo_details;
    productDetails.image = x.image;
    productDetails.allow_cod = x.allow_cod;
    // check already exist in cart
    let cartIndex = this.checkProductExistInCart(this.cs.cart_list, productDetails);
    // remove product, if already exist
    if(cartIndex != -1) this.cs.cart_list.splice(cartIndex, 1);
    this.cs.cart_list.push(productDetails);
    this.updateCartList(this.cs.cart_list);
  }

  checkProductExistInCart(cartList, x) {
    return cartList.findIndex(obj => obj.product_id==x.product_id && JSON.stringify(obj.variant_types)==JSON.stringify(x.variant_types));
  }

  // this fn also call from cart page, so set cart_list again
  updateCartList(x) {
    this.cs.cart_list = x;
    this.findCurrency();
    localStorage.setItem("by_cc", this.cs.encode(this.cs.cart_list));
    if(this.cs.customer_token) {
      this.USER_UPDATE({ cart_list: x, cart_updated_on: new Date(), cart_recovery: true }).subscribe(result => { });
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      this.GUEST_USER_UPDATE({ cart_list: x, cart_updated_on: new Date(), cart_recovery: true }).subscribe(result => { });
    }
  }

  // this fn call on login
  resetCartList(x) {
    this.cs.cart_list = x;
    this.findCurrency();
    localStorage.setItem("by_cc", this.cs.encode(this.cs.cart_list));
  }

  findCurrency() {
    if(this.cs.cart_list?.length) {
      for(let product of this.cs.cart_list) {
        product.temp_final_price = this.cc.CALC(product.final_price*product.quantity);
        if(product.unit!='Pcs') product.temp_final_price = this.cc.CALC((product.final_price*product.quantity)+product.addon_price);
      }
    }
  }

}
