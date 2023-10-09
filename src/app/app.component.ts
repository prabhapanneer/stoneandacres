import { Component, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { Location, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { fromEvent, Subscription, interval } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';
import { environment } from '../environments/environment';
import { AppService } from './services/app.service';
import { CommonService } from './services/common.service';
import { StartupService } from './services/startup.service';
import { CurrencyConversionService } from './services/currency-conversion.service';
import { DynamicAssetLoaderService } from './services/dynamic-asset-loader.service';
declare const Headroom: any;
declare const WOW: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  
  template_setting: any = environment.template_setting;
  tempAnnounceBar: string; private subscription: Subscription;
  imgBaseUrl: string = environment.img_baseurl; currUrl: string;
  isConnected = true; chatLoaded: boolean; intracted: boolean;
  wowjsLoaded: boolean; headroomInit: boolean; appConfig: any;
  ip_urls: any = [
    "https://ipapi.co/json",
    "https://freegeoip.app/json/",
    "https://api.db-ip.com/v2/free/self"
  ];

  @HostListener('window:scroll', ['$event'])
  onScrollEvent() {
    localStorage.removeItem("random_num");
    if(isPlatformBrowser(this.platformId)) {
      this.cs.scroll_y_pos = window.pageYOffset;
      // for scroll-top icon
      let scrollElem = this.document.getElementById('scrollup');
      if(scrollElem) {
        if(window.pageYOffset > 100) scrollElem.style.display = 'block';
        else scrollElem.style.display = 'none';
      }
      // wow js
      if(window.pageYOffset > 0 && !this.wowjsLoaded) {
        this.wowjsLoaded = true;
        this.assetLoader.load('wow-js').then(() => {
          new WOW().init();
        }).catch(error => console.log("wow-js err", error));
      }
      // headroom
      if(window.pageYOffset > 150 && !this.headroomInit && environment.template_setting.headroom) {
        this.headroomInit = true;
        this.assetLoader.load('headroom-js', 'headroom-css').then(() => {
          let headroomElement = this.document.querySelector("#headroom-head");
          new Headroom(headroomElement, {
            offset: 150,
            tolerance: 5,
            classes: { initial: "animated", pinned: "slideDown", unpinned: "slideUp" }
          }).init();
        }).catch(error => console.log("err", error));
      }
    }
  }
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    if(isPlatformBrowser(this.platformId)) {
      this.cs.screen_width = window.innerWidth;
      // device type
      this.cs.desktop_device = false;
      if(window.innerWidth >= 992) this.cs.desktop_device = true;
      if(["iPad", "iPhone", "iPod", "iPod touch"].indexOf(navigator.platform) != -1) this.cs.ios = true;
      // for mega menu
      if(!window.requestAnimationFrame) setTimeout(() => { this.cs.moveNavigation(); }, 300);
      else window.requestAnimationFrame(() => { this.cs.moveNavigation(); });
    }
  }

	constructor(
    @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document, private meta: Meta, private api: AppService, private router: Router, private cc: CurrencyConversionService,
    public cs: CommonService, private location: Location, private connectionService: ConnectionService, private assetLoader: DynamicAssetLoaderService, public sus: StartupService
	) {
    // window properties
    this.onScrollEvent();
    this.onResizeEvent();
    if(isPlatformBrowser(this.platformId)) {
      // network status
      this.connectionService.monitor().subscribe(isConnected => {
        this.isConnected = isConnected;
      });
      // interaction
      fromEvent(document, 'mousemove').subscribe(() => this.onInteract());
      fromEvent(document, 'touchmove').subscribe(() => this.onInteract());
      fromEvent(document, 'scroll').subscribe(() => this.onInteract());
    }
  }

  ngOnInit() {
    if(isPlatformBrowser(this.platformId) && this.location.path().split('?')[0]!='') {
      let bgElem = this.document.getElementById('pre-bg');
      if(bgElem && bgElem.style.display != "none") bgElem.style.display = "none";
    }
    // site images
    if(this.cs.store_id) {
      this.cs.favicon = "uploads/"+this.cs.store_id+"/favicon.png?v="+this.sus.randomNum;
      this.cs.store_logo = "uploads/"+this.cs.store_id+"/logo.png?v="+this.sus.randomNum;
      this.cs.social_logo = "uploads/"+this.cs.store_id+"/social_logo.jpg?v="+this.sus.randomNum;
    }
    // session id
    if(isPlatformBrowser(this.platformId) && !sessionStorage.getItem('sid')) {
      this.cs.session_id = this.randomString(8)+new Date().valueOf()+this.randomString(8);
      sessionStorage.setItem('sid', this.cs.session_id);
    }
    if(this.cs.store_id) {
      // favicon
      this.document.getElementById('appFavicon').setAttribute('href', this.imgBaseUrl+this.cs.favicon);
      /* STORE DETAILS */
      this.api.STORE_DETAILS().subscribe(result => {
        if(result.status) {
          let storeDetails = result.store_details;
          if(storeDetails.status=='active') {
            let liveCurrencies = result.live_currencies;
            let storeProperties = storeDetails.store_properties[0];
            // ys features
            this.cs.ys_features = result.ys_features;
            // ip-based currency
            this.cs.ipBasedCurrency = false;
            if(this.cs.ys_features.indexOf('ip_based_4_currency')!=-1 || this.cs.ys_features.indexOf('ip_based_10_currency')!=-1 || this.cs.ys_features.indexOf('ip_based_25_plus_currency')!=-1) {
              this.cs.ipBasedCurrency = true;
            }
            // store details
            this.cs.store_details = {
              name: storeDetails.name, company_details: storeDetails.company_details, country: storeDetails.country,
              additional_features: storeDetails.additional_features, package_details: storeDetails.package_details,
              domain: environment.domain, sub_type: 'order'
            };
            if(storeDetails.gst_no) this.cs.store_details.gst_no = storeDetails.gst_no;
            if(storeDetails.sub_type) this.cs.store_details.sub_type = storeDetails.sub_type;
            if(storeDetails.tax_config) this.cs.store_details.tax_config = storeDetails.tax_config;
            if(storeDetails.packaging_charges) this.cs.store_details.packaging_charges = storeDetails.packaging_charges;
            if(storeDetails.customer_contact_no) this.cs.store_details.cust_cn = storeDetails.customer_contact_no;
            localStorage.setItem("by_sd", this.cs.encode(this.cs.store_details));
            // sv code
            if(storeDetails.analytics_details?.vcodes) this.meta.addTags(storeDetails.analytics_details.vcodes);
            // if(environment.production) {
            //   let analyticsData = storeDetails.analytics_details;
            //   if(analyticsData?.ga_id) this.loadGoogleAnalytics(analyticsData.ga_id);
            //   if(analyticsData?.gt_id) this.loadGTM(analyticsData.gt_id);
            //   if(analyticsData?.fbp_id) this.loadFbPixel(analyticsData.fbp_id);
            // }
            // seo details
            this.cs.seo_details = storeDetails.seo_details;
            localStorage.setItem("by_ssd", this.cs.encode(this.cs.seo_details));
            // store properties
            this.cs.store_properties = {
              pincodes: storeProperties.pincodes, currency_list: storeProperties.currency_list, opening_days: storeProperties.opening_days,
              pickup_locations: [], img_tag_list: [], auto_tags: {}
            };
            if(storeProperties.auto_tags) {
              storeProperties.auto_tags.filter(obj => obj.status=='active').forEach(el => {
                this.cs.store_properties.auto_tags[el.type] = el.name;
              });
            }
            if(storeProperties.img_tag_list?.length) {
              this.cs.store_properties.img_tag_list = storeProperties.img_tag_list.filter(el => el.status=='active');
            }
            if(this.cs.ys_features.indexOf('store_pickup')!=-1) {
              this.cs.store_properties.pickup_locations = storeProperties.branches.filter(obj => obj.pickup_location && obj.status=='active');
            }
            localStorage.setItem("by_sp", this.cs.encode(this.cs.store_properties));
            // payment methods
            this.cs.payment_methods = storeDetails.payment_types;
            // checkout setting
            if(storeProperties.checkout_setting) this.cs.checkout_setting = storeProperties.checkout_setting;
            // footer config
            if(storeProperties.footer_config) this.cs.footer_config = storeProperties.footer_config;
            // giftcard config
            if(storeProperties.giftcard_config) this.cs.giftcard_config = storeProperties.giftcard_config;
            // application setting
            let appSetting = storeProperties.application_setting;
            if(!appSetting) appSetting = {};
            this.appConfig = appSetting;
            this.cs.storeDataLoaded = true;
            this.cs.storeDataListener.next(true);
            this.setBodyMarginTop(100);
            // unit info
            if(appSetting.min_qty) this.cs.min_qty = appSetting.min_qty;
            if(appSetting.step_qty) this.cs.step_qty = appSetting.step_qty;
            if(appSetting.customize_name) this.cs.customize_name = appSetting.customize_name;
            this.cs.application_setting = {};
            for(let key in appSetting) {
              if(['announcebar_status', 'announcebar_config', 'newsletter_status', 'newsletter_config', 'chat_status', 'chat_config'].indexOf(key)==-1 && appSetting.hasOwnProperty(key)) {
                this.cs.application_setting[key] = appSetting[key];
              }
            }
            localStorage.setItem("by_as", this.cs.encode(this.cs.application_setting));
            // newsletter
            if(appSetting.newsletter_status && this.cs.ys_features.indexOf('newsletter')!=-1) {
              this.cs.nl_config = appSetting.newsletter_config;
              if(this.cs.nl_config?.sub_heading) this.cs.nl_config.sub_heading = this.cs.nl_config.sub_heading.replace(new RegExp('\n', 'g'), "<br />");
              if(this.cs.nl_config?.response_msg) this.cs.nl_config.response_msg = this.cs.nl_config.response_msg.replace(new RegExp('\n', 'g'), "<br />");
            }
            // announcement bar
            if(appSetting.announcebar_status) {
              let abConfig = appSetting.announcebar_config;
              this.cs.ab_config = abConfig;
              if(abConfig && abConfig.timer && abConfig.timer_date) {
                // TIMER
                const countDownDate = new Date(abConfig.timer_date).getTime();
                if(isPlatformBrowser(this.platformId) && countDownDate > new Date().getTime())
                {
                  this.tempAnnounceBar = abConfig.content;
                  this.subscription = interval(1000).subscribe(x => { this.startAnnounceInterval(countDownDate); });
                }
                this.setBodyMarginTop(1100);
              }
              else this.cs.announcementBar = abConfig.content;
            }
            // currency types
            this.updateCurrencyValue(storeDetails.currency_types, liveCurrencies);
          }
          else this.router.navigate(['/others/service-unavailable']);
        }
        else console.log("store response", result);
      });

      /* ROUTER EVENT */
      let currentUrl = this.router.url;
      this.router.events.subscribe(event => {
        if(event instanceof NavigationEnd) {
          let routeName = this.location.path();
          // SEO
          if(routeName.indexOf("/category/")==-1 && routeName.indexOf("/product/")==-1 && routeName.indexOf("/blogs")==-1 && routeName.indexOf("/pages")==-1 && routeName.indexOf("/account")==-1 && routeName.indexOf("/wishlist")==-1) {
            this.cs.getStoreSeoDetails();
          }
          this.setBodyMarginTop(100);
          // prev route
          this.cs.previous_route = currentUrl;
          currentUrl = event.url;
          this.currUrl = currentUrl.split('?')[0];
          this.document.getElementById('reset-menu')?.click();
        }
      });
    }
  }

  onInteract() {
    if(this.cs.storeDataLoaded && !this.intracted) {
      this.intracted = true;
      // script
      this.assetLoader.load('jquery').then(() => {
        this.cs.jsLoaded = true;
        this.assetLoader.load('script-js').then(() => { }).catch(error => console.log("err", error));
      }).catch(error => console.log("err", error));
      // whatsapp
      setTimeout(() => {
        if(this.appConfig?.chat_status && this.cs.ys_features.indexOf('whatsapp_chat')!=-1) {
          this.cs.wc_config = this.appConfig?.chat_config;
        }
      }, 1000);
      // newsletter
      setTimeout(() => {
        if(this.cs.nl_config?.open_onload && this.router.url=='/') this.document.getElementById("openSubscribeModal")?.click();
      }, 8000);
    }
  }

	updateCurrencyValue(currencyTypes, liveList) {
    let currencyIndex = currencyTypes.findIndex(obj => obj.default_currency);
    this.cs.store_details.currency = currencyTypes[currencyIndex].country_code;
    localStorage.setItem("by_sd", this.cs.encode(this.cs.store_details));
    // run in browser side(for overcome ssr country_code unefined error)
    if(isPlatformBrowser(this.platformId)) {
      currencyTypes.forEach(element => {
        let liveIndex = liveList.findIndex(obj => obj.name==element.country_code);
        element.country_inr_value = liveList[liveIndex].rates[this.cs.store_details.currency];
      });
      this.cs.currency_types = currencyTypes;
      // ip based
      if(this.cs.ipBasedCurrency && this.cs.store_properties.currency_list.length) {
        let ipIndex = "0"; let ipIndexList = [];
        this.ip_urls.forEach((element, index) => {
          ipIndexList.push(index.toString());
        });
        if(localStorage.getItem("ip_index")) ipIndex = localStorage.getItem("ip_index");
        ipIndexList.splice(ipIndexList.indexOf(ipIndex), 1);
        // call api(1)
        this.getIpInfo(ipIndex)
        .then((ipInfo) => { this.getCurrencyType(ipInfo, currencyIndex); })
        .catch((err) => {
          ipIndex = ipIndexList[0]; ipIndexList.splice(0, 1);
          // call api(2)
          this.getIpInfo(ipIndex)
          .then((ipInfo) => {this.getCurrencyType(ipInfo, currencyIndex); })
          .catch((err) => {
            ipIndex = ipIndexList[0]; ipIndexList.splice(0, 1);
            // call api(3)
            this.getIpInfo(ipIndex)
            .then((ipInfo) => { this.getCurrencyType(ipInfo, currencyIndex); })
            .catch((err) => {
              console.log("-----err", err);
              this.cs.ipBasedCurrency = false;
              this.setStoreCurrency(currencyIndex);
            });
          });
        });
      }
      else {
        if(localStorage.getItem("by_sc")) {
          let selectedCurrency = this.cs.decode(localStorage.getItem("by_sc"));
          let localIndex = this.cs.currency_types.findIndex(obj => obj.country_code==selectedCurrency.country_code);
          if(localIndex!=-1) { currencyIndex = localIndex; }
          this.setStoreCurrency(currencyIndex);
        }
        else this.setStoreCurrency(currencyIndex);
      }
    }
  }
  getCurrencyType(ipInfo, currencyIndex) {
    if(ipInfo) {
      let countryCurrency = this.cs.store_properties.currency_list.filter(obj => obj.country_list.findIndex(el => this.optString(el.code)==this.optString(ipInfo.country_code) || this.optString(el.name)==this.optString(ipInfo.country_name))!=-1);
      if(countryCurrency.length) {
        let ipIndex = this.cs.currency_types.findIndex(obj => obj.country_code==countryCurrency[0].currency_code);
        if(ipIndex!=-1) { currencyIndex = ipIndex; }
        this.setStoreCurrency(currencyIndex);
      }
      else this.setStoreCurrency(currencyIndex);
    }
    else this.setStoreCurrency(currencyIndex);
  }
  setStoreCurrency(index) {
    this.cs.temp_currency = this.cs.currency_types[index];
    this.cc.currency = this.cs.temp_currency;
    this.cs.setCurrency(this.cs.temp_currency);
    localStorage.setItem("by_sc", this.cs.encode(this.cs.temp_currency));
  }
  optString(str) {
    return str.replace(/[^A-Z0-9]/ig, "").toLowerCase();
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
      this.cs.announcementBar = "";
      this.subscription.unsubscribe();
    }
  }

  setBodyMarginTop(timer: number) {
    if(this.document.getElementById("headroom-head")) {
      setTimeout(() => {
        let mastHeight = this.document.getElementById("headroom-head").offsetHeight;
        this.document.body.style.marginTop = mastHeight+'px';
      }, timer);
    }
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

  getIpInfo(ipIndex) {
    return new Promise((resolve, reject) => {
      this.api.IP_INFO(this.ip_urls[Number(ipIndex)]).subscribe(result => {
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

  // loadGoogleAnalytics(trackingID: string): void {
  //   let gaScript1 = this.document.createElement('script');
  //   gaScript1.setAttribute('async', 'true');
  //   gaScript1.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${ trackingID }`);

  //   let gaScript2 = this.document.createElement('script');
  //   gaScript2.innerText = "window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } gtag('js', new Date());";
  //   gaScript2.innerText += `gtag(\'config\', \'${ trackingID }\');`;

  //   this.document.documentElement.firstChild.appendChild(gaScript1);
  //   this.document.documentElement.firstChild.appendChild(gaScript2);
  // }
  
  // loadGTM(trackingID: string): void {
  //   let gaScript1 = this.document.createElement('script');
  //   gaScript1.innerText = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})";
  //   gaScript1.innerText += `(window,document,\'script\',\'dataLayer\',\'${ trackingID }\');`;

  //   this.document.documentElement.firstChild.appendChild(gaScript1);

  //   let fbScript2 = this.document.createElement('noscript');
  //   let frameElem = this.document.createElement('iframe');
  //   frameElem.height = 0; frameElem.width = 0; frameElem.style.display = "none"; frameElem.style.visibility = "hidden";
  //   frameElem.src = "https://www.googletagmanager.com/ns.html?id="+trackingID;
  //   fbScript2.appendChild(frameElem);

  //   this.document.body.insertBefore(fbScript2, this.document.body.firstChild);
  //   // this.document.body.appendChild(fbScript2);
  // }

  // loadFbPixel(trackingID: string): void {
  //   let fbScript1 = this.document.createElement('script');
  //   fbScript1.innerText = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');";
  //   fbScript1.innerText += `fbq(\'init\', \'${ trackingID }\');`;
  //   fbScript1.innerText += `fbq(\'track\', \'PageView\');`;

  //   let fbScript2 = this.document.createElement('noscript');
  //   let imgElem = this.document.createElement('img');
  //   imgElem.height = 1; imgElem.width = 1; imgElem.style.display = "none";
  //   imgElem.src = "https://www.facebook.com/tr?id="+trackingID+"&ev=PageView&noscript=1";
  //   fbScript2.appendChild(imgElem);

  //   this.document.documentElement.firstChild.appendChild(fbScript1);
  //   this.document.documentElement.firstChild.appendChild(fbScript2);
  // }

}