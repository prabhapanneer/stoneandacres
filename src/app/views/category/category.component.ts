import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { environment } from './../../../environments/environment';
import { StoreApiService } from '../../services/store-api.service';
import { CommonService } from '../../services/common.service';
import { RedirectService } from '../../services/redirect.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})

export class CategoryComponent implements OnInit {

  tag_list: any = []; params: any = {};
  category_details: any = {};
  parent_list: any = []; list: any = [];
  pageLoader: boolean; tagSelected: boolean;
  imgBaseUrl: string = environment.img_baseurl;
  sort_value: string; current_url: string;
  template_setting: any = environment.template_setting;
  collapseIndex: number; showMore: boolean;
  sort_list: any = [
    { name: "Latest", value: "latest" },
    // { name: "Discounted", value: "discounted" },
    { name: "Price: Low to High", value: "price_asc" },
    { name: "Price: High to Low", value: "price_desc" }
  ];
  subscription: Subscription;
  gridType: string = "four";
  rangeMin: number; rangeMax: number;
  range_disp: any = { min: 0, max: 0 };
  randomProducts: any = []; page: number = 1;
  pageSize: number = this.template_setting.products_per_page;
  pageUrl: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, public router: Router, private activeRoute: ActivatedRoute,
    private storeApi: StoreApiService, public cc: CurrencyConversionService, public cs: CommonService, public rs: RedirectService
  ) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      this.findCurrency();
    });
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.pageUrl = this.router.url.split('?')[0];
      if(this.template_setting.price_range) this.gridType = "three";
      this.showMore = false; this.params = params; this.tag_list = [];
      if(this.pageUrl=='/recommended-products' || this.pageUrl=='/all-products' || this.pageUrl=='/new-arrivals' || this.pageUrl=='/on-sale'|| this.pageUrl=='/featured-products') {
        this.params = { category_id: this.pageUrl };
        if(this.cs.category_page_attr.category_id == this.pageUrl) {
          this.page = this.cs.category_page_attr.page;
          this.gridType = this.cs.category_page_attr.grid_type;
          this.sort_value = this.cs.category_page_attr.sort_value;
          this.collapseIndex = this.cs.category_page_attr.collapse_index;
          this.category_details = this.cs.category_page_attr.category_details;
          this.rangeMin = this.cs.category_page_attr.range_min;
          this.rangeMax = this.cs.category_page_attr.range_max;
          this.range_disp = this.cs.category_page_attr.range_disp;
          // seo
          this.updateMetaData();
          this.parent_list = this.cs.category_page_attr.parent_list;
          this.list = this.parent_list;
          this.findCurrency();
          // tag filter
          this.tag_list = this.cs.category_page_attr.tag_list;
          this.onTagFilter(false);
          let scrollPos = this.cs.category_page_attr.scroll_y_pos;
          setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
          this.cs.category_page_attr = {};
        }
        else {
          this.page = 1; this.sort_value = "latest";
          this.pageLoader = true; this.collapseIndex = 0;
          // seo
          this.updateMetaData();
          if(this.pageUrl=='/recommended-products') {
            this.category_details = { name: "Specially curated for you", route: this.pageUrl };
            if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("by_ais")) {
              let filterList = this.cs.decode(sessionStorage.getItem("by_ais"));
              this.storeApi.AI_STYLES_FILTER({styles: filterList}).subscribe(result => {
                setTimeout(() => { this.pageLoader = false; }, 500);
                if(result.status) this.filterProducts(result.list);
                else console.log("response", result);
              });
            }
            else this.pageLoader = false;
          }
          else {
            let categoryName = ""; let filterType = "";
            if(this.pageUrl == "/all-products") {
              categoryName = "All Products"; filterType = "all";
            }
            else if(this.pageUrl == "/new-arrivals") {
              categoryName = "New Arrivals"; filterType = "new_arrivals";
            }
            else if(this.pageUrl == "/on-sale") {
              categoryName = "On Sale"; filterType = "discount";
            }
            else if(this.pageUrl == "/featured-products") {
              categoryName = "Featured Products"; filterType = "featured";
            }
            this.category_details = { name: categoryName, route: this.pageUrl };
            this.storeApi.FILTERED_PRODUCT_LIST({ type: filterType }).subscribe(result => {
              setTimeout(() => { this.pageLoader = false; }, 500);
              if(result.status) this.filterProducts(result.list);
              else console.log("response", result);
            });
          }
        }
      }
      else if(this.params.category_id) {
        // product list
        if(this.cs.category_page_attr.category_id == this.params.category_id) {
          this.page = this.cs.category_page_attr.page;
          this.gridType = this.cs.category_page_attr.grid_type;
          this.sort_value = this.cs.category_page_attr.sort_value;
          this.collapseIndex = this.cs.category_page_attr.collapse_index;
          this.category_details = this.cs.category_page_attr.category_details;
          this.rangeMin = this.cs.category_page_attr.range_min;
          this.rangeMax = this.cs.category_page_attr.range_max;
          this.range_disp = this.cs.category_page_attr.range_disp;
          this.randomProducts = this.cs.category_page_attr.random_products;
          // seo
          this.updateMetaData();
          this.parent_list = this.cs.category_page_attr.parent_list;
          this.list = this.parent_list;
          this.findCurrency();
          // tag filter
          this.tag_list = this.cs.category_page_attr.tag_list;
          this.onTagFilter(false);
          let scrollPos = this.cs.category_page_attr.scroll_y_pos;
          setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
          this.cs.category_page_attr = {};
        }
        else {
          this.page = 1; this.sort_value = "latest";
          this.pageLoader = true; this.collapseIndex = 0;
          let sendData: any = { category_id: this.params.category_id };
          if(this.pageUrl.includes('/vendor/')) sendData = { vendor_id: this.params.category_id };
          this.storeApi.PRODUCT_LIST(sendData).subscribe(result => {
            setTimeout(() => { this.pageLoader = false; }, 500);
            if(result.status)
            {
              this.category_details = result.category_details;
              // seo
              this.updateMetaData();
              // filter products
              this.parent_list = [];
              result.list.forEach(object => {
                object.created_on = new Date(new Date(new Date(object.created_on).setHours(23,59,59,59)).setDate(new Date(object.created_on).getDate() + 30));
                if(object.badge_list?.length) object.badge_list = this.cs.buildTags(object.badge_list);
                if(object.hold_till) {
                  let balanceStock = object.stock;
                  if(new Date() < new Date(object.hold_till)) balanceStock = object.stock - object.hold_qty;
                  object.stock = balanceStock;
                }
                if(this.cs.store_details?.additional_features?.disp_all_products) {
                  if(object.stock < this.cs.min_qty[object.unit]) object.stock = 0;
                  this.parent_list.push(object);
                }
                else {
                  if(object.stock >= this.cs.min_qty[object.unit]) this.parent_list.push(object);
                }
              });
              this.list = this.parent_list;
              if(this.list.length > this.pageSize && this.category_details.prod_list_status) {
                this.randomProducts = this.getRandomProds(this.list, 15);
              }
              this.findCurrency();
              this.getProductTags();
            }
            else {
              console.log("response", result);
              this.router.navigate(["/"]);
            }
          });
        }
      }
    });
  }

  getProductTags() {
    if(isPlatformBrowser(this.platformId)) {
      if(this.cs.product_tags) {
        this.onCreateTagList(this.list, false);
      }
      else {
        this.storeApi.PRODUCT_TAGS().subscribe(result => {
          if(result.status) {
            this.cs.product_tags = JSON.parse(result.list);
            this.onCreateTagList(this.list, false);
          }
          else console.log("response", result);
        });
      }
    }
    this.findMinMax();
  }

  filterProducts(productList) {
    this.parent_list = [];
    productList.forEach(object => {
      object.created_on = new Date(new Date(new Date(object.created_on).setHours(23,59,59,59)).setDate(new Date(object.created_on).getDate() + 30));
      if(object.badge_list?.length) object.badge_list = this.cs.buildTags(object.badge_list);
      if(object.hold_till) {
        let balanceStock = object.stock;
        if(new Date() < new Date(object.hold_till)) balanceStock = object.stock - object.hold_qty;
        object.stock = balanceStock;
      }
      if(this.cs.store_details?.additional_features?.disp_all_products) {
        if(object.stock < this.cs.min_qty[object.unit]) object.stock = 0;
        this.parent_list.push(object);
      }
      else {
        if(object.stock >= this.cs.min_qty[object.unit]) this.parent_list.push(object);
      }
    });
    this.list = this.parent_list;
    this.findCurrency();
    this.getProductTags();
  }

  findCurrency() {
    for(let product of this.parent_list) {
      product.temp_selling_price = this.cc.CALC_TEXT(product.selling_price);
      product.temp_discounted_price = this.cc.CALC_TEXT(product.discounted_price);
    }
  }

  onSelectProduct(x) {
    this.cs.selected_product = x;
    // set page attributes
    this.cs.category_page_attr = {
      category_id: this.params.category_id, page: this.page, sort_value: this.sort_value, tag_list: this.tag_list,
      collapse_index: this.collapseIndex, scroll_y_pos: this.cs.scroll_y_pos, category_details: this.category_details,
      parent_list: this.parent_list, page_url: this.pageUrl, grid_type: this.gridType, random_products: this.randomProducts,
      range_min: this.rangeMin, range_max: this.rangeMax, range_disp: this.range_disp
    };
    if(isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem("by_cat_d", this.cs.encode(this.category_details));
      if(this.template_setting.product_swiper) {
        let swipeProList: any = [];
        this.list.forEach(obj => {
          if(obj.seo_status) swipeProList.push(obj.seo_details.page_url);
          else swipeProList.push(obj._id);
        });
        sessionStorage.setItem("by_spl", this.cs.encode(swipeProList));
      }
    }
  }

  onCreateTagList(list, click) {
    let duplicateTagList: any = this.tag_list;
    this.tag_list = [];
    list.forEach(prod => {
      if(prod.tag_status) {
        prod.tag_list.forEach(tagObj => {
          let tagId = Object.keys(tagObj)[0];
          let existingTagIndex = duplicateTagList.findIndex(x => x._id == tagId && x.option_list.findIndex(obj => obj.checked)!=-1);
          if(existingTagIndex!=-1) {
            let tagIndex = this.tag_list.findIndex(x => x._id == tagId);
            if(tagIndex == -1) this.tag_list.push(duplicateTagList[existingTagIndex]);
          }
          else {
            let tagIndex = this.tag_list.findIndex(x => x._id == tagId);
            if(tagIndex == -1) {
              let tIndex = this.cs.product_tags?.findIndex(element => element._id==tagId);
              if(tIndex!=-1) {
                let optionArray = [];
                tagObj[tagId].forEach(element => { optionArray.push({name: element}) });
                if(optionArray.length) this.tag_list.push({ _id: tagId, name: this.cs.product_tags[tIndex].name, rank: this.cs.product_tags[tIndex].rank, option_list: optionArray });
              }
            }
            else {
              tagObj[tagId].forEach(element => {
                let optionIndex = this.tag_list[tagIndex].option_list.findIndex(x => x.name == element);
                if(optionIndex == -1) {
                  this.tag_list[tagIndex].option_list.push({ name: element });
                }
              });
            }
          }
        });
      }
    });
    if(this.tag_list.length && !click) this.gridType = "three";
  }
  onTagFilter(changeEvent) {
    let parentProducts: any = this.parent_list;
    this.tagSelected = false;
    let dummyList = [];
    this.tag_list.forEach(tag => {
      let tagId = tag._id;
      if(dummyList.length) { parentProducts = dummyList; dummyList = []; }
      tag.option_list.forEach(tagOption => {
        if(tagOption.checked) {
          this.tagSelected = true;
          let optionName = tagOption.name;
          parentProducts.forEach(prod => {
            prod.tag_list.forEach(prodTag => {
              if(Object.keys(prodTag)[0] == tagId) {
                let tagIndex = prodTag[tagId].findIndex(x => x == optionName);
                if(tagIndex != -1) {
                  // push product
                  let index = dummyList.findIndex(x => x._id == prod._id);
                  if(index == -1) dummyList.push(prod);
                }
              }
            });
          });
        }
      });
    });
    if(this.tagSelected) {
      if(dummyList.length) parentProducts = dummyList;
      this.list = parentProducts;
    }
    else this.list = this.parent_list;
    if(changeEvent) this.page = 1;
    this.findMinMax();
  }
  clearTagFilter() {
    this.list = this.parent_list;
    this.tag_list.forEach(tag => {
      tag.option_list.forEach(tagOption => { delete tagOption.checked; });
    });
    this.tagSelected = false;
    this.onCreateTagList(this.list, false);
    this.findMinMax();
  }

  findMinMax() {
    let minPrice = this.list.reduce((min, p) => parseFloat(p?.temp_discounted_price)<min ? parseFloat(p?.temp_discounted_price) : min, parseFloat(this.list[0]?.temp_discounted_price));
    let maxPrice = this.list.reduce((max, p) => parseFloat(p?.temp_discounted_price)>max ? parseFloat(p?.temp_discounted_price) : max, parseFloat(this.list[0]?.temp_discounted_price));
    this.range_disp = { min: minPrice, max: maxPrice };
  }

  updateMetaData() {
    if(this.category_details.seo_status) this.cs.setSiteMetaData(this.category_details.seo_details, null);
    else this.cs.getStoreSeoDetails();
  }

  getRandomProds(arr, num) {
    let shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}