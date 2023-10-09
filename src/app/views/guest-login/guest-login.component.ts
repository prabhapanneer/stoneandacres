import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-guest-login',
  templateUrl: './guest-login.component.html',
  styleUrls: ['./guest-login.component.scss']
})

export class GuestLoginComponent implements OnInit {

  guestForm: any;
  template_setting: any = environment.template_setting;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cs: CommonService, private router: Router, private api: ApiService) { }

  ngOnInit(): void {
    this.guestForm = {};
  }

  onLogin() {
    if(isPlatformBrowser(this.platformId)) {
      let cart_list = []; let checkoutDetails: any = {};
      if(sessionStorage.getItem("by_cd")) {
        checkoutDetails = this.cs.decode(sessionStorage.getItem("by_cd"));
        if(checkoutDetails.item_list && checkoutDetails.item_list.length) cart_list = checkoutDetails.item_list;
      }
      this.guestForm.submit = true;
      this.api.GUEST_LOGIN({ store_id: this.cs.store_id, email: this.guestForm.email, cart_list: cart_list }).subscribe(result => {
        this.guestForm.submit = false;
        if(result.status) {
          this.cs.guest_token = result.token;
          this.cs.guest_email = this.guestForm.email.trim();
          sessionStorage.setItem("by_ge", this.cs.encode(this.cs.guest_email));
          sessionStorage.setItem("guest_token", this.cs.guest_token);
          if(sessionStorage.getItem("by_cd")) {
            let addrtype = 'product';
            if(this.cs.store_details?.sub_type=='quot') addrtype = 'quotation';
            this.router.navigate(["/checkout/address-list/"+addrtype]);
          }
          else this.router.navigate([this.cs.previous_route]);
        }
        else {
          this.guestForm.errorMsg = result.message;
          console.log("response", result);
        }
      });
    }
  }

  onAccountPage(type) {
    if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("account_type", type);
    this.router.navigate(["/account"]);
  }

}