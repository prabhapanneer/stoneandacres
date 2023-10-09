import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})

export class CurrencyConversionService {

  currency: any;
  format: any = environment.template_setting.currency_format;

  constructor(private cs: CommonService) {
    if(localStorage.getItem("by_sc")) this.currency = this.cs.decode(localStorage.getItem("by_sc"));
  }

  CALC(price) {
    if(!price) price = 0;
    if(this.cs.selected_currency) {
      this.currency = this.cs.selected_currency;
      let additonalCost: any = 0;
      if(this.currency.additional_charges > 0) {
        let percentage = this.currency.additional_charges/100;
        additonalCost = price*percentage;
      }
      let totalPrice: any = parseFloat(price)+parseFloat(additonalCost);
      let finalPrice = (totalPrice/this.currency.country_inr_value).toFixed(2);
      return parseFloat(finalPrice);
    }
    else return 0;
  }

  CALC_TEXT(number) {
    let convertedValue, returnValue;
    let originalNumber = Math.abs(Number(number));
    if (originalNumber > 0 && originalNumber <= 999) {  
      convertedValue = originalNumber / 100;   
      returnValue = parseFloat(convertedValue).toFixed(2) + " ";
    } 
    else if (originalNumber > 999 && originalNumber <= 99999) {
      convertedValue = originalNumber / 1000;
      returnValue = parseFloat(convertedValue).toFixed(2) + " K";
    } 
    else if (originalNumber > 99999 && originalNumber <= 9999999) {
      convertedValue = originalNumber / 100000;
      returnValue = parseFloat(convertedValue).toFixed(2) + " L";
    } 
    else if (originalNumber > 9999999) {
      convertedValue = originalNumber / 10000000;
      returnValue = parseFloat(convertedValue).toFixed(2) + " C";
    } 
    else returnValue = originalNumber;
    if (number < 0) returnValue = "-" + convertedValue;
    return returnValue;
  }

  CALC_INR_WITH_AC(price) {
    if(!price) price = 0;
    if(this.cs.selected_currency) {
      this.currency = this.cs.selected_currency;
      let additonalCost: any = 0;
      if(this.currency.additional_charges > 0) {
        let percentage = this.currency.additional_charges/100;
        additonalCost = price*percentage;
      }
      let totalPrice: any = parseFloat(price)+parseFloat(additonalCost);
      return parseFloat((totalPrice).toFixed(2));
    }
    else return 0;
  }

  CALC_WO_AC(price) {
    if(!price) price = 0;
    if(this.cs.selected_currency) {
      this.currency = this.cs.selected_currency;
      let finalPrice = (price/this.currency.country_inr_value).toFixed(2);
      return parseFloat(finalPrice);
    }
    else return 0;
  }

  CALC_ROUND_WO_AC(price) {
    if(!price) price = 0;
    if(this.cs.selected_currency) {
      this.currency = this.cs.selected_currency;
      let finalPrice = (price/this.currency.country_inr_value);
      return Math.ceil(finalPrice/10)*10;
    }
    else return 0;
  }

  CONVERT_TO_INR(price) {
    if(!price) price = 0;
    if(this.cs.selected_currency) {
      this.currency = this.cs.selected_currency;
      let finalPrice = Math.round(price*this.currency.country_inr_value);
      return finalPrice;
    }
    else return 0;
  }

}