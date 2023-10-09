import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-quote-status',
  templateUrl: './quote-status.component.html',
  styleUrls: ['./quote-status.component.scss']
})

export class QuoteStatusComponent implements OnInit {

  template_setting: any = environment.template_setting;
  params: any;

  constructor(private activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params = params;
    });
  }

}