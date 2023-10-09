import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class OrderCheckoutService {

  ws_url: string = this.gs.wsUrl;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private gs: GlobalService) { }

  VALIDATE_OFFER_CODE(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.ws_url+'/user/validate_offercoupon', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.ws_url+'/guest_user/validate_offercoupon', x, httpOptions);
    }
    else return null;
  }

  CHECKOUT_DETAILS(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.get<any>(this.ws_url+'/user/order/checkout_details?sid='+x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.get<any>(this.ws_url+'/guest_user/order/checkout_details?sid='+x, httpOptions);
    }
    else return null;
  }

  CREATE_ORDER(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.ws_url+'/user/order/create_v2', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.ws_url+'/guest_user/order/create_v2', x, httpOptions);
    }
    else return null;
  }

  VALIDATE_COD_OTP(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.get<any>(this.ws_url+'/user/order/cod_otp?otp='+x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.get<any>(this.ws_url+'/guest_user/order/cod_otp?otp='+x, httpOptions);
    }
    else return null;
  }

  SEND_COD_OTP(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.ws_url+'/user/order/cod_otp', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.ws_url+'/guest_user/order/cod_otp', x, httpOptions);
    }
    else return null;
  }

  UPDATE_ORDER_PAYMENT(storeId, x) { return this.http.post<any>(this.ws_url+'/store_details/update_order_payment?store_id='+storeId, x); }

  CALC_ORDER_DISCOUNT(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.ws_url+'/user/order/calc_discount', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.ws_url+'/guest_user/order/calc_discount', x, httpOptions);
    }
    else return null;
  }

}