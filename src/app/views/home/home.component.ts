import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { HomeService } from '../../services/home.service';
import { CommonService } from '../../services/common.service';
import { StartupService } from '../../services/startup.service';
import { RedirectService } from '../../services/redirect.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  styleIndex: number = 0;
  imgBaseUrl: string = environment.img_baseurl;
  ts = environment.template_setting; intracted: boolean;
  subscription: Subscription; storeSubscription: Subscription;

  @HostListener('window:scroll', ['$event'])
  onScrollEvent() {
    if(isPlatformBrowser(this.platformId)) {
      if(window.pageYOffset > 0) this.onInteract();
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private hApi: HomeService,
    private sanitizer: DomSanitizer, public cs: CommonService, private router: Router, private sus: StartupService,
    public cc: CurrencyConversionService, @Inject(DOCUMENT) private document, public rs: RedirectService
  ) {
    this.onScrollEvent();
    this.subscription = this.cs.currency_type.subscribe(() => {
      this.findCurrency();
    });
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.loadHomeContent();
    });
    // primary slider
    if(this.ts.primary_slider && !this.cs.primary_main_slider.length) {
      this.cs.primary_main_slider = [{
        "desktop_img": "uploads/"+this.cs.store_id+"/layouts/desktop_primary_slider.webp?v="+this.sus.randomNum,
        "mobile_img": "uploads/"+this.cs.store_id+"/layouts/mobile_primary_slider.webp?v="+this.sus.randomNum
      }];
    }
    // primary highlights
    if(this.ts.highlights && !this.cs.primary_highlights.length) {
      for(let i=0; i<this.ts.highlights; i++) {
        this.cs.primary_highlights.push({ desktop_img: "uploads/yourstore/placeholder.jpg" });
      }
    }
  }

  ngOnInit(): void {
    this.createJsonLd();
    this.setSliderHeight();
    if(this.cs.storeDataLoaded) this.loadHomeContent();
  }

  loadHomeContent() {
    this.setSliderHeight();
    /* LAYOUT DETAILS */
    if(!this.cs.layout_list.length) {
      this.hApi.LAYOUT_LIST().subscribe(result => {
        if(result.status) {
          let layoutList = JSON.parse(result.list).sort((a, b) => 0 - (a.rank > b.rank ? -1 : 1));
          this.updateLayoutList(layoutList);
          this.findCurrency();
        }
        else console.log("home response", result);
      });
    }
    else this.findCurrency();
  }

  updateLayoutList(layoutList) {
    for(let segment of layoutList) {
      segment.image_list.forEach(el => {
        if(el.link_status && el.link_type=='category') {
          let cInd = this.rs.catalog_list.findIndex(c => c._id==el.category_id);
          if(cInd!=-1) {
            el.link_type = 'internal';
            el.link = '/category/'+this.rs.catalog_list[cInd]._id;
            if(this.rs.catalog_list[cInd].seo_status) el.link = '/category/'+this.rs.catalog_list[cInd].seo_details?.page_url;
          }
        }
      });
      if(segment.sub_heading) segment.sub_heading = segment.sub_heading.replace(new RegExp('\n', 'g'), "<br />");
      if(segment.type=="slider" || segment.type=="primary_slider" || segment.type=="multiple_highlighted_section") {
        for(let obj of segment.image_list) {
          if(obj.content_status && obj.content_details) {
            if(obj.content_details.sub_heading) obj.content_details.sub_heading = obj.content_details.sub_heading.replace(new RegExp('\n', 'g'), "<br />");
            if(obj.content_details.description) obj.content_details.description = obj.content_details.description.replace(new RegExp('\n', 'g'), "<br />");
          }
          if(obj.position && !obj.mob_position) obj.mob_position = obj.position;
        }
      }
      else if(segment.type=="section" && segment.section_grid_type=="grid_8" && this.cs.screen_width>767) {
        let imgList = segment.image_list;
        segment.image_list = [];
        imgList.forEach((element, index) => {
          if(index===4) segment.image_list.push(imgList[5]);
          else if(index===5) segment.image_list.push(imgList[4]);
          else segment.image_list.push(element);
        });
      }
      else if(segment.type=="featured_product") {
        segment.product_list.forEach(obj => {
          obj.created_on = new Date(new Date(new Date(obj.created_on).setHours(23,59,59,59)).setDate(new Date(obj.created_on).getDate() + 30));
          if(obj.badge_list?.length) obj.badge_list = this.cs.buildTags(obj.badge_list);
          if(obj.hold_till) {
            let balanceStock = obj.stock;
            if(new Date() < new Date(obj.hold_till)) balanceStock = obj.stock - obj.hold_qty;
            obj.stock = balanceStock;
          }
        });
      }
      else if(segment.type=="multiple_featured_product") {
        for(let tab of segment.multitab_list) {
          tab.product_list.forEach(obj => {
            obj.created_on = new Date(new Date(new Date(obj.created_on).setHours(23,59,59,59)).setDate(new Date(obj.created_on).getDate() + 30));
            if(obj.badge_list?.length) obj.badge_list = this.cs.buildTags(obj.badge_list);
            if(obj.hold_till) {
              let balanceStock = obj.stock;
              if(new Date() < new Date(obj.hold_till)) balanceStock = obj.stock - obj.hold_qty;
              obj.stock = balanceStock;
            }
          });
        }
      }
      else if(segment.type=="shopping_assistant") {
        if(segment.shopping_assistant_config.sub_text)
          segment.shopping_assistant_config.sub_text = segment.shopping_assistant_config.sub_text.replace(new RegExp('\n', 'g'), "<br />");
      }
      else if(segment.type=="flexible") {
        segment.content = this.sanitizer.bypassSecurityTrustHtml(segment.content);
      }
    }
    this.cs.layout_list = layoutList;
    // primary slider
    if(this.ts.primary_slider) {
      let sliderIndex = this.cs.layout_list.findIndex(obj => obj.type=='primary_slider');
      if(sliderIndex!=-1) {
        let primaryImgList = this.cs.layout_list[sliderIndex].image_list;
        if(primaryImgList.length) {
          primaryImgList[0].desktop_img = this.cs.primary_main_slider[0].desktop_img;
          primaryImgList[0].mobile_img = this.cs.primary_main_slider[0].mobile_img;
          this.cs.primary_main_slider = primaryImgList;
        }
        this.cs.layout_list.splice(sliderIndex, 1);
      }
    }
    // primary highlights
    let phIndex = this.cs.layout_list.findIndex(obj => obj.type=='highlights');
    if(phIndex!=-1) {
      this.cs.primary_highlights = this.cs.layout_list[phIndex].image_list;
      this.cs.layout_list.splice(phIndex, 1);
    }
  }

  onInteract() {
    if(this.cs.layout_list?.length && !this.intracted) {
      this.intracted = true;
      let layoutList = this.cs.layout_list;
      // Blogs
      let blogIndex = layoutList.findIndex(obj => obj.type=='blogs');
      if(blogIndex!=-1 && this.cs.ys_features.indexOf('blogs')!=-1) {
        let blogData = layoutList[blogIndex];
        this.hApi.HOME_PAGE_BLOG_LIST(this.ts.blog_count).subscribe(result => {
          if(result.status) {
            let blogList = JSON.parse(result.list);
            if(blogList.length) {
              blogData.image_list = blogList;
              if(blogData.blogs_type=='grid') {
                let bCount = 0;
                if(blogData.section_grid_type=='grid_1') bCount = 2;
                else if(blogData.section_grid_type=='grid_2') bCount = 3;
                else if(blogData.section_grid_type=='grid_3') bCount = 4;
                blogData.image_list = blogList.slice(0, bCount);
              }
            }
          }
          else console.log("blog response", result);
        });
      }
      // Instagram
      let instaIndex = layoutList.findIndex(obj => obj.type=='instagram');
      if(instaIndex!=-1 && layoutList[instaIndex].insta_config?.token) {
        let instaData = layoutList[instaIndex];
        this.hApi.INSTAGRAM(layoutList[instaIndex].insta_config.token).subscribe((result) => {
          if(result.data) {
            let InstaPosts = result.data.filter(el => el.media_type!="VIDEO");
            if(InstaPosts.length) {
              instaData.image_list = InstaPosts.slice(0, 10);
              if(instaData.blogs_type=='grid') {
                let iCount = 0;
                if(instaData.section_grid_type=='grid_1') iCount = 3;
                else if(instaData.section_grid_type=='grid_2') iCount = 6;
                else if(instaData.section_grid_type=='grid_3') iCount = 9;
                else if(instaData.section_grid_type=='grid_4') iCount = 4;
                else if(instaData.section_grid_type=='grid_5') iCount = 8;
                instaData.image_list = InstaPosts.slice(0, iCount);
              }
            }
          }
          else console.log("insta response", result);
        });
      }
      // shopping assistant
      if(layoutList.findIndex(obj => obj.type=='shopping_assistant')!=-1 && this.cs.ys_features.indexOf('shopping_assistant')!=-1) {
        this.hApi.AI_STYLES().subscribe(result => {
          if(result.status) this.cs.ai_styles = JSON.parse(result.list);
        });
      }
    }
  }

  exploreAll(segment) {
    if(segment.type=="featured_product") {
      if(segment.featured_category_id=="all_products") this.router.navigate(['/all-products']);
      else if(segment.featured_category_id=="new_arrivals") this.router.navigate(['/new-arrivals']);
      else if(segment.featured_category_id=="on_sale") this.router.navigate(['/on-sale']);
      else if(segment.featured_category_id=="featured_products") this.router.navigate(['/featured-products']);
      else this.getCatalogInfo(segment.featured_category_id);
    }
    // multi-tab
    else if(segment.type=="featured") this.router.navigate(['/featured-products']);
    else if(segment.type=="new_arrivals") this.router.navigate(['/new-arrivals']);
    else if(segment.type=="discounted") this.router.navigate(['/on-sale']);
    else if(segment.type=="category") this.getCatalogInfo(segment.category_id);
  }
  getCatalogInfo(catId) {
    let cInd = this.rs.catalog_list.findIndex(obj => obj._id==catId);
    if(cInd != -1) {
      let catDetails = this.rs.catalog_list[cInd];
      let routeLink = '/category/'+catDetails._id;
      if(catDetails.seo_status) routeLink = '/category/'+catDetails.seo_details.page_url;
      this.router.navigate([routeLink]);
    }
  }
  
  findCurrency() {
    for(let layout of this.cs.layout_list) {
      if(layout.type=="featured_product") {
        for(let product of layout.product_list) {
          product.temp_selling_price = this.cc.CALC_TEXT(product.selling_price);
          product.temp_discounted_price = this.cc.CALC_TEXT(product.discounted_price);
        }
      }
      else if(layout.type=="multiple_featured_product") {
        for(let tab of layout.multitab_list) {
          for(let product of tab.product_list) {
            product.temp_selling_price = this.cc.CALC_TEXT(product.selling_price);
            product.temp_discounted_price = this.cc.CALC_TEXT(product.discounted_price);
          }
        }
      }
    }
  }

  setSliderHeight() {
    // For set body margin-top and main-slider height
    if(this.ts.primary_slider=='fs_slider') {
      let mastHeight = this.document.getElementById("headroom-head").offsetHeight;
      this.document.body.style.marginTop = mastHeight+'px';
      let slider_height = "calc(100vh - " + mastHeight + "px)";
      let classList = this.document.getElementsByClassName('dynamic-height');
      for(let i=0; i<classList.length; i++) {
        classList[i].style.height = slider_height;
      }
    }
  }

  /* AI Styling */
  openAiStyleModal(modalName) {
    this.styleIndex = 0;
    modalName.show();
    this.cs.scrollModalTop(500);
    this.cs.ai_styles[this.styleIndex].filtered_option_list = this.cs.ai_styles[this.styleIndex].option_list;
    if(this.cs.ai_styles[this.styleIndex].type=='either_or') {
      this.cs.ai_styles[this.styleIndex].selected_option = this.cs.ai_styles[this.styleIndex].filtered_option_list[0]._id;
      this.getRadioNextList(this.cs.ai_styles[this.styleIndex].selected_option)
    }
    else {
      this.cs.ai_styles[this.styleIndex].filtered_option_list.forEach(obj => {
        delete obj.aistyle_option_checked;
      });
    }
  }

  getRadioNextList(optionId) {
    let currentStyleDetails = this.cs.ai_styles[this.styleIndex];
    // if next option list exist
    if(this.cs.ai_styles[this.styleIndex+1])
    {
      let optionIndex = currentStyleDetails.option_list.findIndex(obj => obj._id==optionId);
      if(optionIndex!=-1) {
        let currentSelectedOption = currentStyleDetails.option_list[optionIndex];
        let filterList = this.cs.ai_styles[this.styleIndex+1].option_list;
        this.cs.ai_styles[this.styleIndex+1].filtered_option_list = filterList.filter(obj => obj.link_to=='all' || obj.link_to==currentSelectedOption.heading);
      }
    }
  }
  getCheckboxNextList() {
    // if next option list exist
    if(this.cs.ai_styles[this.styleIndex+1])
    {
      let selectedItems = [];
      this.cs.ai_styles[this.styleIndex].filtered_option_list.forEach(obj => {
        if(obj.aistyle_option_checked) selectedItems.push(obj.heading);
      });
      let filterList = this.cs.ai_styles[this.styleIndex+1].option_list;
      this.cs.ai_styles[this.styleIndex+1].filtered_option_list = filterList.filter(obj => obj.link_to=='all' || selectedItems.indexOf(obj.link_to)!=-1);
    }
  }
  onStyleNext() {
    this.styleIndex = this.styleIndex+1;
    this.cs.scrollModalTop(0);
    if(this.cs.ai_styles[this.styleIndex].type=='either_or') {
      if(this.cs.ai_styles[this.styleIndex].selected_option) {
        if(this.cs.ai_styles[this.styleIndex].filtered_option_list.findIndex(obj => obj._id==this.cs.ai_styles[this.styleIndex].selected_option) == -1) {
          this.cs.ai_styles[this.styleIndex].selected_option = this.cs.ai_styles[this.styleIndex].filtered_option_list[0]._id;
        }
      }
      else {
        this.cs.ai_styles[this.styleIndex].selected_option = this.cs.ai_styles[this.styleIndex].filtered_option_list[0]._id;
      }
      this.getRadioNextList(this.cs.ai_styles[this.styleIndex].selected_option);
    }
  }

  onStylingFilter() {
    this.processAiStyles(this.cs.ai_styles).then((selectedData) => {
      if(Object.entries(selectedData).length) {
        if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("by_ais", this.cs.encode(selectedData));
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

  createJsonLd() {
    let homeSchema: any = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": this.cs.store_details?.name,
      "url": this.cs.origin,
      "logo": environment.img_baseurl+"uploads/"+this.cs.store_id+"/logo.png",
      "sameAs": []
    };
    if(this.cs.store_details.cust_cn) {
      homeSchema['contactPoint'] = {
        "@type": "ContactPoint",
        "telephone": this.cs.store_details.cust_cn,
        "contactType": "Customer Service",
        "availableLanguage": "en"
      };
    }
    if(this.cs.footer_config?.social_media_links?.length) {
      this.cs.footer_config?.social_media_links.forEach(el => {
        if(el.type!='whatsapp') homeSchema['sameAs'].push(el.url);
      });
    }
    this.cs.createJsonLD("home-jsonld", homeSchema);
  }

  prodNavigate(x) {
    let catDetails = null;
    if(x.type=="featured_product") {
      if(x.featured_category_id=="all_products") catDetails = { name: 'All Products', route: '/all-products' };
      else if(x.featured_category_id=="new_arrivals") catDetails = { name: 'New Arrivals', route: '/new-arrivals' };
      else if(x.featured_category_id=="on_sale") catDetails = { name: 'On Sale', route: '/on-sale' };
      else if(x.featured_category_id=="featured_products") catDetails = { name: 'Featured Products', route: '/featured-products' };
      else {
        let cInd = this.rs.catalog_list.findIndex(el => el._id==x.featured_category_id);
        if(cInd!=-1) {
          let catInfo = this.rs.catalog_list[cInd];
          catDetails = { name: catInfo.name, seo_status: catInfo.seo_status, seo_details: catInfo.seo_details };
        }
      }
    }
    // multi-tab
    else if(x.type=='featured') catDetails = { name: 'Featured Products', route: '/featured-products' };
    else if(x.type=='new_arrivals') catDetails = { name: 'New Arrivals', route: '/new-arrivals' };
    else if(x.type=='discounted') catDetails = { name: 'On Sale', route: '/on-sale' };
    else if(x.type=='category') {
      let cInd = this.rs.catalog_list.findIndex(el => el._id==x.category_id);
      if(cInd!=-1) {
        let catInfo = this.rs.catalog_list[cInd];
        catDetails = { name: catInfo.name, seo_status: catInfo.seo_status, seo_details: catInfo.seo_details };
      }
    }
    if(catDetails && isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem("by_cat_d", this.cs.encode(catDetails));
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.storeSubscription.unsubscribe();
    this.cs.removeElement('home-jsonld');
  }

}