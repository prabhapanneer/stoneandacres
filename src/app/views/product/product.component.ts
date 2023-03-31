import { Component, OnInit, Inject, PLATFORM_ID, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isPlatformBrowser, DOCUMENT, formatDate, DatePipe } from '@angular/common';
import { Meta, DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AccordionConfig } from 'ngx-bootstrap/accordion';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { StoreApiService } from '../../services/store-api.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartlistService } from '../../services/cartlist.service';
import { CommonService } from '../../services/common.service';
import { SwiperService } from '../../services/swiper.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import { DynamicAssetLoaderService } from '../../services/dynamic-asset-loader.service';
import * as PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
// import { sqLocale } from 'ngx-bootstrap/chronos';
declare const fbq: Function;
declare const Swiper: any;
declare const $: any;

export function getAccordionConfig(): AccordionConfig {
  return Object.assign(new AccordionConfig(), { closeOthers: true });
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [{ provide: AccordionConfig, useFactory: getAccordionConfig }]
})

export class ProductComponent implements OnInit {
  name = '!!!';
  viewMode = 'tab1';
  imgBaseUrl: string = environment.img_baseurl;
  pageLoader: boolean; params: any;
  productDetails: any = {}; parentProductImages: any = [];
  activeImgIndex: number; tempMinCheckoutValue: any = 0;
  swipe_product_list: any; swipeProductIndex: number;
  category_details: any; psCssLoaded: boolean;
  unitindex: number = 0;
  existing_model_list: any = [];
  addonForm: any = {}; customized_model: any;
  selected_unit: any = {};
  customIndex: number; mmIndex: number;
  customSection: boolean; mmSection: boolean; noteSection: boolean;
  custom_list: any = []; measurement_sets: any = []; notes_list: any = [];

  template_setting: any = environment.template_setting;
  exist_in_wishlist: boolean; cartCloseTimer: any;
  subscription: Subscription; wl_subscription: Subscription;
  related_products: any = []; reviews: any = []; avg_review: any;
  page: number; pageSize: number = 10; review_sort: string;
  projectForm: any = {}; currentYear: any; styleIndex: number = 0;
  brochureForm: any = {}; btn_loader1: boolean = false; btn_loader2: boolean = false; enquiry_list: any = [];
  @ViewChild('zohoForm', { static: false }) zohoForm: ElementRef;
  @ViewChild('zohoForm1', { static: false }) zohoForm1: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2, @Inject(DOCUMENT) private document, private assetLoader: DynamicAssetLoaderService,
    private router: Router, private activeRoute: ActivatedRoute, public commonService: CommonService, private storeApi: StoreApiService, private meta: Meta, private sanitizer: DomSanitizer,
    private api: ApiService, public wishService: WishlistService, private cartService: CartlistService, public cc: CurrencyConversionService, public swiperService: SwiperService,
    private datePipe: DatePipe,
  ) {
    this.subscription = this.commonService.currency_type.subscribe(currency => {
      this.findCurrency();
    });
    this.wl_subscription = this.wishService.observe_wishlist.subscribe(wishlist => {
      this.exist_in_wishlist = wishlist.some(x => x.product_id == this.productDetails._id);
    });
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      this.currentYear = new Date().getFullYear();
      this.removeMetaProperties();
      if (isPlatformBrowser(this.platformId)) $(".related-products").css("visibility", "hidden");
      if (isPlatformBrowser(this.platformId)) $(".product_image").css("visibility", "hidden");
      this.params = params; this.swipeProductIndex = 0; this.swipe_product_list = []; this.activeImgIndex = 0;
      this.category_details = {}; this.related_products = []; this.reviews = []; this.page = 1; this.review_sort = 'rating';
      if (isPlatformBrowser(this.platformId)) {
        if (!sessionStorage.getItem("website_url")) sessionStorage.setItem("website_url", window.location.href);
        if (!sessionStorage.getItem("lead_source")) {
          if (this.router.url.indexOf("li_fat_id") != -1) {
            sessionStorage.setItem("lead_source", "SA Website LinkedIn")
          }
          else if (this.router.url.indexOf("fbclid") != -1) {
            sessionStorage.setItem("lead_source", "SA Website Facebook")
          }
          else if (this.router.url.indexOf("gclid") != -1) {
            sessionStorage.setItem("lead_source", "SA Website Google")
          }
          else {
            sessionStorage.setItem("lead_source", "SA Website")
          }
        }

      }

      this.assetLoader.load('zoho').then(data => {
      });

      if (this.commonService.product_page_attr) {
        // for login redirection
        this.productDetails = this.commonService.product_page_attr.product;
        this.parentProductImages = this.productDetails.image_list;
        this.activeImgIndex = this.commonService.product_page_attr.active_img_index;
        this.related_products = this.commonService.product_page_attr.related_products;
        delete this.commonService.product_page_attr;
        this.exist_in_wishlist = this.wishService.checkProductExist(this.productDetails._id);
        this.initializePhotoSwipe(this.productDetails.image_list);
        this.initializeSwiper();
        this.findCurrency();
        this.addMeta();

        // custom model
        if (isPlatformBrowser(this.platformId) && sessionStorage.getItem("sizing_modal")) {
          this.customized_model = this.commonService.decryptData(sessionStorage.getItem("sizing_modal"));
          sessionStorage.removeItem("sizing_modal");
        }
        // video
        if (this.productDetails.video_details && Object.entries(this.productDetails.video_details).length) {
          const tag = this.document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          this.document.body.appendChild(tag);
        }
        // seo
        if (this.productDetails.seo_status) {
          let seoImage = this.imgBaseUrl + this.productDetails.image;
          this.commonService.setSiteMetaData(this.productDetails.seo_details, seoImage);
        }
        else this.commonService.getStoreSeoDetails();
      }
      else {
        if (this.commonService.selected_product) {
          this.productDetails = this.commonService.selected_product;
          this.productDetails.image = this.productDetails.image_list[0].image;
          delete this.commonService.selected_product;
          this.initializePhotoSwipe(this.productDetails.image_list);
        }
        else this.pageLoader = true;
        // swipe product list
        if (isPlatformBrowser(this.platformId)) {
          if (sessionStorage.getItem("swipe_product_list")) {
            this.swipe_product_list = this.commonService.decryptData(sessionStorage.getItem("swipe_product_list"));
            let proIndex = this.swipe_product_list.findIndex(obj => obj == this.params.product_id);
            if (proIndex != -1) this.swipeProductIndex = proIndex;
          }
          if (sessionStorage.getItem("category_details")) this.category_details = this.commonService.decryptData(sessionStorage.getItem("category_details"));
        }
        // product details
        this.storeApi.PRODUCT_DETAILS({ product_id: this.params.product_id }).subscribe(result => {
          console.log(result)
          setTimeout(() => { this.pageLoader = false; }, 500);
          if (result.status) {
            this.productDetails = result.data;
            this.productDetails.variant_list = this.productDetails.variant_list.filter(obj => obj.stock > 0);

            if (this.productDetails.variant_status) {
              this.productDetails.bhk_list = [];
              this.productDetails.sqft_list = [];
              this.productDetails.price_list = [];
              this.productDetails.variant_list.forEach(obj => {
                if (obj['Type']) {
                  let pushValue = obj['Type'];
                  if (this.productDetails.bhk_list.indexOf(pushValue) == -1) this.productDetails.bhk_list.push(pushValue);

                }
                if (obj['sqft']) {
                  let pushValue = parseFloat(obj['sqft']);
                  if (this.productDetails.sqft_list.indexOf(pushValue) == -1) this.productDetails.sqft_list.push(pushValue);
                }
                if (this.productDetails.price_list.indexOf(obj.discounted_price) == -1) this.productDetails.price_list.push(obj.discounted_price);
              });

              this.productDetails.bhk_list = this.productDetails.bhk_list.sort((a, b) => a - b);
              this.productDetails.sqft_list = this.productDetails.sqft_list.sort((a, b) => a - b);
              this.productDetails.price_list = this.productDetails.price_list.sort((a, b) => a - b);

              let bhkList = this.productDetails.variant_types.filter(obj => obj.name === "Type");
              if (bhkList.length && bhkList[0]?.options?.length) {
                this.productDetails.variant_unit_info = bhkList[0];
                // this.productDetails.variant_unit_info.options = this.productDetails.variant_unit_info.options.sort((a, b) => 0 - (a.value > b.value ? -1 : 1));
                this.productDetails.selected_variant_unit = this.productDetails.variant_unit_info.options[0].value;
                this.getTabList();
              }
            }
            this.productDetails.description = this.sanitizer.bypassSecurityTrustHtml(this.productDetails.description);
            this.productDetails.location_url_new = this.sanitizer.bypassSecurityTrustResourceUrl(this.productDetails.location_url);
            this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
            this.productDetails.additional_qty = 0;
            this.productDetails.addon_price = 0;
            this.productDetails.product_id = this.productDetails._id;
            this.parentProductImages = this.productDetails.image_list;
            this.productDetails.image = this.productDetails.image_list[0].image;
            this.productDetails.external_addon_status = this.productDetails.addon_status;
            this.productDetails.external_addon_list = this.productDetails.addon_list;
            this.exist_in_wishlist = this.wishService.checkProductExist(this.productDetails._id);
            if (!this.commonService.selected_product) this.initializePhotoSwipe(this.productDetails.image_list);
            // related products
            if (this.commonService.ys_features.indexOf('related_products') != -1) {
              setTimeout(() => {
                let catId = null;
                if (this.category_details._id) catId = this.category_details._id;
                else if (this.productDetails.category_id.length) catId = this.productDetails.category_id[0];
                if (catId) {
                  this.storeApi.RANDOM_PRODUCT_LIST({ category_id: catId, limit: environment.template_setting.related_products_limit }).subscribe(result => {

                    if (result.status) {
                      this.related_products = result.list;
                      for (let product of this.related_products) {
                        product.temp_selling_price = this.cc.CALC(product.selling_price);
                        product.temp_discounted_price = this.cc.CALC(product.discounted_price);
                      }
                      setTimeout(() => { this.initializeSwiper(); }, 1000);
                    }
                  });
                }
              }, 500);
            }
            setTimeout(() => { this.initializeSwiper(); }, 1000);
            this.findCurrency();
            // fb tracking
            if (isPlatformBrowser(this.platformId) && environment.facebook_pixel) {
              fbq('track', 'ViewContent', {
                value: this.productDetails.temp_discounted_price, currency: this.commonService.selected_currency.country_code,
                content_ids: this.productDetails.sku, content_type: 'Product'
              });
            }
            // video
            if (this.productDetails.video_details && Object.entries(this.productDetails.video_details).length) {
              const tag = this.document.createElement('script');
              tag.src = 'https://www.youtube.com/iframe_api';
              this.document.body.appendChild(tag);
            }
            // seo
            if (this.productDetails.seo_status) {
              let seoImage = this.imgBaseUrl + this.productDetails.image;
              this.commonService.setSiteMetaData(this.productDetails.seo_details, seoImage);
            }
            else this.commonService.getStoreSeoDetails();
            // update stock
            if (this.productDetails.hold_till) {
              let balanceStock = this.productDetails.stock;
              if (new Date() < new Date(this.productDetails.hold_till)) balanceStock = this.productDetails.stock - this.productDetails.hold_qty;
              this.productDetails.stock = balanceStock;
            }
            if (this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
            // variants
            if (this.productDetails.variant_status) {
              // for first option checked
              this.productDetails.variant_types.forEach(element => {
                element.value = element.options[0].value;
              });
              // this.setVariantPrice();
            }
            // PRODUCT FEATURES
            if (!Object.entries(this.commonService.product_features).length) {
              this.storeApi.PRODUCT_FEATURES().subscribe(result => {

                if (result.status) {
                  let productFeatures = JSON.parse(result.data);

                  this.commonService.product_features = {
                    addon_list: productFeatures.addon_list.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
                    measurement_set: productFeatures.measurement_set.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
                    tag_list: productFeatures.tag_list.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
                    tax_rates: productFeatures.tax_rates.filter(obj => obj.status == 'active'),
                    size_chart: productFeatures.size_chart.filter(obj => obj.status == 'active'),
                    faq_list: productFeatures.faq_list.filter(obj => obj.status == 'active'),
                    sizing_assistant: productFeatures.sizing_assistant.filter(obj => obj.status == 'active'),
                    taxonomy: productFeatures.taxonomy.filter(obj => obj.status == 'active'),
                    color_list: productFeatures.color_list,
                    amenities_list: productFeatures.amenities.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1))
                  };
                  if (isPlatformBrowser(this.platformId)) sessionStorage.setItem("measurement_sets", this.commonService.encryptData(this.commonService.product_features.measurement_set));
                  this.setProductFeatures();
                }
                else console.log("response", result);
              });
            }
            else this.setProductFeatures();
            // product reviews
            if (this.commonService.ys_features.indexOf('product_reviews') != -1) {
              this.storeApi.REVIEWS(this.productDetails._id).subscribe(result => {
                if (result.status) {
                  this.reviews = result.list;
                  this.reviews.forEach(obj => {
                    obj.description = obj.description.replace(new RegExp('\n', 'g'), "<br />");
                  });
                  let totalRating = this.reviews.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue['rating'];
                  }, 0);
                  this.avg_review = totalRating / this.reviews.length;
                  if (this.avg_review % 1) this.avg_review = this.avg_review.toFixed(1);
                  this.sorting(this.review_sort);
                }
              });
            }
          }
          else {
            console.log("response", result);
            this.router.navigate(["/"]);
          }
        });
      }

    });

    if(localStorage.getItem("enquiry_type")) localStorage.removeItem("enquiry_type");;
    if(localStorage.getItem("enquiry_proj_id")) localStorage.removeItem("enquiry_proj_id");;


  }

  getTabList() {

    this.productDetails.tablist = this.productDetails.variant_list.filter(obj => obj.Type === this.productDetails.selected_variant_unit);
    this.productDetails.variant_image = [];
    if (this.productDetails?.tablist?.length) {
      this.productDetails.tablist.forEach(obj => {

        if (obj?.image_list?.length) {
          obj.image_list.forEach(element => {
            this.productDetails.variant_image.push(element)
          });
        }

      });
      if (this.productDetails?.variant_image?.length) this.initializePhotoSwipe1(this.productDetails.variant_image);
    }

  }

  // photoswipe
  initializePhotoSwipe(imgList) {
    setTimeout(() => {

    }, 1000);

    if (isPlatformBrowser(this.platformId) && imgList[0].image) {
      this.assetLoader.load('photoswipe', 'default-skin').then(data => {
        this.psCssLoaded = true;
        let swipeItems: any = [];
        imgList.forEach(element => {
          let imgPath = this.imgBaseUrl + element.image;
          swipeItems.push({ src: imgPath, w: '900', h: '1060' });
        });
        setTimeout(function () {
          $('#photogallery a').click(function (event) {
            event.preventDefault();
            let index = $("#photogallery a").index(this);
            let $pswp = $('.pswp')[0],
              options = {
                index: index,
                bgOpacity: 0.8,
                captionEl: false,
                tapToClose: true,
                closeOnScroll: false,
                closeOnVerticalDrag: false,
                shareEl: false,
                fullscreenEl: false,
                getDoubleTapZoom: function (isMouseClick, item) {
                  if (isMouseClick) {
                    return 2;
                  } else {
                    return item.initialZoomLevel < 0.7 ? 2 : 1.33;
                  }
                },
                maxSpreadZoom: 2
              };
            let gallery = new PhotoSwipe($pswp, PhotoSwipeUI_Default, swipeItems, options);
            gallery.init();
          });
        }, 500);
      }).catch(error => console.log("err", error));
    }
  }

  // photoswipe
  initializePhotoSwipe1(imgList) {

    if (isPlatformBrowser(this.platformId) && imgList[0].image) {
      this.assetLoader.load('photoswipe', 'default-skin').then(data => {
        this.psCssLoaded = true;
        let swipeItems: any = [];
        imgList.forEach(element => {
          let imgPath = this.imgBaseUrl + element.image;
          swipeItems.push({ src: imgPath, w: '900', h: '1060' });
        });
        setTimeout(function () {
          $('#photogallery1 a').click(function (event) {
            event.preventDefault();
            let index = $("#photogallery1 a").index(this);
            let $pswp = $('.pswp')[0],
              options = {
                index: index,
                bgOpacity: 0.8,
                captionEl: false,
                tapToClose: true,
                closeOnScroll: false,
                closeOnVerticalDrag: false,
                shareEl: false,
                fullscreenEl: false,
                getDoubleTapZoom: function (isMouseClick, item) {
                  if (isMouseClick) {
                    return 2;
                  } else {
                    return item.initialZoomLevel < 0.7 ? 2 : 1.33;
                  }
                },
                maxSpreadZoom: 2
              };
            let gallery = new PhotoSwipe($pswp, PhotoSwipeUI_Default, swipeItems, options);
            gallery.init();
          });
        }, 500);
      }).catch(error => console.log("err", error));
    }
  }

  // swiper
  initializeSwiper() {

    if (this.productDetails?.image_list && isPlatformBrowser(this.platformId)) {
      let swiperElem = '.product_image';
      // if(this.commonService.desktop_device) swiperElem = '.product_slider';
      setTimeout(() => {
        let swiperConfig: any = {
          speed: 500,
          breakpoints: this.swiperService.product_section.break_points,
          navigation: {
            nextEl: '#product_image_next',
            prevEl: '#product_image_prev'
          }
        }
        if (this.swiperService.product_section.auto_play) {
          swiperConfig.autoplay = {
            delay: 3000,
            disableOnInteraction: false
          }
        }
        new Swiper(swiperElem, swiperConfig);
        setTimeout(() => { $(".product_image").css("visibility", "visible"); }, 0);
        if (this.swiperService.product_section.auto_play && swiperElem.includes("desktop_")) {
          $(swiperElem).hover(function () {
            (this).swiper.autoplay.stop();
          }, function () {
            (this).swiper.autoplay.start();
          });
        }
      }, 0);
    }
    if (this.related_products.length >= this.swiperService.related_products.card_count && isPlatformBrowser(this.platformId)) {
      let swiperElem = '.related_prod_slider';
      if (this.commonService.desktop_device) swiperElem = '.desktop_related_prod_slider';
      setTimeout(() => {
        let swiperConfig: any = {
          speed: 500,
          breakpoints: this.swiperService.related_products.break_points,
          navigation: {
            nextEl: '#related_prod_next',
            prevEl: '#related_prod_prev'
          }
        }
        if (this.swiperService.related_products.auto_play) {
          swiperConfig.autoplay = {
            delay: 3000,
            disableOnInteraction: false
          }
        }
        new Swiper(swiperElem, swiperConfig);
        setTimeout(() => { $(".related-products").css("visibility", "visible"); }, 0);
        if (this.swiperService.related_products.auto_play && swiperElem.includes("desktop_")) {
          $(swiperElem).hover(function () {
            (this).swiper.autoplay.stop();
          }, function () {
            (this).swiper.autoplay.start();
          });
        }
      }, 0);
    }
  }

  chooseAddon(mmOptionsModal, addonTypesModal, addonListModal, existingListModal, createNewModal) {
    this.productDetails.temp_addon_list = this.productDetails.addon_list;
    this.productDetails.external_addon_status = this.productDetails.addon_status;
    this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
    if (this.productDetails.addon_list.length == 1) {
      if (!this.productDetails.addon_list[0].custom_list.length && this.productDetails.addon_list[0].updated_mm_list.length && this.productDetails.addon_list[0].sizing_assistant_id) {
        this.productDetails.temp_selected_addon = this.productDetails.addon_list[0];
        mmOptionsModal.show();
      }
      else {
        this.productDetails.selected_addon = this.productDetails.addon_list[0];
        this.onChangeAddon();
        this.onCreateCustomization(existingListModal, createNewModal);
      }
    }
    else {
      this.productDetails.filteredNoneList = this.productDetails.addon_list.filter(obj => !obj.custom_list.length && !obj.updated_mm_list.length);
      this.productDetails.filteredCombinedList = this.productDetails.addon_list.filter(obj => obj.custom_list.length && obj.updated_mm_list.length);
      this.productDetails.filteredCustomList = this.productDetails.addon_list.filter(obj => obj.custom_list.length && !obj.updated_mm_list.length);
      this.productDetails.filteredMmList = this.productDetails.addon_list.filter(obj => !obj.custom_list.length && obj.updated_mm_list.length);
      if (!this.productDetails.filteredNoneList.length && !this.productDetails.filteredCombinedList.length && this.productDetails.filteredCustomList.length && this.productDetails.filteredMmList.length) {
        this.productDetails.disp_sizing_card = false;
        if (this.productDetails.filteredMmList.length == 1 && this.productDetails.filteredMmList[0].sizing_assistant_id) this.productDetails.disp_sizing_card = true;
        addonTypesModal.show();
      }
      else addonListModal.show();
    }
  }
  selectAddonType(filteredAddonList, addonListModal, existingListModal, createNewModal) {
    this.productDetails.external_addon_status = this.productDetails.addon_status;
    this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
    if (filteredAddonList.length == 1) {
      this.productDetails.selected_addon = filteredAddonList[0];
      this.onChangeAddon();
      this.onCreateCustomization(existingListModal, createNewModal);
    }
    else {
      this.productDetails.temp_addon_list = filteredAddonList;
      addonListModal.show();
    }
  }
  redirectSizingAssistPage(addonDetails) {
    let prodAttr = { product: this.productDetails, selected_addon: addonDetails, active_img_index: this.activeImgIndex, related_products: this.related_products };
    if (isPlatformBrowser(this.platformId) && this.commonService.customer_token) {
      sessionStorage.setItem("product_attr", this.commonService.encryptData(prodAttr));
      this.router.navigate(["/sizing-assistant/" + addonDetails.sizing_assistant_id]);
    }
    else {
      delete this.productDetails.selected_addon;
      delete this.productDetails.external_addon_status;
      this.commonService.after_login_event = {
        type: 'custom_model', redirect: this.router.url,
        product_attr: { product: this.productDetails, active_img_index: this.activeImgIndex, related_products: this.related_products }
      };
      this.router.navigate(["/account"]);
    }
  }

  onSelectAddon(addonDetails, existingListModal, createNewModal, mmOptionsModal, delay) {
    setTimeout(() => {
      if (addonDetails.sizing_assistant_id) {
        this.productDetails.temp_selected_addon = addonDetails;
        mmOptionsModal.show();
      }
      else {
        this.productDetails.selected_addon = addonDetails;
        this.onChangeAddon();
        this.onCreateCustomization(existingListModal, createNewModal);
      }
    }, delay);
  }

  findCurrency() {
    this.productDetails.temp_selling_price = this.cc.CALC(this.productDetails.selling_price);
    this.productDetails.temp_discounted_price = this.cc.CALC(this.productDetails.discounted_price);
    this.productDetails.temp_addon_price = this.cc.CALC(this.productDetails.addon_price);
    this.tempMinCheckoutValue = this.cc.CALC_WO_AC(this.commonService.application_setting.min_checkout_value);
    for (let product of this.related_products) {
      product.temp_selling_price = this.cc.CALC(product.selling_price);
      product.temp_discounted_price = this.cc.CALC(product.discounted_price);
    }
  }

  onChangeAddon() {
    if (this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
    if (this.productDetails.quantity < this.commonService.min_qty[this.productDetails.unit]) this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
    this.customized_model = null;
    this.productDetails.addon_alert = false;
    this.productDetails.customization_alert = false;
    this.productDetails.cart_alert = false;
    this.productDetails.buynow_alert = "";
    this.productDetails.added_to_cart = false;
    this.calcAddonPrice();
  }

  setVariantPrice() {
    this.productDetails.added_to_cart = false;
    this.productDetails.cart_alert = false;
    this.productDetails.buynow_alert = "";
    let variantInfo = []; let filterImgList = [];
    // let variantImages = [];
    let productImgList = this.parentProductImages;
    let variantTypes = this.productDetails.variant_types;
    if (variantTypes.length === 1) {
      variantInfo = this.productDetails.variant_list.filter(element =>
        element[variantTypes[0].name] == variantTypes[0].value
      );
      if (this.productDetails.image_tag_status) filterImgList = productImgList.filter(obj => obj.tag == variantTypes[0].value);
    }
    else if (variantTypes.length === 2) {
      variantInfo = this.productDetails.variant_list.filter(element =>
        element[variantTypes[0].name] == variantTypes[0].value && element[variantTypes[1].name] == variantTypes[1].value
      );
      if (this.productDetails.image_tag_status) filterImgList = productImgList.filter(obj =>
        obj.tag == variantTypes[0].value || obj.tag == variantTypes[1].value
      );
    }
    else if (variantTypes.length === 3) {
      variantInfo = this.productDetails.variant_list.filter(element =>
        element[variantTypes[0].name] == variantTypes[0].value && element[variantTypes[1].name] == variantTypes[1].value && element[variantTypes[2].name] == variantTypes[2].value
      );
      if (this.productDetails.image_tag_status) filterImgList = productImgList.filter(obj =>
        obj.tag == variantTypes[0].value || obj.tag == variantTypes[1].value || obj.tag == variantTypes[2].value
      );
    }
    // update price
    if (variantInfo[0].sku) this.productDetails.sku = variantInfo[0].sku;
    if (variantInfo[0].taxrate_id) this.productDetails.taxrate_id = variantInfo[0].taxrate_id;
    if (variantInfo[0].image_list && variantInfo[0].image_list.length) {
      variantInfo[0].image_list.forEach(elem => {
        // let imgData = {};
        // for(let key in elem) {
        //   if(elem.hasOwnProperty(key)) imgData[key] = elem[key];
        // }
        // variantImages.push(imgData);
      });
    }
    this.productDetails.selling_price = variantInfo[0].selling_price;
    this.productDetails.discounted_price = variantInfo[0].discounted_price;
    this.productDetails.stock = variantInfo[0].stock;
    this.findCurrency();
    // update stock
    if (variantInfo[0].hold_till) {
      let balanceStock = this.productDetails.stock;
      if (new Date() < new Date(variantInfo[0].hold_till)) balanceStock = this.productDetails.stock - variantInfo[0].hold_qty;
      this.productDetails.stock = balanceStock;
    }
    this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
    if (this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
    if (this.productDetails.quantity < this.commonService.min_qty[this.productDetails.unit]) this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
    // update image list
    this.productDetails.image_list = productImgList;
    if (filterImgList.length) {
      productImgList.filter(obj => !obj.tag && !obj.hide_on_variants).forEach(element => { filterImgList.push(element); });
      this.productDetails.image_list = filterImgList;
    }
    // if(variantImages.length) {
    //   filterImgList.forEach(element => { variantImages.push(element); });
    //   if(!filterImgList.length) productImgList.filter(obj => !obj.tag && !obj.hide_on_variants).forEach(element => { variantImages.push(element); });
    //   this.productDetails.image_list = variantImages;
    // }
    this.initializePhotoSwipe(this.productDetails.image_list);
    this.activeImgIndex = 0;
    this.productDetails.image = this.productDetails.image_list[0].image;
    delete this.productDetails.selected_addon;
    this.onChangeAddon();
    // addons
    this.filterProductAddons();
  }

  calcAddonPrice() {
    let customizedPrice = 0; this.productDetails.additional_qty = 0;
    if (this.productDetails.selected_addon && this.customized_model && this.customized_model.addon_id == this.productDetails.selected_addon._id) {
      // custom list
      this.customized_model.custom_list.forEach(obj => {
        obj.value.forEach(element => {
          customizedPrice += element.price;
          this.productDetails.additional_qty += element.additional_qty;
        });
      });
      // mm sets
      this.customized_model.mm_sets.forEach(obj => {
        obj.list.forEach(element => {
          this.productDetails.additional_qty += element.additional_qty;
        });
      });
    }
    this.productDetails.addon_price = 0;
    if (this.productDetails.selected_addon) this.productDetails.addon_price = this.productDetails.selected_addon.price + customizedPrice;
    if ((this.productDetails.additional_qty % 1) != 0) this.productDetails.additional_qty = parseFloat(this.productDetails.additional_qty.toFixed(1));
    this.findCurrency();
  }

  getRadioNextList(optionName) {
    // if next option list exist
    if (this.custom_list[this.customIndex + 1]) {
      this.custom_list[this.customIndex + 1].filtered_option_list = this.custom_list[this.customIndex + 1].option_list.filter(obj => obj.link_to == 'all' || obj.link_to == optionName);
    }
  }
  getCheckboxNextList() {
    // if next option list exist
    if (this.custom_list[this.customIndex + 1]) {
      let selectedItems = [];
      this.custom_list[this.customIndex].filtered_option_list.forEach(obj => {
        if (obj.custom_option_checked) selectedItems.push(obj.name);
      });
      this.custom_list[this.customIndex + 1].filtered_option_list = this.custom_list[this.customIndex + 1].option_list.filter(obj => obj.link_to == 'all' || selectedItems.indexOf(obj.link_to) != -1);
    }
  }
  disableOption() {
    // for mandatory or limited options
    if (this.custom_list[this.customIndex].limit > 0) {
      // for disable unchecked checkbox
      let checkedLen = this.custom_list[this.customIndex].filtered_option_list.filter(obj => obj.custom_option_checked).length;
      if (this.custom_list[this.customIndex].limit == checkedLen) {
        this.custom_list[this.customIndex].filtered_option_list.forEach(obj => {
          obj.disabled = true;
          if (obj.custom_option_checked) obj.disabled = false;
        });
      }
      else this.custom_list[this.customIndex].filtered_option_list.forEach(obj => { obj.disabled = false; });
    }
  }

  addtoCart(openPopup) {
    this.productDetails.final_price = parseFloat(this.productDetails.discounted_price);
    if (this.productDetails.unit == "Pcs") {
      this.productDetails.final_price = parseFloat(this.productDetails.discounted_price) + parseFloat(this.productDetails.addon_price);
    }
    this.productDetails.customized_model = this.customized_model;
    this.productDetails.customization_status = false;
    if (this.productDetails.customized_model) {
      this.productDetails.customization_status = true;
      this.productDetails.customized_model.model_id = this.productDetails.customized_model._id;
    }
    // addon section
    if (this.productDetails.selected_addon && this.productDetails.selected_addon != undefined) {
      if (this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
        if (this.productDetails.customized_model && this.productDetails.customized_model != undefined) this.addToCartTrigger(openPopup);
        else this.productDetails.customization_alert = true;
      }
      else this.addToCartTrigger(openPopup);
    }
    else {
      if (this.commonService.application_setting.product_addon && this.productDetails.addon_status && this.productDetails.addon_list.length && this.productDetails.addon_must) {
        if (this.productDetails.selected_addon && this.productDetails.selected_addon != undefined) {
          if (this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
            if (this.productDetails.customized_model && this.productDetails.customized_model != undefined) this.addToCartTrigger(openPopup);
            else this.productDetails.customization_alert = true;
          }
          else this.addToCartTrigger(openPopup);
        }
        else this.productDetails.addon_alert = true;
      }
      else {
        this.productDetails.external_addon_status = false;
        this.addToCartTrigger(openPopup);
      }
    }
  }
  addToCartTrigger(openPopup) {
    this.productDetails.cart_alert = true;
    this.productDetails.added_to_cart = true;
    if (openPopup && this.document.getElementById('minicart-trigger')) this.document.getElementById('minicart-trigger').click();
    if (isPlatformBrowser(this.platformId)) {
      this.cartCloseTimer = setTimeout(() => {
        this.productDetails.cart_alert = false;
        if ($('.cart-box:visible').length) $('.cart-box').slideUp('400');
      }, 5000);
    }
    this.cartService.addToCart(this.productDetails);
    this.showHeader();
    if (this.params.wishstatus) this.wishService.removeFromWishList(this.productDetails._id);
  }

  buyNow() {
    if (isPlatformBrowser(this.platformId)) sessionStorage.removeItem("qo-cd");
    this.productDetails.final_price = parseFloat(this.productDetails.discounted_price);
    if (this.productDetails.unit == "Pcs") {
      this.productDetails.final_price = parseFloat(this.productDetails.discounted_price) + parseFloat(this.productDetails.addon_price);
    }
    this.productDetails.customized_model = this.customized_model;
    this.productDetails.customization_status = false;
    if (this.productDetails.customized_model) {
      this.productDetails.customization_status = true;
      this.productDetails.customized_model.model_id = this.productDetails.customized_model._id;
    }
    // addon section
    if (this.productDetails.selected_addon && this.productDetails.selected_addon != undefined) {
      if (this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
        if (this.productDetails.customized_model && this.productDetails.customized_model != undefined) this.continueBuyNow(this.productDetails);
        else this.productDetails.customization_alert = true;
      }
      else this.continueBuyNow(this.productDetails);
    }
    else {
      if (this.commonService.application_setting.product_addon && this.productDetails.addon_status && this.productDetails.addon_list.length && this.productDetails.addon_must) {
        if (this.productDetails.selected_addon && this.productDetails.selected_addon != undefined) {
          if (this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
            if (this.productDetails.customized_model && this.productDetails.customized_model != undefined) this.continueBuyNow(this.productDetails);
            else this.productDetails.customization_alert = true;
          }
          else this.continueBuyNow(this.productDetails);
        }
        else this.productDetails.addon_alert = true;
      }
      else {
        this.productDetails.external_addon_status = false;
        this.continueBuyNow(this.productDetails);
      }
    }
  }
  continueBuyNow(x) {
    let cartQty = this.productDetails.quantity + this.productDetails.additional_qty;
    let cartWeight = cartQty * this.productDetails.weight;
    let cartTotal = this.cc.CALC_INR_WITH_AC(this.productDetails.final_price * cartQty);
    if (this.productDetails.unit != "Pcs") {
      cartTotal += this.cc.CALC_INR_WITH_AC(this.productDetails.addon_price);
    }
    if (this.commonService.application_setting.max_shipping_weight > 0 && cartWeight > this.commonService.application_setting.max_shipping_weight) {
      this.productDetails.buynow_alert = "max_shipping";
    }
    else if (this.commonService.application_setting.min_checkout_value > cartTotal) {
      this.tempMinCheckoutValue = this.cc.CALC_WO_AC(this.commonService.application_setting.min_checkout_value);
      this.productDetails.buynow_alert = "min_checkout";
    }
    else {
      this.productDetails.buynow_loader = true;
      x.quantity = x.quantity + x.additional_qty;
      x.addon_status = x.external_addon_status;
      let checkoutDetails: any = { buy_now: true, item_list: [x], order_type: 'delivery' };
      if (this.commonService.customer_token) {
        this.api.USER_DETAILS().subscribe(result => {
          if (result.status) {
            this.wishService.removeFromWishList(x._id);
            let addressList = result.data.address_list;
            let shippingIndex = addressList.findIndex(obj => obj.shipping_address);
            if (shippingIndex != -1) {
              checkoutDetails.shipping_address = addressList[shippingIndex];
              // pincode verification
              if (this.commonService.ys_features.indexOf('pincode_service') != -1 && this.commonService.store_properties.pincodes.indexOf(checkoutDetails.shipping_address.pincode) == -1) {
                // redirect to address list
                this.buynowNavigation(checkoutDetails, '/checkout/address-list/product');
              }
              else {
                // shipping
                if (this.commonService.ys_features.indexOf('time_based_delivery') != -1) {
                  // redirect to delivery methods
                  this.buynowNavigation(checkoutDetails, '/checkout/delivery-methods');
                }
                else {
                  let sendData: any = {
                    sid: this.commonService.session_id, store_id: environment.store_id, shipping_address: checkoutDetails.shipping_address._id,
                    order_type: checkoutDetails.order_type, currency_type: this.commonService.selected_currency.country_code, buy_now: true
                  };
                  sendData.item_list = this.commonService.getItemList(checkoutDetails.item_list);
                  this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                    if (result.status) {
                      checkoutDetails.shipping_method = result.data.shipping_method;
                      this.buynowNavigation(checkoutDetails, '/checkout/product-order-details');
                    }
                    else {
                      // redirect to shipping page
                      this.buynowNavigation(checkoutDetails, '/checkout/shipping-methods');
                    }
                  });
                }
              }
            }
            else {
              // redirect to address list
              this.buynowNavigation(checkoutDetails, '/checkout/address-list/product');
            }
          }
          else {
            this.productDetails.buynow_loader = false;
            console.log("response", result);
          }
        });
      }
      else if (isPlatformBrowser(this.platformId) && this.commonService.application_setting.guest_checkout) {
        if (sessionStorage.getItem("guest_email")) {
          this.cartService.updateCartList([x]);
          if (sessionStorage.getItem("checkout_address")) {
            let guestAddress = this.commonService.decryptData(sessionStorage.getItem("checkout_address"));
            checkoutDetails.shipping_address = guestAddress;
            sessionStorage.setItem("checkout_details", this.commonService.encryptData(checkoutDetails));
            // pincode verification
            if (this.commonService.ys_features.indexOf('pincode_service') != -1 && this.commonService.store_properties.pincodes.indexOf(checkoutDetails.shipping_address.pincode) == -1) {
              // redirect to address list
              this.router.navigate(["/checkout/address-list/product"]);
            }
            else {
              // shipping
              if (this.commonService.ys_features.indexOf('time_based_delivery') != -1) {
                // redirect to delivery methods
                this.router.navigate(['/checkout/delivery-methods']);
              }
              else {
                let sendData: any = {
                  sid: this.commonService.session_id, store_id: environment.store_id, shipping_address: checkoutDetails.shipping_address._id,
                  order_type: checkoutDetails.order_type, currency_type: this.commonService.selected_currency.country_code, buy_now: true
                };
                sendData.item_list = this.commonService.getItemList(checkoutDetails.item_list);
                this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                  if (result.status) {
                    checkoutDetails.shipping_method = result.data.shipping_method;
                    sessionStorage.setItem("checkout_details", this.commonService.encryptData(checkoutDetails));
                    this.router.navigate(['/checkout/product-order-details']);
                  }
                  else {
                    // redirect to shipping page
                    this.router.navigate(['/checkout/shipping-methods']);
                  }
                });
              }
            }
          }
          else {
            sessionStorage.setItem("checkout_details", this.commonService.encryptData(checkoutDetails));
            this.router.navigate(["/checkout/address-list/product"]);
          }
        }
        else {
          sessionStorage.setItem("checkout_details", this.commonService.encryptData(checkoutDetails));
          this.commonService.after_login_event = { type: 'buynow_product', product: x }; // for go main login page from guest login
          this.router.navigate(["/guest-login"]);
        }
      }
      else {
        this.commonService.after_login_event = { type: 'buynow_product', product: x };
        this.router.navigate(["/account"]);
      }
    }
  }
  buynowNavigation(checkoutDetails, redirect) {
    this.api.USER_UPDATE({ checkout_details: checkoutDetails }).subscribe(result => {
      this.productDetails.buynow_loader = false;
      if (result.status) this.router.navigate([redirect]);
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
    });
  }

  // CUSTOMIZATION SECTION
  onCreateCustomization(existingListModal, createNewModal) {
    if (this.productDetails.selected_addon) {
      if (this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length || this.productDetails.selected_addon.notes_list.length) {
        if (this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
        if (this.productDetails.quantity < this.commonService.min_qty[this.productDetails.unit]) this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
        this.customIndex = 0; this.mmIndex = 0; this.addonForm = {};
        this.custom_list = this.productDetails.selected_addon.custom_list;
        this.measurement_sets = this.productDetails.selected_addon.updated_mm_list;
        this.measurement_sets.forEach(mm => {
          mm.list.forEach(li => { delete li.value });
        });
        this.notes_list = [];
        this.productDetails.selected_addon.notes_list.forEach(obj => {
          this.notes_list.push({ name: obj.name, required: obj.required });
        });
        this.customSection = false; this.mmSection = false; this.noteSection = false;
        // customization
        if (this.custom_list.length) {
          this.customSection = true;
          this.custom_list.forEach(obj => {
            delete obj.selected_option;
            obj.option_list.forEach(opt => { delete opt.custom_option_checked; delete opt.disabled; });
          });
          this.custom_list[this.customIndex].filtered_option_list = this.custom_list[this.customIndex].option_list;
          if (this.custom_list[this.customIndex].type == 'either_or') {
            this.custom_list[this.customIndex].selected_option = this.custom_list[this.customIndex].filtered_option_list[0].name;
            this.getRadioNextList(this.custom_list[this.customIndex].selected_option);
          }
        }
        // measurement
        else if (this.measurement_sets.length) {
          this.mmSection = true;
          this.selected_unit = this.measurement_sets[this.mmIndex].units[0];
          this.addonForm.mm_unit = this.selected_unit.name;
        }
        // notes
        else this.noteSection = true;
        if (this.commonService.store_details.additional_features && this.commonService.store_details.additional_features.custom_model) {
          if (this.commonService.customer_token) {
            this.productDetails.custom_loader = true;
            this.api.USER_DETAILS().subscribe(result => {
              this.productDetails.custom_loader = false;
              if (result.status) {
                this.existing_model_list = result.data.model_list.filter(obj => obj.addon_id == this.productDetails.selected_addon._id);
                if (this.existing_model_list.length) existingListModal.show();
                else createNewModal.show();
                this.commonService.scrollModalTop(500);
              }
              else console.log("response", result);
            });
          }
          else {
            delete this.productDetails.selected_addon;
            delete this.productDetails.external_addon_status;
            this.commonService.after_login_event = {
              type: 'custom_model', redirect: this.router.url,
              product_attr: { product: this.productDetails, active_img_index: this.activeImgIndex, related_products: this.related_products }
            };
            this.router.navigate(["/account"]);
          }
        }
        else {
          createNewModal.show();
          this.commonService.scrollModalTop(500);
        }
      }
    }
  }

  buildFAQList(productFaqList, storeFaqList) {
    return new Promise((resolve, reject) => {
      let updatedFaqList: any = [];
      productFaqList.forEach(faqObj => {
        let faqId = Object.keys(faqObj)[0];
        let quesIndex = storeFaqList.findIndex(obj => obj._id == faqId);
        if (quesIndex != -1) {
          let answerIndex = storeFaqList[quesIndex].answer_list.findIndex(obj => obj._id == faqObj[faqId]);
          if (answerIndex != -1) updatedFaqList.push({ ques: storeFaqList[quesIndex].name, ans: storeFaqList[quesIndex].answer_list[answerIndex].answer });
        }
      });
      resolve(updatedFaqList);
    });
  }

  // CUSTOMIZATION
  buildAddonList(addonList, overallmmList) {
    return new Promise((resolve, reject) => {
      addonList.forEach(addonObj => {
        // mm list
        addonObj.updated_mm_list = [];
        if (addonObj.mm_list.length) {
          addonObj.mm_list.forEach(obj => {
            let mmIndex = overallmmList.findIndex(elem => elem._id == obj.mmset_id);
            if (mmIndex != -1) addonObj.updated_mm_list.push(overallmmList[mmIndex]);
          });
        }
      });
      resolve(addonList);
    });
  }

  customPrev() {
    if (this.customSection) {
      this.customIndex -= 1;
    }
    else if (this.mmSection) {
      if (this.mmIndex > 0) this.mmIndex -= 1;
      else if (this.custom_list.length) {
        this.mmSection = false;
        this.customSection = true;
      }
    }
    else if (this.noteSection) {
      this.noteSection = false;
      if (this.measurement_sets.length) this.mmSection = true;
      else this.customSection = true;
    }
    this.addonForm.alert_msg = null;
    this.commonService.scrollModalTop(0);
  }
  onCustomNext(gotoNext) {
    let reqInput = this.validateForm();
    if (reqInput === undefined) {
      let customAlert = this.checkCustomSelection();
      if (!customAlert) {
        // customization next level
        if (!gotoNext) {
          this.mmSection = false; this.noteSection = false;
          this.customIndex = this.customIndex + 1;
          if (this.custom_list[this.customIndex].type == 'either_or') {
            if (this.custom_list[this.customIndex].selected_option) {
              if (this.custom_list[this.customIndex].filtered_option_list.findIndex(obj => obj.name == this.custom_list[this.customIndex].selected_option) == -1) {
                this.custom_list[this.customIndex].selected_option = this.custom_list[this.customIndex].filtered_option_list[0].name;
              }
            }
            else {
              this.custom_list[this.customIndex].selected_option = this.custom_list[this.customIndex].filtered_option_list[0].name;
            }
            this.getRadioNextList(this.custom_list[this.customIndex].selected_option);
          }
          else this.disableOption();
        }
        // measurement or custom note
        else {
          this.customSection = false; this.mmSection = false; this.noteSection = false;
          // measurement
          if (this.measurement_sets.length) {
            this.mmIndex = 0; this.mmSection = true;
            this.selected_unit = this.measurement_sets[this.mmIndex].units[0];
            this.addonForm.mm_unit = this.selected_unit.name;
          }
          // custom note
          else this.noteSection = true;
        }
        this.commonService.scrollModalTop(0);
      }
      else this.addonForm.alert_msg = customAlert;
    }
    else {
      this.addonForm.alert_msg = "Please fill out the mandatory fields";
      this.document.getElementById(reqInput).focus();
    }
  }
  onMmNext() {
    let reqInput = this.validateForm();
    if (reqInput === undefined) {
      // for find additional qty
      for (let elem of this.measurement_sets[this.mmIndex].list) {
        elem.additional_qty = 0;
        if (elem.conditions.length) {
          for (let cond of elem.conditions) {
            let filteredList = cond.list.filter(obj => obj.unit == this.addonForm.mm_unit);
            if (filteredList.length) {
              elem.additional_qty = filteredList[0].additional_qty;
              if (parseFloat(elem.value) > filteredList[0].mm_from && filteredList[0].mm_to >= parseFloat(elem.value)) {
                elem.additional_qty = filteredList[0].additional_qty;
                break;
              }
            }
          }
        }
      }
      if ((this.measurement_sets.length - 1) > this.mmIndex) this.mmIndex = this.mmIndex + 1;
      else {
        this.customSection = false;
        this.mmSection = false;
        this.noteSection = true;
      }
      this.commonService.scrollModalTop(0);
    }
    else {
      this.addonForm.alert_msg = "Please fill out the mandatory fields";
      this.document.getElementById(reqInput).focus();
    }
  }

  onChangeUnit() {
    let unitIndex = this.measurement_sets[this.mmIndex].units.findIndex(obj => obj.name == this.addonForm.mm_unit);
    if (unitIndex != -1) this.selected_unit = this.measurement_sets[this.mmIndex].units[unitIndex];
    if (this.addonForm.mm_unit == 'cms') {
      // convert inch -> cm
      this.measurement_sets.forEach(set => {
        set.list.forEach(element => {
          if (element.value) {
            element.value = element.value * 2.54;
            if ((element.value % 1) != 0) element.value = parseFloat(element.value.toFixed(1));
          }
        });
      });
    }
    else {
      // convert cm -> inch
      this.measurement_sets.forEach(set => {
        set.list.forEach(element => {
          if (element.value) {
            element.value = element.value * 0.393701;
            if ((element.value % 1) != 0) element.value = parseFloat(element.value.toFixed(1));
          }
        });
      });
    }
  }

  onSaveNewModal(modalName, customDetailsModal) {
    let reqInput = this.validateForm();
    if (reqInput === undefined) {
      let customAlert = this.checkCustomSelection();
      if (!customAlert) {
        this.addonForm.addon_id = this.productDetails.selected_addon._id;
        this.addonForm.custom_list = [];
        this.custom_list.forEach(obj => {
          if (obj.filtered_option_list) {
            if (obj.type == "either_or") {
              let selIndex = obj.filtered_option_list.findIndex(opt => opt.name == obj.selected_option);
              if (selIndex != -1) this.addonForm.custom_list.push({ name: obj.name, value: [obj.filtered_option_list[selIndex]] });
            }
            else {
              let selectedList = obj.filtered_option_list.filter(opt => opt.custom_option_checked);
              if (selectedList.length) this.addonForm.custom_list.push({ name: obj.name, value: selectedList })
            }
          }
        });
        // measurement section (for find additional qty)
        if (this.measurement_sets.length) {
          for (let elem of this.measurement_sets[this.mmIndex].list) {
            elem.additional_qty = 0;
            if (elem.conditions.length) {
              for (let cond of elem.conditions) {
                let filteredList = cond.list.filter(obj => obj.unit == this.addonForm.mm_unit);
                if (filteredList.length) {
                  elem.additional_qty = filteredList[0].additional_qty;
                  if (parseFloat(elem.value) > filteredList[0].mm_from && filteredList[0].mm_to >= parseFloat(elem.value)) {
                    elem.additional_qty = filteredList[0].additional_qty;
                    break;
                  }
                }
              }
            }
          }
        }
        this.productDetails.customization_alert = false;
        this.addonForm.mm_sets = this.measurement_sets;
        let noteIndex = this.notes_list.findIndex(obj => obj.value && obj.value != "");
        if (noteIndex != -1) this.addonForm.notes_list = this.notes_list;
        this.addonForm.sid = this.commonService.session_id;
        this.addonForm.submit = true;
        this.api.ADD_MODEL(this.addonForm).subscribe(result => {
          this.addonForm.submit = false;
          if (result.status) {
            this.customized_model = result.data.model_list[result.data.model_list.length - 1];
            this.productDetails.added_to_cart = false;
            this.productDetails.buynow_alert = "";
            this.calcAddonPrice();
            modalName.hide();
            if (customDetailsModal) this.openCustomDetailsModal(customDetailsModal);
          }
          else {
            this.addonForm.alert_msg = result.message;
            console.log("response", result);
          }
        });
      }
      else this.addonForm.alert_msg = customAlert;
    }
    else {
      this.addonForm.alert_msg = "Please fill out the mandatory fields";
      this.document.getElementById(reqInput).focus();
    }
  }

  openCustomDetailsModal(customDetailsModal) {
    this.commonService.customView = false;
    this.commonService.measurementView = false;
    this.commonService.notesView = false;
    if (this.customized_model) {
      if (this.customized_model.custom_list.length) this.commonService.customView = true;
      else if (this.customized_model.mm_sets.length) this.commonService.measurementView = true;
      else if (this.customized_model.notes_list.length) this.commonService.notesView = true;
    }
    customDetailsModal.show();
    this.commonService.scrollModalTop(500);
  }

  onSelectModal(x, modalName) {
    this.customized_model = x;
    this.calcAddonPrice();
    this.productDetails.added_to_cart = false;
    this.productDetails.customization_alert = false;
    if (modalName) setTimeout(() => { this.openCustomDetailsModal(modalName); }, 500);
  }

  validateForm() {
    let form: any = this.document.getElementById('addon-form');
    for (let elem of form.elements) {
      if (elem.value === '' && elem.hasAttribute('required')) return elem.id;
    }
  }
  mmFocusOut(x) {
    if (x.value && x.value == 0) {
      x.value = ''; x.alert_msg = "Value must be greater than 0";
    }
    else if (this.selected_unit.max_value > 0 && x.value > this.selected_unit.max_value) {
      x.value = ''; x.alert_msg = "Value must be less than or equal to " + this.selected_unit.max_value;
    }
  }
  checkCustomSelection() {
    if (this.custom_list.length) {
      let checkedLen = this.custom_list[this.customIndex].filtered_option_list.filter(obj => obj.custom_option_checked).length;
      if (this.custom_list[this.customIndex].type == 'mandatory') {
        if (this.custom_list[this.customIndex].limit == checkedLen) return null;
        else return "Must choose " + this.custom_list[this.customIndex].limit + " options";
      }
      else if (this.custom_list[this.customIndex].type == 'limited') {
        if (this.custom_list[this.customIndex].limit >= checkedLen) return null;
        else return "Choose maximum " + this.custom_list[this.customIndex].limit + " options";
      }
      else return null;
    }
    else return null;
  }

  modifyWishList(type, product) {
    if (this.commonService.customer_token) {
      this.showHeader();
      if (type == 'add') this.wishService.addToWishList(product);
      else if (type == 'remove') this.wishService.removeFromWishList(product._id);
    }
    else {
      this.commonService.after_login_event = { type: 'add_product_to_wishlist', product: product, redirect: this.router.url };
      this.router.navigate(["/account"]);
    }
  }

  closeExistingAndOpenNewModal(existingModal, newModal) {
    existingModal.hide();
    setTimeout(() => { newModal.show(); this.commonService.scrollModalTop(500); }, 500);
  }

  incQty() {
    this.productDetails.buynow_alert = "";
    this.productDetails.added_to_cart = false;
    this.productDetails.quantity += this.commonService.step_qty[this.productDetails.unit];
    if ((this.productDetails.quantity % 1) != 0) this.productDetails.quantity = parseFloat(this.productDetails.quantity.toFixed(2));
    if ((this.productDetails.quantity + this.productDetails.additional_qty) > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock - this.productDetails.additional_qty;
  }
  decQty() {
    this.productDetails.buynow_alert = "";
    this.productDetails.added_to_cart = false;
    this.productDetails.quantity -= this.commonService.step_qty[this.productDetails.unit];
    if ((this.productDetails.quantity % 1) != 0) this.productDetails.quantity = parseFloat(this.productDetails.quantity.toFixed(2));
    if (this.productDetails.quantity < this.commonService.min_qty[this.productDetails.unit]) this.productDetails.quantity = this.commonService.min_qty[this.productDetails.unit];
  }

  setProductFeatures() {
    this.addMeta();
    // addons
    this.filterProductAddons();

    if (this.productDetails.amenity_list) {
      this.productDetails.updated_amenities_list = [];
      this.productDetails.amenity_list.forEach(element => {
        let amenIndex = this.commonService.product_features.amenities_list?.findIndex(x => x._id == element)
        if (amenIndex != -1) {
          this.productDetails.updated_amenities_list.push(this.commonService.product_features.amenities_list[amenIndex]);
        }
      });
    }

    // tax rates
    if (this.productDetails.taxrate_id) {
      let taxRates = this.commonService.product_features.tax_rates;
      let taxIndex = taxRates.findIndex(obj => obj._id == this.productDetails.taxrate_id);
      if (taxIndex != -1) this.productDetails.tax_details = taxRates[taxIndex];
      else delete this.productDetails.taxrate_id;
    }
    // size chart
    if (this.productDetails.chart_status && this.productDetails.chart_id) {
      let chartList = this.commonService.product_features.size_chart;
      let chartIndex = chartList.findIndex(obj => obj._id == this.productDetails.chart_id);
      if (chartIndex != -1) {
        this.productDetails.chart_details = chartList[chartIndex];
        this.productDetails.chart_keys = Object.keys(this.productDetails.chart_details.chart_list[0]);
      }
    }
    // faq
    if (this.productDetails.faq_status && this.productDetails.faq_list.length && this.commonService.product_features.faq_list.length) {
      this.buildFAQList(this.productDetails.faq_list, this.commonService.product_features.faq_list).then((resp: any) => {
        this.productDetails.faq_list = resp;
      });
    }
  }

  filterProductAddons() {
    if (this.productDetails.addon_status) {
      if (this.commonService.product_features.addon_list) {
        let filteredAddons = this.commonService.product_features.addon_list.filter(obj => this.productDetails.external_addon_list.findIndex(x => x.addon_id == obj._id) != -1);
        if (this.productDetails.addon_must && !filteredAddons.length) this.productDetails.addon_must = false;
        this.buildAddonList(filteredAddons, this.commonService.product_features.measurement_set).then((resp: any) => {
          this.productDetails.addon_list = resp.filter(obj => this.productDetails.stock >= obj.min_stock);
          if (this.commonService.ys_features.indexOf('sizing_assistant') != -1 && this.commonService.product_features.sizing_assistant.length) this.updateAddonWithSizingAssist(this.productDetails.addon_list);
        });
      }
    }
    else this.productDetails.addon_must = false;
  }

  updateAddonWithSizingAssist(addonList) {
    addonList.forEach(obj => {
      delete obj.sizing_assistant_id;
      if (!obj.custom_list.length && obj.updated_mm_list.length) {
        this.commonService.product_features.sizing_assistant.forEach(element => {
          if (element.mm_list.length == obj.updated_mm_list.length) {
            if (this.findMatching(obj.updated_mm_list, element.mm_list)) {
              obj.sizing_assistant_id = element._id;
            }
          }
        });
      }
    });
  }
  findMatching(addonMmList, sizingMmList) {
    let matchingStatus: boolean = true;
    addonMmList.forEach(obj => {
      if (sizingMmList.findIndex(el => el.mmset_id == obj._id) == -1) matchingStatus = false;
    });
    return matchingStatus;
  }

  socialShare() {
    if (isPlatformBrowser(this.platformId)) {
      let windowNav: any = window.navigator;
      if (windowNav && windowNav.share) {
        windowNav.share({
          title: '', text: '',
          url: this.commonService.origin + this.router.url
        })
          .catch((error) => { console.log(error); });
      }
      else console.log("share not supported")
    }
  }

  swipeProduct(index) {
    this.router.navigate(['/product/' + this.swipe_product_list[index]]);
  }

  showHeader() {
    let el = this.document.getElementById("headroom-head");
    if (el) {
      this.renderer.removeClass(el, 'slideUp');
      this.renderer.addClass(el, 'slideDown');
    }
  }

  onViewModel(x) {
    setTimeout(() => { this.commonService.onViewModel(x); }, 500);
  }

  sorting(field) {
    this.page = 1;
    if (field == 'negative') this.reviews.sort((a, b) => 0 - (a.rating > b.rating ? -1 : 1));
    else this.reviews.sort((a, b) => 0 - (a[field] > b[field] ? 1 : -1));
  }

  // JSON LD
  stripHtml(html) {
    let tmp = this.renderer.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent.slice(0, 320) || tmp.innerText.slice(0, 320) || "";
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.wl_subscription.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem("category_details");
      sessionStorage.removeItem("swipe_product_list");
    }
    if (this.cartCloseTimer) clearTimeout(this.cartCloseTimer);
    // remove meta tag
    this.removeMetaProperties();
  }

  addMeta() {
    if (this.productDetails.taxonomy_id) {
      let tempIndex = this.commonService.product_features.taxonomy.findIndex(obj => obj._id == this.productDetails.taxonomy_id);
      if (tempIndex != -1) {
        let stockType = "in stock";
        if (this.productDetails.stock < this.commonService.min_qty[this.productDetails.unit]) stockType = "out of stock";
        this.meta.addTags([
          { property: 'og:url', content: this.commonService.origin + this.router.url },
          { property: 'product:brand', content: this.commonService.store_details.name },
          { property: 'product:availability', content: stockType },
          { property: 'product:condition', content: 'new' },
          { property: 'product:price:amount', content: this.productDetails.discounted_price },
          { property: 'product:price:currency', content: this.commonService.store_details.currency },
          { property: 'product:retailer_item_id', content: this.productDetails.sku },
          { property: 'product:category', content: this.commonService.product_features.taxonomy[tempIndex].category_id }
        ]);
      }
    }
  }
  removeMetaProperties() {
    this.removeMeta("og:url");
    this.removeMeta("product:brand");
    this.removeMeta("product:availability");
    this.removeMeta("product:condition");
    this.removeMeta("product:price:amount");
    this.removeMeta("product:price:currency");
    this.removeMeta("product:retailer_item_id");
    this.removeMeta("product:category");
  }
  removeMeta(name: string) {
    let attributeSelector = `property="${name}"`;
    if (attributeSelector && attributeSelector != undefined) this.meta.removeTag(attributeSelector);
  };


  // Form Submit

  onSubmit() {
    this.projectForm.current_date = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    this.urlFormat(this.productDetails.name).then((router_link) => {
      // setTimeout(() => {
        localStorage.setItem("enquiry_proj_id", this.productDetails._id);
        localStorage.setItem("enquiry_type", "Project Enquiry");
        this.projectForm.redirect_url = this.commonService.origin + "/enquiry/" + router_link + "-thankyou-page";
      // }, 500)
    })
    // localStorage.removeItem("enquiry_proj_id");
    // localStorage.removeItem("enquiry_type");
    this.projectForm.submit = true;
    this.projectForm.form_type = "Get in Touch";
    this.projectForm.project = this.productDetails.name;
    this.projectForm.store_id = environment.store_id;
    this.projectForm.subject = "Project Enquiry";

    this.projectForm.to_mail = "contact@stoneandacres.com";
    this.projectForm.cc_mail = "prabha1094@gmail.com";
    this.projectForm.type = this.projectForm.type;
    this.projectForm.form_data = { name: this.projectForm.name, email: this.projectForm.email, mobile: this.projectForm.mobile, message: this.projectForm.message, project: this.projectForm.project, form_type: this.projectForm.form_type };
    // list status
    this.projectForm.enquiry_list = true;

    this.storeApi.MAIL(this.projectForm).subscribe((result) => {
      this.projectForm.enquiry_list = false;
      if (result.status) {
        this.enquiry_list = result.list;
        this.emailBody(this.projectForm).then((bodyContent) => {
          this.projectForm.mail_content = bodyContent;
          this.storeApi.MAIL(this.projectForm).subscribe((result) => {
            if (result.status) {
              this.projectForm.website_url = window.location.href;
              this.projectForm.lead_source = "SA Website";
              if (isPlatformBrowser(this.platformId)) {
                if (sessionStorage.getItem("website_url")) this.projectForm.website_url = sessionStorage.getItem("website_url");
                if (sessionStorage.getItem("lead_source")) this.projectForm.lead_source = sessionStorage.getItem("lead_source");
              }
              setTimeout(_ => this.zohoForm.nativeElement.submit());

            }
            else console.log("response", result)
          })
        })
      }
      else console.log("response", result);
    })
  }

  emailBody(formData) {
    return new Promise((resolve) => {
      var bodyContent = "<html lang='en'>";
      bodyContent += "<head>";
      bodyContent += "<meta charset='utf-8'>";
      bodyContent += "<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>";
      bodyContent += "<title>Demo Store</title>";
      bodyContent += "<link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap' rel='stylesheet'>";
      bodyContent += "</head>";

      bodyContent += "<body style='margin:0px;padding:0;background-color:#f7f7f7;font-size:14px;'>";
      bodyContent += "<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' style='background-color:#f7f7f7;font-family: Poppins, sans-serif!important;font-size:14px;color:#3d3d3d;line-height:1.5;width:100%;min-width:100%;'>";
      bodyContent += "<tbody>";
      bodyContent += "<tr>";
      bodyContent += "<td align='center' valign='top'>";
      bodyContent += "<table border='0' cellpadding='0' cellspacing='0' width='700' style='width:700px;background-color:#ffffff;font-family: Poppins, sans-serif!important;'>";
      bodyContent += "<tbody>";
      bodyContent += "<tr>";
      bodyContent += "<td align='center' valign='top' width='100%' style='width:100%;min-width:100%;background-color:#ffffff;font-family: Poppins, sans-serif!important;'>";
      bodyContent += "<table cellpadding='0' border='0' cellspacing='0' width='100%' style='width:100%;min-width:100%;padding:0 30px;'>";
      bodyContent += "<tbody>";
      bodyContent += "<tr>";
      bodyContent += "<td align='center' valign='middle' width='100%' style='width:100%;min-width:100%'>";
      bodyContent += "<img src='https://yourstore.io/api/uploads/624fd5a8a96c721d4bef5bc5/mail_logo.png?v=1660062628048' alt='Demo Store' style='vertical-align:middle;clear:both;width:auto;height:80px;padding-top:20px;padding-bottom:30px'>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "<tr>";
      bodyContent += "<td align='center' valign='middle' style='padding:0'>";
      bodyContent += "<h1 style='font-size:24px;font-weight:600;margin:0;text-align:center;padding-bottom: 30px;color: rgba(0, 0, 0, 0.7);font-family: Poppins, sans-serif!important;'>New Enquiry</h1>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "<tr>";
      bodyContent += "<td align='center' valign='middle' style='padding:0'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>Hey Team,</p>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>You have a new ##form_type## enquiry!</p>";

      bodyContent += "</td>";
      bodyContent += "</tr>";

      bodyContent += "</tbody>";
      bodyContent += "</table>";
      bodyContent += "<table border='0' cellpadding='0' cellspacing='0' width='500' style='width:100%;min-width:100%;padding:0 30px '>";
      bodyContent += "<tbody>";
      bodyContent += "<tr>";
      bodyContent += "<td colspan='2'  align='left'  width='100%'>";
      bodyContent += "<p style='font-size:15px;font-weight:600;margin:0;padding-top:10px;padding-bottom: 15px;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: 'Poppins', sans-serif!important;'>Customer Contact Details</p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "<tr>";
      bodyContent += "<td colspan='2'>";
      bodyContent += "<table>";
      bodyContent += "<tr>";
      bodyContent += "<td align='left' valign='top' width='15%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Name</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='1%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>:</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='84%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##name## </b></p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";

      bodyContent += "<tr>";
      bodyContent += "<td align='left' valign='top' width='15%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Phone</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='1%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='84%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##mobile## </b></p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";

      bodyContent += "<tr>";
      bodyContent += "<td align='left' valign='top' width='15%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Email</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='1%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='84%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##email## </b></p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";

      if (!this.enquiry_list?.length) {
        bodyContent += "<tr>";
        bodyContent += "<td align='left' valign='top' width='15%'>";
        bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Project</p>";
        bodyContent += "</td>";
        bodyContent += "<td align='left' valign='top' width='1%'>";
        bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent += "</td>";
        bodyContent += "<td align='left' valign='top' width='84%'>";
        bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##project## </b></p>";
        bodyContent += "</td>";
        bodyContent += "</tr>";
      }
      bodyContent += "</tbody>";
      bodyContent += "</table>";

      if (this.enquiry_list?.length) {
        bodyContent += "<table style='text-align: center !important;'' border='0' width='100%'>";
        bodyContent += "<tr>";
        bodyContent += "<td>";
        bodyContent += "<h3>Enquiry Details</h3>";
        bodyContent += "</td>";
        bodyContent += "</tr>";
        bodyContent += "</table>";
        bodyContent += "<div style='margin: 0 30px'>";
        bodyContent += "<table border='1' cellpadding='0' cellspacing='0' width='100%'>";
        bodyContent += "<tr>";
        bodyContent += "<td align='left' valign='top'>";
        bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins', sans-serif!important;'><b> Date </b></p>";
        bodyContent += "</td>";

        bodyContent += "<td align='left' valign='top' width='35%''>";
        bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'><b> Project </b></p>";
        bodyContent += "</td>";
        bodyContent += "<td align='left' valign='top'>";
        bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'><b> Enquiry Type </b></p>";
        bodyContent += "</td>";
        bodyContent += "</tr>";

        this.enquiry_list.forEach((el, i) => {
          if (typeof el.form_data == 'object') {
            bodyContent += "<tr>";
            bodyContent += "<td align='left' valign='top'>";
            bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'>##created_on" + i + "##";
            bodyContent += "</p>";
            bodyContent += "</td>";
            bodyContent += "<td align='left' valign='top'>";
            bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'>##project" + i + "##";
            bodyContent += "</p>";
            bodyContent += "</td>";
            bodyContent += "<td align='left' valign='top'>";
            bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'>##form_type" + i + "##";
            bodyContent += "</p>";
            bodyContent += "</td>";
            bodyContent += "</tr>";
          }
        });

        bodyContent += "</table>";
        bodyContent += "</div>";
      }

      bodyContent += "<table border='0' cellpadding='0' cellspacing='0' width='500' style='width:100%;min-width:100%;padding:0 30px 20px;'>";
      bodyContent += "<tbody>";

      bodyContent += "<tr>";
      bodyContent += "<td colspan='4' align='left' valign='top' width='100%' style='width:100%;min-width:100%;border-bottom:2px solid rgba(0, 0, 0, 0.1)'>";
      bodyContent += "<p style='font-size:15px;font-weight:600;margin:0;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: Poppins, sans-serif!important;'>&nbsp; </p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "<tr>";
      bodyContent += "<td align='left' style='width:20%;padding-top:20px'>";
      bodyContent += "<div style='margin-bottom:0px;display:table;justify-content:flex-start;position: relative;' align='left'>";
      bodyContent += "<a align='left' style='display:flex;align-items:center!important;justify-content:flex-start;font-weight:500;text-decoration: none; padding-right:20px;align-items:center!important;' href='https://yourstore.io' target='_blank'>";
      bodyContent += "<img src='https://www.yssentials.com/mail-template/foot-logo.png' style='width:150px; height: auto;vertical-align: middle!important;' alt='Yourstore'>";
      bodyContent += "</a> </div>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' style='width:2%;padding-top:20px'>";
      bodyContent += "<p style='width:50px'>&nbsp;</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' style='width:2%;padding-top:20px'>";
      bodyContent += "<p style='width:50px'>&nbsp;</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='right' style='width:76%;padding-top:20px'>";
      bodyContent += "<p style='font-size:12px;font-weight:500;margin:0;padding-top:10px;text-align:right;padding-bottom: 15px;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: Poppins, sans-serif!important;'>© ##copy_year## ";
      bodyContent += "<a style='text-decoration: underline;color: rgba(0, 0, 0, 0.3)!important;font-weight:bold; text-decoration: none;font-family: Poppins, sans-serif!important;' href='https://www.stoneandacres.com/' target='_blank'>Stone & Acres.</a> All Rights Reserved. </p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "</tbody>";
      bodyContent += "</table>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "</tbody>";
      bodyContent += "</table>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "</tbody>";
      bodyContent += "</table>";
      bodyContent += "</body>";
      bodyContent += "</html>";

      bodyContent = bodyContent.replace("##name##", formData.name);
      bodyContent = bodyContent.replace("##mobile##", formData.mobile);
      bodyContent = bodyContent.replace("##email##", formData.email);
      if (!this.enquiry_list?.length) bodyContent = bodyContent.replace("##project##", formData.project);
      else if (this.enquiry_list?.length) {
        for (let i = 0; i < this.enquiry_list?.length; i++) {
          let createdOn = 'NA'; let proName = 'NA'; let formType = 'NA';
          if(this.enquiry_list[i]?.created_on) createdOn = this.datePipe.transform(this.enquiry_list[i]?.created_on, "dd MMM y ");
          if(this.enquiry_list[i]?.form_data.project) proName = this.enquiry_list[i]?.form_data.project;
          if(this.enquiry_list[i]?.form_data.form_type) formType = this.enquiry_list[i]?.form_data.form_type;
          bodyContent = bodyContent.replace("##created_on" + i + "##", createdOn);
          bodyContent = bodyContent.replace("##project" + i + "##", proName);
          bodyContent = bodyContent.replace("##form_type" + i + "##", formType);
        }
      }
      bodyContent = bodyContent.replace("##form_type##", formData.form_type);
      bodyContent = bodyContent.replace("##copy_year##", this.currentYear);

      resolve(bodyContent)
    })
  }

  openBrochureModal(modalName) {
    this.btn_loader1 = true;
    setTimeout(() => {
      this.btn_loader1 = false;
      this.styleIndex = 0;
      modalName.show();
      this.commonService.scrollModalTop(500);
    }, 500);
  }

  onSubmitBrochure() {

    this.brochureForm.current_date = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    this.urlFormat(this.productDetails.name).then((router_link) => {
        localStorage.setItem("enquiry_proj_id", this.productDetails._id);
        localStorage.setItem("enquiry_type", "brochure");
        this.brochureForm.redirect_url = this.commonService.origin + "/enquiry/" + router_link + "-thankyou-page";
    })

    this.brochureForm.submit = true;
    this.brochureForm.form_type = "Download Brochure";
    this.brochureForm.project = this.productDetails.name;
      this.brochureForm.store_id = environment.store_id;
      this.brochureForm.subject = "Brochure Enquiry";
      this.brochureForm.to_mail = "contact@stoneandacres.com";
      this.brochureForm.cc_mail = "prabha1094@gmail.com";
      this.brochureForm.type = this.brochureForm.type;
      this.brochureForm.form_data = { name: this.brochureForm.name, email: this.brochureForm.email, mobile: this.brochureForm.mobile, message: this.brochureForm.message, project: this.brochureForm.project, form_type: this.brochureForm.form_type };
      // list status
      this.brochureForm.enquiry_list = true;

      this.storeApi.MAIL(this.brochureForm).subscribe((result) => {
        this.brochureForm.enquiry_list = false;
        if (result.status) {
          this.enquiry_list = result.list;
          this.emailBody(this.brochureForm).then((bodyContent) => {
            this.brochureForm.mail_content = bodyContent;
            this.storeApi.MAIL(this.brochureForm).subscribe((result) => {
              if (result.status) {
                this.brochureForm.website_url = window.location.href;
                this.brochureForm.lead_source = "SA Website";
                if (isPlatformBrowser(this.platformId)) {
                  if (sessionStorage.getItem("website_url")) this.brochureForm.website_url = sessionStorage.getItem("website_url");
                  if (sessionStorage.getItem("lead_source")) this.brochureForm.lead_source = sessionStorage.getItem("lead_source");
                }
                setTimeout(_ => this.zohoForm1.nativeElement.submit());
              }
              else console.log("response", result)
            })
          });
        }
        else { console.log("response", result) }
      })
  }

  btnLoader2() {
    this.btn_loader2 = true;
    setTimeout(() => {
      this.btn_loader2 = false;
      // this.document.getElementById('open_emi').click();
      this.commonService.openEmi();
    }, 500);
  }

  urlFormat(string) {
    return new Promise((resolve, reject) => {
      string = string.trim().toLowerCase().replace(/[^a-zA-Z0-9- ]/g, "");
      string = string.replace(/ +(?= )/g, "");
      string = string.replace(/[^a-zA-Z0-9]/g, "-");
      string = string.replace("---", "-");
      resolve(string)
    });

  }
}