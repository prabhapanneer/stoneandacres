import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-others',
  templateUrl: './others.component.html',
  styleUrls: ['./others.component.scss']
})

export class OthersComponent implements OnInit {

  leftLogo: boolean;
  template_setting: any = environment.template_setting;
  imgBaseUrl: string = environment.img_baseurl;

  constructor(public router: Router, public cs: CommonService) { }

  ngOnInit(): void {
    if(environment.header_type=='type-1' || environment.header_type=='type-6' || environment.header_type=='type-7') {
      this.leftLogo = true;
    }
  }

}