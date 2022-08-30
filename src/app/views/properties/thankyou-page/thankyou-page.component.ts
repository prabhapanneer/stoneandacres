import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { StoreApiService } from 'src/app/services/store-api.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-thankyou-page',
  templateUrl: './thankyou-page.component.html',
  styleUrls: ['./thankyou-page.component.scss']
})
export class ThankyouPageComponent implements OnInit {
  type:boolean=false; params:any;productDetails:any={};
  imgBaseUrl: string = environment.img_baseurl;
  myFileName:any=String; fileUrl:any=String;
  btn_loader:boolean=false;

  constructor( public router: Router,  private activeRoute: ActivatedRoute, private storeApi: StoreApiService) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params= params.id;
      if(params.id){
        this.storeApi.PRODUCT_DETAILS({ product_id: this.params }).subscribe(result => {
          if(result.status) {
            this.productDetails = result.data;
            this.myFileName = this.productDetails.name+'.pdf';
            this.fileUrl = 'https://yourstore.io/'+this.productDetails.brochure;
          }
        });
      }
      else{ setTimeout(() => { this.router.navigate(['/']) }, 10000); }      
    });
    
  }

  btnClick(){
    this.btn_loader = true;        
    setTimeout(()=>{ 
      document.getElementById('getPdf').click();
      this.btn_loader = false;}, 500)
  }

}
