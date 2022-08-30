import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-our-services',
  templateUrl: './our-services.component.html',
  styleUrls: ['./our-services.component.scss']
})
export class OurServicesComponent implements OnInit {

  pageLoader: boolean;btn_loader:boolean=false;
  template_setting: any = environment.template_setting;

  constructor(public commonService: CommonService, public router: Router) { }

  ngOnInit(): void {
  }
  btnClick(){
    this.btn_loader = true;
    setTimeout(()=>{ 
      this.btn_loader = false;
      this.router.navigate(['/land-owners']) }, 500)
  }
}
