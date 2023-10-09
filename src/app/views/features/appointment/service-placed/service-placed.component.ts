import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-service-placed',
  templateUrl: './service-placed.component.html',
  styleUrls: ['./service-placed.component.scss']
})

export class ServicePlacedComponent implements OnInit {

  constructor(public cs: CommonService, private router: Router) { }

  ngOnInit(): void {
    if(this.cs.customer_token) {
      // 
    }
    else this.router.navigate(['/account']);
  }

}