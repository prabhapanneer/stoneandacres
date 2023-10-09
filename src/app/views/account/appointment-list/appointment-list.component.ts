import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';
import { CurrencyConversionService } from '../../../services/currency-conversion.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})

export class AppointmentListComponent implements OnInit {

  list: any = [];
  pageLoader: boolean;
  page: number = 1; pageSize: number = 10;
  template_setting: any = environment.template_setting;

  constructor(private api: ApiService, public cs: CommonService, public cc: CurrencyConversionService) { }

  ngOnInit(): void {
    this.pageLoader = true;
    this.api.USER_APPOINTMENTS().subscribe(result => {
      if(result.status) {
        this.list = result.list;
        for(let obj of this.list) {
          obj.temp_price = (obj.service_price/obj.currency_type.country_inr_value).toFixed(2);
        }
      }
      else console.log("response", result);
      setTimeout(() => { this.pageLoader = false; }, 500);
    });
  }

}
