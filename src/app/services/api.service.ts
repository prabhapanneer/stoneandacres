import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private gs: GlobalService) { }

  REGISTER(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/register', x); }
  LOGIN(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/login', x); }
  SOCIAL_LOGIN(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/social_login', x); }
  FORGOT_REQUEST(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/forgot_request', x); }
  VALIDATE_FORGOT_REQUEST(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/validate_forgot_request', x); }
  UPDATE_PWD(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/update_pwd', x); }
  GUEST_LOGIN(x) { return this.http.post<any>(this.gs.wsUrl+'/auth/user/guest_login', x); }

  CHANGE_PWD(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/user/change_pwd', x, httpOptions);
  }
  USER_DETAILS() {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/customer', httpOptions);
  }
  USER_UPDATE(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/user/customer', x, httpOptions);
  }
  UPDATE_USER_MOBILE(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.post<any>(this.gs.wsUrl+'/user/update_mobile', x, httpOptions);
  }

  // guest user
  GUEST_USER_UPDATE(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/guest_user/details', x, httpOptions);
  }

  // Address list
  ADD_ADDRESS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.post<any>(this.gs.wsUrl+'/user/address', x, httpOptions);
  }
  UPDATE_ADDRESS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/user/address', x, httpOptions);
  }
  DELETE_ADDRESS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.patch<any>(this.gs.wsUrl+'/user/address', x, httpOptions);
  }

  // Model
  ADD_MODEL(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.post<any>(this.gs.wsUrl+'/user/model', x, httpOptions);
  }
  UPDATE_MODEL(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.put<any>(this.gs.wsUrl+'/user/model', x, httpOptions);
  }
  DELETE_MODEL(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.patch<any>(this.gs.wsUrl+'/user/model', x, httpOptions);
  }

  // feedback
  FEEDBACK(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.post<any>(this.gs.wsUrl+'/user/feedback', x, httpOptions);
  }

  // giftcard coupons
  COUPON_LIST() {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/coupon', httpOptions);
  }

  // appointment
  USER_APPOINTMENTS() {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/appointment', httpOptions);
  }
  APPOINTMENT_DETAILS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/appointment?id='+x, httpOptions);
  }

  // product
  SHIPPING_DETAILS(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.gs.wsUrl+'/user/order/shipping_details', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.gs.wsUrl+'/guest_user/order/shipping_details', x, httpOptions);
    }
    else return null;
  }
  
  ORDER_LIST(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/order/list?type='+x, httpOptions);
  }
  ORDER_DETAILS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/order/details?order_id='+x, httpOptions);
  }
  CANCEL_ORDER(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.patch<any>(this.gs.wsUrl+'/user/order/details', x, httpOptions);
  }

  // quotation
  CREATE_QUOTATION(x) {
    if(localStorage.getItem('customer_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
      return this.http.post<any>(this.gs.wsUrl+'/user/quotation', x, httpOptions);
    }
    else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem('guest_token')) {
      let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+sessionStorage.getItem('guest_token') }) };
      return this.http.post<any>(this.gs.wsUrl+'/guest_user/quotation', x, httpOptions);
    }
    else return null;
  }
  QUOTATION_LIST(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/quotation?type='+x, httpOptions);
  }
  QUOTATION_DETAILS(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.gs.wsUrl+'/user/quotation?order_id='+x, httpOptions);
  }

}