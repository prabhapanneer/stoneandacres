import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CheckoutService } from '../../../../services/checkout.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-giftcard-summary',
  templateUrl: './giftcard-summary.component.html',
  styleUrls: ['./giftcard-summary.component.scss']
})

export class GiftcardSummaryComponent implements OnInit {

  pageLoader: boolean;
  order_details: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    private activeRoute: ActivatedRoute, private router: Router, public cs: CommonService, public cc: CurrencyConversionService, private cApi: CheckoutService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.pageLoader = true;
      this.cApi.COUPON_DETAILS(params['order_id']).subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) {
          this.order_details = result.data;
          this.order_details.price = (this.order_details.price/this.order_details.currency_type.country_inr_value).toFixed(2);
        }
        else {
          console.log("response", result);
          this.router.navigate(["/"]);
        }
      });
    });
  }

}