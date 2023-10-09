import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { StoreApiService } from '../../../../services/store-api.service';
import { CartlistService } from '../../../../services/cartlist.service';
import { CommonService } from '../../../../services/common.service';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { environment } from '../../../../../environments/environment';
declare const fbq: Function;
declare var gtag;

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.scss']
})

export class ProductSummaryComponent implements OnInit {

  pageLoader: boolean;
  order_details: any = {};
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private activeRoute: ActivatedRoute, private api: ApiService, private storeApi: StoreApiService,
    private router: Router, private cartService: CartlistService, public cs: CommonService, public cc: CurrencyConversionService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      this.pageLoader = true;
      let orderId = params['order_id'];
      this.storeApi.STORE_ORDER_DETAILS(orderId).subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) {
          this.order_details = result.data;
          if(!this.order_details.giftcard_amount) {
            this.order_details.final_price += this.order_details.giftcard_amount;
          }
          if(!this.order_details.shipping_discount) this.order_details.shipping_discount = 0;
          this.order_details.base_final_price = this.order_details.final_price;
          this.order_details.base_shipping_cost = this.order_details.shipping_cost;
          let countryInr = this.order_details.currency_type.country_inr_value;
          this.order_details.sub_total = (this.order_details.sub_total/countryInr).toFixed(2);
          this.order_details.gift_wrapper = (this.order_details.gift_wrapper/countryInr).toFixed(2);
          this.order_details.packaging_charges = (this.order_details.packaging_charges/countryInr).toFixed(2);
          this.order_details.shipping_cost = (this.order_details.shipping_cost/countryInr).toFixed(2);
          this.order_details.cod_charges = (this.order_details.cod_charges/countryInr).toFixed(2);
          this.order_details.discount_amount = (this.order_details.discount_amount/countryInr).toFixed(2);
          this.order_details.shipping_discount = (this.order_details.shipping_discount/countryInr).toFixed(2);
          this.order_details.final_price = (this.order_details.final_price/countryInr).toFixed(2);
          for(let product of this.order_details.item_list) {
            product.base_final_price = product.final_price*product.quantity;
            if(product.unit!='Pcs') product.base_final_price += product.addon_price;
            product.final_price = (product.base_final_price/countryInr).toFixed(2);
          }
          // tracking
          if(isPlatformBrowser(this.platformId)) {
            // gtag
            if(environment.gtag_tracking || environment.gtag_conversion_id) {
              let gtagData: any = {
                transaction_id: this.order_details.order_number, affiliation: this.cs.store_details.name,
                value: (this.order_details.base_final_price-this.order_details.base_shipping_cost), currency: this.cs.store_details.currency,
                tax: 0, shipping: this.order_details.base_shipping_cost
              };
              gtagData.items = this.filterProductDetails(this.order_details.item_list);
              let gawData: any = {
                send_to: environment.gtag_conversion_id, transaction_id: this.order_details.order_number,
                value: parseFloat(this.order_details.final_price), currency: this.order_details.currency_type.country_code
              }
              if(localStorage.getItem("by_go")) {
                let gtagOrderList = this.cs.decode(localStorage.getItem("by_go"));
                if(!gtagOrderList.includes(orderId)) {
                  gtagOrderList.push(orderId);
                  localStorage.setItem("by_go", this.cs.encode(gtagOrderList));
                  if(environment.gtag_conversion_id) gtag('event', 'conversion', gawData);
                  if(environment.gtag_tracking) gtag('event', 'purchase', gtagData);
                }
              }
              else {
                localStorage.setItem("by_go", this.cs.encode([orderId]));
                if(environment.gtag_conversion_id) gtag('event', 'conversion', gawData);
                if(environment.gtag_tracking) gtag('event', 'purchase', gtagData);
              }
            }
            // fb pixel
            if(environment.facebook_pixel) {
              let fbData: any = { value: parseFloat(this.order_details.final_price), currency: this.order_details.currency_type.country_code };
              if(localStorage.getItem("by_fo")) {
                let fbOrderList = this.cs.decode(localStorage.getItem("by_fo"));
                if(!fbOrderList.includes(orderId)) {
                  fbOrderList.push(orderId);
                  localStorage.setItem("by_fo", this.cs.encode(fbOrderList));
                  fbq('track', 'Purchase', fbData);
                }
              }
              else {
                localStorage.setItem("by_fo", this.cs.encode([orderId]));
                fbq('track', 'Purchase', fbData);
              }
            }
          }
        }
        else {
          console.log("response", result);
          this.router.navigate(["/"]);
        }
      });
      // update cart list
      if(localStorage.getItem('customer_token')) {
        this.api.USER_DETAILS().subscribe(result => {
          if(result.status) this.cartService.resetCartList(result.data.cart_list);
          else this.cartService.resetCartList([]);
        });
      }
      // guest logout
      if(isPlatformBrowser(this.platformId) && sessionStorage.getItem("guest_token")) {
        delete this.cs.guest_token;
        delete this.cs.guest_email;
        sessionStorage.removeItem("by_ge");
        sessionStorage.removeItem("guest_token");
        sessionStorage.removeItem("by_ca");
        sessionStorage.removeItem("by_cd");
        this.cartService.resetCartList([]);
      }
    });
  }

  filterProductDetails(list) {
    let proList = [];
    list.forEach((element, index) => {
      proList.push({
        "id": element.sku, "name": element.name, "brand": this.cs.store_details.name,
        "category": 'product', "list_position": index+1,
        "quantity": element.quantity, "price": element.base_final_price
      });
    });
    return proList;
  }

}
