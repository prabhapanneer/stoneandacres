import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})

export class FeedbackComponent implements OnInit {

  feedForm: any = {};
  feedbackSuccess: boolean; feedbackFailure: boolean;
  template_setting: any = environment.template_setting;

  constructor(private api: ApiService, public cs: CommonService) { }

  ngOnInit(): void {
    this.feedForm = { quality: "5", pricing: "5", shipping: "5", comment: null };
  }

  onSubmit() {
    this.feedForm.submit = true;
    this.feedForm.store_id = this.cs.store_id;
    this.api.FEEDBACK(this.feedForm).subscribe(result => {
      if(result.status) {
        this.feedbackSuccess = true;
        this.feedForm = { quality: "5", pricing: "5", shipping: "5", comment: null };
      }
      else {
        this.feedbackFailure = true;
        console.log("response", result);
      }
      setTimeout(() => { this.feedbackSuccess = false; this.feedbackFailure = false; }, 3000);
    });
  }

}