import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import { StoreApiService } from 'src/app/services/store-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-land-owners',
  templateUrl: './land-owners.component.html',
  styleUrls: ['./land-owners.component.scss']
})
export class LandOwnersComponent implements OnInit {

  landWonerForm: any = {}; pageLoader: boolean;
  alert_msg: string; success_alert: boolean;
  template_setting: any = environment.template_setting;
  currentYear:any;

  constructor(private storeApi: StoreApiService, public commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
    this.alert_msg = null; this.landWonerForm = {};
    this.pageLoader = true;
    this.currentYear = new Date().getFullYear();
    setTimeout(() => { this.pageLoader = false; }, 500);
  }

  onSubmit(){
    this.landWonerForm.type = "For Land Owners";
    this.emailBody(this.landWonerForm).then((bodyContent)=>{
      this.landWonerForm.store_id = environment.store_id; 
      this.landWonerForm.subject = "Land Owners Enquiry";
      this.landWonerForm.mail_content = bodyContent;      
      this.landWonerForm.to_mail = "prabha1094@gmail.com";
      this.landWonerForm.cc_mail = "nandhakumar26092000@gmail.com";
      this.landWonerForm.type = this.landWonerForm.type;
      this.landWonerForm.form_data = { name: this.landWonerForm.name, email:this.landWonerForm.email, mobile: this.landWonerForm.mobile, message: this.landWonerForm.message, location: this.landWonerForm.location, land_extend:{Landextent_name: this.landWonerForm.Landextent, Landextent_type: this.landWonerForm.Landextent_type}};
      this.storeApi.MAIL(this.landWonerForm).subscribe((result)=>{
        if(result.status) {
          this.router.navigate(["/thankyou-page"]);
        }
        else console.log("response", result)
      })
    })
  }

  // body content for email
  async emailBody(formData){
    var bodyContent = "<html lang='en'>";
        bodyContent += "<head>";
        bodyContent +="<meta charset='utf-8'>";
        bodyContent +="<meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'>";
        bodyContent +="<title>Demo Store</title>";
        bodyContent +="<link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap' rel='stylesheet'>";
        bodyContent +="</head>";

        bodyContent +="<body style='margin:0px;padding:0;background-color:#f7f7f7;font-size:14px;'>";
        bodyContent +="<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' style='background-color:#f7f7f7;font-family: Poppins, sans-serif!important;font-size:14px;color:#3d3d3d;line-height:1.5;width:100%;min-width:100%;'>";
        bodyContent +="<tbody>";
        bodyContent +="<tr>";
        bodyContent +="<td align='center' valign='top'>";
        bodyContent +="<table border='0' cellpadding='0' cellspacing='0' width='700' style='width:700px;background-color:#ffffff;font-family: Poppins, sans-serif!important;'>";
        bodyContent +="<tbody>";
        bodyContent +="<tr>";
        bodyContent +="<td align='center' valign='top' width='100%' style='width:100%;min-width:100%;background-color:#ffffff;font-family: Poppins, sans-serif!important;'>";
        bodyContent +="<table cellpadding='0' border='0' cellspacing='0' width='100%' style='width:100%;min-width:100%;padding:0 30px;'>";
        bodyContent +="<tbody>";
        bodyContent +="<tr>";
        bodyContent +="<td align='center' valign='middle' width='100%' style='width:100%;min-width:100%'>"; 
        bodyContent +="<img src='https://yourstore.io/api/uploads/624fd5a8a96c721d4bef5bc5/mail_logo.png?v=1660062628048' alt='Demo Store' style='vertical-align:middle;clear:both;width:auto;height:80px;padding-top:20px;padding-bottom:30px'>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="<tr>";
        bodyContent +="<td align='center' valign='middle' style='padding:0'>";
        bodyContent +="<h1 style='font-size:24px;font-weight:600;margin:0;text-align:center;padding-bottom: 30px;color: rgba(0, 0, 0, 0.7);font-family: Poppins, sans-serif!important;'>New Enquiry</h1>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="<tr>";
        bodyContent +="<td align='center' valign='middle' style='padding:0'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>Hey Team,</p>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>You have a new land owners enquiry!</p>";
                            
        bodyContent +="</td>";
        bodyContent +="</tr>";
                 
        bodyContent +="</tbody>";
        bodyContent +="</table>";
        bodyContent +="<table border='0' cellpadding='0' cellspacing='0' width='500' style='width:100%;min-width:100%;padding:0 30px '>";
        bodyContent +="<tbody>";
        bodyContent +="<tr>";
        bodyContent +="<td colspan='2'  align='left'  width='100%'>";
        bodyContent +="<p style='font-size:15px;font-weight:600;margin:0;padding-top:10px;padding-bottom: 15px;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: 'Poppins', sans-serif!important;'>Customer Contact Details</p>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="<tr>";
        bodyContent +="<td colspan='2'>";
        bodyContent +="<table>";
        bodyContent +="<tr>";
        bodyContent +="<td align='left' valign='top' width='15%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Name</p>";
        bodyContent +="</td>";  
        bodyContent +="<td align='left' valign='top' width='1%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>:</p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='84%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##name## </b></p>";
        bodyContent +="</td>";  
        bodyContent +="</tr>";  
  
        bodyContent +="<tr>";
        bodyContent +="<td align='left' valign='top' width='15%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Phone</p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='1%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent +="</td>"; 
        bodyContent +="<td align='left' valign='top' width='84%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##mobile## </b></p>";
        bodyContent +="</td>"; 
        bodyContent +="</tr>"; 
  
        bodyContent +="<tr>";
        bodyContent +="<td align='left' valign='top' width='15%'>"; 
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Email</p>";
        bodyContent +="</td>";  
        bodyContent +="<td align='left' valign='top' width='1%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='84%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##email## </b></p>";
        bodyContent +="</td>"; 
        bodyContent +="</tr>"; 
  
        bodyContent +="<tr>";
        bodyContent +="<td align='left' valign='top' width='15%'>"; 
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Location</p>";
        bodyContent +="</td>";  
        bodyContent +="<td align='left' valign='top' width='1%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='84%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##location## </b></p>";
        bodyContent +="</td>"; 
        bodyContent +="</tr>"; 
           
        bodyContent +="<tr>";
        bodyContent +="<td align='left' valign='top' width='15%'>"; 
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Land Extend</p>";
        bodyContent +="</td>";  
        bodyContent +="<td align='left' valign='top' width='1%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='84%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##landextent## </b></p>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="</table>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
                 
        bodyContent +="</tbody>";
        bodyContent +="</table>";
                
        bodyContent +="<table border='0' cellpadding='0' cellspacing='0' width='500' style='width:100%;min-width:100%;padding:0 30px 20px;'>";
        bodyContent +="<tbody>";

        bodyContent +="<tr>";
        bodyContent +="<td colspan='4' align='left' valign='top' width='100%' style='width:100%;min-width:100%;border-bottom:2px solid rgba(0, 0, 0, 0.1)'>";
        bodyContent +="<p style='font-size:15px;font-weight:600;margin:0;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: Poppins, sans-serif!important;'>&nbsp; </p>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="<tr>";
        bodyContent +="<td align='left' style='width:20%;padding-top:20px'>";
        bodyContent +="<div style='margin-bottom:0px;display:table;justify-content:flex-start;position: relative;' align='left'>" ;
        bodyContent +="<a align='left' style='display:flex;align-items:center!important;justify-content:flex-start;font-weight:500;text-decoration: none; padding-right:20px;align-items:center!important;' href='https://yourstore.io' target='_blank'>";
        bodyContent +="<img src='https://www.yssentials.com/mail-template/foot-logo.png' style='width:150px; height: auto;vertical-align: middle!important;' alt='Yourstore'>";
        bodyContent +="</a> </div>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' style='width:2%;padding-top:20px'>";
        bodyContent +="<p style='width:50px'>&nbsp;</p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' style='width:2%;padding-top:20px'>";
        bodyContent +="<p style='width:50px'>&nbsp;</p>";
        bodyContent +="</td>";
        bodyContent +="<td align='right' style='width:76%;padding-top:20px'>";
        bodyContent +="<p style='font-size:12px;font-weight:500;margin:0;padding-top:10px;text-align:right;padding-bottom: 15px;color: rgba(0, 0, 0, 0.3);letter-spacing: 0.05em;font-family: Poppins, sans-serif!important;'>© ##copy_year## ";
        bodyContent +="<a style='text-decoration: underline;color: rgba(0, 0, 0, 0.3)!important;font-weight:bold; text-decoration: none;font-family: Poppins, sans-serif!important;' href='https://www.onetuft.com' target='_blank'>Stone & Acres.</a> All Rights Reserved. </p>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="</tbody>";
        bodyContent +="</table>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="</tbody>";
        bodyContent +="</table>";
        bodyContent +="</td>";
        bodyContent +="</tr>";
        bodyContent +="</tbody>";
        bodyContent +="</table>";
        bodyContent +="</body>";
        bodyContent +="</html>";

        bodyContent = bodyContent.replace("##name##", formData.name);
        bodyContent = bodyContent.replace("##mobile##", formData.mobile);
        bodyContent = bodyContent.replace("##email##", formData.email);
        bodyContent = bodyContent.replace("##location##", formData.location);
        bodyContent = bodyContent.replace("##landextent##", formData.landextent);
        bodyContent = bodyContent.replace("##copy_year##", this.currentYear);

        return bodyContent;
        
  }
}
