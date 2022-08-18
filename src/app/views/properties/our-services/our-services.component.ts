import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.scss']
})
export class OurServicesComponent implements OnInit {

  pageLoader: boolean;
  template_setting: any = environment.template_setting;

  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
  }
}
