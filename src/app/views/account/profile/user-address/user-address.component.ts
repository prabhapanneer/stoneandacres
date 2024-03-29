import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { RedirectService } from '../../../../services/redirect.service';
import { CommonService } from '../../../../services/common.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss']
})

export class UserAddressComponent implements OnInit {

  pageLoader: boolean; list: any = [];
  state_list: any = []; country_details: any;
  addressForm: any = {}; deleteForm: any = {};
  template_setting: any = environment.template_setting;
  address_fields: any = []; mobile_pattern: any;
  page: number = 1; pageSize: number = 10;

  constructor(private api: ApiService, public cs: CommonService, public rs: RedirectService) { }

  ngOnInit(): void {
    this.pageLoader = true;
    this.api.USER_DETAILS().subscribe(result => {
      if(result.status) {
        this.list = result.data.address_list;
        this.list.forEach((obj, index) => {
          obj.index = index+1;
        });
      }
      else console.log("response", result);
      setTimeout(() => { this.pageLoader = false; }, 500);
    });
    // country list
    this.rs.getCountryList();
  }

  onAddAddress(modalName) {
    this.addressForm = { form_type: 'add', type: 'home', country: this.cs.store_details.country };
    if(!this.list.length) {
      this.addressForm.billing_address = true;
      this.addressForm.shipping_address = true;
    }
    this.onCountryChange(this.addressForm.country);
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
            this.page = 1;
          }
          else console.log("response", result);
        });
      }
      else {
        this.api.UPDATE_ADDRESS(this.addressForm).subscribe(result => {
          if(result.status) {
            modalName.hide();
            this.list = result.data.address_list;
            this.page = 1;
          }
          else console.log("response", result);
        });
      }
    }
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

  onDelete(modalName) {
    this.deleteForm.submit = true;
    this.api.DELETE_ADDRESS(this.deleteForm).subscribe(result => {
      if(result.status) {
        modalName.hide();
        this.list = result.data.address_list;
        this.page = 1;
      }
      else console.log("response", result);
    });
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