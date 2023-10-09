import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent {

  template_setting: any = environment.template_setting;

  constructor(public cs: CommonService) { }

}