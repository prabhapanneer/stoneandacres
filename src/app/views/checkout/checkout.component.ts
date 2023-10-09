import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { RedirectService } from '../../services/redirect.service';
import { CommonService } from '../../services/common.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartlistService } from '../../services/cartlist.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {

  leftLogo: boolean;
  template_setting: any = environment.template_setting;
  imgBaseUrl: string = environment.img_baseurl;

  constructor(
    public cs: CommonService, @Inject(DOCUMENT) private document, public rs: RedirectService,
    private router: Router, private wishService: WishlistService, private cartService: CartlistService
  ) { }

  ngOnInit(): void {
    if(environment.header_type=='type-1' || environment.header_type=='type-6' || environment.header_type=='type-7') {
      this.leftLogo = true;
    }
    // update customer details
    if(this.cs.customer_token && !this.cs.user_details?._id) {
      this.rs.USER_DETAILS().subscribe(result => {
        if(result.status) {
          this.wishService.resetWishList(result.data.wish_list);
          this.cartService.resetCartList(result.data.cart_list);
          this.cs.setCustomerData(result.data);
        }
        else {
          console.log("user response", result);
          localStorage.removeItem("customer_token");
          delete this.cs.customer_token;
          this.cs.user_details = {};
          this.wishService.resetWishList([]);
          this.cartService.resetCartList([]);
          this.router.navigate(["/account"]);
        }
      });
    }
  }

  resetmm() {
    this.document.getElementById('reset-menu')?.click();
  }

}