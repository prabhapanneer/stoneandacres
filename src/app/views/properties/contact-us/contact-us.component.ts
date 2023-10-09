import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PropertiesService } from '../../../services/properties.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})

export class ContactUsComponent implements OnInit {

  contactForm: any = {}; pageLoader: boolean;
  alert_msg: string; success_alert: boolean;
  template_setting: any = environment.template_setting;

  constructor(private sanitizer: DomSanitizer, private ps: PropertiesService, public cs: CommonService) { }

  ngOnInit(): void {
    this.alert_msg = null; this.contactForm = {};
    if(!this.cs.contact_page_info) {
      this.pageLoader = true;
      this.ps.CONTACT_PAGE_INFO().subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) {
          this.cs.contact_page_info = result.data;
          if(this.cs.contact_page_info.map_url) {
            this.cs.contact_page_info.map_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.cs.contact_page_info.map_url);
          }
        }
        else {
          console.log("response", result);
          this.cs.contact_page_info = {};
        }
      });
    }
  }

  onSubmit() {
    this.contactForm.submit = true;
    this.contactForm.store_id = this.cs.store_id;
    this.contactForm.subject = "New Enquiry";
    this.ps.CONTACT_US(this.contactForm).subscribe(result => {
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