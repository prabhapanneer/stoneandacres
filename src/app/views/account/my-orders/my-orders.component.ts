import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})

export class MyOrdersComponent implements OnInit {

  template_setting: any = environment.template_setting;
  
  constructor(public commonService: CommonService) {
    delete this.commonService.order_search;
    delete this.commonService.coupon_search;
  }

  ngOnInit() {
  }

}