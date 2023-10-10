import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Location, isPlatformBrowser, PlatformLocation, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Buffer } from 'buffer';
import { GlobalService } from './global.service';
declare const $: any;

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  store_id: string = this.gs.storeId;
  currDate: Date = new Date();
  jsLoaded: boolean;

  menu_list: any = [];
  cart_list: any = [];
  wish_list: any = [];

  seo_details: any;
  user_details: any = {};
  store_details: any = {};
  currency_types: any= [];
  temp_currency: any;
  application_setting: any = {
    max_shipping_weight: 0, min_checkout_value: 0, gift_wrapping_charges: 0
  };
  checkout_setting: any = {};
  ys_features: any = [];
  store_properties: any = { pincodes: [], currency_list: [], pickup_locations: [], opening_days: [], img_tag_list: [], auto_tags: {} };
  nl_config: any; wc_config: any; ab_config: any;
  footer_config: any = {};
  extra_pages: any = {};
  giftcard_config: any = {};
  announcementBar: string;
  ipBasedCurrency: boolean;

  product_tags: any;
  product_features: any = {};
  vendor_features: any = {};

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
  layout_list: any = [];
  ai_styles: any = [];
  blog_list: any = [];
  collection_list: any = [];
  footer_seo_links: any = [];

  selected_model: any = {};
  selected_product: any;

  customView: boolean;
  measurementView: boolean;
  notesView: boolean;

  scroll_y_pos: number; screen_width: number;
  desktop_device: boolean; ios: boolean;
  previous_route: string; customer_token: string;

  search_page_attr: any = {};
  category_page_attr: any = {};
  product_page_attr: any;
  blog_page_attr: any = {};
  recipe_page_attr: any = {};
  giftcard_page_attr: any = {};
  appointment_cat_page_attr: any = {};
  appointment_page_attr: any = {};

  temp_offer_code: string;
  order_search: string;
  quot_search: string;
  coupon_search: string;
  appointment_search: string;

  favicon: any; store_logo: any; social_logo: any;
  primary_main_slider: any = []; primary_highlights: any = [];

  selected_currency: any;
  public currency_type = new Subject<any>();
  origin: any = 'https://'+this.platformLocation.hostname;

  min_qty: any = { "Pcs": 1, "Mts": 1, "Kgs": 1 };
  step_qty: any = { "Pcs": 1, "Mts": 1, "Kgs": 1 };
  customize_name: any = { "Pcs": "CUSTOMIZE YOUR GARMENT", "Mts": "STITCH GARMENT", "Kgs": "CUSTOMIZE YOUR PRODUCT" };

  storeDataLoaded: boolean;
  public storeDataListener = new Subject<any>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private location: Location, private platformLocation: PlatformLocation,
    private meta: Meta, private title: Title, private http: HttpClient, @Inject(DOCUMENT) private document, private gs: GlobalService
  ) {
    if(localStorage.getItem('customer_token')) this.customer_token = localStorage.getItem('customer_token');
    if(localStorage.getItem("sub")) this.origin = this.origin+'/'+localStorage.getItem("sub");

    if(localStorage.getItem("by_sd")) this.store_details = this.decode(localStorage.getItem("by_sd"));
    if(localStorage.getItem("by_ssd")) this.seo_details = this.decode(localStorage.getItem("by_ssd"));
    if(localStorage.getItem("by_sp")) this.store_properties = this.decode(localStorage.getItem("by_sp"));
    if(localStorage.getItem("by_sc")) this.setCurrency(this.decode(localStorage.getItem("by_sc")));
    if(localStorage.getItem("by_as")) {
      this.application_setting = this.decode(localStorage.getItem("by_as"));
      if(this.application_setting.min_qty) this.min_qty = this.application_setting.min_qty;
      if(this.application_setting.step_qty) this.step_qty = this.application_setting.step_qty;
      if(this.application_setting.customize_name) this.customize_name = this.application_setting.customize_name;
    }

    if(isPlatformBrowser(this.platformId)) {
      if(sessionStorage.getItem("by_ge")) this.guest_email = this.decode(sessionStorage.getItem("by_ge"));
      if(sessionStorage.getItem('guest_token')) this.guest_token = sessionStorage.getItem("guest_token");
      if(sessionStorage.getItem('sid')) this.session_id = sessionStorage.getItem("sid");
    }
  }

  buildTags(prodTags) {
    let newArr = [];
    let tagList = this.store_properties.img_tag_list;
    if(tagList?.length && prodTags?.length) {
      prodTags.forEach(el => {
        let tIndex = tagList.findIndex(obj => obj._id==el);
        if(tIndex!=-1) {
          newArr.push({ name: tagList[tIndex].name, rank: tagList[tIndex].rank });
        }
      });
    }
    return newArr;
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
      if(prod.vendor_id) newData.vendor_id = prod.vendor_id;
      updatedList.push(newData);
    });
    return updatedList;
  }

  setCurrency(value) {
    this.selected_currency = value;
    this.currency_type.next(this.selected_currency);
  }

  encode(data) {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
  decode(data) {
    try {
      let decodeData = Buffer.from(data, 'base64').toString();
      return JSON.parse(decodeData);
    } catch (e) {
      console.log("decode err-----", e);
      if(isPlatformBrowser(this.platformId)) {
        localStorage.clear();
        sessionStorage.clear();
      }
    }
  }

  /* JSON LD */
  createJsonLD(id, schema) {
    if(!this.document.getElementById(id)) {
      let script = this.document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.text =  `${JSON.stringify(schema)}`;
      this.document.getElementsByTagName("head")[0].appendChild(script);
    }
  }
  removeElement(id) {
    this.document.getElementById(id)?.remove();
  }
  /* JSON LD */

  getStoreSeoDetails() {
    if(this.seo_details) {
      this.setSiteMetaData(this.seo_details, null);
    }
    else {
      this.http.get<any>(this.gs.wsUrl+'/store_details/store?store_id='+this.gs.storeId).subscribe(result => {
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
    if(!image) image = this.gs.imgBaseurl+this.social_logo;
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

  moveNavigation() {
    let navigation = this.document.querySelector(".cd-nav");
    if(navigation) {
      if(this.desktop_device) {
        navigation.parentElement.removeChild(navigation);
        this.document.querySelector(".cd-header-buttons")?.after(navigation);
      } else {
        navigation.parentElement.removeChild(navigation);
        this.document.querySelector(".cd-main-content")?.after(navigation);
      }
    }
  }

  scrollModalTop(timer: number) {
    if(isPlatformBrowser(this.platformId) && this.jsLoaded) {
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
    this.document.getElementById("openCustomizationDetailsModal")?.click();
    this.scrollModalTop(500);
  }

  setCustomerData(details) {
    this.user_details = {
      _id: details._id, name: details.name, email: details.email,
      dial_code: details.dial_code, mobile: details.mobile
    };
    if(details.gst) this.user_details.gst = details.gst;
  }

  openEmi() {
    this.document.getElementById('open_emi')?.click();
  }

}

// browser storage variable expansion
/*
by_sp -> store properties
by_as -> application setting
by_cc -> customer cart
by_ca -> checkout address
by_cd -> checkout details
by_afl -> after login event
by_qo_cd -> quick order checkout
by_td -> temp data
by_ge -> guest email
by_cat_d -> category details
by_s_mm -> sizing mm
by_sm -> sizing modal
by_pa -> product attr

by_sd -> store details
by_ssd -> store seo details
by_sc -> selected currency
by_ais -> ai styles
by_go -> gtag orders
by_fo -> fbpixel orders
by_spl -> swipe product list

sid -> session id
sub -> sub domain name
*/