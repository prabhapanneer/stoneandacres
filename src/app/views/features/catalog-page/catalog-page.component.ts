import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FeaturesService } from '../../../services/features.service';
import { CommonService } from '../../../services/common.service';
import { RedirectService } from '../../../services/redirect.service';

@Component({
  selector: 'app-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss']
})

export class CatalogPageComponent implements OnInit {

  page: number = 1; pageSize: number = 12;
  pageLoader: boolean;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  storeSubscription: Subscription;

  constructor(private fApi: FeaturesService, public cs: CommonService, public rs: RedirectService) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getDataList();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.getDataList();
    else this.pageLoader = true;
  }

  getDataList(): void {
    this.pageLoader = false;
    if(!this.cs.discount_page && this.cs.ys_features.indexOf('discounts_page')!=-1) {
      this.pageLoader = true;
      this.fApi.CATALOGS().subscribe(result => {
        if(result.status) this.cs.discount_page = result.data;
        else {
          console.log("response", result);
          this.cs.discount_page = {};
        }
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}