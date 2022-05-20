import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { Location, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from '../environments/environment';
import { ApiService } from './services/api.service';
import { CommonService } from './services/common.service';
import { WishlistService } from './services/wishlist.service';
import { CartlistService } from './services/cartlist.service';
import { StoreApiService } from './services/store-api.service';
import { CurrencyConversionService } from './services/currency-conversion.service';
import { DynamicAssetLoaderService } from './services/dynamic-asset-loader.service';
declare const Headroom: any;
declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './header-types/'+environment.header+'/app.html',
  styleUrls: ['./header-types/'+environment.header+'/app.scss']
})

export class AppComponent {
  
  currency_types: any = []; currency: any;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  isConnected = true; announcementBar: string;
  tempAnnounceBar: string; private subscription: Subscription;
  chatLoaded: boolean;

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  getWindowDetails() {
    if(isPlatformBrowser(this.platformId)) {
      this.commonService.scroll_x_pos = window.pageXOffset;
      this.commonService.scroll_y_pos = window.pageYOffset;
      this.commonService.screen_height = window.innerHeight;
      this.commonService.screen_width = window.innerWidth;
      // for scroll-top icon
      if(this.commonService.scroll_y_pos > 100) $(".scrollup").show();
      else $(".scrollup").hide();
      // for mega menu
      if(!window.requestAnimationFrame) setTimeout(() => { this.moveNavigation(); }, 300);
      else window.requestAnimationFrame(() => { this.moveNavigation(); });
    }
  }

	constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private deviceService: DeviceDetectorService, @Inject(DOCUMENT) private document,
		private storeApi: StoreApiService, private api: ApiService, public router: Router, public commonService: CommonService,
    public wishService: WishlistService, public cartService: CartlistService, public cc: CurrencyConversionService, private location: Location,
    private connectionService: ConnectionService, private assetLoader: DynamicAssetLoaderService
	) {
    // device type
    if(this.deviceService.isDesktop()) {
      this.commonService.desktop_device = true;
      this.commonService.gpayQrcode = true;
    }
    else {
      let iosPlatforms = ["iPad", "iPhone", "iPod", "iPod touch"];
      if(iosPlatforms.indexOf(navigator.platform) != -1) this.commonService.gpayQrcode = true;
    }
    // window properties
    this.getWindowDetails();
    // network status
    if(isPlatformBrowser(this.platformId)) {
      this.commonService.IsBrowser = true;
      this.connectionService.monitor().subscribe(isConnected => {
        this.isConnected = isConnected;
      });
    }
    // window loaded
    // this.document.addEventListener('readystatechange', event => {
    //   if(event.target.readyState === "complete") this.commonService.window_loaded = true;
    // });
  }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId) && !sessionStorage.getItem('sid')) {
      this.commonService.session_id = this.randomString(8)+new Date().valueOf()+this.randomString(8);
      sessionStorage.setItem('sid', this.commonService.session_id);
    }
  }

  ngAfterContentInit() {
    this.commonService.window_loaded = true;
    // favicon
    this.document.getElementById('appFavicon').setAttribute('href', this.imgBaseUrl+this.commonService.favicon);
    /* STORE DETAILS */
    this.storeApi.STORE_DETAILS().subscribe(result => {
      if(result.status) {
        let storeDetails = JSON.parse(result.store_details);
        if(storeDetails.status=='active') {
          let liveCurrencies = JSON.parse(result.live_currencies);
          let storeProperties = storeDetails.store_properties[0];
          // ys features
          this.commonService.ys_features = JSON.parse(result.ys_features);
          localStorage.setItem("ys_features", this.commonService.encryptData(this.commonService.ys_features));
          // ip-based currency
          this.commonService.ipBasedCurrency = false;
          if(this.commonService.ys_features.indexOf('ip_based_4_currency')!=-1 || this.commonService.ys_features.indexOf('ip_based_10_currency')!=-1 || this.commonService.ys_features.indexOf('ip_based_25_plus_currency')!=-1) {
            this.commonService.ipBasedCurrency = true;
          }
          // store details
          this.commonService.store_details = {
            name: storeDetails.name, company_details: storeDetails.company_details, country: storeDetails.country,
            additional_features: storeDetails.additional_features
          };
          if(storeDetails.gst_no) this.commonService.store_details.gst_no = storeDetails.gst_no;
          if(storeDetails.tax_config) this.commonService.store_details.tax_config = storeDetails.tax_config;
          if(storeDetails.packaging_charges) this.commonService.store_details.packaging_charges = storeDetails.packaging_charges;
          localStorage.setItem("store_details", this.commonService.encryptData(this.commonService.store_details));
          // seo details
          this.commonService.seo_details = storeDetails.seo_details;
          localStorage.setItem("seo_details", this.commonService.encryptData(this.commonService.seo_details));
          // store properties
          this.commonService.store_properties = {
            pincodes: storeProperties.pincodes, currency_list: storeProperties.currency_list, opening_days: storeProperties.opening_days, pickup_locations: []
          };
          if(this.commonService.ys_features.indexOf('store_pickup')!=-1) {
            this.commonService.store_properties.pickup_locations = storeProperties.branches.filter(obj => obj.pickup_location && obj.status=='active');
          }
          localStorage.setItem("store_properties", this.commonService.encryptData(this.commonService.store_properties));
          // payment methods
          this.commonService.payment_methods = storeDetails.payment_types;
          localStorage.setItem("payment_methods", this.commonService.encryptData(this.commonService.payment_methods));
          // application setting
          if(storeProperties.application_setting) {
            this.commonService.application_setting = storeProperties.application_setting;
            if(this.commonService.application_setting.min_qty) this.commonService.min_qty = this.commonService.application_setting.min_qty;
            if(this.commonService.application_setting.step_qty) this.commonService.step_qty = this.commonService.application_setting.step_qty;
            if(this.commonService.application_setting.customize_name) this.commonService.customize_name = this.commonService.application_setting.customize_name;
          }
          localStorage.setItem("application_setting", this.commonService.encryptData(this.commonService.application_setting));
          // checkout setting
          if(storeProperties.checkout_setting) this.commonService.checkout_setting = storeProperties.checkout_setting;
          localStorage.setItem("checkout_setting", this.commonService.encryptData(this.commonService.checkout_setting));
          // footer config
          if(storeProperties.footer_config) this.commonService.footer_config = storeProperties.footer_config;
          localStorage.setItem("footer_config", this.commonService.encryptData(this.commonService.footer_config));
          // giftcard config
          if(storeProperties.giftcard_config) this.commonService.giftcard_config = storeProperties.giftcard_config;
          localStorage.setItem("giftcard_config", this.commonService.encryptData(this.commonService.giftcard_config));
          // blog seo
          if(storeProperties.blog_seo) this.commonService.blog_seo = storeProperties.blog_seo;
          localStorage.setItem("bs", this.commonService.encryptData(this.commonService.blog_seo));
          // catalogs
          this.commonService.catalog_list = storeDetails.section_list;
          // menus
          this.commonService.menu_list = storeDetails.menu_list;
          this.commonService.menu_list.forEach(menu => {
            menu.sec_count = menu.sections.length + menu.menu_images.length;
            if(menu.sections.length) {
              let secIndex = menu.sections.findIndex(sec => sec.categories.length);
              if(secIndex==-1) {
                menu.sections_in_one_col = true;
                menu.sec_count = 1 + menu.menu_images.length;
              }
            }
          });
          // announcement bar
          if(!storeDetails.website) storeDetails.website = "";
          if(this.commonService.application_setting.announcebar_status) {
            let abConfig = this.commonService.application_setting.announcebar_config;
            if(abConfig && abConfig.timer && abConfig.timer_date) {
              // TIMER
              const countDownDate = new Date(abConfig.timer_date).getTime();
              if(isPlatformBrowser(this.platformId) && countDownDate > new Date().getTime())
              {
                this.announcementBar = " "; this.tempAnnounceBar = abConfig.content;
                this.subscription = interval(1000).subscribe(x => { this.startAnnounceInterval(countDownDate); });
              }
              else this.announcementBar = storeDetails.website.toUpperCase();
              this.setBodyMarginTop(1100);
            }
            else this.announcementBar = abConfig.content;
          }
          else this.announcementBar = storeDetails.website.toUpperCase();
          this.setBodyMarginTop(100);
          // newsletter
          if(this.commonService.application_setting.newsletter_status) {
            let nlConfig = this.commonService.application_setting.newsletter_config;
            nlConfig.sub_heading = nlConfig.sub_heading.replace(new RegExp('\n', 'g'), "<br />");
            if(isPlatformBrowser(this.platformId) && nlConfig.open_onload && this.commonService.ys_features.indexOf('newsletter')!=-1 && this.router.url=='/') {
              if(this.document.getElementById("openSubscribeModal")) this.document.getElementById("openSubscribeModal").click();
            }
          }
          // chat
          if(isPlatformBrowser(this.platformId) && this.commonService.ys_features.indexOf('messenger')!=-1 && this.commonService.application_setting.chat_status && this.commonService.application_setting.chat_config.type=='third_party' && this.router.url=='/') {
            this.loadChat(this.commonService.application_setting.chat_config.url);
          }
          // currency types
          this.updateCurrencyValue(storeDetails.currency_types, liveCurrencies);
          // update customer details
          if(this.commonService.customer_token) {
            if(storeDetails._id==localStorage.getItem("store_id")) {
              this.api.USER_DETAILS().subscribe(result => {
                if(result.status) {
                  this.wishService.resetWishList(result.data.wish_list);
                  this.cartService.resetCartList(result.data.cart_list);
                  this.commonService.user_details = {
                    name: result.data.name, email: result.data.email,
                    dial_code: result.data.dial_code, mobile: result.data.mobile
                  };
                  if(result.data.gst) this.commonService.user_details.gst = result.data.gst;
                  localStorage.setItem("user_details", this.commonService.encryptData(this.commonService.user_details));
                }
                else {
                  console.log("user response", result);
                  this.accountRedirect();
                }
              });
            }
            else this.accountRedirect();
          }
        }
        else {
          this.router.navigate(['/others/service-unavailable']);
        }
      }
      else console.log("store response", result);
    });

    /* ROUTER EVENT */
    let currentUrl = this.router.url;
		this.router.events.subscribe(event => {
			if(event instanceof NavigationEnd) {
        let routeName = this.location.path();
        // SEO
        if(routeName.indexOf("/category/")==-1 && routeName.indexOf("/product/")==-1 && routeName.indexOf("/blogs")==-1) {
          this.commonService.getStoreSeoDetails();
        }
        // hide content
        this.commonService.hideHeader = false; this.commonService.hideFooter = false;
        this.commonService.hideTopbar = false; this.commonService.hideCurrencySelect = false;
        if(routeName.indexOf("/gift-cards/")!=-1) { this.commonService.hideCurrencySelect = true; }
        if(routeName.indexOf("/checkout/")!=-1) { this.commonService.hideHeader = true; }
        if(routeName.indexOf("/others/")!=-1) {
          this.commonService.hideHeader = true; this.commonService.hideFooter = true; this.commonService.hideTopbar = true;
        }
        if(this.router.url!='/') this.setBodyMarginTop(100);
        // chat
        let appSetting = this.commonService.application_setting;
        if(this.commonService.ys_features.indexOf('messenger')!=-1 && appSetting.chat_status && appSetting.chat_config.only_on_home && appSetting.chat_config.type=='third_party') {
          if(isPlatformBrowser(this.platformId) && this.document.getElementById("third_party_chat")) {
            if(event.url=='/') $("#third_party_chat").nextAll("div").attr('style', 'display: block !important; z-index: 1000 !important;');
            else $("#third_party_chat").nextAll("div").attr('style', 'display: none !important; z-index: 1000 !important;');
          }
          else if(event.url=='/') this.loadChat(appSetting.chat_config.url);
        }
        // prev route
        this.commonService.previous_route = currentUrl;
        currentUrl = event.url;
        //NOTE: This Function Will trigger close event in menu
				this.commonService.resetMegaMenu();
			}
    });
    
    /* HEADROOM */
    this.assetLoader.load('headroom-js', 'headroom-css').then(data => {
      let headroomElement = this.document.querySelector("#headroom-head");
      new Headroom(headroomElement, {
        offset: 150,
        tolerance: 5,
        classes: {
          initial: "animated",
          pinned: "slideDown",
          unpinned: "slideUp"
        }
      }).init();
    }).catch(error => console.log("err", error));
  }

  accountRedirect() {
    localStorage.removeItem("customer_token");
    delete this.commonService.customer_token;
    localStorage.removeItem("user_details");
    this.commonService.user_details = {};
    this.wishService.resetWishList([]);
    this.cartService.resetCartList([]);
    this.router.navigate(["/account"]);
  }

	updateCurrencyValue(currencyTypes, liveList) {
    let currencyIndex = currencyTypes.findIndex(obj => obj.default_currency);
    this.commonService.store_details.currency = currencyTypes[currencyIndex].country_code;
    localStorage.setItem("store_details", this.commonService.encryptData(this.commonService.store_details));
    // run in browser side(for overcome ssr country_code unefined error)
    if(isPlatformBrowser(this.platformId)) {
      currencyTypes.forEach(element => {
        let liveIndex = liveList.findIndex(obj => obj.name==element.country_code);
        element.country_inr_value = parseFloat(liveList[liveIndex].rates[this.commonService.store_details.currency].toFixed(2));
      });
      this.currency_types = currencyTypes;
      // ip based
      if(this.commonService.ipBasedCurrency && this.commonService.store_properties.currency_list.length) {
        let ipIndex = "0"; let ipIndexList = [];
        this.commonService.ip_urls.forEach((element, index) => {
          ipIndexList.push(index.toString());
        });
        if(localStorage.getItem("ip_index")) ipIndex = localStorage.getItem("ip_index");
        ipIndexList.splice(ipIndexList.indexOf(ipIndex), 1);
        // call api(1)
        this.commonService.getIpInfo(ipIndex)
        .then((ipInfo) => { this.getCurrencyType(ipInfo, currencyIndex); })
        .catch((err) => {
          ipIndex = ipIndexList[0]; ipIndexList.splice(0, 1);
          // call api(2)
          this.commonService.getIpInfo(ipIndex)
          .then((ipInfo) => {this.getCurrencyType(ipInfo, currencyIndex); })
          .catch((err) => {
            ipIndex = ipIndexList[0]; ipIndexList.splice(0, 1);
            // call api(3)
            this.commonService.getIpInfo(ipIndex)
            .then((ipInfo) => { this.getCurrencyType(ipInfo, currencyIndex); })
            .catch((err) => {
              console.log("-----err", err);
              this.commonService.ipBasedCurrency = false;
              this.setStoreCurrency(currencyIndex);
            });
          });
        });
      }
      else {
        if(localStorage.getItem("selected_currency")) {
          let selectedCurrency = this.commonService.decryptData(localStorage.getItem("selected_currency"));
          let localIndex = this.currency_types.findIndex(obj => obj.country_code==selectedCurrency.country_code);
          if(localIndex!=-1) { currencyIndex = localIndex; }
          this.setStoreCurrency(currencyIndex);
        }
        else this.setStoreCurrency(currencyIndex);
      }
    }
  }
  getCurrencyType(ipInfo, currencyIndex) {
    if(ipInfo) {
      let countryCurrency = this.commonService.store_properties.currency_list.filter(obj => obj.country_list.findIndex(el => this.optString(el.code)==this.optString(ipInfo.country_code) || this.optString(el.name)==this.optString(ipInfo.country_name))!=-1);
      if(countryCurrency.length) {
        let ipIndex = this.currency_types.findIndex(obj => obj.country_code==countryCurrency[0].currency_code);
        if(ipIndex!=-1) { currencyIndex = ipIndex; }
        this.setStoreCurrency(currencyIndex);
      }
      else this.setStoreCurrency(currencyIndex);
    }
    else this.setStoreCurrency(currencyIndex);
  }
  setStoreCurrency(index) {
    this.currency = this.currency_types[index];
    this.commonService.setCurrency(this.currency);
    localStorage.setItem("selected_currency", this.commonService.encryptData(this.currency));
  }
  
	onCurrencyChange() {
    this.commonService.setCurrency(this.currency);
    this.cartService.findCurrency();
    localStorage.setItem("selected_currency", this.commonService.encryptData(this.currency));
  }
  
  startAnnounceInterval(tillDate) {
    let distance = tillDate - new Date().getTime();
    if(distance >= 0) {
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      let timer = String(hours).padStart(2, '0')+"h:"+String(minutes).padStart(2, '0')+"m:"+String(seconds).padStart(2, '0')+"s";
      if(days>0) { timer = String(days).padStart(2, '0')+"d:"+timer; }
      if(this.document.getElementById("announceBar")) {
        if(this.tempAnnounceBar.includes("TIMER")) this.document.getElementById("announceBar").innerHTML = this.tempAnnounceBar.replace("TIMER", timer);
        else this.document.getElementById("announceBar").innerHTML = this.tempAnnounceBar+' '+timer;
      }
    }
    else {
      this.announcementBar = "";
      this.subscription.unsubscribe();
    }
  }
  
  optString(str) {
    return str.replace(/[^A-Z0-9]/ig, "").toLowerCase();
  }
  
  moveNavigation() {
    let navigation = $('.cd-nav');
    if(this.commonService.screen_width >= 992) {
      navigation.detach();
      navigation.insertBefore('.cd-header-buttons');
    } else {
      navigation.detach();
      navigation.insertAfter('.cd-main-content');
    }
  }

  loadChat(src) {
    if(isPlatformBrowser(this.platformId) && !this.chatLoaded) {
      let script = this.document.createElement("script");
      script.type = "text/javascript";
      script.id = "third_party_chat";
      this.document.getElementsByTagName("body")[0].appendChild(script);
      script.src = src;
      script.onload = () => {
        setTimeout(() => {
          $("#third_party_chat").nextAll("div").attr('style', 'display: block !important; z-index: 1000 !important;');
        }, 5000);
      }
      this.chatLoaded = true;
    }
  }

  openCustomDetails() {
    this.commonService.customView = false;
    this.commonService.measurementView = false;
    this.commonService.notesView = false;
    if(this.commonService.selected_model) {
      if(this.commonService.selected_model.custom_list.length) this.commonService.customView = true;
      else if(this.commonService.selected_model.mm_sets.length) this.commonService.measurementView = true;
      else if(this.commonService.selected_model.notes_list.length) this.commonService.notesView = true;
    }
  }

  setBodyMarginTop(timer: number) {
    setTimeout(() => {
      let mastHeight = this.document.getElementById("headroom-head").offsetHeight;
      this.document.body.style.marginTop = mastHeight+'px';
    }, timer);
  }

  randomString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for(let i=0; i<length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    } 
    return result;
  }

}