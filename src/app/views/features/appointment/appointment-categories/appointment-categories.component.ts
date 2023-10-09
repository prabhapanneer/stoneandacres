import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../../services/common.service';
import { FeaturesService } from '../../../../services/features.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';

@Component({
  selector: 'app-appointment-categories',
  templateUrl: './appointment-categories.component.html',
  styleUrls: ['./appointment-categories.component.scss']
})

export class AppointmentCategoriesComponent implements OnInit {

  list: any = [];
  pageLoader: boolean; parmas: any;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  storeSubscription: Subscription;

  constructor(
    private router: Router, private fApi: FeaturesService,
    public cc: CurrencyConversionService, public cs: CommonService
  ) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getList();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.getList();
    else this.pageLoader = true;
  }

  getList(): void {
    this.pageLoader = false;
    if(Object.entries(this.cs.appointment_cat_page_attr).length) {
      this.list = this.cs.appointment_cat_page_attr.list;
      let scrollPos = this.cs.appointment_cat_page_attr.scroll_y_pos;
      setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
      this.cs.appointment_cat_page_attr.scroll_y_pos = 0;
    }
    else if(this.cs.ys_features.indexOf('appointment_scheduler')!=-1) {
      this.pageLoader = true;
      this.fApi.APPOINTMENT_CATEGORIES().subscribe(result => {
        if(result.status) this.list = result.list;
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
  }

  onSelect(x) {
    this.cs.appointment_cat_page_attr = { name: x.name, list: this.list, scroll_y_pos: this.cs.scroll_y_pos };
    this.router.navigate(["/services/"+x.page_url]);
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}