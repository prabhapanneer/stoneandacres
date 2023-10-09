import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../services/wishlist.service';
import { environment } from './../../../environments/environment';
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
  subscription: Subscription; storeSubscription: Subscription;

  constructor(private wishService: WishlistService, public cc: CurrencyConversionService, public cs: CommonService) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      this.findCurrency();
    });
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.setPageSeo();
    });
  }

  ngOnInit(): void {
    if(this.cs.customer_token) {
      this.pageLoader = true;
      this.wishService.UPDATE_WISHLIST().subscribe(result => {
        if(result.status) {
          this.list = result.data.wish_list;
          this.wishService.updateWishList(this.list);
          this.findCurrency();
        }
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
    if(this.cs.storeDataLoaded) this.setPageSeo();
  }

  setPageSeo() {
    let seoDetails = {
      h1_tag: "List of my favourites",
      page_title: this.cs.store_details?.name+" - My Wishlist",
      meta_desc: "Create a list of your favourite products so you can shop it later.",
      meta_keywords: []
    };
    this.cs.setSiteMetaData(seoDetails, null);
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
    this.storeSubscription.unsubscribe();
  }

}