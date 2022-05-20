import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../../../services/api.service';
import { CommonService } from '../../../../../services/common.service';
import { CurrencyConversionService } from '../../../../../services/currency-conversion.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})

export class OrderDetailsComponent implements OnInit {

  pageLoader: boolean;
  params: any; details: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    private router: Router, private activeRoute: ActivatedRoute,
    private api: ApiService, public commonService: CommonService, public cc: CurrencyConversionService
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params = params;
      if(this.commonService.selected_order) {
        this.details = this.commonService.selected_order;
        delete this.commonService.selected_order;
        this.processOrder();
      }
      else {
        this.pageLoader = true;
        this.api.ORDER_DETAILS(this.params.order_id).subscribe(result => {
          if(result.status) {
            this.details = result.data;
            this.processOrder();
          }
          else console.log("response", result);
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
    });
  }

  processOrder() {
    let countryInr = this.details.currency_type.country_inr_value;
    this.details.sub_total = (this.details.sub_total/countryInr).toFixed(2);
    this.details.gift_wrapper = (this.details.gift_wrapper/countryInr).toFixed(2);
    this.details.packaging_charges = (this.details.packaging_charges/countryInr).toFixed(2);
    this.details.shipping_cost = (this.details.shipping_cost/countryInr).toFixed(2);
    this.details.cod_charges = (this.details.cod_charges/countryInr).toFixed(2);
    this.details.discount_amount = (this.details.discount_amount/countryInr).toFixed(2);
    this.details.final_price = (this.details.final_price/countryInr).toFixed(2);
    for(let product of this.details.item_list) {
      if(product.unit!='Pcs') product.final_price = (((product.final_price*product.quantity)+product.addon_price)/countryInr).toFixed(2);
      else product.final_price = ((product.final_price*product.quantity)/countryInr).toFixed(2);
    }
  }

}