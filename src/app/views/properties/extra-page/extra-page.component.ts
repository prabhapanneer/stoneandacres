import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PropertiesService } from '../../../services/properties.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-extra-page',
  templateUrl: './extra-page.component.html',
  styleUrls: ['./extra-page.component.scss']
})

export class ExtraPageComponent implements OnInit {

  pageLoader: boolean; details: any;
  template_setting: any = environment.template_setting;
  storeSubscription: Subscription;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private ps: PropertiesService, public cs: CommonService, private sanitizer: DomSanitizer) {
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
      if(this.cs.extra_pages[params['type']]) {
        this.details = this.cs.extra_pages[params['type']];
        if(this.details.seo_status) this.cs.setSiteMetaData(this.details.seo_details, null);
      }
      else if(this.cs.ys_features.indexOf('extra_pages')!=-1) {
        this.pageLoader = true;
        this.ps.EXTRA_PAGE(params['type']).subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.details = result.data;
            this.details.content = this.sanitizer.bypassSecurityTrustHtml(this.details.content);
            this.cs.extra_pages[params['type']] = this.details;
            if(this.details.seo_status) this.cs.setSiteMetaData(this.details.seo_details, null);
          }
          else {
            console.log("response", result);
            this.router.navigate(['/404']);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}