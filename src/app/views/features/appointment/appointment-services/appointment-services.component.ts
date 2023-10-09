import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CommonService } from '../../../../services/common.service';
import { FeaturesService } from '../../../../services/features.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';

@Component({
  selector: 'app-appointment-services',
  templateUrl: './appointment-services.component.html',
  styleUrls: ['./appointment-services.component.scss']
})

export class AppointmentServicesComponent implements OnInit {

  list: any = [];
  pageLoader: boolean; parmas: any;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  subscription: Subscription; storeSubscription: Subscription;

  constructor(
    private router: Router, private fApi: FeaturesService, private activeRoute: ActivatedRoute,
    public cc: CurrencyConversionService, public cs: CommonService
  ) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      this.findCurrency();
    });
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
    this.activeRoute.params.subscribe((params: Params) => {
      this.parmas = params;
      if(Object.entries(this.cs.appointment_page_attr).length && this.cs.appointment_page_attr.page_url==this.parmas.category) {
        this.list = this.cs.appointment_page_attr.list;
        this.findCurrency();
        let scrollPos = this.cs.appointment_page_attr.scroll_y_pos;
        setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
        this.cs.appointment_page_attr.scroll_y_pos = 0;
      }
      else if(this.cs.ys_features.indexOf('appointment_scheduler')!=-1) {
        this.pageLoader = true;
        this.fApi.APPOINTMENT_SERVICES(this.parmas.category).subscribe(result => {
          if(result.status) {
            this.list = result.list;
            this.cs.appointment_page_attr = { list: this.list, page_url: this.parmas.category, scroll_y_pos: 0 };
            this.findCurrency();
          }
          else console.log("response", result);
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
    });
  }

  onSelect(x) {
    if(this.cs.customer_token) {
      // set page attributes
      this.cs.appointment_page_attr = { list: this.list, page_url: this.parmas.category, scroll_y_pos: this.cs.scroll_y_pos };
      this.router.navigate([this.router.url+"/"+x._id]);
    }
    else {
      this.cs.after_login_event = { redirect: this.router.url+"/"+x._id };
      this.router.navigate(["/account"]);
    }
  }

  findCurrency() {
    for(let service of this.list) {
      service.temp_price = this.cc.CALC_WO_AC(service.price);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.storeSubscription.unsubscribe();
  }

}