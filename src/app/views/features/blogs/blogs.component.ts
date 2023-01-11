import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { StoreApiService } from '../../../services/store-api.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})

export class BlogsComponent implements OnInit {

  page: number; pageSize: number = 12;
  pageLoader: boolean; list: any = [];
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(private storeApi: StoreApiService, public commonService: CommonService) { }

  ngOnInit() {
    this.pageLoader = true;
    if(Object.entries(this.commonService.blog_page_attr).length > 0) {
      this.list = this.commonService.blog_page_attr.list;
      this.page = this.commonService.blog_page_attr.page;
      let scrollPos = this.commonService.blog_page_attr.scroll_y_pos;
      setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); this.pageLoader = false; }, 500);
      this.commonService.blog_page_attr.scroll_y_pos = 0;
      this.commonService.blog_page_attr.page = 1;
    }
    else{
      this.page = 1; this.pageLoader = true;
      this.storeApi.BLOG_LIST().subscribe(result => {
        if(result.status) this.list = result.list;
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
    // else if(this.commonService.ys_features.indexOf('blogs')!=-1) {
    //   console.log("fs")
    //   this.page = 1; this.pageLoader = true;
    //   this.storeApi.BLOG_LIST().subscribe(result => {
    //     if(result.status) this.list = result.list;
    //     else console.log("response", result);
    //     setTimeout(() => { this.pageLoader = false; }, 500);
    //   });
    // }
    // SEO
    if(this.commonService.blog_seo.status) this.commonService.setSiteMetaData(this.commonService.blog_seo, null);
    else this.commonService.getStoreSeoDetails();
  }

  onSelectBlog(x) {
    this.commonService.selected_blog = x;
    // set page attributes
    this.commonService.blog_page_attr = { list: this.list, page: this.page, scroll_y_pos: this.commonService.scroll_y_pos };
  }

}