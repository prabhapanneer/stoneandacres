import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./customization.component.scss']
})

export class CustomizationComponent {

  imgBaseUrl: string = environment.img_baseurl;

  constructor(public cs: CommonService) { }

  openCustomDetails() {
    this.cs.customView = false;
    this.cs.measurementView = false;
    this.cs.notesView = false;
    if(this.cs.selected_model) {
      if(this.cs.selected_model.custom_list.length) this.cs.customView = true;
      else if(this.cs.selected_model.mm_sets.length) this.cs.measurementView = true;
      else if(this.cs.selected_model.notes_list.length) this.cs.notesView = true;
    }
  }

}