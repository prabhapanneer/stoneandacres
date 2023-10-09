import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class CheckoutService {

  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  razorpay_payment_url: string = "https://api.razorpay.com/v1/checkout/embedded";
  razorpay_redirect_url: string = this.gs.wsUrl+"/store_details/razorpay_payment/";
  ccavenue_payment_url: string = "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction";
  payu_redirect_url: string = this.gs.wsUrl+"/store_details/payu_payment/";

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private gs: GlobalService) { }

  DELIVERY_METHODS() { return this.http.get<any>(this.ws_url+'/store_details/delivery_methods?store_id='+this.store_id); }
  DELIVERY_DETAILS(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.ws_url+'/user/order/delivery_details', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.ws_url+'/guest_user/order/delivery_details', x, httpOptions);
    }
    else return null;
  }

  PICKUP_DETAILS(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.ws_url+'/user/order/pickup_details', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.ws_url+'/guest_user/order/pickup_details', x, httpOptions);
    }
    else return null;
  }

  QUICK_ORDER_DETAILS(x) { return this.http.post<any>(this.ws_url+'/store_details/quick_order_details', x); }

  SHIPPING_METHODS() { return this.http.get<any>(this.ws_url+'/store_details/shipping_methods?store_id='+this.store_id); }

  // gift card
  BUY_COUPON(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.post<any>(this.ws_url+'/user/buy_coupon', x, httpOptions);
  }
  COUPON_DETAILS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.ws_url+'/user/coupon?coupon_id='+x, httpOptions);
  }

  // donation
  DONATION_DETAILS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.ws_url+'/user/donation?order_id='+x, httpOptions);
  }

  // square payment
  SQUARE_PAYMENT(x) { return this.http.post<any>(this.ws_url+'/store_details/square_payment/'+this.store_id, x); }

  // fatoorah payment
  FATOORAH_INITIATE_PAY(x) { return this.http.post<any>(this.ws_url+'/store_details/fatoorah_initiate_pay/'+this.store_id, x); }

}