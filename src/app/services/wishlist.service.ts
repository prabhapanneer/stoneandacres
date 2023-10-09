import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from './common.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})

export class WishlistService {

  ws_url: string = this.gs.wsUrl;
  public observe_wishlist = new Subject<any>();

  constructor(private http: HttpClient, private cs: CommonService, private gs: GlobalService) { }

  UPDATE_WISHLIST() {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.get<any>(this.ws_url+'/user/update_wish_list', httpOptions);
  }
  USER_UPDATE(x) {
    let httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('customer_token') }) };
    return this.http.put<any>(this.ws_url+'/user/customer', x, httpOptions);
  }

  checkProductExist(productId) {
    if(this.cs.wish_list && this.cs.wish_list.length) {
      return this.cs.wish_list.some(x => x.product_id == productId);
    }
  }

  addToWishList(x) {
    x.product_id = x._id;
    x.image = x.image_list[0].image;
    if(!this.cs.wish_list) this.cs.wish_list = [];
    this.cs.wish_list.push(x);
    this.updateWishList(this.cs.wish_list);
  }

  removeFromWishList(productId) {
    if(this.cs.wish_list) {
      let index = this.cs.wish_list.findIndex(x => x.product_id == productId);
      if(index != -1) {
        this.cs.wish_list.splice(index, 1);
        this.updateWishList(this.cs.wish_list);
      }
    }
  }

  // this fn also call from wishlist page, so set wish_list again
  updateWishList(x) {
    this.cs.wish_list = x;
    this.observe_wishlist.next(this.cs.wish_list);
    this.USER_UPDATE({ wish_list: x }).subscribe(result => { });
  }

  // this fn call on login
  resetWishList(x) {
    this.cs.wish_list = x;
    this.observe_wishlist.next(this.cs.wish_list);
  }

}