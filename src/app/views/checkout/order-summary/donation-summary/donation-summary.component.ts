import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CheckoutService } from '../../../../services/checkout.service';
import { CommonService } from '../../../../services/common.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-donation-summary',
  templateUrl: './donation-summary.component.html',
  styleUrls: ['./donation-summary.component.scss']
})

export class DonationSummaryComponent implements OnInit {

  pageLoader: boolean;
  order_details: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    private activeRoute: ActivatedRoute, private router: Router, public cs: CommonService, private cApi: CheckoutService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.pageLoader = true;
      this.cApi.DONATION_DETAILS(params['order_id']).subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) this.order_details = result.data;
        else {
          console.log("response", result);
          this.router.navigate(["/"]);
        }
      });
    });
  }

}