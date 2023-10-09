import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FeaturesService } from '../../../services/features.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})

export class RecipesComponent implements OnInit {

  page: number = 1; pageSize: number = 12;
  pageLoader: boolean; list: any = [];
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  seo_details: any = {}; storeSubscription: Subscription;
  totalPages: number = 0; tempList: any = [];

  constructor(private fApi: FeaturesService, public cs: CommonService) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getDataList();
    });
  }

  ngOnInit(): void {
    this.pageLoader = true;
    if(this.cs.storeDataLoaded) this.getDataList();
  }

  getDataList(): void {
    this.pageLoader = false;
    if(this.cs.recipe_page_attr && Object.entries(this.cs.recipe_page_attr).length) {
      this.list = this.cs.recipe_page_attr.list;
      this.page = this.cs.recipe_page_attr.page;
      this.tempList = this.cs.recipe_page_attr.temp_list;
      this.totalPages = this.cs.recipe_page_attr.total_pages;
      let scrollPos = this.cs.recipe_page_attr.scroll_y_pos;
      setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
      // SEO
      this.seo_details = this.cs.recipe_page_attr.seo_details;
      if(this.seo_details.status) this.cs.setSiteMetaData(this.seo_details, null);
      else this.cs.getStoreSeoDetails();
      delete this.cs.recipe_page_attr;
    }
    else if(this.cs.ys_features.indexOf('blogs')!=-1) this.callApi();
  }

  callApi() {
    this.pageLoader = true; this.tempList = [];
    let skip = (this.page-1)*this.pageSize;
    this.fApi.RECIPE_LIST(skip, this.pageSize).subscribe(result => {
      if(result.status) {
        this.list = result.list;
        this.totalPages = Math.ceil(result.count/this.pageSize);
        for(let i=0; i<result.count; i++) {
          this.tempList.push("");
        }
        // SEO
        this.seo_details = result.seo_details;
        if(this.seo_details.status) this.cs.setSiteMetaData(this.seo_details, null);
        else this.cs.getStoreSeoDetails();
      }
      else console.log("response", result);
      setTimeout(() => { this.pageLoader = false; }, 500);
    });
  }

  onSelectRecipe() {
    // set page attributes
    this.cs.recipe_page_attr = {
      list: this.list, seo_details: this.seo_details, page: this.page, total_pages: this.totalPages,
      scroll_y_pos: this.cs.scroll_y_pos, temp_list: this.tempList
    };
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}