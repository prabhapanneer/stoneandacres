import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { PropertiesService } from '../../../services/properties.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})

export class PolicyComponent implements OnInit {

  pageLoader: boolean; policy_details: any;
  template_setting: any = environment.template_setting;

  constructor(private router: Router, private cs: CommonService, private ps: PropertiesService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    let pageUrl = this.router.url.split('?')[0];
    if(pageUrl=="/privacy-policy") {
      if(!this.cs.privacy_policy) {
        this.pageLoader = true;
        this.ps.POLICY_DETAILS("privacy").subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.cs.privacy_policy = result.data;
            this.cs.privacy_policy.content = this.sanitizer.bypassSecurityTrustHtml(this.cs.privacy_policy.content);
          }
          else {
            console.log("response", result);
            this.cs.privacy_policy = { title: "Privacy Policy", content: "" };
          }
          this.policy_details = this.cs.privacy_policy;
        });
      }
      else this.policy_details = this.cs.privacy_policy;
    }
    if(pageUrl=="/shipping-policy") {
      if(!this.cs.shipping_policy) {
        this.pageLoader = true;
        this.ps.POLICY_DETAILS("shipping").subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.cs.shipping_policy = result.data;
            this.cs.shipping_policy.content = this.sanitizer.bypassSecurityTrustHtml(this.cs.shipping_policy.content);
          }
          else {
            console.log("response", result);
            this.cs.shipping_policy = { title: "Shipping Policy", content: "" };
          }
          this.policy_details = this.cs.shipping_policy;
        });
      }
      else this.policy_details = this.cs.shipping_policy;
    }
    else if(pageUrl=="/cancellation-policy") {
      if(!this.cs.cancellation_policy) {
        this.pageLoader = true;
        this.ps.POLICY_DETAILS("cancellation").subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.cs.cancellation_policy = result.data;
            this.cs.cancellation_policy.content = this.sanitizer.bypassSecurityTrustHtml(this.cs.cancellation_policy.content);
          }
          else {
            console.log("response", result);
            this.cs.cancellation_policy = { title: "Cancellation Policy", content: "" };
          }
          this.policy_details = this.cs.cancellation_policy;
        });
      }
      else this.policy_details = this.cs.cancellation_policy;
    }
    else if(pageUrl=="/terms-and-conditions") {
      if(!this.cs.terms_conditions) {
        this.pageLoader = true;
        this.ps.POLICY_DETAILS("terms_conditions").subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.cs.terms_conditions = result.data;
            this.cs.terms_conditions.content = this.sanitizer.bypassSecurityTrustHtml(this.cs.terms_conditions.content);
          }
          else {
            console.log("response", result);
            this.cs.terms_conditions = { title: "Terms & Conditions", content: "" };
          }
          this.policy_details = this.cs.terms_conditions;
        });
      }
      else this.policy_details = this.cs.terms_conditions;
    }
  }

}