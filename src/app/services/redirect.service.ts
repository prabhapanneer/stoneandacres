import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { GlobalService } from './global.service';


@Injectable({
  providedIn: 'root'
})

export class RedirectService {

  catalog_list: any = [];
  country_list: any = [];
  catalogLoaded: boolean;
  store_id: string = this.gs.storeId;
  ws_url: string = this.gs.wsUrl;

  constructor(
    private http: HttpClient, private router: Router, @Inject(DOCUMENT) private document,
    @Inject(PLATFORM_ID) private platformId: Object, private gs: GlobalService
  ) { }

  CATALOG_MENU() { return this.http.get<any>(this.ws_url+'/store_details/catalog_menu?store_id='+this.store_id); }
  USER_DETAILS() {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.ws_url+'/user/customer', httpOptions);
  }
  PRODUCT_DETAILS(x) { return this.http.post<any>(this.ws_url+'/store_details/product/details?store_id='+this.store_id, x); }
  CATEGORY_DETAILS(x) { return this.http.post<any>(this.ws_url+'/store_details/category/details/v2?store_id='+this.store_id, x); }
  VENDOR_DETAILS(x) { return this.http.post<any>(this.ws_url+'/store_details/vendor/details?store_id='+this.store_id, x); }

  onRedirect(x) {
    if(x && x.link_status) {
      if(x.link_type == 'category')
      {
        let secIndex = this.catalog_list.findIndex(obj => obj._id==x.category_id);
        if(secIndex != -1) {
          let categoryDetails = this.catalog_list[secIndex];
          if(categoryDetails.seo_status) this.router.navigate(['/category/'+categoryDetails.seo_details.page_url]);
          else this.router.navigate(['/category/'+categoryDetails._id]);
        }
        else {
          this.CATEGORY_DETAILS({ category_id: x.category_id }).subscribe(result => {
            if(result.status) {
              let categoryDetails = result.data;
              if(categoryDetails.seo_status) this.router.navigate(['/category/'+categoryDetails.seo_details.page_url]);
              else this.router.navigate(['/category/'+categoryDetails._id]);
            }
            else console.log("response", result);
          });
        }
      }
      else if(x.link_type == 'vendor')
      {
        this.VENDOR_DETAILS({ vendor_id: x.vendor_id }).subscribe(result => {
          if(result.status) this.router.navigate(['/vendor/'+result.data.seo_details?.page_url]);
          else console.log("response", result);
        });
      }
      else if(x.link_type == 'product')
      {
        this.PRODUCT_DETAILS({ product_id: x.product_id }).subscribe(result => {
          if(result.status) {
            let productDetails = result.data;
            if(productDetails.seo_status) this.router.navigate(['/product/'+productDetails.seo_details.page_url]);
            else this.router.navigate(['/product/'+productDetails._id]);
          }
          else console.log("response", result);
        });
      }
      else if(x.link_type == 'internal') {
        this.router.navigate([x.link]);
      }
      else if(isPlatformBrowser(this.platformId) && x.link_type == 'external') {
        window.open(x.link, "_blank");
      }
    }
    this.document.getElementById('reset-menu')?.click();
  }

  getCountryList() {
    return new Promise((resolve, reject) => {
      if(!this.country_list.length && isPlatformBrowser(this.platformId)) {
        this.http.get<any>(this.ws_url+'/store_details/country_list').subscribe(result => {
          if(result.status) this.country_list = result.list;
          resolve(true);
        });
      }
      else resolve(true);
    });
  }

}