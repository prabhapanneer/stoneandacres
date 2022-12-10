import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { StoreApiService } from '../../../services/store-api.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser, formatDate } from '@angular/common';
import { DynamicAssetLoaderService } from '../../../services/dynamic-asset-loader.service';


@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})

export class ContactUsComponent implements OnInit {

  contactForm: any = {}; pageLoader: boolean;
  alert_msg: string; success_alert: boolean;
  template_setting: any = environment.template_setting;
  @ViewChild('zohoForm', {static: false}) zohoForm: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private sanitizer: DomSanitizer, private storeApi: StoreApiService, public commonService: CommonService, 
    private router: Router, private activeRoute: ActivatedRoute, private assetLoader: DynamicAssetLoaderService) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params: Params) => {
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
    }

    })

    
  }

  onSubmit() {   
    this.assetLoader.load('zoho');
    this.contactForm.current_date = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    this.contactForm.redirect_url = this.commonService.origin+"/enquiry/thankyou-page";
    localStorage.removeItem("enquiry_proj_id");
    localStorage.removeItem("enquiry_type");
    this.contactForm.submit = true;
    this.contactForm.store_id = environment.store_id;
    this.contactForm.subject = "New Enquiry";
    this.contactForm.leadtype = "Contact Page";
    if(this.commonService.application_setting.enquiry_email) this.contactForm.to_mail = this.commonService.application_setting.enquiry_email;

      this.contactForm.website_url = window.location.href;
      this.contactForm.lead_source = "SA Website";           
      if(isPlatformBrowser(this.platformId)) {
        if(sessionStorage.getItem("website_url")) this.contactForm.website_url = sessionStorage.getItem("website_url"); 
        if(sessionStorage.getItem("lead_source")) this.contactForm.lead_source = sessionStorage.getItem("lead_source");    
      }   
     
    this.storeApi.CONTACT_US(this.contactForm).subscribe(result => {       
      if(result.status) 
      {
          setTimeout(() => {
            this.zohoForm.nativeElement.submit();
            this.contactForm.submit = false;
            this.contactForm = {};
            this.success_alert = result.status;     
          }, 1000);          
      }
      else {
        this.alert_msg = "Network error, try again later";
        console.log("response", result);
      }
      setTimeout(() => { this.alert_msg = null; }, 3000);
    });
  }

}