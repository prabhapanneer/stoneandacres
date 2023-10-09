import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';
import { FeaturesService } from '../../../services/features.service';
import { CurrencyConversionService } from '../../../services/currency-conversion.service';

@Component({
  selector: 'app-gift-cards',
  templateUrl: './gift-cards.component.html',
  styleUrls: ['./gift-cards.component.scss']
})

export class GiftCardsComponent implements OnInit {

  list: any = [];
  pageLoader: boolean;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  subscription: Subscription; storeSubscription: Subscription;

  constructor(
    private router: Router, private fApi: FeaturesService,
    public cc: CurrencyConversionService, public cs: CommonService
  ) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      this.findCurrency();
    });
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
    if(Object.entries(this.cs.giftcard_page_attr).length) {
      this.list = this.cs.giftcard_page_attr.list;
      this.findCurrency();
      let scrollPos = this.cs.giftcard_page_attr.scroll_y_pos;
      setTimeout(() => { window.scrollTo({ top: scrollPos, behavior: 'smooth' }); }, 500);
      this.cs.giftcard_page_attr.scroll_y_pos = 0;
    }
    else if(this.cs.ys_features.indexOf('giftcard')!=-1) {
      this.pageLoader = true;
      this.fApi.GIFT_CARDS().subscribe(result => {
        if(result.status) {
          this.list = result.list;
          this.findCurrency();
        }
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
  }

  findCurrency() {
    for(let card of this.list) {
      card.temp_price = this.cc.CALC_ROUND_WO_AC(card.price);
    }
  }

  onSelect(x) {
    if(this.cs.customer_token) {
      this.cs.giftcard_page_attr = { list: this.list, scroll_y_pos: this.cs.scroll_y_pos };
      this.router.navigate(["/gift-cards/"+x.page_url]);
    }
    else {
      this.cs.after_login_event = { redirect: "/gift-cards/"+x.page_url };
      this.router.navigate(["/account"]);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.storeSubscription.unsubscribe();
  }

}