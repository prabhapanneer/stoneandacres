import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { StoreApiService } from '../../services/store-api.service';
import { CommonService } from '../../services/common.service';
import { SwiperService } from '../../services/swiper.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';
import { DynamicAssetLoaderService } from '../../services/dynamic-asset-loader.service';
declare const Swiper: any;
declare const $: any;
declare function startVideo(): any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {

  styleIndex: number = 0; maxWidth: number = 720;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting = environment.template_setting;
  blog_list: any = [];
  subscription: Subscription;
  

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private storeApi: StoreApiService, public swiperService: SwiperService, private assetLoader: DynamicAssetLoaderService,
    public commonService: CommonService, private router: Router, public cc: CurrencyConversionService, @Inject(DOCUMENT) private document, private sanitizer: DomSanitizer,
    private activeRoute: ActivatedRoute,
    ) {
    this.subscription = this.commonService.currency_type.subscribe(currency => {
      this.findCurrency();
    });
  }

  ngOnInit() {
    // this.setSliderHeight();
    this.activeRoute.queryParams.subscribe((params: Params) => {
      let paramsVal:any = JSON.stringify(params);
      localStorage.setItem("website_url", JSON.stringify(this.commonService.origin+this.router.url));
      
      if(params.gclid){
        localStorage.setItem("urltype", paramsVal)
      }
      else if(params.utm_source){
        localStorage.setItem("urltype", paramsVal);
      }
      else if(params.li_fat_id){
        localStorage.setItem("urltype", paramsVal);
      }
      else{
        localStorage.removeItem("urltype");
      }
    })
  }

  

  ngAfterContentInit() {
    // this.setSliderHeight();
    /* LAYOUT DETAILS */
    if(!this.commonService.layout_list.length) {
      this.storeApi.LAYOUT_LIST().subscribe(result => {
        if(result.status) {
          let layoutList = JSON.parse(result.list).sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          // blogs
          if(layoutList.findIndex(obj => obj.type=='blogs')!=-1 && this.commonService.ys_features.indexOf('blogs')!=-1) {
            this.storeApi.HOME_PAGE_BLOG_LIST(environment.template_setting.blog_count).subscribe(result => {
              if(result.status) this.blog_list = JSON.parse(result.list);
              this.updateLayoutList(layoutList);
              this.findCurrency();
              setTimeout(() => { this.initializeSwiper(); }, 100);
            });
          }
          else {
            this.updateLayoutList(layoutList);
            this.findCurrency();
            setTimeout(() => { this.initializeSwiper(); }, 100);
          }
          // shopping assistant
          if(layoutList.findIndex(obj => obj.type=='shopping_assistant')!=-1 && this.commonService.ys_features.indexOf('shopping_assistant')!=-1) {
            this.storeApi.AI_STYLES().subscribe(result => {
              if(result.status) this.commonService.ai_styles = JSON.parse(result.list);
            });
          }
        }
        else console.log("home response", result);
      });
    }
    else {
      this.findCurrency();
      setTimeout(() => { this.initializeSwiper(); }, 100);
    }
  }

  updateLayoutList(layoutList) {
    for(let segment of layoutList) {
      if(segment.sub_heading) segment.sub_heading = segment.sub_heading.replace(new RegExp('\n', 'g'), "<br />");
      if(segment.type=="slider" || segment.type=="primary_slider" || segment.type=="multiple_highlighted_section") {
        for(let obj of segment.image_list) {
          if(obj.content_status && obj.content_details) {
            if(obj.content_details.sub_heading) obj.content_details.sub_heading = obj.content_details.sub_heading.replace(new RegExp('\n', 'g'), "<br />");
            if(obj.content_details.description) obj.content_details.description = obj.content_details.description.replace(new RegExp('\n', 'g'), "<br />");
          }
        }
      }
      else if(segment.type=="section" && segment.section_grid_type=="grid_8" && this.commonService.screen_width>767) {
        let imgList = segment.image_list;
        segment.image_list = [];
        imgList.forEach((element, index) => {
          if(index===4) segment.image_list.push(imgList[5]);
          else if(index===5) segment.image_list.push(imgList[4]);
          else segment.image_list.push(element);
        });
      }
      else if(segment.type=="blogs" && this.blog_list.length) {
        if(segment.blogs_type=='grid') {
          if(segment.section_grid_type=='grid_1') segment.image_list = this.blog_list.slice(0, 2);
          else if(segment.section_grid_type=='grid_2') segment.image_list = this.blog_list.slice(0, 3);
          else if(segment.section_grid_type=='grid_3') segment.image_list = this.blog_list.slice(0, 4);
        }
        else segment.image_list = this.blog_list;
      }
      else if(segment.type=="shopping_assistant") {
        if(segment.shopping_assistant_config.sub_text)
          segment.shopping_assistant_config.sub_text = segment.shopping_assistant_config.sub_text.replace(new RegExp('\n', 'g'), "<br />");
      }
      else if(segment.type=="flexible") {
        segment.content = this.sanitizer.bypassSecurityTrustHtml(segment.content);
      }
    }
    this.commonService.layout_list = layoutList;
    if(this.template_setting.primary_slider) {
      let sliderIndex = this.commonService.layout_list.findIndex(obj => obj.type=='primary_slider');
      if(sliderIndex!=-1 && this.commonService.layout_list[sliderIndex].image_list.length && this.commonService.primary_main_slider.length) {
        this.commonService.layout_list[sliderIndex].image_list[0].desktop_img = this.commonService.primary_main_slider[0].desktop_img;
        this.commonService.layout_list[sliderIndex].image_list[0].mobile_img = this.commonService.primary_main_slider[0].mobile_img;
        this.commonService.primary_main_slider = this.commonService.layout_list[sliderIndex].image_list;
        this.commonService.layout_list.splice(sliderIndex, 1);
      }
    }
  }
  
  findCurrency() {
    for(let layout of this.commonService.layout_list) {
      if(layout.type=="featured_product") {
        for(let product of layout.product_list) {
          product.temp_selling_price = this.cc.CALC(product.selling_price);
          product.temp_discounted_price = this.cc.CALC(product.discounted_price);
        }
      }
      else if(layout.type=="multiple_featured_product") {
        for(let tab of layout.multitab_list) {
          for(let product of tab.product_list) {
            product.temp_selling_price = this.cc.CALC(product.selling_price);
            product.temp_discounted_price = this.cc.CALC(product.discounted_price);
          }
        }
      }
    }
  }

  initializeSwiper() {
    // this.setSliderHeight();
    if(isPlatformBrowser(this.platformId)) {
      // swiper
      if(this.commonService.primary_main_slider.length>1) {
        let swiperElem = '.primary_main_silder';
        if(this.commonService.desktop_device) swiperElem = '.desktop_primary_main_silder';
        new Swiper(swiperElem, {
          speed: 700,
          loop: true,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false
          },
          pagination: {
            el: '#primary_pagination',
            clickable: true
          },
          navigation: {
            nextEl: '#primary_next',
            prevEl: '#primary_prev'
          }
        });
        if(swiperElem.includes("desktop_")) {
          $(swiperElem).hover(function () {
            (this).swiper.autoplay.stop();
          }, function () {
            (this).swiper.autoplay.start();
          });
        }
      }
    }
  }

  // setSliderHeight() {
  //   // For set body margin-top and main-slider height
  //   let mastHeight = this.document.getElementById("headroom-head").offsetHeight;
  //   this.document.body.style.marginTop = mastHeight+'px';
  //   let slider_height = "calc(100vh - " + mastHeight + "px)";
  //   let classList = this.document.getElementsByClassName('dynamic-height');
  //   for(let i=0; i<classList.length; i++) {
  //     classList[i].style.height = slider_height;
  //   }
  // }

  /* AI Styling */
  openAiStyleModal(modalName) {
    this.styleIndex = 0;
    modalName.show();
    this.commonService.scrollModalTop(500);
    this.commonService.ai_styles[this.styleIndex].filtered_option_list = this.commonService.ai_styles[this.styleIndex].option_list;
    if(this.commonService.ai_styles[this.styleIndex].type=='either_or') {
      this.commonService.ai_styles[this.styleIndex].selected_option = this.commonService.ai_styles[this.styleIndex].filtered_option_list[0]._id;
      this.getRadioNextList(this.commonService.ai_styles[this.styleIndex].selected_option)
    }
    else {
      this.commonService.ai_styles[this.styleIndex].filtered_option_list.forEach(obj => {
        delete obj.aistyle_option_checked;
      });
    }
  }

  getRadioNextList(optionId) {
    let currentStyleDetails = this.commonService.ai_styles[this.styleIndex];
    // if next option list exist
    if(this.commonService.ai_styles[this.styleIndex+1])
    {
      let optionIndex = currentStyleDetails.option_list.findIndex(obj => obj._id==optionId);
      if(optionIndex!=-1) {
        let currentSelectedOption = currentStyleDetails.option_list[optionIndex];
        let filterList = this.commonService.ai_styles[this.styleIndex+1].option_list;
        this.commonService.ai_styles[this.styleIndex+1].filtered_option_list = filterList.filter(obj => obj.link_to=='all' || obj.link_to==currentSelectedOption.heading);
      }
    }
  }
  getCheckboxNextList() {
    // if next option list exist
    if(this.commonService.ai_styles[this.styleIndex+1])
    {
      let selectedItems = [];
      this.commonService.ai_styles[this.styleIndex].filtered_option_list.forEach(obj => {
        if(obj.aistyle_option_checked) selectedItems.push(obj.heading);
      });
      let filterList = this.commonService.ai_styles[this.styleIndex+1].option_list;
      this.commonService.ai_styles[this.styleIndex+1].filtered_option_list = filterList.filter(obj => obj.link_to=='all' || selectedItems.indexOf(obj.link_to)!=-1);
    }
  }
  onStyleNext() {
    this.styleIndex = this.styleIndex+1;
    this.commonService.scrollModalTop(0);
    if(this.commonService.ai_styles[this.styleIndex].type=='either_or') {
      if(this.commonService.ai_styles[this.styleIndex].selected_option) {
        if(this.commonService.ai_styles[this.styleIndex].filtered_option_list.findIndex(obj => obj._id==this.commonService.ai_styles[this.styleIndex].selected_option) == -1) {
          this.commonService.ai_styles[this.styleIndex].selected_option = this.commonService.ai_styles[this.styleIndex].filtered_option_list[0]._id;
        }
      }
      else {
        this.commonService.ai_styles[this.styleIndex].selected_option = this.commonService.ai_styles[this.styleIndex].filtered_option_list[0]._id;
      }
      this.getRadioNextList(this.commonService.ai_styles[this.styleIndex].selected_option);
    }
  }

  onStylingFilter() {
    this.processAiStyles(this.commonService.ai_styles).then((selectedData) => {
      if(Object.entries(selectedData).length) {
        if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("ai_styles", this.commonService.encryptData(selectedData));
        this.router.navigate(["/recommended-products"]);
      }
    });
  }
  processAiStyles(list) {
    return new Promise((resolve, reject) => {
      let sendData = {};
      for(let section of list) {
        let styleList = [];
        if(section.type=='either_or') styleList.push(section.selected_option);
        else if(section.filtered_option_list) {
          section.filtered_option_list.forEach(option => {
            if(option.aistyle_option_checked) styleList.push(option._id);
          });
        }
        if(styleList.length) sendData[section._id] = styleList;
      }
      resolve(sendData);
    });
  }
  /* ### AI Styling ### */

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}