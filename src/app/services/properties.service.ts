import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class PropertiesService {

  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  constructor(private http: HttpClient, private gs: GlobalService) { }

  POLICY_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/policy?store_id='+this.store_id+'&type='+x); }
  CONTACT_PAGE_INFO() { return this.http.get<any>(this.ws_url+'/store_details/contact_page?store_id='+this.store_id); }
  LOCATIONS() { return this.http.get<any>(this.ws_url+'/store_details/locations?store_id='+this.store_id); }
  EXTRA_PAGE(x) { return this.http.get<any>(this.ws_url+'/store_details/extra_page?store_id='+this.store_id+'&type='+x); }

  CONTACT_US(x) { return this.http.post<any>(this.ws_url+'/store_details/enquiry_mail', x); }

  VENDOR_ENQUIRY(x) { return this.http.post<any>(this.ws_url+'/store_details/vendor_enquiry', x); }
  VENDOR_REGISTER(x) { return this.http.post<any>(this.ws_url+'/others/vendor', x); }

  SEARCH_PRODUCT(x) { return this.http.post<any>(this.ws_url+'/store_details/product/search?store_id='+this.store_id, x); }
  SUBSCRIBE_NEWSLETTER(x) { return this.http.post<any>(this.ws_url+'/store_details/subscribe_newsletter', x); }

}