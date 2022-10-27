import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { StoreApiService } from '../../../services/store-api.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})

export class ContactUsComponent implements OnInit {

  contactForm: any = {}; pageLoader: boolean;
  alert_msg: string; success_alert: boolean;
  template_setting: any = environment.template_setting;

  constructor(private sanitizer: DomSanitizer, private storeApi: StoreApiService, public commonService: CommonService, private router: Router) { }

  ngOnInit() {
    this.alert_msg = null; this.contactForm = {};
    if(!this.commonService.contact_page_info) {
      this.pageLoader = true;
      
      this.storeApi.CONTACT_PAGE_INFO().subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) {
          this.commonService.contact_page_info = result.data;
          if(this.commonService.contact_page_info.map_url) {
            this.commonService.contact_page_info.map_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.commonService.contact_page_info.map_url);
          }
        }
        else {
          console.log("response", result);
          this.commonService.contact_page_info = {};
        }
      });
      
      // try {
      // var result =  this.storeApi.ZOHO_ENQUIRY();
      // result.then((res)=>{
      // console.log(res);
      // })
      // } catch (error) {
      // console.log("err",error)
      // }
    }
  }

  onSubmit() {   
    localStorage.removeItem("enquiry_proj_id");
    localStorage.removeItem("enquiry_type");
    this.contactForm.submit = true;
    this.contactForm.store_id = environment.store_id;
    this.contactForm.subject = "New Enquiry";
    this.contactForm.leadtype = "Contact Page";
    if(this.commonService.application_setting.enquiry_email) this.contactForm.to_mail = this.commonService.application_setting.enquiry_email;
    let zohourl = 'https://crm.zoho.com/crm/WebToLeadForm?xnQsjsdp=f6f7384c8d22675f81dd9671ac44b92bb9604e92c1248f154accb7a54c5158f2&zc_gad&xmIwtLD=d24eb38063b01d62d67919337c899972d97c3986eb1c9294bc609eae6d438bde&actionType=TGVhZHM=&returnURL=https://www.stoneandacres.com&Last Name='+this.contactForm.name+'&Mobile='+this.contactForm.mobile+'&Email='+this.contactForm.email+'&Description='+this.contactForm.message+'&LEADCF11='+this.contactForm.leadtype;
    this.storeApi.CONTACT_US(this.contactForm).subscribe(result => {
      this.contactForm.submit = false;
      this.contactForm = {};
      this.success_alert = result.status;
      if(result.status) {
        try {
          let result =  this.storeApi.ZOHO_ENQUIRY(zohourl);
          result.then((res)=>{
          this.alert_msg = "Your enquiry submitted successfully";
          setTimeout(() => { this.router.navigate(["/enquiry/thankyou-page"]); }, 500);
          })
          } catch (error) {
          console.log("err",error);
        }        
      }
      else {
        this.alert_msg = "Network error, try again later";
        console.log("response", result);
      }
      setTimeout(() => { this.alert_msg = null; }, 3000);
    });
  }

}