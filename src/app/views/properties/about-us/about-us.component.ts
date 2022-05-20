import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  pageLoader: boolean;
  template_setting: any = environment.template_setting;

  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
  }

}
