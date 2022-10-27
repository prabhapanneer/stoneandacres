import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';
import { StoreApiService } from 'src/app/services/store-api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customerForm: any = {}; pageLoader: boolean;
  alert_msg: string; success_alert: boolean;
  template_setting: any = environment.template_setting;
  projectList:any={}; currentYear:any;
  constructor(private storeApi: StoreApiService, public commonService: CommonService, public router: Router) { }

  ngOnInit(): void {
    this.alert_msg = null; this.customerForm = {};
    this.pageLoader = true;
    let filterType = "all";
    this.currentYear = new Date().getFullYear();
    this.storeApi.FILTERED_PRODUCT_LIST({ type: filterType }).subscribe(result => {
      setTimeout(() => { this.pageLoader = false; }, 500);
      if(result.status) {
        this.projectList = result;
      }
      else console.log("response", result);
    });
  }

  onSubmit(){
    localStorage.removeItem("enquiry_proj_id");
    localStorage.removeItem("enquiry_type");
    this.customerForm.submit = true;
    this.customerForm.type = "Customer";
    this.emailBody(this.customerForm).then((bodyContent)=>{
      this.customerForm.store_id = environment.store_id;
      this.customerForm.subject = "Customer Enquiry";
      this.customerForm.mail_content = bodyContent;      
      this.customerForm.to_mail = "contact@stoneandacres.com";
      this.customerForm.cc_mail = "prabha1094@gmail.com";
      this.customerForm.type = this.customerForm.type;
      this.customerForm.form_data = { name: this.customerForm.name, email:this.customerForm.email, mobile: this.customerForm.mobile, message: this.customerForm.message };
      this.storeApi.MAIL(this.customerForm).subscribe((result)=>{
        if(result.status) {
          setTimeout(()=>{
            let zohourl = 'https://crm.zoho.com/crm/WebToLeadForm?xnQsjsdp=f6f7384c8d22675f81dd9671ac44b92bb9604e92c1248f154accb7a54c5158f2&zc_gad&xmIwtLD=d24eb38063b01d62d67919337c899972d97c3986eb1c9294bc609eae6d438bde&actionType=TGVhZHM=&returnURL=https://www.stoneandacres.com&Last Name='+this.customerForm.name+'&Mobile='+this.customerForm.mobile+'&Email='+this.customerForm.email+'&LEADCF15='+this.customerForm.project+'&Description='+this.customerForm.message+'&LEADCF11='+this.customerForm.type;
            try {
              let result =  this.storeApi.ZOHO_ENQUIRY(zohourl);
              result.then((res)=>{
                this.customerForm.submit = false;
                this.router.navigate(["/enquiry/customer-enquiry-thankyou-page"]);
              })
              } catch (error) {
              console.log("err",error);
            }      
          },500);          
        }
        else console.log("response", result)
      })
    })   
  }

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
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:center;padding-bottom: 10px;color: rgba(0, 0, 0, 0.5);font-family: Poppins, sans-serif!important;'>You have a new customer enquiry!</p>";
                            
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
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Project</p>";
        bodyContent +="</td>";  
        bodyContent +="<td align='left' valign='top' width='1%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='84%'>";  
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##project## </b></p>";
        bodyContent +="</td>";
        bodyContent +="</tr>";

        bodyContent +="<tr>";
        bodyContent +="<td align='left' valign='top' width='15%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'>Message</p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='1%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'> : </p>";
        bodyContent +="</td>";
        bodyContent +="<td align='left' valign='top' width='84%'>";
        bodyContent +="<p style='font-size:14px;font-weight:500;margin:0;text-align:left;padding:10px 0px 10px 10px;color: rgba(0, 0, 0, 0.64);font-family: 'Poppins', sans-serif!important;'><b> ##message## </b></p>";
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
        bodyContent +="<a style='text-decoration: underline;color: rgba(0, 0, 0, 0.3)!important;font-weight:bold; text-decoration: none;font-family: Poppins, sans-serif!important;' href='https://www.stoneandacres.com/' target='_blank'>Stone & Acres.</a> All Rights Reserved. </p>";
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
        bodyContent = bodyContent.replace("##project##", formData.project);
        bodyContent = bodyContent.replace("##message##", formData.message);
        bodyContent = bodyContent.replace("##copy_year##", this.currentYear);

        return bodyContent;
        
  }

}
