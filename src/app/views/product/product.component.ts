import { Component, OnInit, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { fromEvent, Subscription } from 'rxjs';
import { AccordionConfig } from 'ngx-bootstrap/accordion';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { StoreApiService } from '../../services/store-api.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartlistService } from '../../services/cartlist.service';
import { CommonService } from '../../services/common.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import { DynamicAssetLoaderService } from '../../services/dynamic-asset-loader.service';
import { RedirectService } from '../../services/redirect.service';
import * as PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';
declare const fbq: Function;
declare const Plyr: any;
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

  imgBaseUrl: string = environment.img_baseurl;
  pageLoader: boolean; params: any;
  productDetails: any = {}; parentProductImages: any = [];
  activeImgIndex: number; tempMinCheckoutValue: any = 0;
  swipe_product_list: any; swipeProductIndex: number;
  category_details: any; psCssLoaded: boolean;
  pageUrl: string;
  
  existing_model_list: any = [];
  addonForm: any = {}; customized_model: any;
  selected_unit: any = {};
  customIndex: number;  mmIndex: number;
  customSection: boolean; mmSection: boolean; noteSection: boolean;
  custom_list: any = []; measurement_sets: any = []; notes_list: any = [];
  
  template_setting: any = environment.template_setting;
  exist_in_wishlist: boolean; cartCloseTimer: any;
  subscription: Subscription; wl_subscription: Subscription;
  related_products: any = []; reviews: any = []; avg_review: any;
  page: number; pageSize: number = 10; review_sort: string;
  prodFeatures: any = {}; plyrLoaded: boolean;
  storeSubscription: Subscription;
  prodLoaded: boolean; rpLoaded: boolean; pwLoaded: Boolean;
  enquiryForm: any = {};

  productSchema: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "250"
    },
    "offers": {
      "@type": "Offer",
      "priceValidUntil": new Date().getFullYear()+1+"-06-30",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "image": []
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2, @Inject(DOCUMENT) private document, private assetLoader: DynamicAssetLoaderService,
    public router: Router, private activeRoute: ActivatedRoute, public cs: CommonService, private storeApi: StoreApiService, private sanitizer: DomSanitizer,
    private api: ApiService, public wishService: WishlistService, private cartService: CartlistService, public cc: CurrencyConversionService, public rs: RedirectService
  ) {
    this.subscription = this.cs.currency_type.subscribe(() => {
      this.findCurrency();
    });
    this.wl_subscription = this.wishService.observe_wishlist.subscribe(wishlist => {
      this.exist_in_wishlist = wishlist.some(x => x.product_id == this.productDetails._id);
    });
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getData();
    });
    if(isPlatformBrowser(this.platformId)) {
      fromEvent(document, 'mousemove').subscribe(() => this.onInteract());
      fromEvent(document, 'touchmove').subscribe(() => this.onInteract());
      fromEvent(document, 'scroll').subscribe(() => this.onInteract());
    }
    // country list
    this.rs.getCountryList().then(() => {
      let index = this.rs.country_list.findIndex(object => object.name==this.cs.store_details.country);
      if(index!=-1) this.enquiryForm.dial_code = this.rs.country_list[index].dial_code;
    });
  }

  onInteract() {
    this.getRelatedProducts();
    this.initializePhotoSwipe();
  }

  ngOnInit(): void {
    this.pageUrl = this.router.url.split('?')[0];
    if(this.cs.storeDataLoaded) this.getData();
    else this.pageLoader = true;
  }

  getData(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      delete this.prodLoaded; delete this.rpLoaded; delete this.pwLoaded;
      this.params = params; this.swipeProductIndex = 0; this.swipe_product_list = []; this.activeImgIndex = 0;
      this.category_details = {}; this.related_products = []; this.reviews = [];this.page = 1; this.review_sort = 'rating';
      if(this.cs.product_page_attr) {
        // for login redirection
        this.productDetails = this.cs.product_page_attr.product;
        this.parentProductImages = this.productDetails.image_list;
        this.activeImgIndex = this.cs.product_page_attr.active_img_index;
        this.related_products = this.cs.product_page_attr.related_products;
        delete this.cs.product_page_attr;
        this.exist_in_wishlist = this.wishService.checkProductExist(this.productDetails._id);
        this.createJsonLd();
        this.findCurrency();
        // custom model
        if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("by_sm")) {
          this.customized_model = this.cs.decode(sessionStorage.getItem("by_sm"));
          sessionStorage.removeItem("by_sm");
        }
        // video
        if(this.productDetails.video_details && Object.entries(this.productDetails.video_details).length) {
          const tag = this.document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          this.document.body.appendChild(tag);
        }
        // seo
        if(this.productDetails.seo_status) {
          let seoImage = this.imgBaseUrl+this.productDetails.image;
          this.cs.setSiteMetaData(this.productDetails.seo_details, seoImage);
        }
        else this.cs.getStoreSeoDetails();
      }
      else {
        if(this.cs.selected_product) {
          this.productDetails = this.cs.selected_product;
          this.productDetails.image = this.productDetails.image_list[0].image;
          delete this.cs.selected_product;
        }
        else this.pageLoader = true;
        // swipe product list
        if(isPlatformBrowser(this.platformId)) {
          if(sessionStorage.getItem("by_spl")) {
            this.swipe_product_list = this.cs.decode(sessionStorage.getItem("by_spl"));
            let proIndex = this.swipe_product_list.findIndex(obj => obj==this.params.product_id);
            if(proIndex!=-1) this.swipeProductIndex = proIndex;
          }
          if(sessionStorage.getItem("by_cat_d")) this.category_details = this.cs.decode(sessionStorage.getItem("by_cat_d"));
        }
        // product details
        this.storeApi.PRODUCT_DETAILS({ product_id: this.params.product_id }).subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.productDetails = result.data;
            this.productDetails.bulk_disc = 0;
            if(this.productDetails.selling_price > this.productDetails.discounted_price) {
              let discAmount = this.productDetails.selling_price - this.productDetails.discounted_price;
              this.productDetails.disc_percentage = Math.round((discAmount/this.productDetails.selling_price)*100);
            }
            this.productDetails.original_desc = result.data.description;
            this.productDetails.description = this.sanitizer.bypassSecurityTrustHtml(this.productDetails.description);
            if(!this.productDetails.min_qty) this.productDetails.min_qty = 1;
            this.productDetails.quantity = this.productDetails.min_qty;
            this.productDetails.additional_qty = 0;
            this.productDetails.addon_price = 0;
            this.productDetails.product_id = this.productDetails._id;
            this.parentProductImages = this.productDetails.image_list;
            this.productDetails.image = this.productDetails.image_list[0].image;
            this.productDetails.external_addon_status = this.productDetails.addon_status;
            this.productDetails.external_addon_list = this.productDetails.addon_list;
            this.exist_in_wishlist = this.wishService.checkProductExist(this.productDetails._id);
            this.createJsonLd();
            this.findCurrency();
            this.prodLoaded = true;
            // fb tracking
            if(isPlatformBrowser(this.platformId) && environment.facebook_pixel) {
              fbq('track', 'ViewContent', {
                value: this.productDetails.temp_discounted_price, currency: this.cs.selected_currency.country_code,
                content_ids: this.productDetails.sku, content_type: 'Product'
              });
            }
            // video
            if(this.productDetails.video_details && Object.entries(this.productDetails.video_details).length) {
              const tag = this.document.createElement('script');
              tag.src = 'https://www.youtube.com/iframe_api';
              this.document.body.appendChild(tag);
            }
            // seo
            if(this.productDetails.seo_status) {
              let seoImage = this.imgBaseUrl+this.productDetails.image;
              this.cs.setSiteMetaData(this.productDetails.seo_details, seoImage);
            }
            else this.cs.getStoreSeoDetails();
            // update stock
            if(this.productDetails.hold_till) {
              let balanceStock = this.productDetails.stock;
              if(new Date() < new Date(this.productDetails.hold_till)) balanceStock = this.productDetails.stock - this.productDetails.hold_qty;
              this.productDetails.stock = balanceStock;
            }
            if(this.productDetails.stock_type=='lim' && this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
            if(this.template_setting.pp_img_tag) {
              this.productDetails.created_on = new Date(new Date(new Date(this.productDetails.created_on).setHours(23,59,59,59)).setDate(new Date(this.productDetails.created_on).getDate() + 30));
              if(this.productDetails.badge_list?.length) this.productDetails.badge_list = this.cs.buildTags(this.productDetails.badge_list);
            }
            // variants
            if(this.productDetails.variant_status) {
              // for first option checked
              this.productDetails.variant_types.forEach(element => {
                element.value = element.options[0].value;
              });
              this.setVariantPrice();
            }
            // PRODUCT FEATURES
            if(isPlatformBrowser(this.platformId)) {
              this.getProductFeatures().then((prodFeatures: any) => {
                this.prodFeatures = prodFeatures;
                if(this.productDetails.vendor_id) {
                  this.getVendorFeatures().then((vendorFeatures: any) => {
                    this.prodFeatures.addon_list = vendorFeatures.addon_list;
                    this.prodFeatures.measurement_set = vendorFeatures.measurement_set;
                    this.prodFeatures.faq_list = vendorFeatures.faq_list;
                    this.prodFeatures.size_chart = vendorFeatures.size_chart;
                    this.setProductFeatures();
                  });
                }
                else this.setProductFeatures();
              });
            }
            // product reviews
            if(this.cs.ys_features.indexOf('product_reviews')!=-1) {
              this.storeApi.REVIEWS(this.productDetails._id).subscribe(result => {
                if(result.status) {
                  this.reviews = result.list;
                  this.reviews.forEach(obj => {
                    obj.description = obj.description.replace(new RegExp('\n', 'g'), "<br />");
                  });
                  let totalRating = this.reviews.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue['rating'];
                  }, 0);
                  this.avg_review = totalRating/this.reviews.length;
                  if(this.avg_review % 1) this.avg_review = this.avg_review.toFixed(1);
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
  }

  onEnquiry() {
    let sendData = {
      store_id: this.cs.store_id, product_id: this.productDetails._id, product_name: this.productDetails.name,
      product_sku: this.productDetails.sku, name: this.enquiryForm.name, email: this.enquiryForm.email,
      mobile: this.enquiryForm.dial_code+" "+this.enquiryForm.mobile
    };
    this.enquiryForm.submit = true;
    this.storeApi.PRODUCT_ENQUIRY(sendData).subscribe(result => {
      this.enquiryForm.submit = false;
      if(result.status) {
        this.enquiryForm = { status: true, alert_msg: "Your request has been submitted, our team will reach out to you within 24 hours." };
      }
      else {
        this.enquiryForm.status = false;
        this.enquiryForm.alert_msg = result.message;
        console.log("response", result);
      }
    });
  }

  changeQty() {
    delete this.productDetails.cart_alert;
    delete this.productDetails.added_to_cart;
    this.productDetails.disc_percentage = 0;
    if(this.productDetails.disc_status && this.productDetails.disc_by) {
      let priceRange = this.productDetails.disc_range.sort((a, b) => 0 - (a.qty > b.qty ? -1 : 1));
      let prInd = priceRange.findIndex(obj => obj.qty > this.productDetails.quantity);
      if(prInd==-1) prInd = priceRange.length - 1;
      else prInd--;
      if(prInd != -1) {
        let itemPrice = this.productDetails.discounted_price;
        this.productDetails.bulk_disc = priceRange[prInd].value;
        if(this.productDetails.disc_by=='percentage') {
          this.productDetails.bulk_disc = Math.round((priceRange[prInd].value/100)*itemPrice);
        }
        let temDiscPrice = this.productDetails.discounted_price - this.productDetails.bulk_disc;
        this.productDetails.temp_discounted_price = this.cc.CALC(temDiscPrice);
        // discount
        if(this.productDetails.selling_price > temDiscPrice) {
          let discAmount = this.productDetails.selling_price - temDiscPrice;
          this.productDetails.disc_percentage = Math.round((discAmount/this.productDetails.selling_price)*100);
        }
      }
      else this.productDetails.temp_discounted_price = this.cc.CALC(this.productDetails.discounted_price);
    }
    else this.productDetails.temp_discounted_price = this.cc.CALC(this.productDetails.discounted_price);
  }

  getRelatedProducts() {
    if(this.prodLoaded && !this.rpLoaded && this.cs.ys_features.indexOf('related_products')!=-1) {
      this.rpLoaded = true;
      setTimeout(() => {
        let catId = null;
        if(this.category_details._id) catId = this.category_details._id;
        else if(this.productDetails.category_id.length) catId = this.productDetails.category_id[0];
        if(catId) {
          this.storeApi.RANDOM_PRODUCT_LIST({ category_id: catId, limit: this.template_setting.related_products_limit }).subscribe(result => {
            if(result.status) {
              this.related_products = result.list;
              for(let product of this.related_products) {
                product.created_on = new Date(new Date(new Date(product.created_on).setHours(23,59,59,59)).setDate(new Date(product.created_on).getDate() + 30));
                if(product.badge_list?.length) product.badge_list = this.cs.buildTags(product.badge_list);
                if(product.hold_till) {
                  let balanceStock = product.stock;
                  if(new Date() < new Date(product.hold_till)) balanceStock = product.stock - product.hold_qty;
                  product.stock = balanceStock;
                }
                product.temp_selling_price = this.cc.CALC(product.selling_price);
                product.temp_discounted_price = this.cc.CALC(product.discounted_price);
              }
            }
          });
        }
      }, 500);
    }
  }

  getProductFeatures() {
    return new Promise((resolve, reject) => {
      if(typeof(this.cs.product_features)=='object' && Object.keys(this.cs.product_features).length) {
        resolve(this.cs.product_features);
      }
      else {
        this.storeApi.PRODUCT_FEATURES().subscribe(result => {
          let pdFeatures = JSON.parse(result.data);
          pdFeatures.addon_list = pdFeatures.addon_list.sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          pdFeatures.measurement_set = pdFeatures.measurement_set.sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          this.cs.product_features = pdFeatures;
          resolve(pdFeatures);
        });
      }
    });
  }
  getVendorFeatures() {
    return new Promise((resolve, reject) => {
      if(typeof(this.cs.vendor_features[this.productDetails.vendor_id])=='object' && Object.keys(this.cs.vendor_features[this.productDetails.vendor_id]).length) {
        resolve(this.cs.vendor_features[this.productDetails.vendor_id]);
      }
      else {
        this.storeApi.VENDOR_FEATURES(this.productDetails.vendor_id).subscribe(result => {
          let vdFeatures = JSON.parse(result.data);
          vdFeatures.addon_list = vdFeatures.addon_list.sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          vdFeatures.measurement_set = vdFeatures.measurement_set.sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          this.cs.vendor_features[this.productDetails.vendor_id] = vdFeatures;
          resolve(vdFeatures);
        });
      }
    });
  }

  // photoswipe
  initializePhotoSwipe() {
    if(isPlatformBrowser(this.platformId) && !this.pwLoaded && this.productDetails.image_list?.length && this.productDetails.image_list[0].image) {
      this.pwLoaded = true;
      this.assetLoader.load('jquery', 'photoswipe', 'default-skin').then(data => {
        this.psCssLoaded = true;
        let swipeItems: any = [];
        this.productDetails.image_list.forEach(element => {
          let imgPath = this.imgBaseUrl+element.image;
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
              getDoubleTapZoom: function(isMouseClick, item) {
                if(isMouseClick) {
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

  chooseAddon(mmOptionsModal, addonTypesModal, addonListModal, existingListModal, createNewModal) {
    this.productDetails.temp_addon_list = this.productDetails.addon_list;
    this.productDetails.external_addon_status = this.productDetails.addon_status;
    this.productDetails.quantity = this.productDetails.min_qty;
    if(this.productDetails.addon_list.length==1) {
      if(!this.productDetails.addon_list[0].custom_list.length && this.productDetails.addon_list[0].updated_mm_list.length && this.productDetails.addon_list[0].sizing_assistant_id) {
        this.productDetails.temp_selected_addon = this.productDetails.addon_list[0];
        mmOptionsModal.show();
      }
      else {
        this.productDetails.selected_addon=this.productDetails.addon_list[0];
        this.onChangeAddon();
        this.onCreateCustomization(existingListModal, createNewModal);
      }
    }
    else {
      this.productDetails.filteredNoneList = this.productDetails.addon_list.filter(obj => !obj.custom_list.length && !obj.updated_mm_list.length);
      this.productDetails.filteredCombinedList = this.productDetails.addon_list.filter(obj => obj.custom_list.length && obj.updated_mm_list.length);
      this.productDetails.filteredCustomList = this.productDetails.addon_list.filter(obj => obj.custom_list.length && !obj.updated_mm_list.length);
      this.productDetails.filteredMmList = this.productDetails.addon_list.filter(obj => !obj.custom_list.length && obj.updated_mm_list.length);
      if(!this.productDetails.filteredNoneList.length && !this.productDetails.filteredCombinedList.length && this.productDetails.filteredCustomList.length && this.productDetails.filteredMmList.length) {
        this.productDetails.disp_sizing_card = false;
        if(this.productDetails.filteredMmList.length==1 && this.productDetails.filteredMmList[0].sizing_assistant_id) this.productDetails.disp_sizing_card = true;
        addonTypesModal.show();
      }
      else addonListModal.show();
    }
  }
  selectAddonType(filteredAddonList, addonListModal, existingListModal, createNewModal) {
    this.productDetails.external_addon_status = this.productDetails.addon_status;
    this.productDetails.quantity = this.productDetails.min_qty;
    if(filteredAddonList.length==1) {
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
    if(isPlatformBrowser(this.platformId) && this.cs.customer_token) {
      sessionStorage.setItem("by_pa", this.cs.encode(prodAttr));
      this.router.navigate(["/sizing-assistant/"+addonDetails.sizing_assistant_id]);
    }
    else {
      delete this.productDetails.selected_addon;
      delete this.productDetails.external_addon_status;
      this.cs.after_login_event = {
        type: 'custom_model', redirect: this.pageUrl,
        product_attr: { product: this.productDetails, active_img_index: this.activeImgIndex, related_products: this.related_products }
      };
      this.router.navigate(["/account"]);
    }
  }

  onSelectAddon(addonDetails, existingListModal, createNewModal, mmOptionsModal, delay) {
    setTimeout(() => {
      if(addonDetails.sizing_assistant_id) {
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
    this.tempMinCheckoutValue = this.cc.CALC_WO_AC(this.cs.application_setting.min_checkout_value);
    for(let product of this.related_products) {
      product.temp_selling_price = this.cc.CALC(product.selling_price);
      product.temp_discounted_price = this.cc.CALC(product.discounted_price);
    }
  }

  onChangeAddon() {
    if(this.productDetails.stock_type=='lim' && this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
    if(this.productDetails.quantity < this.productDetails.min_qty) this.productDetails.quantity = this.productDetails.min_qty;
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
    let variantInfo = []; let variantImages = [];
    let productImgList = this.parentProductImages;
    let variantTypes = this.productDetails.variant_types;
    if(variantTypes.length===1) {
      variantInfo = this.productDetails.variant_list.filter(element => 
        element[variantTypes[0].name]==variantTypes[0].value
      );
    }
    else if(variantTypes.length===2) {
      variantInfo = this.productDetails.variant_list.filter(element => 
        element[variantTypes[0].name]==variantTypes[0].value && element[variantTypes[1].name]==variantTypes[1].value
      );
    }
    else if(variantTypes.length===3) {
      variantInfo = this.productDetails.variant_list.filter(element => 
        element[variantTypes[0].name]==variantTypes[0].value && element[variantTypes[1].name]==variantTypes[1].value && element[variantTypes[2].name]==variantTypes[2].value
      );
    }
    // update price
    if(variantInfo.length) {
      if(variantInfo[0].sku) this.productDetails.sku = variantInfo[0].sku;
      if(variantInfo[0].weight) this.productDetails.weight = variantInfo[0].weight;
      if(variantInfo[0].taxrate_id) this.productDetails.taxrate_id = variantInfo[0].taxrate_id;
      if(variantInfo[0].image_list && variantInfo[0].image_list.length) {
        variantInfo[0].image_list.forEach(elem => {
          let imgData = {};
          for(let key in elem) {
            if(elem.hasOwnProperty(key)) imgData[key] = elem[key];
          }
          variantImages.push(imgData);
        });
      }
      this.productDetails.selling_price = variantInfo[0].selling_price;
      this.productDetails.discounted_price = variantInfo[0].discounted_price;
      this.productDetails.stock = variantInfo[0].stock;
      this.findCurrency();
      // update stock
      if(variantInfo[0].hold_till) {
        let balanceStock = this.productDetails.stock;
        if(new Date() < new Date(variantInfo[0].hold_till)) balanceStock = this.productDetails.stock - variantInfo[0].hold_qty;
        this.productDetails.stock = balanceStock;
      }
    }
    this.productDetails.quantity = this.productDetails.min_qty;
    if(this.productDetails.stock_type=='lim' && this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
    if(this.productDetails.quantity < this.productDetails.min_qty) this.productDetails.quantity = this.productDetails.min_qty;
    // update image list
    this.productDetails.image_list = productImgList;
    if(variantImages.length) {
      productImgList.filter(obj => !obj.hide_on_variants).forEach(element => { variantImages.push(element); });
      this.productDetails.image_list = variantImages;
    }
    this.initializePhotoSwipe();
    this.activeImgIndex = 0;
    this.productDetails.image = this.productDetails.image_list[0].image;
    delete this.productDetails.selected_addon;
    this.onChangeAddon();
    // addons
    this.filterProductAddons();
  }

  calcAddonPrice() {
    let customizedPrice = 0; this.productDetails.additional_qty = 0;
    if(this.productDetails.selected_addon && this.customized_model && this.customized_model.addon_id==this.productDetails.selected_addon._id) {
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
    if(this.productDetails.selected_addon) this.productDetails.addon_price = this.productDetails.selected_addon.price+customizedPrice;
    if((this.productDetails.additional_qty % 1) != 0) this.productDetails.additional_qty = parseFloat(this.productDetails.additional_qty.toFixed(1));
    this.findCurrency();
  }

  getRadioNextList(optionName) {
    // if next option list exist
    if(this.custom_list[this.customIndex+1]) {
      this.custom_list[this.customIndex+1].filtered_option_list = this.custom_list[this.customIndex+1].option_list.filter(obj => obj.link_to=='all' || obj.link_to==optionName);
    }
  }
  getCheckboxNextList() {
    // if next option list exist
    if(this.custom_list[this.customIndex+1])
    {
      let selectedItems = [];
      this.custom_list[this.customIndex].filtered_option_list.forEach(obj => {
        if(obj.custom_option_checked) selectedItems.push(obj.name);
      });
      this.custom_list[this.customIndex+1].filtered_option_list = this.custom_list[this.customIndex+1].option_list.filter(obj => obj.link_to=='all' || selectedItems.indexOf(obj.link_to)!=-1);
    }
  }
  disableOption() {
    // for mandatory or limited options
    if(this.custom_list[this.customIndex].limit > 0) {
      // for disable unchecked checkbox
      let checkedLen = this.custom_list[this.customIndex].filtered_option_list.filter(obj => obj.custom_option_checked).length;
      if(this.custom_list[this.customIndex].limit==checkedLen) {
        this.custom_list[this.customIndex].filtered_option_list.forEach(obj => {
          obj.disabled = true;
          if(obj.custom_option_checked) obj.disabled = false;
        });
      }
      else this.custom_list[this.customIndex].filtered_option_list.forEach(obj => { obj.disabled = false; });
    }
  }

  addtoCart(openPopup) {
    // fb tracking
    if(isPlatformBrowser(this.platformId) && environment.facebook_pixel) {
      fbq('track', 'AddToCart', {
        value: this.productDetails.temp_discounted_price, currency: this.cs.selected_currency.country_code,
        content_ids: [this.productDetails.sku], content_type: 'Product'
      });
    }
    let prodPrice: any = this.productDetails.discounted_price - this.productDetails.bulk_disc;
    this.productDetails.final_price = parseFloat(prodPrice);
    if(this.productDetails.unit=="Pcs") {
      this.productDetails.final_price = parseFloat(prodPrice)+parseFloat(this.productDetails.addon_price);
    }
    this.productDetails.customized_model = this.customized_model;
    this.productDetails.customization_status = false;
    if(this.productDetails.customized_model) {
      this.productDetails.customization_status = true;
      this.productDetails.customized_model.model_id = this.productDetails.customized_model._id;
    }
    // addon section
    if(this.productDetails.selected_addon && this.productDetails.selected_addon!=undefined) {
      if(this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
        if(this.productDetails.customized_model && this.productDetails.customized_model!=undefined) this.addToCartTrigger(openPopup);
        else this.productDetails.customization_alert = true;
      }
      else this.addToCartTrigger(openPopup);
    }
    else {
      if(this.cs.application_setting.product_addon && this.productDetails.addon_status && this.productDetails.addon_list.length && this.productDetails.addon_must)
      {
        if(this.productDetails.selected_addon && this.productDetails.selected_addon!=undefined) {
          if(this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
            if(this.productDetails.customized_model && this.productDetails.customized_model!=undefined) this.addToCartTrigger(openPopup);
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
    if(isPlatformBrowser(this.platformId)) {
      if(environment.header_root.indexOf('sc') != -1) {
        if(openPopup && this.cs.desktop_device && this.document.getElementById('sidecart-trigger')) {
          setTimeout(() => { this.document.getElementById('sidecart-trigger')?.click(); }, 100);
        }
        this.cartCloseTimer = setTimeout(() => { this.productDetails.cart_alert = false; }, 5000);
      }
      else {
        if(openPopup && this.document.getElementById('minicart-trigger')) this.document.getElementById('minicart-trigger')?.click();
        this.cartCloseTimer = setTimeout(() => {
          this.productDetails.cart_alert = false;
          if($('.cart-box:visible').length) $('.cart-box').slideUp('400');
        }, 5000);
        this.showHeader();
      }
    }
    this.cartService.addToCart(this.productDetails);
    if(this.params.wishstatus) this.wishService.removeFromWishList(this.productDetails._id);
  }
  gotoCart() {
    if(environment.header_root.indexOf('sc') != -1) this.document.getElementById('sidecart-trigger')?.click();
    else this.router.navigate(['/cart']);
  }

  buyNow() {
    if(isPlatformBrowser(this.platformId)) {
      // fb tracking
      if(environment.facebook_pixel) {
        fbq('track', 'InitiateCheckout', {
          value: this.productDetails.temp_discounted_price, currency: this.cs.selected_currency.country_code
        });
      }
      sessionStorage.removeItem("by_qo_cd");
    }
    this.productDetails.final_price = parseFloat(this.productDetails.discounted_price);
    if(this.productDetails.unit=="Pcs") {
      this.productDetails.final_price = parseFloat(this.productDetails.discounted_price)+parseFloat(this.productDetails.addon_price);
    }
    this.productDetails.customized_model = this.customized_model;
    this.productDetails.customization_status = false;
    if(this.productDetails.customized_model) {
      this.productDetails.customization_status = true;
      this.productDetails.customized_model.model_id = this.productDetails.customized_model._id;
    }
    // addon section
    if(this.productDetails.selected_addon && this.productDetails.selected_addon!=undefined) {
      if(this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
        if(this.productDetails.customized_model && this.productDetails.customized_model!=undefined) this.continueBuyNow(this.productDetails);
        else this.productDetails.customization_alert = true;
      }
      else this.continueBuyNow(this.productDetails);
    }
    else {
      if(this.cs.application_setting.product_addon && this.productDetails.addon_status && this.productDetails.addon_list.length && this.productDetails.addon_must)
      {
        if(this.productDetails.selected_addon && this.productDetails.selected_addon!=undefined) {
          if(this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length) {
            if(this.productDetails.customized_model && this.productDetails.customized_model!=undefined) this.continueBuyNow(this.productDetails);
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
    let cartWeight = cartQty*this.productDetails.weight;
    let cartTotal = this.cc.CALC_INR_WITH_AC(this.productDetails.final_price * cartQty);
    if(this.productDetails.unit!="Pcs") {
      cartTotal += this.cc.CALC_INR_WITH_AC(this.productDetails.addon_price);
    }
    if(this.cs.application_setting.max_shipping_weight > 0 && cartWeight > this.cs.application_setting.max_shipping_weight) {
      this.productDetails.buynow_alert = "max_shipping";
    }
    else if(this.cs.application_setting.min_checkout_value > cartTotal) {
      this.tempMinCheckoutValue = this.cc.CALC_WO_AC(this.cs.application_setting.min_checkout_value);
      this.productDetails.buynow_alert = "min_checkout";
    }
    else {
      this.productDetails.buynow_loader = true;
      x.quantity = x.quantity+x.additional_qty;
      x.addon_status = x.external_addon_status;
      let checkoutDetails: any = { buy_now: true, item_list: [x], order_type: 'delivery' };
      if(this.cs.customer_token) {
        this.api.USER_DETAILS().subscribe(result => {
          if(result.status) {
            this.wishService.removeFromWishList(x._id);
            let addressList = result.data.address_list;
            let shippingIndex = addressList.findIndex(obj => obj.shipping_address);
            if(shippingIndex != -1) {
              checkoutDetails.shipping_address = addressList[shippingIndex];
              // pincode verification
              if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(checkoutDetails.shipping_address.pincode)==-1) {
                // redirect to address list
                this.buynowNavigation(checkoutDetails, '/checkout/address-list/product');
              }
              else {
                // shipping
                if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
                  // redirect to delivery methods
                  this.buynowNavigation(checkoutDetails, '/checkout/delivery-methods');
                }
                else {
                  let sendData: any = {
                    sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: checkoutDetails.shipping_address._id,
                    order_type: checkoutDetails.order_type, currency_type: this.cs.selected_currency.country_code, buy_now: true
                  };
                  sendData.item_list = this.cs.getItemList(checkoutDetails.item_list);
                  this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                    if(result.status) {
                      checkoutDetails.shipping_method = result.data.shipping_method;
                      this.buynowNavigation(checkoutDetails, '/checkout/order-details/product');
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
      else if(isPlatformBrowser(this.platformId) && this.cs.application_setting.guest_checkout) {
        if(sessionStorage.getItem("guest_token")) {
          this.cartService.updateCartList([x]);
          if(sessionStorage.getItem("by_ca")) {
            let guestAddress = this.cs.decode(sessionStorage.getItem("by_ca"));
            checkoutDetails.shipping_address = guestAddress;
            sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
            // pincode verification
            if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(checkoutDetails.shipping_address.pincode)==-1) {
              // redirect to address list
              this.router.navigate(["/checkout/address-list/product"]);
            }
            else {
              // shipping
              if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
                // redirect to delivery methods
                this.router.navigate(['/checkout/delivery-methods']);
              }
              else {
                let sendData: any = {
                  sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: checkoutDetails.shipping_address._id,
                  order_type: checkoutDetails.order_type, currency_type: this.cs.selected_currency.country_code, buy_now: true
                };
                sendData.item_list = this.cs.getItemList(checkoutDetails.item_list);
                this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
                  if(result.status) {
                    checkoutDetails.shipping_method = result.data.shipping_method;
                    sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
                    this.router.navigate(['/checkout/order-details/product']);
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
            sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
            this.router.navigate(["/checkout/address-list/product"]);
          }
        }
        else {
          sessionStorage.setItem("by_cd", this.cs.encode(checkoutDetails));
          this.cs.after_login_event = { type: 'buynow_product', product: x }; // for go main login page from guest login
          this.router.navigate(["/guest-login"]);
        }
      }
      else {
        this.cs.after_login_event = { type: 'buynow_product', product: x };
        this.router.navigate(["/account"]);
      }
    }
  }
  buynowNavigation(checkoutDetails, redirect) {
    this.api.USER_UPDATE({ checkout_details: checkoutDetails }).subscribe(result => {
      this.productDetails.buynow_loader = false;
      if(result.status) this.router.navigate([redirect]);
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
    });
  }

  // CUSTOMIZATION SECTION
  onCreateCustomization(existingListModal, createNewModal) {
    if(this.productDetails.selected_addon) {
      if(this.productDetails.selected_addon.custom_list.length || this.productDetails.selected_addon.updated_mm_list.length ||  this.productDetails.selected_addon.notes_list.length) {
        if(this.productDetails.stock_type=='lim' && this.productDetails.quantity > this.productDetails.stock) this.productDetails.quantity = this.productDetails.stock;
        if(this.productDetails.quantity < this.productDetails.min_qty) this.productDetails.quantity = this.productDetails.min_qty;
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
        if(this.custom_list.length) {
          this.customSection = true;
          this.custom_list.forEach(obj => {
            delete obj.selected_option;
            obj.option_list.forEach(opt => { delete opt.custom_option_checked; delete opt.disabled; });
          });
          this.custom_list[this.customIndex].filtered_option_list = this.custom_list[this.customIndex].option_list;
          if(this.custom_list[this.customIndex].type=='either_or') {
            this.custom_list[this.customIndex].selected_option = this.custom_list[this.customIndex].filtered_option_list[0].name;
            this.getRadioNextList(this.custom_list[this.customIndex].selected_option);
          }
        }
        // measurement
        else if(this.measurement_sets.length) {
          this.mmSection = true;
          this.selected_unit = this.measurement_sets[this.mmIndex].units[0];
          this.addonForm.mm_unit = this.selected_unit.name;
        }
        // notes
        else this.noteSection = true;
        if(this.cs.store_details.additional_features?.custom_model) {
          if(this.cs.customer_token) {
            this.productDetails.custom_loader = true;
            this.api.USER_DETAILS().subscribe(result => {
              this.productDetails.custom_loader = false;
              if(result.status) {
                this.existing_model_list = result.data.model_list.filter(obj => obj.addon_id==this.productDetails.selected_addon._id);
                if(this.existing_model_list.length) existingListModal.show();
                else createNewModal.show();
                this.cs.scrollModalTop(500);
              }
              else console.log("response", result);
            });
          }
          else {
            delete this.productDetails.selected_addon;
            delete this.productDetails.external_addon_status;
            this.cs.after_login_event = {
              type: 'custom_model', redirect: this.pageUrl,
              product_attr: { product: this.productDetails, active_img_index: this.activeImgIndex, related_products: this.related_products }
            };
            this.router.navigate(["/account"]);
          }
        }
        else {
          createNewModal.show();
          this.cs.scrollModalTop(500);
        }
      }
    }
  }

  buildFAQList(productFaqList, storeFaqList) {
    return new Promise((resolve, reject) => {
      let updatedFaqList: any = [];
      productFaqList.forEach(faqObj => {
        let faqId = Object.keys(faqObj)[0];
        let quesIndex = storeFaqList.findIndex(obj => obj._id==faqId);
        if(quesIndex!=-1) {
          let answerIndex = storeFaqList[quesIndex].answer_list.findIndex(obj => obj._id==faqObj[faqId]);
          if(answerIndex!=-1) updatedFaqList.push({ ques: storeFaqList[quesIndex].name, ans: storeFaqList[quesIndex].answer_list[answerIndex].answer });
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
        if(addonObj.mm_list.length) {
          addonObj.mm_list.forEach(obj => {
            let mmIndex = overallmmList.findIndex(elem => elem._id==obj.mmset_id);
            if(mmIndex!=-1) addonObj.updated_mm_list.push(overallmmList[mmIndex]);
          });
        }
      });
      resolve(addonList);
    });
  }

  customPrev() {
    if(this.customSection) {
      this.customIndex -= 1;
    }
    else if(this.mmSection) {
      if(this.mmIndex>0) this.mmIndex -= 1;
      else if(this.custom_list.length) {
        this.mmSection = false;
        this.customSection = true;
      }
    }
    else if(this.noteSection) {
      this.noteSection = false;
      if(this.measurement_sets.length) this.mmSection = true;
      else this.customSection = true;
    }
    this.addonForm.alert_msg = null;
    this.cs.scrollModalTop(0);
  }
  onCustomNext(gotoNext) {
    let reqInput = this.validateForm();
    if(reqInput===undefined) {
      let customAlert = this.checkCustomSelection();
      if(!customAlert) {
        // customization next level
        if(!gotoNext) {
          this.mmSection = false; this.noteSection = false;
          this.customIndex = this.customIndex+1;
          if(this.custom_list[this.customIndex].type=='either_or') {
            if(this.custom_list[this.customIndex].selected_option) {
              if(this.custom_list[this.customIndex].filtered_option_list.findIndex(obj => obj.name==this.custom_list[this.customIndex].selected_option) == -1) {
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
          if(this.measurement_sets.length) {
            this.mmIndex = 0; this.mmSection = true;
            this.selected_unit = this.measurement_sets[this.mmIndex].units[0];
            this.addonForm.mm_unit = this.selected_unit.name;
          }
          // custom note
          else this.noteSection = true;
        }
        this.cs.scrollModalTop(0);
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
    if(reqInput===undefined) {
      // for find additional qty
      for(let elem of this.measurement_sets[this.mmIndex].list) {
        elem.additional_qty = 0;
        if(elem.conditions.length) {
          for(let cond of elem.conditions) {
            let filteredList = cond.list.filter(obj => obj.unit==this.addonForm.mm_unit);
            if(filteredList.length) {
              elem.additional_qty = filteredList[0].additional_qty;
              if(parseFloat(elem.value)>filteredList[0].mm_from && filteredList[0].mm_to>=parseFloat(elem.value)) {
                elem.additional_qty = filteredList[0].additional_qty;
                break;
              }
            }
          }
        }
      }
      if((this.measurement_sets.length-1) > this.mmIndex) this.mmIndex = this.mmIndex+1;
      else {
        this.customSection = false;
        this.mmSection = false;
        this.noteSection = true;
      }
      this.cs.scrollModalTop(0);
    }
    else {
      this.addonForm.alert_msg = "Please fill out the mandatory fields";
      this.document.getElementById(reqInput).focus();
    }
  }
  
  onChangeUnit() {
    let unitIndex = this.measurement_sets[this.mmIndex].units.findIndex(obj => obj.name==this.addonForm.mm_unit);
    if(unitIndex!=-1) this.selected_unit = this.measurement_sets[this.mmIndex].units[unitIndex];
    if(this.addonForm.mm_unit=='cms') {
      // convert inch -> cm
      this.measurement_sets.forEach(set => {
        set.list.forEach(element => {
          if(element.value) {
            element.value = element.value*2.54;
            if((element.value % 1) != 0) element.value = parseFloat(element.value.toFixed(1));
          }
        });
      });
    }
    else {
      // convert cm -> inch
      this.measurement_sets.forEach(set => {
        set.list.forEach(element => {
          if(element.value) {
            element.value = element.value*0.393701;
            if((element.value % 1) != 0) element.value = parseFloat(element.value.toFixed(1));
          }
        });
      });
    }
  }

  onSaveNewModal(modalName, customDetailsModal) {
    let reqInput = this.validateForm();
    if(reqInput===undefined) {
      let customAlert = this.checkCustomSelection();
      if(!customAlert) {
        this.addonForm.addon_id = this.productDetails.selected_addon._id;
        this.addonForm.custom_list = [];
        this.custom_list.forEach(obj => {
          if(obj.filtered_option_list) {
            if(obj.type=="either_or") {
              let selIndex = obj.filtered_option_list.findIndex(opt => opt.name==obj.selected_option);
              if(selIndex!=-1) this.addonForm.custom_list.push({ name: obj.name, value: [obj.filtered_option_list[selIndex]] });
            }
            else {
              let selectedList = obj.filtered_option_list.filter(opt => opt.custom_option_checked);
              if(selectedList.length) this.addonForm.custom_list.push({ name: obj.name, value: selectedList })
            }
          }
        });
        // measurement section (for find additional qty)
        if(this.measurement_sets.length) {
          for(let elem of this.measurement_sets[this.mmIndex].list) {
            elem.additional_qty = 0;
            if(elem.conditions.length) {
              for(let cond of elem.conditions) {
                let filteredList = cond.list.filter(obj => obj.unit==this.addonForm.mm_unit);
                if(filteredList.length) {
                  elem.additional_qty = filteredList[0].additional_qty;
                  if(parseFloat(elem.value)>filteredList[0].mm_from && filteredList[0].mm_to>=parseFloat(elem.value)) {
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
        let noteIndex = this.notes_list.findIndex(obj => obj.value && obj.value!="");
        if(noteIndex!=-1) this.addonForm.notes_list = this.notes_list;
        this.addonForm.sid = this.cs.session_id;
        this.addonForm.submit = true;
        this.api.ADD_MODEL(this.addonForm).subscribe(result => {
          this.addonForm.submit = false;
          if(result.status) {
            this.customized_model = result.data.model_list[result.data.model_list.length-1];
            this.productDetails.added_to_cart=false;
            this.productDetails.buynow_alert = "";
            this.calcAddonPrice();
            modalName.hide();
            if(customDetailsModal) this.openCustomDetailsModal(customDetailsModal);
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
    this.cs.customView = false;
    this.cs.measurementView = false;
    this.cs.notesView = false;
    if(this.customized_model) {
      if(this.customized_model.custom_list.length) this.cs.customView = true;
      else if(this.customized_model.mm_sets.length) this.cs.measurementView = true;
      else if(this.customized_model.notes_list.length) this.cs.notesView = true;
    }
    customDetailsModal.show();
    this.cs.scrollModalTop(500);
  }

  onSelectModal(x, modalName) {
    this.customized_model = x;
    this.calcAddonPrice();
    this.productDetails.added_to_cart = false;
    this.productDetails.customization_alert = false;
    if(modalName) setTimeout(() => { this.openCustomDetailsModal(modalName); }, 500);
  }

  validateForm() {
    let form: any = this.document.getElementById('addon-form');
    for(let elem of form.elements) {
      if(elem.value === '' && elem.hasAttribute('required')) return elem.id;
    }
  }
  mmFocusOut(x) {
    if(x.value && x.value==0) {
      x.value=''; x.alert_msg = "Value must be greater than 0"; 
    }
    else if(this.selected_unit.max_value>0 && x.value>this.selected_unit.max_value) {
      x.value=''; x.alert_msg = "Value must be less than or equal to "+this.selected_unit.max_value;
    }
  }
  checkCustomSelection() {
    if(this.custom_list.length) {
      let checkedLen = this.custom_list[this.customIndex].filtered_option_list.filter(obj => obj.custom_option_checked).length;
      if(this.custom_list[this.customIndex].type=='mandatory') {
        if(this.custom_list[this.customIndex].limit==checkedLen) return null;
        else return "Must choose "+this.custom_list[this.customIndex].limit+" options";
      }
      else if(this.custom_list[this.customIndex].type=='limited') {
        if(this.custom_list[this.customIndex].limit >= checkedLen) return null;
        else return "Choose maximum "+this.custom_list[this.customIndex].limit+" options";
      }
      else return null;
    }
    else return null;
  }

  modifyWishList(type, product) {
    if(this.cs.customer_token) {
      this.showHeader();
      if(type=='add') this.wishService.addToWishList(product);
      else if(type=='remove') this.wishService.removeFromWishList(product._id);
    }
    else {
      this.cs.after_login_event = { type: 'add_product_to_wishlist', product: product, redirect: this.pageUrl };
      this.router.navigate(["/account"]);
    }
  }

  closeExistingAndOpenNewModal(existingModal, newModal) {
    existingModal.hide();
    setTimeout(() => { newModal.show(); this.cs.scrollModalTop(500); }, 500);
  }

  setProductFeatures() {
    // addons
    this.filterProductAddons();
    // size chart
    if(this.productDetails.chart_status && this.productDetails.chart_id) {
      let chartList = this.prodFeatures.size_chart;
      let chartIndex = chartList.findIndex(obj => obj._id==this.productDetails.chart_id);
      if(chartIndex!=-1) {
        this.productDetails.chart_details = chartList[chartIndex];
        this.productDetails.chart_keys = Object.keys(this.productDetails.chart_details.chart_list[0]);
      }
    }
    // faq
    if(this.productDetails.faq_status && this.productDetails.faq_list.length && this.prodFeatures.faq_list.length) {
      this.buildFAQList(this.productDetails.faq_list, this.prodFeatures.faq_list).then((resp: any) => {
        this.productDetails.faq_list = resp;
      });
    }
  }

  filterProductAddons() {
    if(this.productDetails.addon_status) {
      if(this.prodFeatures.addon_list) {
        let filteredAddons = this.prodFeatures.addon_list.filter(obj => this.productDetails.external_addon_list.findIndex(x => x.addon_id == obj._id) != -1 );
        if(this.productDetails.addon_must && !filteredAddons.length) this.productDetails.addon_must = false;
        this.buildAddonList(filteredAddons, this.prodFeatures.measurement_set).then((resp: any) => {
          this.productDetails.addon_list = resp;
          if(this.productDetails.stock_type=='lim') {
            this.productDetails.addon_list = resp.filter(obj => this.productDetails.stock >= obj.min_stock);
          }
          if(this.cs.ys_features.indexOf('sizing_assistant')!=-1 && this.prodFeatures.sizing_assistant.length) this.updateAddonWithSizingAssist(this.productDetails.addon_list);
        });
      }
    }
    else this.productDetails.addon_must = false;
  }

  updateAddonWithSizingAssist(addonList) {
    addonList.forEach(obj => {
      delete obj.sizing_assistant_id;
      if(!obj.custom_list.length && obj.updated_mm_list.length) {
        this.prodFeatures.sizing_assistant.forEach(element => {
          if(element.mm_list.length==obj.updated_mm_list.length) {
            if(this.findMatching(obj.updated_mm_list, element.mm_list)) {
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
      if(sizingMmList.findIndex(el => el.mmset_id==obj._id) == -1) matchingStatus = false;
    });
    return matchingStatus;
  }

  socialShare() {
    if(isPlatformBrowser(this.platformId)) {
      let windowNav: any = window.navigator;
      if(windowNav && windowNav.share) {
        windowNav.share({
          title: '', text: '',
          url: this.cs.origin+this.pageUrl
        })
        .catch( (error) => { console.log(error); });
      }
      else console.log("share not supported")
    }
  }

  swipeProduct(index) {
    this.router.navigate(['/product/'+this.swipe_product_list[index]]);
  }

  showHeader() {
    let el = this.document.getElementById("headroom-head");
    if(el) {
      this.renderer.removeClass(el, 'slideUp');
      this.renderer.addClass(el, 'slideDown');
    }
  }

  onViewModel(x) {
    setTimeout(() => { this.cs.onViewModel(x); }, 500);
  }

  sorting(field) {
    this.page = 1;
    if(field=='negative') this.reviews.sort((a, b) => 0 - (a.rating > b.rating ? -1 : 1));
    else this.reviews.sort((a, b) => 0 - (a[field] > b[field] ? 1 : -1));
  }

  // JSON LD
  createJsonLd() {
    this.productSchema.offers.availability = "https://schema.org/OutofStock";
    if(this.productDetails.stock>0) this.productSchema.offers.availability = "https://schema.org/InStock";
    this.productSchema.name = this.productDetails.name;
    this.productSchema.mpn = this.productDetails._id;
    if(this.productDetails.image_list.length) {
      this.productDetails.image_list.forEach(el => {
        if(el.image) this.productSchema.image.push(this.imgBaseUrl+el.image);
      });
    }
    let brandName = this.cs.store_details.name;
    if(this.productDetails.brand) brandName = this.productDetails.brand;
    this.productSchema.brand = { "@type": "Brand", name: brandName };
    this.productSchema.offers.seller = { "@type": "Organization", name: this.cs.store_details.name };
    this.productSchema.offers['priceCurrency'] = this.cs.store_details.currency;
    this.productSchema.description = this.stripHtml(this.productDetails.original_desc);
    this.productSchema.sku = this.productDetails.sku;
    this.productSchema.offers.url = this.cs.origin+this.pageUrl;
    this.productSchema.offers.price = this.productDetails.discounted_price;
    this.cs.createJsonLD("product-jsonld", this.productSchema);
  }
  stripHtml(html) {
    if(html) {
      let tmp = this.renderer.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent.slice(0, 320) || tmp.innerText.slice(0, 320) || "";
    }
    else return "";
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.wl_subscription.unsubscribe();
    this.storeSubscription.unsubscribe();
    this.cs.removeElement('product-jsonld');
    if(isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem("by_cat_d");
      sessionStorage.removeItem("by_spl");
    }
    if(this.cartCloseTimer) clearTimeout(this.cartCloseTimer);
  }

  playVideo() {
    this.productDetails.show_video = true;
    let plyrConfig = {
      captions: { active: true }, 
      controls:['play-large', 'mute', 'fullscreen'],
      autoplay: false 
    };
    if(!this.plyrLoaded) {
      this.assetLoader.load('plyr-js', 'plyr-css').then(() => {
        this.plyrLoaded = true;
        setTimeout(() => { new Plyr('#prodVideo', plyrConfig); }, 100);
      });
    }
    else {
      setTimeout(() => { new Plyr('#prodVideo', plyrConfig); }, 100);
    }
  }

}