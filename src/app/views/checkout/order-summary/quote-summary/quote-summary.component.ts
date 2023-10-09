import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { StoreApiService } from '../../../../services/store-api.service';
import { CartlistService } from '../../../../services/cartlist.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-quote-summary',
  templateUrl: './quote-summary.component.html',
  styleUrls: ['./quote-summary.component.scss']
})

export class QuoteSummaryComponent implements OnInit {

  pageLoader: boolean;
  order_details: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private activeRoute: ActivatedRoute, private api: ApiService, private storeApi: StoreApiService,
    private router: Router, private cartService: CartlistService, public cs: CommonService, public cc: CurrencyConversionService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.pageLoader = true;
      this.storeApi.STORE_QUOTATION_DETAILS(params['order_id']).subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) {
          this.order_details = result.data;
          let countryInr = this.order_details.currency_type.country_inr_value;
          this.order_details.final_price = (this.order_details.final_price/countryInr).toFixed(2);
          for(let product of this.order_details.item_list) {
            if(product.unit!='Pcs') product.final_price = (((product.final_price*product.quantity)+product.addon_price)/countryInr).toFixed(2);
            else product.final_price = ((product.final_price*product.quantity)/countryInr).toFixed(2);
          }
        }
        else {
          console.log("response", result);
          this.router.navigate(["/"]);
        }
      });
      // update cart list
      if(localStorage.getItem('customer_token')) {
        this.api.USER_DETAILS().subscribe(result => {
          if(result.status) this.cartService.resetCartList(result.data.cart_list);
          else this.cartService.resetCartList([]);
        });
      }
      // guest logout
      if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("guest_token")) {
        delete this.cs.guest_token;
        delete this.cs.guest_email;
        sessionStorage.removeItem("by_ge");
        sessionStorage.removeItem("guest_token");
        sessionStorage.removeItem("by_ca");
        sessionStorage.removeItem("by_cd");
        this.cartService.resetCartList([]);
      }
    });
  }
  
}