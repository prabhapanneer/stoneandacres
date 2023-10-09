import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { FeaturesService } from '../../../../services/features.service';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})

export class RecipeDetailsComponent implements OnInit {

  recipe_details: any = {};
  pageLoader: boolean;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  storeSubscription: Subscription;

  constructor(
    private router: Router, private fApi: FeaturesService, private activeRoute: ActivatedRoute,
    public cs: CommonService, private sanitizer: DomSanitizer
  ) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getData();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.getData();
    else this.pageLoader = true;
  }

  getData(): void {
    this.pageLoader = false;
    this.activeRoute.params.subscribe((params: Params) => {
      if(this.cs.ys_features.indexOf('blogs')!=-1) {
        this.pageLoader = true;
        this.fApi.RECIPE_DETAILS(params['id']).subscribe(result => {
          if(result.status) {
            this.recipe_details = result.data;
            this.updateMetaData();
          }
          else {
            console.log("response", result);
            this.router.navigate(["/"]);
          }
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
    });
  }

  updateMetaData() {
    this.recipe_details.description = this.sanitizer.bypassSecurityTrustHtml(this.recipe_details.description);
    if(this.recipe_details.seo_status) {
      let seoImage = this.imgBaseUrl+this.recipe_details.image;
      this.cs.setSiteMetaData(this.recipe_details.seo_details, seoImage);
    }
    else this.cs.getStoreSeoDetails();
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}