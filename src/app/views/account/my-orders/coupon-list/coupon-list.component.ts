import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.scss']
})

export class CouponListComponent implements OnInit {

  list: any = [];
  pageLoader: boolean;
  page: number = 1; pageSize: number = 10;
  template_setting: any = environment.template_setting;

  constructor(private api: ApiService, public commonService: CommonService, public cc: CurrencyConversionService) { }

  ngOnInit() {
    if(this.commonService.ys_features.indexOf('giftcard')!=-1) {
      this.pageLoader = true;
      this.api.COUPON_LIST().subscribe(result => {
        if(result.status) {
          this.list = result.list;
          for(let coupon of this.list) {
            coupon.message = this.commonService.transformHtml(coupon.message);
            coupon.temp_price = (coupon.price/coupon.currency_type.country_inr_value).toFixed(2);
          }
        }
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
  }

}