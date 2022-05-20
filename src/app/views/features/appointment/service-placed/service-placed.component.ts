import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-service-placed',
  templateUrl: './service-placed.component.html',
  styleUrls: ['./service-placed.component.scss']
})
export class ServicePlacedComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute, public commonService: CommonService) { }

  ngOnInit(): void {
    if(this.commonService.ys_features.indexOf('appointment_scheduler')!=-1) {

    }
    else this.router.navigate(["/services"]);
  }

}
