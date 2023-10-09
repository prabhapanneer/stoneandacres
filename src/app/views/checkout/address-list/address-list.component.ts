import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';
import { RedirectService } from '../../../services/redirect.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})

export class AddressListComponent implements OnInit {

  pageLoader: boolean; btnLoader: boolean;
  list: any = []; params: any;
  state_list: any = []; guestForm: any = {};
  addressForm: any = {}; checkout_details: any = {};
  template_setting: any = environment.template_setting;
  country_details: any; address_fields: any = []; mobile_pattern: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private activeRoute: ActivatedRoute, private api: ApiService,
    private router: Router, public cs: CommonService, public rs: RedirectService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params = params; this.addressForm = {}; this.btnLoader = false;
      if(this.cs.customer_token) {
        this.pageLoader = true;
        this.api.USER_DETAILS().subscribe(result => {
          if(result.status && result.data.checkout_details) {
            this.list = result.data.address_list;
            this.checkout_details = result.data.checkout_details;
            if(this.router.url.indexOf('product')!=-1) {
              if(!this.checkout_details.item_list)
                this.router.navigate(["/"]);
              if(this.checkout_details.order_type=='pickup' && this.list.length)
                this.router.navigate(["/checkout/pickup-methods"]);
            }
          }
          else {
            console.log("response", result);
            this.router.navigate(["/"]);
          }
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
      else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("guest_token") && sessionStorage.getItem("by_cd")) {
        this.guestForm = { email: this.cs.guest_email };
        this.checkout_details = this.cs.decode(sessionStorage.getItem("by_cd"));
        if(!this.checkout_details.item_list) this.router.navigate(["/"]);
        // address details
        if(sessionStorage.getItem("by_ca")) {
          this.addressForm = this.cs.decode(sessionStorage.getItem("by_ca"));
        }
        else {
          this.addressForm.type = 'home';
          this.addressForm.country = this.cs.store_details.country;
        }
      }
      else this.router.navigate(["/"]);
      // country list
      this.rs.getCountryList().then(() => {
        // update address form
        if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("guest_token") && sessionStorage.getItem("by_cd")) {
          this.onCountryChange(this.addressForm.country);
          if(sessionStorage.getItem("by_ca")) {
            this.address_fields.forEach(element => {
              element.value = this.addressForm[element.keyword];
            });
          }
        }
      });
    });
  }

  // for product (valid users)
  onSelectForProduct(x, index) {
    this.checkout_details.shipping_address = x;
    // set default shipping address (if not exist)
    let updatedAddressList = null;
    if(this.list.findIndex(obj => obj.shipping_address) == -1) {
      this.list[index].shipping_address = true;
      updatedAddressList = this.list;
    }
    // shipping
    if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
      // redirect to delivery methods
      this.checkoutNavigation(updatedAddressList, this.checkout_details, '/checkout/delivery-methods');
    }
    else {
      let sendData: any = {
        sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: this.checkout_details.shipping_address._id,
        order_type: this.checkout_details.order_type, currency_type: this.cs.selected_currency.country_code
      };
      sendData.item_list = this.cs.getItemList(this.checkout_details.item_list);
      if(this.checkout_details.quick_order_id) sendData.quick_order_id = this.checkout_details.quick_order_id;
      this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
        if(result.status) {
          this.checkout_details.shipping_method = result.data.shipping_method;
          this.checkoutNavigation(updatedAddressList, this.checkout_details, '/checkout/order-details/product');
        }
        else {
          // redirect to shipping page
          this.checkoutNavigation(updatedAddressList, this.checkout_details, '/checkout/shipping-methods');
        }
      });
    }
  }
  checkoutNavigation(addressList, checkoutDetails, redirect) {
    let jsonData: any = { checkout_details: checkoutDetails };
    if(addressList) jsonData.address_list = addressList;
    this.api.USER_UPDATE(jsonData).subscribe(result => {
      if(result.status) this.router.navigate([redirect]);
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
    });
  }

  // for gc or quot (valid users)
  onSelectAddr(x) {
    if(this.params?.type=='giftcard') {
      this.checkout_details.billing_address = x;
      this.api.USER_UPDATE({ checkout_details: this.checkout_details }).subscribe(result => {
        if(result.status) this.router.navigate(['/checkout/order-details/giftcard']);
        else {
          console.log("response", result);
          this.router.navigate(["/"]);
        }
      });
    }
    else {
      this.checkout_details.company_address = x;
      this.api.USER_UPDATE({ checkout_details: this.checkout_details }).subscribe(result => {
        if(result.status) this.router.navigate(['/checkout/order-details/quotation']);
        else {
          console.log("response", result);
          this.router.navigate(["/"]);
        }
      });
    }
  }

  // for guest users
  onDeliver() {
    if(this.cs.store_details?.sub_type=='order') this.orderCheckout();
    else this.quoteCheckout();
  }
  orderCheckout() {
    this.address_fields.forEach(element => {
      if(element.value) this.addressForm[element.keyword] = element.value;
    });
    if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(this.addressForm.pincode)==-1) {
      this.addressForm.error_msg = "Service not available for this pincode.";
    }
    else if(isPlatformBrowser(this.platformId)) {
      this.btnLoader = true;
      this.api.GUEST_USER_UPDATE({ address_list: [this.addressForm] }).subscribe(result => {
        this.btnLoader = false;
        if(result.status) {
          if(this.checkout_details.order_type!='pickup') this.checkout_details.shipping_address = result.data.address_list[0];
          sessionStorage.setItem("by_ca", this.cs.encode(result.data.address_list[0]));
          sessionStorage.setItem("by_cd", this.cs.encode(this.checkout_details));
          // pickup
          if(this.checkout_details.order_type=='pickup') {
            this.router.navigate(['/checkout/pickup-methods']);
          }
          // shipping
          else if(this.cs.ys_features.indexOf('time_based_delivery')!=-1) {
            this.router.navigate(['/checkout/delivery-methods']);
          }
          else {
            let sendData: any = {
              sid: this.cs.session_id, store_id: this.cs.store_id, shipping_address: this.checkout_details.shipping_address._id,
              order_type: this.checkout_details.order_type, currency_type: this.cs.selected_currency.country_code
            };
            sendData.item_list = this.cs.getItemList(this.checkout_details.item_list);
            if(this.checkout_details.quick_order_id) sendData.quick_order_id = this.checkout_details.quick_order_id;
            this.api.SHIPPING_DETAILS(sendData).subscribe(result => {
              if(result.status) {
                this.checkout_details.shipping_method = result.data.shipping_method;
                if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("by_cd", this.cs.encode(this.checkout_details));
                this.router.navigate(['/checkout/order-details/product']);
              }
              else {
                // redirect to shipping page
                this.router.navigate(['/checkout/shipping-methods']);
              }
            });
          }
        }
        else {
          this.addressForm.error_msg = result.message;
          console.log("response", result);
        }
      });
    }
  }
  quoteCheckout() {
    this.address_fields.forEach(element => {
      if(element.value) this.addressForm[element.keyword] = element.value;
    });
    if(isPlatformBrowser(this.platformId)) {
      this.btnLoader = true;
      this.api.GUEST_USER_UPDATE({ address_list: [this.addressForm] }).subscribe(result => {
        this.btnLoader = false;
        if(result.status) {
          this.checkout_details.billing_address = result.data.address_list[0];
          this.checkout_details.company_address = result.data.address_list[0];
          sessionStorage.setItem("by_ca", this.cs.encode(result.data.address_list[0]));
          sessionStorage.setItem("by_cd", this.cs.encode(this.checkout_details));
          this.router.navigate(['/checkout/order-details/quotation']);
        }
        else {
          this.addressForm.error_msg = result.message;
          console.log("response", result);
        }
      });
    }
  }

  onChangeGuest() {
    if(isPlatformBrowser(this.platformId) && this.cs.guest_email!=this.guestForm.email.trim()) {
      let cart_list = [];
      if(sessionStorage.getItem("by_cd")) {
        let checkoutDetails = this.cs.decode(sessionStorage.getItem("by_cd"));
        if(checkoutDetails.item_list && checkoutDetails.item_list.length) cart_list = checkoutDetails.item_list;
      }
      this.guestForm.submit = true;
      this.api.GUEST_LOGIN({ store_id: this.cs.store_id, email: this.guestForm.email, cart_list: cart_list }).subscribe(result => {
        this.guestForm.submit = false;
        if(result.status) {
          this.addressForm = { type: 'home', country: this.cs.store_details.country };
          this.onCountryChange(this.addressForm.country);
          this.address_fields.forEach(elem => {
            delete elem.value;
          });
          sessionStorage.removeItem("by_ca");
          delete this.guestForm.email_change;
          this.cs.guest_token = result.token;
          this.cs.guest_email = this.guestForm.email.trim();
          sessionStorage.setItem("by_ge", this.cs.encode(this.cs.guest_email));
          sessionStorage.setItem("guest_token", this.cs.guest_token);
        }
        else {
          this.guestForm.errorMsg = result.message;
          console.log("response", result);
        }
      });
    }
    else delete this.guestForm.email_change;
  }

  onOpenAddressModal(modalName) {
    this.addressForm = { form_type: 'add', type: 'home', country: this.cs.store_details.country };
    if(!this.list.length) {
      this.addressForm.billing_address = true;
      this.addressForm.shipping_address = true;
    }
    this.onCountryChange(this.addressForm.country);
    modalName.show();
    this.cs.scrollModalTop(500);
  }

  onEdit(x, modalName) {
    this.onCountryChange(x.country);
    this.addressForm = { form_type: 'edit' };
    for(let key in x) {
      if(x.hasOwnProperty(key)) this.addressForm[key] = x[key];
    }
    this.addressForm.exist_billing = this.addressForm.billing_address;
    this.addressForm.exist_shipping = this.addressForm.shipping_address;
    this.address_fields.forEach(element => {
      element.value = this.addressForm[element.keyword];
    });
    modalName.show();
    this.cs.scrollModalTop(500);
  }

  onSubmit(modalName) {
    this.address_fields.forEach(element => {
      if(element.value) this.addressForm[element.keyword] = element.value;
    });
    if(this.cs.ys_features.indexOf('pincode_service')!=-1 && this.cs.store_properties.pincodes.length && this.cs.store_properties.pincodes.indexOf(this.addressForm.pincode)==-1) {
      this.addressForm.error_msg = "Service not available for this pincode.";
    }
    else {
      this.addressForm.submit = true;
      if(this.addressForm.form_type=='add') {
        this.api.ADD_ADDRESS(this.addressForm).subscribe(result => {
          if(result.status) {
            modalName.hide();
            this.list = result.data.address_list;
            if(this.checkout_details.order_type=='pickup' && this.list.length)
              this.router.navigate(["/checkout/pickup-methods"]);
          }
          else {
            this.addressForm.error_msg = result.message;
            console.log("response", result);
          }
        });
      }
      else {
        this.api.UPDATE_ADDRESS(this.addressForm).subscribe(result => {
          if(result.status) {
            modalName.hide();
            this.list = result.data.address_list;
            if(this.checkout_details.order_type=='pickup' && this.list.length)
              this.router.navigate(["/checkout/pickup-methods"]);
          }
          else {
            this.addressForm.error_msg = result.message;
            console.log("response", result);
          }
        });
      }
    }
  }

  onCountryChange(x) {
    this.state_list = []; this.address_fields = [];
    delete this.country_details; delete this.mobile_pattern;
    let index = this.rs.country_list.findIndex(object => object.name==x);
    if(index!=-1) {
      this.country_details = this.rs.country_list[index];
      this.state_list = this.country_details.states;
      this.addressForm.dial_code = this.country_details.dial_code;
      this.address_fields = this.country_details.address_fields;
      if(this.country_details.mobileno_length) this.mobile_pattern = ".{"+this.country_details.mobileno_length+","+this.country_details.mobileno_length+"}";
    }
  }

}