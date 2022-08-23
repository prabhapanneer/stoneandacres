import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { StoreApiService } from '../../../services/store-api.service';
import { CommonService } from '../../../services/common.service';
declare const $: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent {

  subscribeForm: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  bandLogo: string = environment.band_logo;
  currentYear: any = (new Date()).getFullYear();
  emiForm: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private storeApi: StoreApiService, public commonService: CommonService, public router: Router) { }
  openemi(modalName) {
    modalName.show();
  }
  onCalc()
  {
    console.log(this.emiForm)
    let princ = this.emiForm.loan_amount;
  let term  = this.emiForm.duration;
  let intr   = (this.emiForm.interest_rate/100)/12;

  this.emiForm.calc = princ * intr / (1 - (Math.pow(1/(1 + intr), term*12)));
  let x = this.emiForm.calc.toFixed(0);
  this.emiForm.result = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(x);
  console.log("EMI",this.emiForm.calc.toFixed(0));
  }
  onSubscribe(modalName) {
    this.subscribeForm.submit = true;
    this.subscribeForm.store_id = environment.store_id;
    this.storeApi.SUBSCRIBE_NEWSLETTER(this.subscribeForm).subscribe(result => {
      this.subscribeForm.status = result.status;
      if(result.status) this.subscribeForm.alert_msg = "Thank you for subscribing.";
      else {
        this.subscribeForm.alert_msg = "Error! Try again later.";
        console.log("response", result);
      }
      setTimeout(() => { modalName.hide(); }, 2000);
    });
  }

  linkNavigate(x) {
    if(x.link_type == 'internal') {
      this.router.navigate([x.link]);
    }
    else if(isPlatformBrowser(this.platformId) && x.link_type == 'external') {
      window.open(x.link, "_blank");
    }
  }

  // btnsubscribe()
  // {
  //   $('.btn-input').addClass('active');
  // }

  ngOnInit() {
    $(".btn-input").hover(function() { $(this).toggleClass("active"); });
  }

}