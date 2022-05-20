import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})

export class OrderListComponent implements OnInit {

  pageLoader: boolean;
  params: any; list: any = [];
  page: number; pageSize: number;
  template_setting: any = environment.template_setting;

  constructor(private activeRoute: ActivatedRoute, private api: ApiService, public commonService: CommonService, public cc: CurrencyConversionService) { }

  ngOnInit() {
    this.pageLoader = true;
    this.activeRoute.params.subscribe((params: Params) => {
      this.params = params; this.page = 1; this.pageSize = 10;
      this.api.ORDER_LIST(this.params.type).subscribe(result => {
        if(result.status) {
          this.list = result.list;
          for(let order of this.list) {
            order.temp_final_price = (order.final_price/order.currency_type.country_inr_value).toFixed(2);
          }
        }
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    });
  }

}