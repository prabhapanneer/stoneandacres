import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../../../services/properties.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-vendor-enquiry',
  templateUrl: './vendor-enquiry.component.html',
  styleUrls: ['./vendor-enquiry.component.scss']
})

export class VendorEnquiryComponent implements OnInit {

  contactForm: any;
  alert_msg: string
  success_alert: boolean;

  constructor(private pApi: PropertiesService, public cs: CommonService) { }

  ngOnInit(): void {
    delete this.alert_msg;
    this.contactForm = {};
  }

  onSubmit() {
    this.contactForm.submit = true;
    this.contactForm.store_id = this.cs.store_id;
    this.contactForm.subject = "New Vendor Enquiry";
    this.pApi.VENDOR_ENQUIRY(this.contactForm).subscribe(result => {
      this.contactForm.submit = false;
      this.contactForm = {};
      this.success_alert = result.status;
      if(result.status) this.alert_msg = "Enquiry successfully submitted";
      else {
        this.alert_msg = "Network error, try again later";
        console.log("response", result);
      }
      setTimeout(() => { this.alert_msg = null; }, 3000);
    });
  }

}