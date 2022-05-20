import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Location, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StoreApiService } from './store-api.service';
import { environment } from '../../environments/environment';
declare const CryptoJS: any;
declare const $: any;

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  seo_details: any;
  user_details: any = {};
  store_details: any = {};
  application_setting: any = {
    max_shipping_weight: 0, min_checkout_value: 0, gift_wrapping_charges: 0
  };
  checkout_setting: any = {};
  ys_features: any = [];
  country_list: any = [];
  store_properties: any = { pincodes: [], currency_list: [], pickup_locations: [], opening_days: [] };
  product_features: any = {};
  footer_config: any = {};
  extra_pages: any = {};
  giftcard_config: any = {};
  blog_seo: any = {};

  after_login_event: any;
  guest_email: string;
  guest_token: string;
  session_id: string;

  privacy_policy: any;
  shipping_policy: any;
  cancellation_policy: any;
  terms_conditions: any;
  
  contact_page_info: any;
  store_locations: any;
  discount_page: any;

  payment_methods: any = [];
  catalog_list: any = [];
  menu_list: any = [];
  layout_list: any = [];
  ai_styles: any = [];
  blog_list: any = [];
  search_category_list: any = [];
  collection_list: any = [];

  selected_model: any = {};
  selected_product: any;
  selected_blog: any;
  selected_order: any;

  hideCurrencySelect: boolean;
  ipBasedCurrency: boolean;

  customView: boolean;
  measurementView: boolean;
  notesView: boolean;

  hideHeader: boolean; hideFooter: boolean; hideTopbar: boolean;
  scroll_x_pos: number; scroll_y_pos: number;
  screen_width: number; screen_height: number;
  desktop_device: boolean; IsBrowser: boolean;
  window_loaded: boolean;
  previous_route: string;
  customer_token: string;

  search_page_attr: any = {};
  category_page_attr: any = {};
  product_page_attr: any;
  blog_page_attr: any = {};
  giftcard_page_attr: any = {};
  appointment_cat_page_attr: any = {};
  appointment_page_attr: any = {};

  temp_offer_code: string;
  order_search: string;
  coupon_search: string;
  appointment_search: string;
  gpayQrcode: boolean;

  currDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  randomNum = this.currDate.getFullYear()+''+this.currDate.getMonth()+''+this.currDate.getDate()+''+this.currDate.getHours()+''+this.currDate.getMinutes();;
  store_logo: any = "uploads/"+environment.store_id+"/logo.png?v="+this.randomNum;
  social_logo: any = "uploads/"+environment.store_id+"/social_logo.jpg?v="+this.randomNum;
  primary_main_slider: any = [
    {
      "desktop_img": "uploads/"+environment.store_id+"/layouts/desktop_primary_slider.jpg?v="+localStorage.getItem("random_num"),
      "mobile_img": "uploads/"+environment.store_id+"/layouts/mobile_primary_slider.jpg?v="+localStorage.getItem("random_num")
    }
  ];
  favicon = "uploads/"+environment.store_id+"/favicon.png?v="+this.randomNum;

  selected_currency: any;
  public currency_type = new Subject<any>();
  cryptoSecretkey: string = "$eCReTYoUr065SToRE217KeY";
  origin: any = 'https://'+environment.domain;

  min_qty: any = { "Pcs": 1, "Mts": 1, "Kgs": 1 };
  step_qty: any = { "Pcs": 1, "Mts": 1, "Kgs": 1 };
  customize_name: any = { "Pcs": "CUSTOMIZE YOUR GARMENT", "Mts": "STITCH GARMENT", "Kgs": "CUSTOMIZE YOUR PRODUCT" };
  ip_urls: any = [
    "https://ipapi.co/json",
    "https://freegeoip.app/json/",
    "https://api.db-ip.com/v2/free/self"
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private location: Location, private router: Router, private storeApi: StoreApiService,
    private sanitizer: DomSanitizer, private meta: Meta, private title: Title, private http: HttpClient, @Inject(DOCUMENT) private document
  ) {
    if(localStorage.getItem('customer_token')) this.customer_token = localStorage.getItem('customer_token');
    if(isPlatformBrowser(this.platformId)) {
      if(localStorage.getItem('user_details')) this.user_details = this.decryptData(localStorage.getItem("user_details"));
      if(localStorage.getItem('store_details')) this.store_details = this.decryptData(localStorage.getItem("store_details"));
      if(localStorage.getItem('seo_details')) this.seo_details = this.decryptData(localStorage.getItem("seo_details"));
      if(localStorage.getItem('store_properties')) this.store_properties = this.decryptData(localStorage.getItem("store_properties"));
      if(localStorage.getItem('application_setting')) {
        this.application_setting = this.decryptData(localStorage.getItem("application_setting"));
        if(this.application_setting.min_qty) this.min_qty = this.application_setting.min_qty;
        if(this.application_setting.step_qty) this.step_qty = this.application_setting.step_qty;
        if(this.application_setting.customize_name) this.customize_name = this.application_setting.customize_name;
      }
      if(localStorage.getItem('checkout_setting')) this.checkout_setting = this.decryptData(localStorage.getItem("checkout_setting"));
      if(localStorage.getItem('footer_config')) this.footer_config = this.decryptData(localStorage.getItem("footer_config"));
      if(localStorage.getItem('payment_methods')) this.payment_methods = this.decryptData(localStorage.getItem("payment_methods"));
      if(localStorage.getItem('bs')) this.blog_seo = this.decryptData(localStorage.getItem("bs"));
      if(localStorage.getItem('ys_features')) this.ys_features = this.decryptData(localStorage.getItem("ys_features"));
      if(localStorage.getItem("selected_currency")) this.setCurrency(this.decryptData(localStorage.getItem("selected_currency")));
      if(sessionStorage.getItem('country_list')) this.country_list = this.decryptData(sessionStorage.getItem("country_list"));
      if(sessionStorage.getItem('guest_email')) this.guest_email = this.decryptData(sessionStorage.getItem("guest_email"));
      if(sessionStorage.getItem('guest_token')) this.guest_token = sessionStorage.getItem("guest_token");
      if(sessionStorage.getItem('sid')) this.session_id = sessionStorage.getItem("sid");
      if(this.ys_features.indexOf('ip_based_4_currency')!=-1 || this.ys_features.indexOf('ip_based_10_currency')!=-1 || this.ys_features.indexOf('ip_based_25_plus_currency')!=-1) {
        this.ipBasedCurrency = true;
      }
    }
  }

  getItemList(list) {
    let updatedList = [];
    list.forEach(prod => {
      let newData: any = { product_id: prod.product_id, quantity: prod.quantity, unit: prod.unit, image: prod.image };
      if(prod.variant_status && prod.variant_types && prod.variant_types.length) {
        newData.variant_status = true;
        newData.variant_types = prod.variant_types;
      }
      if(prod.addon_status) {
        if(prod.selected_addon || prod.addon_id) {
          newData.addon_status = true;
          if(prod.addon_id) newData.addon_id = prod.addon_id;
          if(prod.selected_addon) newData.addon_id = prod.selected_addon._id;
          if(prod.customization_status && prod.customized_model) {
            newData.customization_status = true;
            newData.model_id = prod.customized_model.model_id;
          }
        }
      }
      updatedList.push(newData);
    });
    return updatedList;
  }

  setCurrency(value) {
    this.selected_currency = value;
    this.currency_type.next(this.selected_currency);
  }

  encryptData(data) {
    try {
      if(isPlatformBrowser(this.platformId)) return CryptoJS.AES.encrypt(JSON.stringify(data), this.cryptoSecretkey).toString();
    } catch (e) {
      console.log("encrypt err-----", e);
    }
  }
  decryptData(data) {
    try {
      if(isPlatformBrowser(this.platformId)) {
        const bytes = CryptoJS.AES.decrypt(data, this.cryptoSecretkey);
        if(bytes.toString()) {
          return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        }
        return data;
      }
    } catch (e) {
      console.log("decrypt err-----", e);
    }
  }

  /* JSON LD */
  getSafeHTML(jsonLD: {[key: string]: any}): SafeHtml {
    const json = jsonLD ? JSON.stringify(jsonLD, null, 2).replace(/<\/script>/g, '<\\/script>') : ''; 
    const html = `<script type="application/ld+json">${json}</script>`;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  currencyFormat(input) {
    let result = input.toString().split('.');
    let lastThree = result[0].slice(result[0].length - 3);
    let otherNumbers = result[0].slice(0, result[0].length - 3);
    if(otherNumbers != '') lastThree = ',' + lastThree;
    let output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    if(result.length > 1) output += "." + result[1];
    return output+".00";
  }
  /* JSON LD */

  getCountryList() {
    return new Promise((resolve, reject) => {
      if(!this.country_list.length && isPlatformBrowser(this.platformId)) {
        this.storeApi.COUNTRY_LIST().subscribe(result => {
          if(result.status) this.country_list = result.list;
          sessionStorage.setItem("country_list", this.encryptData(this.country_list));
          resolve(true);
        });
      }
      else resolve(true);
    });
  }

  getStoreSeoDetails() {
    if(this.seo_details) {
      this.setSiteMetaData(this.seo_details, null);
    }
    else {
      this.http.get<any>(environment.ws_url+'/store_details/store?store_id='+environment.store_id).subscribe(result => {
        if(result.status) {
          this.seo_details = result.details.seo_details;
          this.setSiteMetaData(this.seo_details, null);
        }
        else console.log("store response", result);
      });
    }
  }
  setSiteMetaData(seoDetails, image) {
    if(this.seo_details) {
      this.meta.updateTag({ name: 'theme-color', content: this.seo_details.tile_color });
      this.meta.updateTag({ property: 'og:site_name', content: this.seo_details.page_title });
    }
    if(!image) image = environment.img_baseurl+this.social_logo;
    this.title.setTitle(seoDetails.page_title);
    this.meta.updateTag({ name: 'description', content: seoDetails.meta_desc });
    this.meta.updateTag({ name: 'keywords', content: seoDetails.meta_keywords.join() });
    this.meta.updateTag({ property: 'og:title', content: seoDetails.page_title });
    this.meta.updateTag({ property: 'og:description', content: seoDetails.meta_desc });
    this.meta.updateTag({ property: 'og:image', content: image });
  }

  transformHtml(content) {
    return content.replace(new RegExp('\n', 'g'), "<br />");
  }

  goBack() {
    this.location.back();
  }

  scrollModalTop(timer: number) {
    if(isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        $('.modal-body').each(function(index, element) {
          let className = 'modal-body'+(index+1);
          element.classList.add(className);
          $("."+className).scrollTop(0);
        });
      }, timer);
    }
  }

  pageScrollTop() {
    if(isPlatformBrowser(this.platformId)) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onViewModel(x) {
    this.selected_model = x;
    this.document.getElementById("openCustomizationDetailsModal").click();
    this.scrollModalTop(500);
  }

  onPageRedirect(x) {
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
          this.storeApi.CATEGORY_DETAILS({ category_id: x.category_id }).subscribe(result => {
            if(result.status) {
              let categoryDetails = result.data;
              if(categoryDetails.seo_status) this.router.navigate(['/category/'+categoryDetails.seo_details.page_url]);
              else this.router.navigate(['/category/'+categoryDetails._id]);
            }
            else console.log("response", result);
          });
        }
      }
      else if(x.link_type == 'product')
      {
        this.storeApi.PRODUCT_DETAILS({ product_id: x.product_id }).subscribe(result => {
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
    this.resetMegaMenu();
  }

  resetMegaMenu() {
    if(isPlatformBrowser(this.platformId)) {
      $('.cd-nav-trigger').removeClass('nav-is-visible');
      $('.cd-main-header').removeClass('nav-is-visible');
      $('.cd-primary-nav').removeClass('nav-is-visible');
      $('.has-children ul').addClass('is-hidden');
      $('.has-children a').removeClass('selected');
      $('.moves-out').removeClass('moves-out');
      $('body').removeClass('overflow-hidden');
      $('.cd-main-content').removeClass('nav-is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () { });
      // close cart overlay
      $('.cart-overlay-close').click();
    }
  }

  getIpInfo(ipIndex) {
    return new Promise((resolve, reject) => {
      this.storeApi.IP_INFO(this.ip_urls[Number(ipIndex)]).subscribe(result => {
        localStorage.setItem("ip_index", ipIndex);
        if(ipIndex==="0" || ipIndex==="1") {
          if(result.country_name && result.country_code) {
            let ipInfo = { country_name: result.country_name, country_code: result.country_code };
            resolve(ipInfo);
          }
          else resolve(null);
        }
        else if(ipIndex==="2") {
          if(result.countryName && result.countryCode) {
            let ipInfo = { country_name: result.countryName, country_code: result.countryCode };
            resolve(ipInfo);
          }
          else resolve(null);
        }
        else resolve(null);
      },
      (error) => { reject(error); });
    });
  }

  thausandFormatConverter(number) {
    var convertedValue;
    var returnValue;
    var originalNumber = Math.abs(Number(number));

    if (originalNumber > 0 && originalNumber <= 999) 
    {  
        convertedValue = originalNumber / 100;   
        returnValue = parseFloat(convertedValue).toFixed(2) + " ";
    } 
    else if (originalNumber > 999 && originalNumber <= 99999) 
    {
        convertedValue = originalNumber / 1000;
        returnValue = parseFloat(convertedValue).toFixed(2) + " K";
    } 
    else if (originalNumber > 99999 && originalNumber <= 9999999) 
    {
        convertedValue = originalNumber / 100000;
        returnValue = parseFloat(convertedValue).toFixed(2) + " L";
    } 
    else if (originalNumber > 9999999) 
    {
        convertedValue = originalNumber / 10000000;
        returnValue = parseFloat(convertedValue).toFixed(2) + " C";
    } 
    else 
    {
      returnValue = originalNumber;
    }
    if (number < 0) {
      returnValue = "-" + convertedValue;
    }

    return returnValue;
}

}