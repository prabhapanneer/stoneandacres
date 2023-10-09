import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-quotations',
  templateUrl: './my-quotations.component.html',
  styleUrls: ['./my-quotations.component.scss']
})

export class MyQuotationsComponent {

  template_setting: any = environment.template_setting;
  
  constructor(public cs: CommonService) {
    delete this.cs.quot_search;
  }

}