import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { StoreApiService } from '../../../../services/store-api.service';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})

export class BlogDetailsComponent implements OnInit {

  blog_details: any = {};
  pageLoader: boolean;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private storeApi: StoreApiService,
    private activeRoute: ActivatedRoute, public commonService: CommonService, private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      if(this.commonService.selected_blog) {
        this.blog_details = this.commonService.selected_blog;
        this.updateMetaData();
      }
      else if(this.commonService.ys_features.indexOf('blogs')!=-1) {
        this.pageLoader = true;
        this.storeApi.BLOG_DETAILS(params.blog_id).subscribe(result => {
          if(result.status) {
            this.blog_details = result.data;
            this.updateMetaData();
          }
          else {
            console.log("response", result);
            this.router.navigate(["/"]);
          }
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
      else this.router.navigate(["/blogs"]);
    });
  }

  updateMetaData() {
    this.blog_details.description = this.sanitizer.bypassSecurityTrustHtml(this.blog_details.description);
    if(this.blog_details.seo_status) {
      let seoImage = this.imgBaseUrl+this.blog_details.image;
      this.commonService.setSiteMetaData(this.blog_details.seo_details, seoImage);
    }
    else this.commonService.getStoreSeoDetails();
  }

  ngOnDestroy() {
    delete this.commonService.selected_blog;
  }

}