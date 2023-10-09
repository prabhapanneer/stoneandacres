import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../../../services/api.service';
import { CommonService } from '../../../../../services/common.service';
import { CurrencyConversionService } from '../../../../../services/currency-conversion.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-details.component.html',
  styleUrls: ['./quote-details.component.scss']
})

export class QuoteDetailsComponent implements OnInit {

  pageLoader: boolean;
  params: any; details: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    private activeRoute: ActivatedRoute, private api: ApiService, public cs: CommonService, public cc: CurrencyConversionService
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params = params; this.pageLoader = true;
      this.api.QUOTATION_DETAILS(this.params.quot_id).subscribe(result => {
        if(result.status) {
          this.details = result.data;
          this.processOrder();
        }
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    });
  }

  processOrder() {
    let countryInr = this.details.currency_type.country_inr_value;
    this.details.sub_total = (this.details.sub_total/countryInr).toFixed(2);
    this.details.shipping_cost = (this.details.shipping_cost/countryInr).toFixed(2);
    this.details.final_price = (this.details.final_price/countryInr).toFixed(2);
    for(let product of this.details.item_list) {
      if(product.unit!='Pcs') product.final_price = (((product.revised_final_price*product.quantity)+product.revised_addon_price)/countryInr).toFixed(2);
      else product.final_price = ((product.revised_final_price*product.quantity)/countryInr).toFixed(2);
    }
  }

}