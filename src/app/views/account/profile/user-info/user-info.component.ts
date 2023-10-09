import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { CartlistService } from '../../../../services/cartlist.service';
import { CommonService } from '../../../../services/common.service';
import { RedirectService } from '../../../../services/redirect.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  pageLoader: boolean;
  customer_details: any = {};
  pwdForm: any = {};
  template_setting: any = environment.template_setting;
  mobile_pattern: any; mobileno_length: any;

  constructor(
    public cs: CommonService, private api: ApiService, private router: Router,
    private wishService: WishlistService, private cartService: CartlistService, public rs: RedirectService
  ) { }

  ngOnInit(): void {
    this.pageLoader = true;
    this.api.USER_DETAILS().subscribe(result => {
      if(result.status) {
        this.customer_details = result.data;
        this.cs.setCustomerData(result.data);
      }
      else console.log("response", result);
      setTimeout(() => { this.pageLoader = false; }, 500);
    });
  }

  onUpdateGst(x) {
    this.customer_details.gst_update = true;
    this.api.USER_UPDATE(x).subscribe((result) => {
      delete this.customer_details.gst_change; this.customer_details.gst_update = false;
      if(result.status) {
        this.customer_details = result.data;
        this.cs.setCustomerData(result.data);
      }
      else console.log("response", result);
    });
  }

  onUpdateName(x) {
    this.customer_details.name_update = true;
    if(this.cs.user_details.name!=x.name) {
      this.api.USER_UPDATE(x).subscribe((result) => {
        delete this.customer_details.name_change; this.customer_details.name_update = false;
        if(result.status) {
          this.customer_details = result.data;
          this.cs.setCustomerData(result.data);
        }
        else console.log("response", result);
      });
    }
    else {
      delete this.customer_details.name_change; this.customer_details.name_update = false;
    }
  }

  onEditMobile() {
    delete this.customer_details.errorMsg;
    this.customer_details.mobile_change = true;
    delete this.mobileno_length; delete this.mobile_pattern;
    this.rs.getCountryList().then(() => {
      if(!this.customer_details.dial_code) {
        let index = this.rs.country_list.findIndex(object => object.name==this.cs.store_details.country);
        if(index!=-1) {
          this.customer_details.dial_code = this.rs.country_list[index].dial_code;
          this.onDialCodeChange(this.customer_details.dial_code);
        }
      }
      else this.onDialCodeChange(this.customer_details.dial_code);
    });
  }
  onUpdateMobile(x) {
    this.customer_details.mobile_update = true;
    if(this.cs.user_details.dial_code!=x.dial_code || this.cs.user_details.mobile!=x.mobile) {
      this.api.UPDATE_USER_MOBILE(x).subscribe((result) => {
        delete this.customer_details.mobile_change; this.customer_details.mobile_update = false;
        if(result.status) {
          this.customer_details = result.data;
          this.cs.setCustomerData(result.data);
        }
        else {
          console.log("response", result);
          this.customer_details.errorMsg = result.message;
        }
      });
    }
    else {
      delete this.customer_details.mobile_change; this.customer_details.mobile_update = false;
    }
  }

  onChangePwd(modalName) {
    this.pwdForm.submit = true;
    this.api.CHANGE_PWD(this.pwdForm).subscribe((result) => {
      this.pwdForm.submit = false;
      if(result.status) {
        modalName.hide();
        localStorage.removeItem("customer_token");
        delete this.cs.customer_token;
        this.cs.user_details = {};
        this.wishService.resetWishList([]);
        this.cartService.resetCartList([]);
        this.router.navigate(['/account']);
      }
      else {
        this.pwdForm.errorMsg = result.message;
        console.log("response", result);
      }
    });
  }

  onDialCodeChange(x) {
    delete this.mobileno_length; delete this.mobile_pattern;
    let index = this.rs.country_list.findIndex(object => object.dial_code==x);
    if(index!=-1) {
      let countryDetails = this.rs.country_list[index];
      if(countryDetails.mobileno_length) {
        this.mobileno_length = countryDetails.mobileno_length;
        this.mobile_pattern = ".{"+countryDetails.mobileno_length+","+countryDetails.mobileno_length+"}";
      }
    }
  }

}