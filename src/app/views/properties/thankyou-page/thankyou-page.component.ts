import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { StoreApiService } from 'src/app/services/store-api.service';
import { environment } from 'src/environments/environment';
declare var gtag;

@Component({
  selector: 'app-thankyou-page',
  templateUrl: './thankyou-page.component.html',
  styleUrls: ['./thankyou-page.component.scss']
})
export class ThankyouPageComponent implements OnInit {
  type:boolean=false; params:any;productDetails:any={};
  imgBaseUrl: string = environment.img_baseurl;
  myFileName:any=String; fileUrl:any=String;
  btn_loader:boolean=false; params_type:any;
  project_id:any; enquiry_type: any; brochure_status:boolean;

  constructor( public router: Router,  private activeRoute: ActivatedRoute, private storeApi: StoreApiService, public commonService: CommonService,) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params= params.type;
      let x = this.params.split("-");
      this.params_type = x[0];
      if(localStorage.getItem("enquiry_type")) this.enquiry_type = localStorage.getItem("enquiry_type");
      if(localStorage.getItem("enquiry_proj_id")) this.project_id = localStorage.getItem("enquiry_proj_id");

      if(environment.gtag_conversion_id) gtag('event', 'conversion', {'send_to': environment.gtag_conversion_id});
      if(this.enquiry_type == 'brochure'){
        this.brochure_status = true;
        this.storeApi.PRODUCT_DETAILS({ product_id: this.project_id }).subscribe(result => {
          if(result.status) {
            this.productDetails = result.data;
            this.myFileName = this.productDetails.name+'.pdf';
            this.fileUrl = 'https://yourstore.io/'+this.productDetails.brochure;
          }
        });
      }
      else{ 
        this.brochure_status = false;
        // setTimeout(() => { this.router.navigate(['/']) }, 10000); 
      }      
    });
    
  }

  btnClick(){
    this.btn_loader = true;        
    setTimeout(()=>{ 
      document.getElementById('getPdf').click();
      this.btn_loader = false;}, 500)
  }

  backToHome(){
    localStorage.removeItem("enquiry_proj_id");
    localStorage.removeItem("enquiry_type");
    this.router.navigate(['/']);
  }

}
