import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class FeaturesService {

  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  constructor(private http: HttpClient, private gs: GlobalService) { }

  APPOINTMENT_LIST(x) { return this.http.post<any>(this.ws_url+'/store_details/appointments', x); }
  APPOINTMENT_CATEGORIES() { return this.http.get<any>(this.ws_url+'/store_details/appointment_services?store_id='+this.store_id); }
  APPOINTMENT_SERVICES(x) { return this.http.get<any>(this.ws_url+'/store_details/appointment_services?store_id='+this.store_id+'&category='+x); }
  APPOINTMENT_SERVICE_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/appointment_services?store_id='+this.store_id+'&id='+x); }
  CREATE_APPOINTMENT(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.post<any>(this.ws_url+'/user/appointment', x, httpOptions);
  }

  BLOG_LIST(skip, limit) { return this.http.get<any>(this.ws_url+'/store_details/blogs/v1?store_id='+this.store_id+'&skip='+skip+'&limit='+limit); }
  BLOG_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/blogs/v1?store_id='+this.store_id+'&id='+x); }

  RECIPE_LIST(skip, limit) { return this.http.get<any>(this.ws_url+'/store_details/recipes?store_id='+this.store_id+'&skip='+skip+'&limit='+limit); }
  RECIPE_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/recipes?store_id='+this.store_id+'&id='+x); }

  GIFT_CARDS() { return this.http.get<any>(this.ws_url+'/store_details/gift_cards?store_id='+this.store_id); }
  GIFT_CARD_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/gift_cards?store_id='+this.store_id+'&gc_id='+x); }
  CATALOGS() { return this.http.get<any>(this.ws_url+'/store_details/discounts?store_id='+this.store_id); }
  COLLECTIONS() { return this.http.get<any>(this.ws_url+'/store_details/collections?store_id='+this.store_id); }
  ADD_REVIEW(x) { return this.http.post<any>(this.ws_url+'/store_details/reviews', x); }
  SIZING_ASSISTANT(x) { return this.http.post<any>(this.ws_url+'/store_details/sizing_assistant?store_id='+this.store_id, x); }

}