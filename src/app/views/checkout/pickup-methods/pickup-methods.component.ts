import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { CheckoutService } from '../../../services/checkout.service';
import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pickup-methods',
  templateUrl: './pickup-methods.component.html',
  styleUrls: ['./pickup-methods.component.scss']
})

export class PickupMethodsComponent implements OnInit {

  pageLoader: boolean; btnLoader: boolean;
  checkout_details: any = {};
  list: any = []; slot_list: any = [];
  template_setting: any = environment.template_setting;
  selectedDayIndex: number = 0; selectedSlotIndex: number = 0;
  storeSubscription: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private api: ApiService, private cApi: CheckoutService,
    private router: Router, public cs: CommonService, private datePipe: DatePipe
  ) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getData();
    });
  }

  ngOnInit(): void {
    this.pageLoader = true;
    if(this.cs.storeDataLoaded) this.getData();
  }

  getData(): void {
    if(this.cs.ys_features.indexOf('store_pickup')!=-1) {
      let openingDays = this.cs.store_properties.opening_days;
      let startDate = new Date(new Date().setDate(new Date().getDate() + this.cs.application_setting.sp_delay_duration));
      if(this.cs.application_setting.sp_delay_type=='hour') {
        startDate = new Date(new Date().setHours(new Date().getHours() + this.cs.application_setting.sp_delay_duration));
      }
      let setDayIndex = false;
      for(let i=0; i<7; i++)
      {
        let nxt = 0;
        if(i>0) nxt = 1;
        let tempDay = new Date(startDate.setDate(startDate.getDate() + nxt));
        let dayIndex = openingDays.findIndex(obj => obj.active==true && obj.opening_hrs.length && obj.code==tempDay.getDay());
        if(dayIndex!=-1) {
          if(!setDayIndex) {
            this.selectedDayIndex = i;
            setDayIndex = true;
          }
          this.list.push({ date: tempDay, opening_hrs: openingDays[dayIndex].opening_hrs });
        }
        else this.list.push({ date: tempDay, opening_hrs: [] });
      }
      this.buildSlotList();
      // user details
      if(this.cs.customer_token) {
        this.api.USER_DETAILS().subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status && result.data.checkout_details) {
            this.checkout_details = result.data.checkout_details;
            if(!this.checkout_details.item_list || !this.checkout_details.shipping_address) this.router.navigate(["/"]);
          }
          else {
            console.log("response", result);
            this.router.navigate(["/"]);
          }
        });
      }
      else if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("by_cd") && sessionStorage.getItem("by_ca")) {
        setTimeout(() => { this.pageLoader = false; }, 500);
        this.checkout_details = this.cs.decode(sessionStorage.getItem("by_cd"));
        if(!this.checkout_details.item_list || !this.checkout_details.shipping_address) this.router.navigate(["/"]);
      }
      else this.router.navigate(["/"]);
    }
    else this.router.navigate(["/"]);
  }

  buildSlotList() {
    this.slot_list = []; this.selectedSlotIndex = 0;
    let setSlotIndex = false; let newIndex = 0;
    if(this.list[this.selectedDayIndex]) {
      let selectedDate = this.list[this.selectedDayIndex].date;
      for(let openingHrs of this.list[this.selectedDayIndex].opening_hrs)
      {
        let timeStart = new Date("01/01/2007 "+openingHrs.from).getHours();
        let timeEnd = new Date("01/01/2007 "+openingHrs.to).getHours();
        let slotCount = (((timeEnd - timeStart)*60) / this.cs.application_setting.sp_slot_duration);
        if(slotCount!=Infinity) {
          for(let j=0; j<slotCount; j++)
          {
            let startDateTime = this.datePipe.transform(new Date(), 'dd MMM y ')+this.datePipe.transform(selectedDate, 'hh:mm a');
            let fromDate = this.datePipe.transform(selectedDate, 'dd MMM y ')+openingHrs.from;
            let fromSlot = (new Date(fromDate).getTime() + ((this.cs.application_setting.sp_slot_duration*j)*60000));
            let toSlot = (new Date(fromDate).getTime() + ((this.cs.application_setting.sp_slot_duration*(j+1))*60000));
            let jsonData = { from: new Date(fromSlot), to: new Date(toSlot), available: false };
            if(new Date(fromSlot) >= new Date(startDateTime)) {
              jsonData.available = true;
              if(!setSlotIndex) {
                this.selectedSlotIndex = newIndex;
                setSlotIndex = true;
              }
            }
            this.slot_list.push(jsonData);
            newIndex++;
          }
        }
      }
      if(this.slot_list.findIndex(obj => obj.available)==-1) {
        this.list[this.selectedDayIndex].opening_hrs = [];
        this.selectedDayIndex += 1;
        this.buildSlotList();
      }
    }
  }

  onConfirm() {
    this.btnLoader = true;
    let deliveryDate = this.datePipe.transform(this.slot_list[this.selectedSlotIndex].from, 'dd MMM y')+" ("+this.datePipe.transform(this.slot_list[this.selectedSlotIndex].from, 'EEEE')+")";
    let deliveryTime = this.datePipe.transform(this.slot_list[this.selectedSlotIndex].from, 'hh:mm a')+" - "+this.datePipe.transform(this.slot_list[this.selectedSlotIndex].to, 'hh:mm a');
    let sendData: any = {
      sid: this.cs.session_id, shipping_address: this.checkout_details.shipping_address._id,
      order_type: this.checkout_details.order_type, currency_type: this.cs.selected_currency.country_code,
      shipping_method: { delivery_date: deliveryDate, delivery_time: deliveryTime }
    };
    sendData.item_list = this.cs.getItemList(this.checkout_details.item_list);
    if(this.checkout_details.quick_order_id) sendData.quick_order_id = this.checkout_details.quick_order_id;
    this.cApi.PICKUP_DETAILS(sendData).subscribe(result => {
      if(result.status) {
        this.checkout_details.shipping_method = result.data.shipping_method;
        if(this.cs.customer_token) {
          this.api.USER_UPDATE({ checkout_details: this.checkout_details }).subscribe(result => {
            if(result.status) this.router.navigate(["/checkout/order-details/product"]);
            else {
              console.log("response", result);
              this.router.navigate(["/"]);
            }
          });
        }
        else {
          if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("by_cd", this.cs.encode(this.checkout_details));
          this.router.navigate(["/checkout/order-details/product"]);
        }
      }
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
    });
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}