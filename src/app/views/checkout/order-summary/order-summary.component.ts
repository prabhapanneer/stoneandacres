import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  template: ''
})

export class OrderSummaryComponent implements OnInit {

  constructor(private activeRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      if(params['type'] && params['order_id']) {
        this.router.navigate(['/checkout/order-summary/'+params['type']+'/'+params['order_id']]);
      }
    });
  }

}