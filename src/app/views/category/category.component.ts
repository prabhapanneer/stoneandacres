import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { environment } from './../../../environments/environment';
import { StoreApiService } from '../../services/store-api.service';
import { CommonService } from '../../services/common.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})

export class CategoryComponent implements OnInit {

  page: number = 1; pageSize: number;
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
    { name: "Price: Low to High", value: "price_asc" },
    { name: "Price: High to Low", value: "price_desc" }
  ];
  subscription: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private activeRoute: ActivatedRoute,
    private storeApi: StoreApiService, public cc: CurrencyConversionService, public commonService: CommonService
  ) {
    this.subscription = this.commonService.currency_type.subscribe(currency => {
      this.findCurrency();
    });
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      this.showMore = false;
      this.pageSize = this.template_setting.products_per_page; this.params = params; this.tag_list = [];
      if(this.router.url=='/recommended-products' || this.router.url=='/all-products' || this.router.url=='/new-arrivals' || this.router.url=='/on-sale'|| this.router.url=='/featured-products') {
        this.params = { category_id: this.router.url };
        if(this.commonService.category_page_attr.category_id == this.router.url) {
          this.page = this.commonService.category_page_attr.page;
          this.sort_value = this.commonService.category_page_attr.sort_value;
          this.collapseIndex = this.commonService.category_page_attr.collapse_index;
          this.category_details = this.commonService.category_page_attr.category_details;
          // seo
          this.updateMetaData();
          this.parent_list = this.commonService.category_page_attr.parent_list;
          this.list = this.parent_list;
          this.findCurrency();
          // tag filter
          this.tag_list = this.commonService.category_page_attr.tag_list;
          this.onTagFilter(false);
          let scrollPos = this.commonService.category_page_attr.scroll_y_pos;
          setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
          this.commonService.category_page_attr = {};
        }
        else {
          this.page = 1; this.sort_value = "latest";
          this.pageLoader = true; this.collapseIndex = 0;
          // seo
          this.updateMetaData();
          if(this.router.url=='/recommended-products') {
            this.category_details = { name: "Specially curated for you", route: this.router.url };
            if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("ai_styles")) {
              let filterList = this.commonService.decryptData(sessionStorage.getItem("ai_styles"));
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
            if(this.router.url == "/all-products") {
              categoryName = "All Products"; filterType = "all";
            }
            else if(this.router.url == "/new-arrivals") {
              categoryName = "New Arrivals"; filterType = "new_arrivals";
            }
            else if(this.router.url == "/on-sale") {
              categoryName = "On Sale"; filterType = "discount";
            }
            else if(this.router.url == "/featured-products") {
              categoryName = "Featured Products"; filterType = "featured";
            }
            this.category_details = { name: categoryName, route: this.router.url };
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
        if(this.commonService.category_page_attr.category_id == this.params.category_id) {
          this.page = this.commonService.category_page_attr.page;
          this.sort_value = this.commonService.category_page_attr.sort_value;
          this.collapseIndex = this.commonService.category_page_attr.collapse_index;
          this.category_details = this.commonService.category_page_attr.category_details;
          // seo
          this.updateMetaData();
          this.parent_list = this.commonService.category_page_attr.parent_list;
          this.list = this.parent_list;
          this.findCurrency();
          // tag filter
          this.tag_list = this.commonService.category_page_attr.tag_list;
          this.onTagFilter(false);
          let scrollPos = this.commonService.category_page_attr.scroll_y_pos;
          setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
          this.commonService.category_page_attr = {};
        }
        else {
          this.page = 1; this.sort_value = "latest";
          this.pageLoader = true; this.collapseIndex = 0;
          this.storeApi.PRODUCT_LIST({ category_id: this.params.category_id }).subscribe(result => {
            setTimeout(() => { this.pageLoader = false; }, 500);
            if(result.status)
            {
              this.category_details = result.category_details;
              // seo
              this.updateMetaData();
              // filter products
              this.parent_list = [];
              result.list.forEach(object => {
                if(object.hold_till) {
                  let balanceStock = object.stock;
                  if(new Date() < new Date(object.hold_till)) balanceStock = object.stock - object.hold_qty;
                  if(balanceStock >= this.commonService.min_qty[object.unit]) this.parent_list.push(object);
                }
                else if(object.stock >= this.commonService.min_qty[object.unit]) this.parent_list.push(object);
              });
              this.list = this.parent_list; this.sorting(this.sort_value);
              this.findCurrency();
              // PRODUCT FEATURES
              if(!Object.entries(this.commonService.product_features).length) {
                this.storeApi.PRODUCT_FEATURES().subscribe(result => {
                  if(result.status) {
                    let productFeatures = JSON.parse(result.data);
                    this.commonService.product_features = {
                      addon_list: productFeatures.addon_list.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
                      measurement_set: productFeatures.measurement_set.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
                      tag_list: productFeatures.tag_list.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
                      tax_rates: productFeatures.tax_rates.filter(obj => obj.status == 'active'),
                      size_chart: productFeatures.size_chart.filter(obj => obj.status == 'active'),
                      faq_list: productFeatures.faq_list.filter(obj => obj.status == 'active'),
                      highlights: productFeatures.nearby.filter(obj => obj.status == 'active'),
                      sizing_assistant: productFeatures.sizing_assistant.filter(obj => obj.status == 'active'),
                      taxonomy: productFeatures.taxonomy.filter(obj => obj.status == 'active'),
                      color_list: productFeatures.color_list
                    };
                    this.onCreateTagList(this.list);
                  }
                  else console.log("response", result);
                });
              }
              else this.onCreateTagList(this.list);
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

  filterProducts(productList) {
    this.parent_list = [];
    productList.forEach(object => {
      if(object.hold_till) {
        let balanceStock = object.stock;
        if(new Date() < new Date(object.hold_till)) balanceStock = object.stock - object.hold_qty;
        if(balanceStock >= this.commonService.min_qty[object.unit]) this.parent_list.push(object);
      }
      else if(object.stock >= this.commonService.min_qty[object.unit]) this.parent_list.push(object);
    });
    this.list = this.parent_list; this.sorting(this.sort_value);
    this.findCurrency();
    // PRODUCT FEATURES
    if(!Object.entries(this.commonService.product_features).length) {
      this.storeApi.PRODUCT_FEATURES().subscribe(result => {
        if(result.status) {
          let productFeatures = JSON.parse(result.data);
          this.commonService.product_features = {
            addon_list: productFeatures.addon_list.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
            measurement_set: productFeatures.measurement_set.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
            tag_list: productFeatures.tag_list.filter(obj => obj.status == 'active').sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1)),
            tax_rates: productFeatures.tax_rates.filter(obj => obj.status == 'active'),
            size_chart: productFeatures.size_chart.filter(obj => obj.status == 'active'),
            faq_list: productFeatures.faq_list.filter(obj => obj.status == 'active'),
            highlights: productFeatures.nearby.filter(obj => obj.status == 'active'),
            sizing_assistant: productFeatures.sizing_assistant.filter(obj => obj.status == 'active'),
            taxonomy: productFeatures.taxonomy.filter(obj => obj.status == 'active'),
            color_list: productFeatures.color_list
          };
          this.onCreateTagList(this.list);
        }
        else console.log("response", result);
      });
    }
    else this.onCreateTagList(this.list);
  }

  findCurrency() {
    for(let product of this.parent_list) {
      product.temp_selling_price = this.cc.CALC(product.selling_price);
      product.temp_discounted_price = this.cc.CALC(product.discounted_price);
    }
  }

  onSelectProduct(x) {
    this.commonService.selected_product = x;
    // set page attributes
    this.commonService.category_page_attr = {
      category_id: this.params.category_id, page: this.page, sort_value: this.sort_value, tag_list: this.tag_list, collapse_index: this.collapseIndex,
      scroll_y_pos: this.commonService.scroll_y_pos, category_details: this.category_details, parent_list: this.parent_list, page_url: this.router.url
    }
    if(isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem("category_details", this.commonService.encryptData(this.category_details));
      if(this.template_setting.product_swiper) {
        let swipeProList: any = [];
        this.list.forEach(obj => {
          if(obj.seo_status) swipeProList.push(obj.seo_details.page_url);
          else swipeProList.push(obj._id);
        });
        sessionStorage.setItem("swipe_product_list", this.commonService.encryptData(swipeProList));
      }
    }
  }

  onCreateTagList(list) {
    let duplicateTagList: any = this.tag_list;
    this.tag_list = [];
    let storeTags = this.commonService.product_features.tag_list;
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
              let filterTagList = storeTags.filter(element => element._id==tagId);
              if(filterTagList.length) {
                let optionArray = [];
                tagObj[tagId].forEach(element => { optionArray.push({name: element}) });
                if(optionArray.length) this.tag_list.push({ _id: tagId, name: filterTagList[0].name, rank: filterTagList[0].rank, option_list: optionArray });
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
    if(this.sort_value) this.sorting(this.sort_value);
    if(changeEvent) this.page = 1;
  }
  clearTagFilter() {
    this.list = this.parent_list;
    this.tag_list.forEach(tag => {
      tag.option_list.forEach(tagOption => { delete tagOption.checked; });
    });
    this.tagSelected = false;
    this.onCreateTagList(this.list);
  }

  sorting(field) {
    if(field=='latest') this.list.sort((a, b) => 0 - (a.rank > b.rank ? 1 : -1));
    else if(field=='price_desc') this.list.sort((a, b) => 0 - (a.discounted_price > b.discounted_price ? 1 : -1));
    else if(field=='price_asc') this.list.sort((a, b) => 0 - (a.discounted_price > b.discounted_price ? -1 : 1));
  }

  updateMetaData() {
    if(this.category_details.seo_status) this.commonService.setSiteMetaData(this.category_details.seo_details, null);
    else this.commonService.getStoreSeoDetails();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}