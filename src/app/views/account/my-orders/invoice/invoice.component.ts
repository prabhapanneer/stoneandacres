import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})

export class InvoiceComponent implements OnInit {

  pageLoader: boolean;
  params: any; invoice_details: any = {};
  order_list: any = []; hsncode_exist: boolean;
  template_setting: any = environment.template_setting;
  tax_config: any = { tax: 0 };

  constructor(
    private router: Router, private activeRoute: ActivatedRoute, private api: ApiService,
    public commonService: CommonService, public cc: CurrencyConversionService
  ) { }

  ngOnInit() {
    this.activeRoute.params.subscribe((params: Params) => {
      this.params = params; this.hsncode_exist = false;
      // order
      if(this.params.type=="order") {
        this.pageLoader = true;
        this.api.ORDER_DETAILS(this.params.order_id).subscribe(result => {
          if(result.status) {
            this.invoice_details = result.data;
            if(this.invoice_details.order_type=='pickup') this.invoice_details.billing_address = this.invoice_details.shipping_address;
            if(this.commonService.store_details.tax_config) {
              this.tax_config = this.commonService.store_details.tax_config;
              this.tax_config.tax = 0;
              if(this.invoice_details.billing_address.country==this.commonService.store_details.country) {
                if(this.tax_config.domestic_states && this.tax_config.domestic_states.length) {
                  if(this.tax_config.domestic_states.indexOf(this.invoice_details.billing_address.state) != -1) {
                    // domestic
                    if(this.tax_config.domestic_tax) this.tax_config.tax = this.tax_config.domestic_tax;
                  }
                  else {
                    // international
                    if(this.tax_config.international_tax) this.tax_config.tax = this.tax_config.international_tax;
                  }
                }
                else {
                  // domestic
                  if(this.tax_config.domestic_tax) this.tax_config.tax = this.tax_config.domestic_tax;
                }
              }
              else {
                // international
                if(this.tax_config.international_tax) this.tax_config.tax = this.tax_config.international_tax;
              }
            }
            this.processInvoice();
          }
          else console.log("response", result);
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
      // gift card
      else if(this.params.type=="coupon" && this.commonService.ys_features.indexOf('giftcard')!=-1) {
        this.pageLoader = true;
        this.api.COUPON_DETAILS(this.params.order_id).subscribe(result => {
          if(result.status) {
            this.invoice_details = result.data;
            this.invoice_details.price = (this.invoice_details.price/this.invoice_details.currency_type.country_inr_value).toFixed(2);
          }
          else console.log("response", result);
          setTimeout(() => { this.pageLoader = false; }, 500);
        });
      }
      else this.router.navigate(['/']);
    });
  }

  processInvoice() {
    let countryInr = this.invoice_details.currency_type.country_inr_value;
    if(this.tax_config.tax > 0) {
      let totalPercentage = 100+parseFloat(this.tax_config.tax);
      let onePercentAmount = this.invoice_details.sub_total/totalPercentage;
      this.invoice_details.sub_total_wo_tax = ((onePercentAmount*100)/countryInr).toFixed(2);
      this.invoice_details.tax_amount = ((onePercentAmount*this.tax_config.tax)/countryInr).toFixed(2);
    }
    this.invoice_details.sub_total = (this.invoice_details.sub_total/countryInr).toFixed(2);
    this.invoice_details.gift_wrapper = (this.invoice_details.gift_wrapper/countryInr).toFixed(2);
    this.invoice_details.packaging_charges = (this.invoice_details.packaging_charges/countryInr).toFixed(2);
    this.invoice_details.shipping_cost = (this.invoice_details.shipping_cost/countryInr).toFixed(2);
    this.invoice_details.cod_charges = (this.invoice_details.cod_charges/countryInr).toFixed(2);
    this.invoice_details.discount_amount = (this.invoice_details.discount_amount/countryInr).toFixed(2);
    this.invoice_details.final_price = (this.invoice_details.final_price/countryInr).toFixed(2);
    this.processItemList(this.invoice_details.item_list, countryInr).then((respData) => {
      this.order_list = respData;
      for(let set of this.order_list) {
        if(set.tax_details) {
          set.temp_sub_total = (this.findBaseAmount(set.sub_total, set.tax_details)/countryInr).toFixed(2);
          set.temp_sgst = (this.findTaxAmount( set.sub_total, set.tax_details.sgst, ((set.tax_details.sgst*1)+(set.tax_details.cgst*1)) )/countryInr).toFixed(2);
          set.temp_cgst = (this.findTaxAmount( set.sub_total, set.tax_details.cgst, ((set.tax_details.sgst*1)+(set.tax_details.cgst*1)) )/countryInr).toFixed(2);
          set.temp_igst = (this.findTaxAmount( set.sub_total, set.tax_details.igst, set.tax_details.igst )/countryInr).toFixed(2);
        }
      }
    });
  }

  processItemList(itemList, countryInr) {
    return new Promise((resolve, reject) => {
      let orderList: any = [];
      for(let item of itemList)
      {
        if(item.hsn_code) this.hsncode_exist = true;
        let itemFinalPrice = item.final_price * item.quantity;
        if(item.unit!="Pcs") { itemFinalPrice += item.addon_price; }
        let taxIndex = orderList.findIndex(obj => obj.taxrate_id==item.taxrate_id);
        if(taxIndex!=-1) {
          item.temp_final_price = (this.findBaseAmount(itemFinalPrice, orderList[taxIndex].tax_details)/countryInr).toFixed(2);
          orderList[taxIndex].item_list.push(item);
          orderList[taxIndex].sub_total += itemFinalPrice;
        }
        else {
          item.temp_final_price = (this.findBaseAmount(itemFinalPrice, item.tax_details)/countryInr).toFixed(2);
          orderList.push({ taxrate_id: item.taxrate_id, tax_details: item.tax_details, item_list: [item], sub_total: itemFinalPrice });
        }
      }
      resolve(orderList);
    });
  }

  findBaseAmount(amount, taxDetails) {
    if(taxDetails) {
      if(this.invoice_details.billing_address.country==taxDetails.home_country && this.invoice_details.billing_address.state==taxDetails.home_state) {
        let totalPercentage = 100+parseFloat(taxDetails.sgst)+parseFloat(taxDetails.cgst);
        let onePercentAmount = amount/totalPercentage;
        return (onePercentAmount*100);
      }
      else {
        let totalPercentage = 100+parseFloat(taxDetails.igst);
        let onePercentAmount = amount/totalPercentage;
        return (onePercentAmount*100);
      }
    }
    else if(this.tax_config.tax > 0) {
      let totalPercentage = 100+parseFloat(this.tax_config.tax);
      let onePercentAmount = amount/totalPercentage;
      return (onePercentAmount*100);
    }
    else return amount;
  }

  findTaxAmount(amount, tax, totalTax) {
    let totalPercentage = 100+parseFloat(totalTax);
    let onePercentAmount = amount/totalPercentage;
    return (onePercentAmount*tax);
  }

}