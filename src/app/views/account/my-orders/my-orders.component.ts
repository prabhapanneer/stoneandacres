import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})

export class MyOrdersComponent {

  pageLoader: boolean;
  template_setting: any = environment.template_setting;
  
  constructor(public cs: CommonService) {
    delete this.cs.order_search;
    delete this.cs.coupon_search;
    this.pageLoader = true;
    setTimeout(() => { this.pageLoader = false; }, 500);
  }

}