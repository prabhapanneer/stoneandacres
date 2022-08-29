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
  constructor( public router: Router,  private activeRoute: ActivatedRoute, private storeApi: StoreApiService) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params= params.id;
      if(params){
        this.storeApi.PRODUCT_DETAILS({ product_id: this.params }).subscribe(result => {
          if(result.status) {
            this.productDetails = result.data;
            this.myFileName = this.productDetails.name+'.pdf';
            this.fileUrl = 'https://yourstore.io/'+this.productDetails.brochure;
          }
        });
      }
      if(!params){ setTimeout(() => { this.router.navigate(['/']) }, 10000); }      
    });
    
  }

}
