import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { FeaturesService } from '../../../../services/features.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { DynamicAssetLoaderService } from '../../../../services/dynamic-asset-loader.service';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss']
})
export class ServiceDetailsComponent implements OnInit {

  service_details: any = {};
  pageLoader: boolean; params: any;
  template_setting: any = environment.template_setting;
  subscription: Subscription; tempSelectDate: any;
  slot_list: any = []; appointmentList: any = [];
  storeSubscription: Subscription;

  constructor(
    private router: Router, private fApi: FeaturesService, private activeRoute: ActivatedRoute, private datePipe: DatePipe,
    public cc: CurrencyConversionService, public cs: CommonService, private assetLoader: DynamicAssetLoaderService
  ) {
    this.subscription = this.cs.currency_type.subscribe(currency => {
      this.findCurrency();
    });
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getData();
    });
  }

  ngOnInit(): void {
    if(this.cs.customer_token) {
      this.pageLoader = true;
      if(this.cs.storeDataLoaded) this.getData();
    }
    else this.router.navigate(['/account']);
  }

  getData(): void {
    this.pageLoader = true;
    if(this.cs.ys_features.indexOf('appointment_scheduler')!=-1) {
      this.activeRoute.params.subscribe((params: Params) => {
        this.params = params;
        this.assetLoader.load('bs-datepicker').then(data => {
          this.fApi.APPOINTMENT_SERVICE_DETAILS(params['id']).subscribe(result => {
            if(result.status) {
              this.service_details = result.data;
              this.service_details.selected_date = new Date();
              if(this.tempSelectDate) this.service_details.selected_date = this.tempSelectDate;
              this.service_details.minDate = new Date();
              this.service_details.maxDate = new Date(new Date().setDate(new Date().getDate() + this.service_details.upcoming_days));
              this.findCurrency();
              this.getSlotList();
            }
            else console.log("response", result);
          });
        });
      });
    }
  }

  getSlotList() {
    this.slot_list = [];
    this.pageLoader = true;
    delete this.service_details.tempIndex;
    this.tempSelectDate = this.service_details.selected_date;
    let sendData = { store_id: this.cs.store_id, service_id: this.service_details._id, booking_date: this.service_details.selected_date };
    this.fApi.APPOINTMENT_LIST(sendData).subscribe(result => {
      setTimeout(() => { this.pageLoader = false; }, 500);
      if(result.status) {
        let appointmentList = result.list;
        let selectedDay = new Date(this.service_details.selected_date).getDay();
        let dayIndex = this.service_details.available_days.findIndex(obj => obj.active && obj.code==selectedDay);
        if(dayIndex != -1) {
          let serviceHrs = this.service_details.available_days[dayIndex].opening_hrs;
          if(serviceHrs.length) {
            let formatDate = this.formatDate(this.service_details.selected_date);
            for(let x of serviceHrs) {
              let fromDateTime = formatDate+' '+x.from;
              let toDateTime = formatDate+' '+x.to;
              let fromMins = new Date(fromDateTime).getHours()*60;
              fromMins += new Date(fromDateTime).getMinutes();
              let toMins = new Date(toDateTime).getHours()*60;
              toMins += new Date(toDateTime).getMinutes();
              let slotsCount = Math.floor((toMins - fromMins)/this.service_details.service_duration);
              for(let i=0; i<slotsCount; i++)
              {
                let slotStartDate = new Date(new Date(fromDateTime).setMinutes(new Date(fromDateTime).getMinutes() + (this.service_details.service_duration*i)));
                let slotData = { slot_date: slotStartDate, disable: true };
                if(slotStartDate > new Date()) {
                  slotData.disable = false;
                  let existBookingCount = appointmentList.filter(obj => this.datePipe.transform(new Date(obj.booking_date), 'h:mm a')==this.datePipe.transform(slotStartDate, 'h:mm a')).length;
                  if(this.service_details.no_of_concurrent_services > existBookingCount) {
                    if(!this.service_details.tempIndex) {
                      this.service_details.tempIndex = i+1;
                      this.service_details.booking_date = slotStartDate;
                    }
                  }
                  else slotData.disable = true;
                }
                this.slot_list.push(slotData);
              }
            }
          }
        }
      }
      else console.log("response", result);
    });
  }

  confirmBooking(modalName) {
    let formData: any = {
      store_id: this.cs.store_id, service_id: this.service_details._id,
      currency_type: this.cs.selected_currency, booking_date: this.service_details.booking_date
    };
    if(this.cs.user_details?.mobile) formData.contact_no = this.cs.user_details.mobile;
    this.service_details.submit = true;
    this.fApi.CREATE_APPOINTMENT(formData).subscribe(result => {
      this.service_details.submit = false;
      if(result.status) {
        modalName.hide();
        this.router.navigate(["/service-confirmed/"+result.data._id]);
      }
      else {
        this.service_details.error_msg = result.message;
        console.log("response", result);
      }
    });
  }

  formatDate(date) {
    let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
    if(month.length < 2) month = '0' + month;
    if(day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  findCurrency() {
    this.service_details.temp_price = this.cc.CALC_WO_AC(this.service_details.price);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.storeSubscription.unsubscribe();
  }

}
