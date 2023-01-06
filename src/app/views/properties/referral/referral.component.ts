import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import { StoreApiService } from 'src/app/services/store-api.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { isPlatformBrowser, formatDate, DatePipe } from '@angular/common';
import { DynamicAssetLoaderService } from '../../../services/dynamic-asset-loader.service';


@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {

  referralForm: any = {}; pageLoader: boolean;
  alert_msg: string; success_alert: boolean;
  template_setting: any = environment.template_setting;
  projectList: any = {}; currentYear: any;
  @ViewChild('zohoForm', { static: false }) zohoForm: ElementRef; enquiry_list: any = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private storeApi: StoreApiService, public commonService: CommonService, private router: Router, private activeRoute: ActivatedRoute,
    private assetLoader: DynamicAssetLoaderService, private datePipe: DatePipe,) { }

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.alert_msg = null; this.referralForm = {};
      this.pageLoader = true;
      let filterType = "all";
      this.currentYear = new Date().getFullYear();
      this.storeApi.FILTERED_PRODUCT_LIST({ type: filterType }).subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if (result.status) {
          this.projectList = result;
        }
        else console.log("response", result);
      });
    })

  }

  onSubmit() {
    this.assetLoader.load('zoho');
    this.referralForm.current_date = formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    this.referralForm.redirect_url = this.commonService.origin + "/enquiry/referral-enquiry-thankyou-page";
    localStorage.removeItem("enquiry_proj_id");
    localStorage.removeItem("enquiry_type");
    this.referralForm.submit = true;
    this.referralForm.type = "Referral Program";
    this.referralForm.store_id = environment.store_id;
    this.referralForm.subject = "Referral Enquiry";
    this.referralForm.to_mail = "contact@stoneandacres.com";
    this.referralForm.cc_mail = "prabha1094@gmail.com";
    this.referralForm.type = this.referralForm.type;
    this.referralForm.form_data = { name: this.referralForm.name, email: this.referralForm.email, mobile: this.referralForm.mobile, message: this.referralForm.message, location: this.referralForm.location, project: this.referralForm.project, form_type: this.referralForm.type };
    // list status
    this.referralForm.enquiry_list = true;

    this.storeApi.MAIL(this.referralForm).subscribe((result) => {
      this.referralForm.enquiry_list = false;
      console.log("-----", result);
      if (result.status) {
        this.enquiry_list = result.list;
        this.emailBody(this.referralForm).then((bodyContent) => {
          this.referralForm.mail_content = bodyContent;
          this.storeApi.MAIL(this.referralForm).subscribe((result) => {
            if (result.status) {
              this.referralForm.website_url = window.location.href;
              this.referralForm.lead_source = "SA Website";
              if (isPlatformBrowser(this.platformId)) {
                if (sessionStorage.getItem("website_url")) this.referralForm.website_url = sessionStorage.getItem("website_url");
                if (sessionStorage.getItem("lead_source")) this.referralForm.lead_source = sessionStorage.getItem("lead_source");
              }
              setTimeout(() => {
                this.zohoForm.nativeElement.submit();
              }, 1000);
            }
            else console.log("response", result)
          })
        })
      }
      else console.log("response", result)
    })

  }

  async emailBody(formData) {
    var bodyContent = "<html lang='en'>";
    bodyContent += "<head>";
    bodyContent += "<meta charset='utf-8'>";
    bodyContent += "<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>";
    bodyContent += "<title>Demo Store</title>";
    bodyContent += "<link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap' rel='stylesheet'>";
    bodyContent += "</head>";

    bodyContent += "<body style='margin:0px;padding:0;background-color:#f7f7f7;font-size:14px;'>";
    bodyContent += "<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' style='background-color:#f7f7f7;font-family: Poppins, sans-serif!important;font-size:14px;color:#3d3d3d;line-height:1.5;width:100%;min-width:100%;'>";
    bodyContent += "<tbody>";
    bodyContent += "<tr>";
    bodyContent += "<td align='center' valign='top'>";
    bodyContent += "<table border='0' cellpadding='0' cellspacing='0' width='700' style='width:700px;background-color:#ffffff;font-family: Poppins, sans-serif!important;'>";
    bodyContent += "<tbody>";
    bodyContent += "<tr>";
    bodyContent += "<td align='center' valign='top' width='100%' style='width:100%;min-width:100%;background-color:#ffffff;font-family: Poppins, sans-serif!important;'>";
    bodyContent += "<table cellpadding='0' border='0' cellspacing='0' width='100%' style='width:100%;min-width:100%;padding:0 30px;'>";
    bodyContent += "<tbody>";
    bodyContent += "<tr>";
    bodyContent += "<td align='center' valign='middle' width='100%' style='width:100%;min-width:100%'>";
    bodyContent += "<img src='https://yourstore.io/api/uploads/624fd5a8a96c721d4bef5bc5/mail_logo.png?v=1660062628048' alt='Demo Store' style='vertical-align:middle;clear:both;width:auto;height:80px;padding-top:20px;padding-bottom:30px'>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "<tr>";
    bodyContent += "<td align='center' valign='middle' style='padding:0'>";
    bodyContent += "<h1 style='font-size:24px;font-weight:600;margin:0;text-align:center;padding-bottom: 30px;color: rgba(0, 0, 0, 0.7);font-family: Poppins, sans-serif!important;'>New Enquiry</h1>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "<tr>";
    bodyContent += "<td align='center' valign='middle' style='padding:0'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>Hey Team,</p>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>You have a new Referral program enquiry!</p>";

    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "</tbody>";
    bodyContent += "</table>";
    bodyContent += "<table border='0' cellpadding='0' cellspacing='0' width='500' style='width:100%;min-width:100%;padding:0 30px '>";
    bodyContent += "<tbody>";
    bodyContent += "<tr>";
    bodyContent += "<td colspan='2'  align='left'  width='100%'>";
    bodyContent += "<p style='font-size:15px;font-weight:600;margin:0;padding-top:10px;padding-bottom: 15px;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: 'Poppins', sans-serif!important;'>Customer Contact Details</p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "<tr>";
    bodyContent += "<td colspan='2'>";
    bodyContent += "<table>";
    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Name</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>:</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##name## </b> </p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Phone</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##mobile## </b></p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Email</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##email## </b></p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    if (!this.enquiry_list?.length) {
      bodyContent += "<tr>";
      bodyContent += "<td align='left' valign='top' width='19%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Project</p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='1%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top' width='70%'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##project## </b></p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
    }

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Flat / Plot Number</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##flat_number## </b></p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Friend Name</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##friend_name## </b></p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Friend Phone</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##friend_mobile## </b></p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Location</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##friend_location## </b></p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "<tr>";
    bodyContent += "<td align='left' valign='top' width='19%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Project</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='1%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' valign='top' width='70%'>";
    bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##friend_project##</b> </p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "</table>";
    bodyContent += "</td>";
    bodyContent += "</tr>";

    bodyContent += "</tbody>";
    bodyContent += "</table>";

    if (this.enquiry_list?.length) {
      bodyContent += "<table style='text-align: center !important;'' border='0' width='100%'>";
      bodyContent += "<tr>";
      bodyContent += "<td>";
      bodyContent += "<h3>Enquiry Details</h3>";
      bodyContent += "</td>";
      bodyContent += "</tr>";
      bodyContent += "</table>";
      bodyContent += "<div style='margin: 0 30px'>";
      bodyContent += "<table border='1' cellpadding='0' cellspacing='0' width='100%'>";
      bodyContent += "<tr>";
      bodyContent += "<td align='left' valign='top'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins', sans-serif!important;'><b> Date </b></p>";
      bodyContent += "</td>";

      bodyContent += "<td align='left' valign='top' width='35%''>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'><b> Project </b></p>";
      bodyContent += "</td>";
      bodyContent += "<td align='left' valign='top'>";
      bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'><b> Enquiry Type </b></p>";
      bodyContent += "</td>";
      bodyContent += "</tr>";

      this.enquiry_list.forEach((el, i) => {
        console.log("i", i);
        if (typeof el.form_data == 'object') {
          bodyContent += "<tr>";
          bodyContent += "<td align='left' valign='top'>";
          bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'>##created_on" + i + "##";
          bodyContent += "</p>";
          bodyContent += "</td>";
          bodyContent += "<td align='left' valign='top'>";
          bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'>##project" + i + "##";
          bodyContent += "</p>";
          bodyContent += "</td>";
          bodyContent += "<td align='left' valign='top'>";
          bodyContent += "<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px;color: rgba(0, 0, 0, 0.64);font-family: Poppins, sans-serif!important;'>##form_type" + i + "##";
          bodyContent += "</p>";
          bodyContent += "</td>";
          bodyContent += "</tr>";
        }
      });

      bodyContent += "</table>";
      bodyContent += "</div>";
    }

    bodyContent += "<table border='0' cellpadding='0' cellspacing='0' width='500' style='width:100%;min-width:100%;padding:0 30px 20px;'>";
    bodyContent += "<tbody>";

    bodyContent += "<tr>";
    bodyContent += "<td colspan='4' align='left' valign='top' width='100%' style='width:100%;min-width:100%;border-bottom:2px solid rgba(0, 0, 0, 0.1)'>";
    bodyContent += "<p style='font-size:15px;font-weight:600;margin:0;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: Poppins, sans-serif!important;'>&nbsp; </p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "<tr>";
    bodyContent += "<td align='left' style='width:20%;padding-top:20px'>";
    bodyContent += "<div style='margin-bottom:0px;display:table;justify-content:flex-start;position: relative;' align='left'>";
    bodyContent += "<a align='left' style='display:flex;align-items:center!important;justify-content:flex-start;font-weight:500;text-decoration: none; padding-right:20px;align-items:center!important;' href='https://yourstore.io' target='_blank'>";
    bodyContent += "<img src='https://www.yssentials.com/mail-template/foot-logo.png' style='width:150px; height: auto;vertical-align: middle!important;' alt='Yourstore'>";
    bodyContent += "</a> </div>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' style='width:2%;padding-top:20px'>";
    bodyContent += "<p style='width:50px'>&nbsp;</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='left' style='width:2%;padding-top:20px'>";
    bodyContent += "<p style='width:50px'>&nbsp;</p>";
    bodyContent += "</td>";
    bodyContent += "<td align='right' style='width:76%;padding-top:20px'>";
    bodyContent += "<p style='font-size:12px;font-weight:500;margin:0;padding-top:10px;text-align:right;padding-bottom: 15px;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: Poppins, sans-serif!href='https://www.stoneandacres.com/'important;'>© ##copy_year## ";
    bodyContent += "<a style='text-decoration: underline;color: rgba(0, 0, 0, 0.3)!important;font-weight:bold; text-decoration: none;font-family: Poppins, sans-serif!important;'  target='_blank'>Stone & Acres.</a> All Rights Reserved. </p>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "</tbody>";
    bodyContent += "</table>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "</tbody>";
    bodyContent += "</table>";
    bodyContent += "</td>";
    bodyContent += "</tr>";
    bodyContent += "</tbody>";
    bodyContent += "</table>";
    bodyContent += "</body>";
    bodyContent += "</html>"

    bodyContent = bodyContent.replace("##name##", formData.name);
    bodyContent = bodyContent.replace("##mobile##", formData.mobile);
    bodyContent = bodyContent.replace("##email##", formData.email);
    if (!this.enquiry_list?.length) bodyContent = bodyContent.replace("##project##", formData.project);
    else if (this.enquiry_list?.length) {
      for (let i = 0; i < this.enquiry_list?.length; i++) {
        let createdOn = 'NA'; let proName = 'NA'; let formType = 'NA';
        if(this.enquiry_list[i]?.created_on) createdOn = this.datePipe.transform(this.enquiry_list[i]?.created_on, "dd MMM y ");
        if(this.enquiry_list[i]?.form_data.project) proName = this.enquiry_list[i]?.form_data.project;
        if(this.enquiry_list[i]?.form_data.form_type) formType = this.enquiry_list[i]?.form_data.form_type;
        bodyContent = bodyContent.replace("##created_on" + i + "##", createdOn);
        bodyContent = bodyContent.replace("##project" + i + "##", proName);
        bodyContent = bodyContent.replace("##form_type" + i + "##", formType);
      }
    }
    bodyContent = bodyContent.replace("##flat_number##", formData.flat_number);
    bodyContent = bodyContent.replace("##friend_name##", formData.friend_name);
    bodyContent = bodyContent.replace("##friend_mobile##", formData.friend_mobile);
    bodyContent = bodyContent.replace("##friend_location##", formData.friend_location);
    bodyContent = bodyContent.replace("##friend_project##", formData.friend_project);
    bodyContent = bodyContent.replace("##copy_year##", this.currentYear);

    return bodyContent;

  }

}
