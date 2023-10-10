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
  brochureForm: any = {};
  projectForm: any = {};
  
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
      this.category_details = {}; this.related_products = []; this.page = 1; this.review_sort = 'rating';
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
            this.productDetails.location_url_new = this.sanitizer.bypassSecurityTrustResourceUrl(this.productDetails.location_url);
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

  onSubmitBrochure() {

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
          pdFeatures.amenities_list = pdFeatures.amenities.sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          pdFeatures.highlights = pdFeatures.nearby.filter(obj => obj.status == 'active');
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

  findCurrency() {
    this.productDetails.temp_selling_price = this.cc.CALC(this.productDetails.selling_price);
    this.productDetails.temp_discounted_price = this.cc.CALC(this.productDetails.discounted_price);
    this.productDetails.temp_addon_price = this.cc.CALC(this.productDetails.addon_price);
    this.tempMinCheckoutValue = this.cc.CALC_WO_AC(this.cs.application_setting.min_checkout_value);
    for(let product of this.related_products) {
      product.temp_selling_price = this.cc.CALC_TEXT(product.selling_price);
      product.temp_discounted_price = this.cc.CALC_TEXT(product.discounted_price);
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

  setProductFeatures() {
    // addons
    this.filterProductAddons();
    // amenities
    this.productDetails.updated_amenities_list = [];
    if(this.productDetails.amenity_list?.length && this.cs.product_features.amenities_list?.length) {
      this.productDetails.amenity_list.forEach(element => {
        let amenIndex = this.cs.product_features.amenities_list.findIndex(x => x._id == element)
        if (amenIndex != -1) {
          this.productDetails.updated_amenities_list.push(this.cs.product_features.amenities_list[amenIndex]);
        }
      });
    }
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
    // highlights
    if(this.productDetails.highlights?.length && this.cs.product_features.highlights?.length) {
      this.productDetails.highlights.forEach(el => {
        let hlKey = Object.keys(el)[0];
        let hInd = this.cs.product_features.highlights.findIndex(hl => hl._id==hlKey);
        if(hInd!=-1) {
          el.name = this.cs.product_features.highlights[hInd].name;
          el.image = this.cs.product_features.highlights[hInd].image;
          el.rank = this.cs.product_features.highlights[hInd].rank;
          el.value = el[hlKey];
        }
      });
      this.productDetails.highlights = this.productDetails.highlights.filter(el => el.name).sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
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
        });
      }
    }
    else this.productDetails.addon_must = false;
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