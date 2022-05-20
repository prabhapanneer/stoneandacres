import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../services/wishlist.service';
import { environment } from './../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';

@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.scss']
})

export class WishListComponent implements OnInit {

  pageLoader: boolean; list: any = [];
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  subscription: Subscription;

  constructor(
    private wishService: WishlistService, private router: Router, public cc: CurrencyConversionService,
    private api: ApiService, public commonService: CommonService
  ) {
    this.subscription = this.commonService.currency_type.subscribe(currency => {
      this.findCurrency();
    });
  }

  ngOnInit() {
    this.pageLoader = true;
    this.api.UPDATE_WISHLIST().subscribe(result => {
      if(result.status) {
        this.wishService.updateWishList(result.data.wish_list);
        this.list = this.wishService.wish_list;
        this.findCurrency();
      }
      else console.log("response", result);
      setTimeout(() => { this.pageLoader = false; }, 500);
    });
  }

  findCurrency() {
    for(let product of this.list) {
      product.temp_selling_price = this.cc.CALC(product.selling_price);
      product.temp_discounted_price = this.cc.CALC(product.discounted_price);
    }
  }

  removeFromWishList(index) {
    this.list.splice(index, 1);
    this.wishService.updateWishList(this.list);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}