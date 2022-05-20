import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../../../services/common.service';
import { AccordionConfig } from 'ngx-bootstrap/accordion';

export function getAccordionConfig(): AccordionConfig {
  return Object.assign(new AccordionConfig(), { closeOthers: true });
}


@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
  providers: [{ provide: AccordionConfig, useFactory: getAccordionConfig }]
})
export class SellComponent implements OnInit {

  pageLoader: boolean;
  template_setting: any = environment.template_setting;

  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
  }

}
