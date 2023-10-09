import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from './global.service';
@Injectable({
  providedIn: 'root'
})

export class StoreApiService {

  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  constructor(private http: HttpClient, private gs: GlobalService) { }
  
  STORE_STATUS() { return this.http.get<any>(this.ws_url+'/store_details/store?store_id='+this.store_id); }

  AI_STYLES_FILTER(x) { return this.http.post<any>(this.ws_url+'/store_details/product/ai_styles_filter_v2?store_id='+this.store_id, x); }

  PRODUCT_TAGS() { return this.http.get<any>(this.ws_url+'/store_details/product_features/'+this.store_id+'?type=tags'); }
  PRODUCT_FEATURES() { return this.http.get<any>(this.ws_url+'/store_details/product_features/'+this.store_id); }
  VENDOR_FEATURES(vendorId) { return this.http.get<any>(this.ws_url+'/store_details/vendor_features/'+this.store_id+'/'+vendorId); }

  PRODUCT_LIST(x) { return this.http.post<any>(this.ws_url+'/store_details/product/list/v2?store_id='+this.store_id, x); }
  FILTERED_PRODUCT_LIST(x) { return this.http.post<any>(this.ws_url+'/store_details/product/filter?store_id='+this.store_id, x); }
  RANDOM_PRODUCT_LIST(x) { return this.http.post<any>(this.ws_url+'/store_details/product/random_list?store_id='+this.store_id, x); }
  
  PRODUCT_DETAILS(x) { return this.http.post<any>(this.ws_url+'/store_details/product/details?store_id='+this.store_id, x); }
  ADDON_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/product/addon_details?store_id='+this.store_id+'&addon_id='+x); }
  REVIEWS(x) { return this.http.get<any>(this.ws_url+'/store_details/reviews?store_id='+this.store_id+'&product_id='+x); }

  STORE_ORDER_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/order_details?store_id='+this.store_id+'&id='+x); }
  STORE_QUOTATION_DETAILS(x) { return this.http.get<any>(this.ws_url+'/store_details/quotation_details?store_id='+this.store_id+'&id='+x); }

  UPDATE_CARTLIST(x) { return this.http.post<any>(this.ws_url+'/store_details/update_cart_list', x); }
  CHECK_STOCK_AVAILABILITY(x) { return this.http.post<any>(this.ws_url+'/store_details/check_stock_availabilty', x); }

  PRODUCT_ENQUIRY(x) { return this.http.post<any>(this.ws_url+'/store_details/product_enquiry', x); }

  MAIL(x){
    return this.http.post<any>(this.ws_url+'/others/enquiry_email',x);
  }

}