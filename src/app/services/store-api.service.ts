import { Observable } from "rxjs"
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class StoreApiService {

  constructor(private http: HttpClient) { }

  IP_INFO(url) { return this.http.get<any>(url); }
  STORE_DETAILS() { return this.http.get<any>(environment.ws_url+'/store_details/details_v3?store_id='+environment.store_id); }
  
  LAYOUT_LIST() { return this.http.get<any>(environment.ws_url+'/store_details/layouts?store_id='+environment.store_id); }
  HOME_PAGE_BLOG_LIST(limit) { return this.http.get<any>(environment.ws_url+'/store_details/blogs?limit='+limit+'&store_id='+environment.store_id); }

  AI_STYLES() { return this.http.get<any>(environment.ws_url+'/store_details/ai_styles?store_id='+environment.store_id); }
  AI_STYLES_FILTER(x) { return this.http.post<any>(environment.ws_url+'/store_details/product/ai_styles_filter_v2?store_id='+environment.store_id, x); }
  SIZING_ASSISTANT(x) { return this.http.post<any>(environment.ws_url+'/store_details/sizing_assistant?store_id='+environment.store_id, x); }

  SEARCH_PRODUCT(x) { return this.http.post<any>(environment.ws_url+'/store_details/product/search?store_id='+environment.store_id, x); }
  COUNTRY_LIST() { return this.http.get<any>(environment.ws_url+'/store_details/country_list'); }
  PRODUCT_FEATURES() { return this.http.get<any>(environment.ws_url+'/store_details/product_features?store_id='+environment.store_id); }
  CATEGORY_DETAILS(x) { return this.http.post<any>(environment.ws_url+'/store_details/category/details/v2?store_id='+environment.store_id, x); }

  PRODUCT_LIST(x) { return this.http.post<any>(environment.ws_url+'/store_details/product/list/v2?store_id='+environment.store_id, x); }
  FILTERED_PRODUCT_LIST(x) { return this.http.post<any>(environment.ws_url+'/store_details/product/filter?store_id='+environment.store_id, x); }
  RANDOM_PRODUCT_LIST(x) { return this.http.post<any>(environment.ws_url+'/store_details/product/random_list?store_id='+environment.store_id, x); }
  
  PRODUCT_DETAILS(x) { return this.http.post<any>(environment.ws_url+'/store_details/product/details?store_id='+environment.store_id, x); }
  ADDON_DETAILS(x) { return this.http.get<any>(environment.ws_url+'/store_details/product/addon_details?store_id='+environment.store_id+'&addon_id='+x); }
  
  SHIPPING_METHODS() { return this.http.get<any>(environment.ws_url+'/store_details/shipping_methods?store_id='+environment.store_id); }
  DELIVERY_METHODS() { return this.http.get<any>(environment.ws_url+'/store_details/delivery_methods?store_id='+environment.store_id); }
  QUICK_ORDER_DETAILS(x) { return this.http.post<any>(environment.ws_url+'/store_details/quick_order_details', x); }
  
  GIFT_CARDS() { return this.http.get<any>(environment.ws_url+'/store_details/gift_cards?store_id='+environment.store_id); }
  GIFT_CARD_DETAILS(x) { return this.http.get<any>(environment.ws_url+'/store_details/gift_cards?store_id='+environment.store_id+'&gc_id='+x); }
  DISCOUNTS() { return this.http.get<any>(environment.ws_url+'/store_details/discounts?store_id='+environment.store_id); }
  COLLECTIONS() { return this.http.get<any>(environment.ws_url+'/store_details/collections?store_id='+environment.store_id); }
  
  BLOG_LIST() { return this.http.get<any>(environment.ws_url+'/store_details/blogs?store_id='+environment.store_id); }
  BLOG_DETAILS(x) { return this.http.get<any>(environment.ws_url+'/store_details/blog_details?store_id='+environment.store_id+'&blog_id='+x); }

  STORE_ORDER_DETAILS(x) { return this.http.get<any>(environment.ws_url+'/store_details/order_details?store_id='+environment.store_id+'&id='+x); }

  APPOINTMENT_LIST(x) { return this.http.post<any>(environment.ws_url+'/store_details/appointments', x); }
  APPOINTMENT_CATEGORIES() { return this.http.get<any>(environment.ws_url+'/store_details/appointment_services?store_id='+environment.store_id); }
  APPOINTMENT_SERVICES(x) { return this.http.get<any>(environment.ws_url+'/store_details/appointment_services?store_id='+environment.store_id+'&category='+x); }
  APPOINTMENT_SERVICE_DETAILS(x) { return this.http.get<any>(environment.ws_url+'/store_details/appointment_services?store_id='+environment.store_id+'&id='+x); }

  // Reviews
  REVIEWS(x) { return this.http.get<any>(environment.ws_url+'/store_details/reviews?store_id='+environment.store_id+'&product_id='+x); }
  ADD_REVIEW(x) { return this.http.post<any>(environment.ws_url+'/store_details/reviews', x); }

  UPDATE_CARTLIST(x) { return this.http.post<any>(environment.ws_url+'/store_details/update_cart_list', x); }
  CHECK_STOCK_AVAILABILITY(x) { return this.http.post<any>(environment.ws_url+'/store_details/check_stock_availabilty', x); }
  VALIDATE_COUPONS(x) { return this.http.post<any>(environment.ws_url+'/store_details/validate_coupons', x); }
  VALIDATE_STORE_OFFER_CODE(x) { return this.http.post<any>(environment.ws_url+'/store_details/validate_offer_code', x); }

  CONTACT_US(x) { return this.http.post<any>(environment.ws_url+'/store_details/enquiry_mail', x); }
  VENDOR_ENQUIRY(x) { return this.http.post<any>(environment.ws_url+'/store_details/vendor_enquiry_mail', x); }
  SUBSCRIBE_NEWSLETTER(x) { return this.http.post<any>(environment.ws_url+'/store_details/subscribe_newsletter', x); }

  POLICY_DETAILS(x) { return this.http.get<any>(environment.ws_url+'/store_details/policy?store_id='+environment.store_id+'&type='+x); }
  CONTACT_PAGE_INFO() { return this.http.get<any>(environment.ws_url+'/store_details/contact_page?store_id='+environment.store_id); }
  LOCATIONS() { return this.http.get<any>(environment.ws_url+'/store_details/locations?store_id='+environment.store_id); }
  EXTRA_PAGE(x) { return this.http.get<any>(environment.ws_url+'/store_details/extra_page?store_id='+environment.store_id+'&type='+x); }

  DONATION_AMOUNT(x) { return this.http.get<any>(environment.ws_url+'/store_details/donation_amount?store_id='+environment.store_id+'&country_code='+x); }

  // square payment
  SQUARE_PAYMENT(x) { return this.http.post<any>(environment.ws_url+'/store_details/square_payment/'+environment.store_id, x); }

  // fatoorah payment
  FATOORAH_INITIATE_PAY(x) { return this.http.post<any>(environment.ws_url+'/store_details/fatoorah_initiate_pay/'+environment.store_id, x); }

}