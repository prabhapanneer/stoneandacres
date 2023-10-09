import { Component, OnInit, Inject, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CheckoutService } from '../../../../services/checkout.service';
import { ApiService } from '../../../../services/api.service';
import { CommonService } from '../../../../services/common.service';
import { environment } from '../../../../../environments/environment';
import { CurrencyConversionService } from '../../../../services/currency-conversion.service';
import { DynamicAssetLoaderService } from '../../../../services/dynamic-asset-loader.service';
declare var SqPaymentForm : any;
declare var Foloosipay: any;

@Component({
  selector: 'app-giftcard-order-details',
  templateUrl: './giftcard-order-details.component.html',
  styleUrls: ['./giftcard-order-details.component.scss']
})
export class GiftcardOrderDetailsComponent implements OnInit {

  @ViewChild('ccAvenueForm', {static: false}) ccAvenueForm: ElementRef;
  @ViewChild('razorpayForm', {static: false}) razorpayForm: ElementRef;
  @ViewChild('payuForm', {static: false}) payuForm: ElementRef;

  pageLoader: boolean;
  orderForm: any = {};
  checkout_details: any = {};
  environment: any = environment;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;

  encRequest: String; accessCode: String;
  ccavenue_redirect: string = this.cApi.ccavenue_payment_url;
  razorpayOptions: any = { my_order_type: "giftcard" };
  payFormOptions: any = {};
  squareForm: any; squareFormErrors: any = [];
  fatoorahPaymentMethods: any = [];
  storeSubscription: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private api: ApiService, private router: Router, public cs: CommonService,
    @Inject(DOCUMENT) private document, public cc: CurrencyConversionService, private assetLoader: DynamicAssetLoaderService,
    public cApi: CheckoutService
  ) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.loadAssets();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.loadAssets();
    this.pageLoader = true;
    this.api.USER_DETAILS().subscribe(result => {
      if(result.status && result.data.checkout_details) {
        this.checkout_details = result.data.checkout_details;
        if(this.checkout_details.card_name && this.checkout_details.billing_address) {
          this.orderForm = {
            card_name: this.checkout_details.card_name,
            image: this.checkout_details.image,
            from_name: this.checkout_details.from_name,
            to_name: this.checkout_details.to_name,
            to_email: this.checkout_details.to_email,
            message: this.checkout_details.message,
            temp_message: this.cs.transformHtml(this.checkout_details.message),
            price: this.checkout_details.price,
            temp_price: this.cc.CALC_WO_AC(this.checkout_details.price),
            currency_type: this.cs.decode(localStorage.getItem("by_sc")),
            billing_address: this.checkout_details.billing_address,
            coupon_type: this.cs.store_details.additional_features.giftcard_type
          };
          // razorpay user details
          this.razorpayOptions.customer_name = result.data.name;
          this.razorpayOptions.customer_email = result.data.email;
          this.razorpayOptions.customer_mobile = this.checkout_details.billing_address.mobile;
        }
        else this.router.navigate(["/"]);
      }
      else {
        console.log("response", result);
        this.router.navigate(["/"]);
      }
      setTimeout(() => { this.pageLoader = false; }, 500);
    });
  }

  onMakePayment(paymentDetails) {
    this.orderForm.submit = true;
    this.orderForm.payment_details = { name: paymentDetails.name };
    if(paymentDetails.name=="Fatoorah") {
      this.cApi.FATOORAH_INITIATE_PAY({ currency_type: this.orderForm.currency_type, price: this.orderForm.price }).subscribe(result => {
        this.orderForm.submit = false;
        if(result.status) {
          this.fatoorahPaymentMethods = result.data.PaymentMethods;
          this.document.getElementById("openFatoorahModal")?.click();
        }
        else {
          console.log("response", result);
          this.router.navigate(['/checkout/payment-failure'], { queryParams: { response: result.message } });
        }
      });
    }
    else {
      this.cApi.BUY_COUPON(this.orderForm).subscribe(result => {
        if(isPlatformBrowser(this.platformId) && result.status) {
          if(paymentDetails.name=="CCAvenue") {
            this.accessCode = result.data.access_code;
            this.encRequest = result.data.enc_data;
            setTimeout(_ => this.ccAvenueForm.nativeElement.submit());
          }
          else if(paymentDetails.name=="Razorpay") {
            this.razorpayOptions.my_order_id = result.data.order_id;
            this.razorpayOptions.razorpay_order_id = result.data.razorpay_response.id;
            if(paymentDetails.app_config) {
              this.razorpayOptions.key = paymentDetails.app_config.key;
              this.razorpayOptions.store_name = paymentDetails.app_config.name;
              this.razorpayOptions.description = paymentDetails.app_config.description;
              setTimeout(_ => this.razorpayForm.nativeElement.submit());
            }
            else {
              this.orderForm.submit = false;
              console.log("Invalid payment details");
            }
          }
          else if(paymentDetails.name=="PayU") {
            this.payFormOptions.order_id = result.data.order_id;
            this.payFormOptions.order_amount = result.data.amount;
            this.payFormOptions.order_type = result.data.order_type;
            this.payFormOptions.key = result.data.meta_data?.key;
            this.payFormOptions.hash = result.data.meta_data?.hash;
            this.payFormOptions.customer_name = result.data.meta_data?.user_name;
            this.payFormOptions.customer_email = result.data.meta_data?.user_email;
            this.payFormOptions.post_url = "https://secure.payu.in/_payment";
            if(result.data.meta_data?.payment_mode=='sandbox') this.payFormOptions.post_url = "https://test.payu.in/_payment";
            setTimeout(_ => this.payuForm.nativeElement.submit());
          }
          else if(paymentDetails.name=="Foloosi") {
            this.orderForm.submit = false;
            Foloosipay.open(result.data.reference_token, paymentDetails.app_config.merchant_key);
            const foloosiHandler = (e => {
              let payData = e.data;
              if(payData.status == 'success') {
                Foloosipay.close();
                this.orderForm.submit = true;
                window.location.href = payData.data.optional3+"?transaction_id="+payData.data.transaction_no;
              }
              else { console.log(payData); }
            });
            window.addEventListener('message', foloosiHandler);
          }
          else if(["PayPal", "Flutterwave", "Billbox", "Stripe"].indexOf(paymentDetails.name) != -1) {
            window.location.href = result.data.payment_url;
          }
          else if(paymentDetails.name=="Telr") window.location.href = result.data.url;
          else if(paymentDetails.name=="Square") this.createSquarePayment(paymentDetails, result.data.order_id);
          else console.log("Invalid payment method");
        }
        else {
          this.orderForm.submit = false;
          console.log("response", result);
        }
      });
    }
  }

  confirmFatoorah(payId) {
    this.orderForm.fatoorah_pay_id = payId;
    this.document.getElementById("closeFatoorahModal")?.click();
    this.orderForm.submit = true;
    this.cApi.BUY_COUPON(this.orderForm).subscribe(result => {
      if(result.status && isPlatformBrowser(this.platformId)) window.location.href = result.data.PaymentURL;
      else {
        console.log("response", result);
        this.orderForm.submit = false;
      }
    });
  }

  loadAssets() {
    // squarepay
    let squareIndex = this.cs.payment_methods.findIndex(obj => obj.name=='Square');
    if(squareIndex != -1) {
      if(this.cs.payment_methods[squareIndex].mode=='live')
        this.assetLoader.load('square-live', 'squarepay').then(() => { }).catch(error => console.log("err", error));
      else this.assetLoader.load('square-sandbox', 'squarepay').then(() => { }).catch(error => console.log("err", error));
    }
    // foloosipay
    if(this.cs.payment_methods.findIndex(obj => obj.name=='Foloosi') != -1) {
      this.assetLoader.load('foloosipay').then(() => {
        Foloosipay.init();
      }).catch(error => console.log("err", error));
    }
  }

  /* Square */
  createSquarePayment(paymentDetails, ysOrderId) {
    this.squareForm = new SqPaymentForm({
      applicationId: paymentDetails.app_config.app_id,
      locationId: paymentDetails.app_config.location_id,
      inputClass: 'sq-input',
      autoBuild: false,
      inputStyles: [{ fontSize: '16px', lineHeight: '24px', padding: '16px', placeholderColor: '#a0a0a0', backgroundColor: 'transparent' }],
      cardNumber: { elementId: 'sq-card-number', placeholder: 'Card Number' },
      cvv: { elementId: 'sq-cvv', placeholder: 'CVV' },
      expirationDate: { elementId: 'sq-expiration-date', placeholder: 'MM/YY' },
      postalCode: { elementId: 'sq-postal-code', placeholder: 'Postal' },
      googlePay: { elementId: 'sq-google-pay' },
      applePay: { elementId: 'sq-apple-pay' },
      callbacks: {
        methodsSupported: (methods, unsupportedReason) => {
          // applePay
          let applePayBtn = document.getElementById('sq-apple-pay');
          if(methods.applePay === true) applePayBtn.style.display = 'inline-block';
          // goolePay
          let googlePayBtn = document.getElementById('sq-google-pay');
          if(methods.googlePay === true) googlePayBtn.style.display = 'inline-block';
        },
        cardNonceResponseReceived: (errors, nonce, cardData, billingContact, shippingContact) => {
          if(!errors && nonce) {
            this.document.getElementById("closeSquareModal")?.click();
            this.orderForm.submit = true;
            this.cApi.SQUARE_PAYMENT({ nonce: nonce, order_type: 'product', order_id: ysOrderId }).subscribe(result => {
              if(result.status) this.router.navigate(["/checkout/order-summary/giftcard/"+ysOrderId]);
              else this.router.navigate(['/checkout/payment-failure'], { queryParams: { response: result.msg } });
            });
          }
          else {
            this.squareFormErrors = errors;
            console.error('Encountered errors:', errors);
          }
        },
        createPaymentRequest: () => {
          let paymentRequestJson = {
            requestShippingAddress: true, requestBillingInfo: true,
            currencyCode: this.cs.selected_currency.country_code, countryCode: "US",
            total: { label: paymentDetails.app_config.name, amount: this.orderForm.temp_price, pending: false }
          };
          return paymentRequestJson;
        }
      }
    });
    this.squareForm.build();
    this.orderForm.submit = false;
    this.document.getElementById("openSquareModal")?.click();
  }
  onGetCardNonce(event) {
    event.preventDefault();
    this.squareForm.requestCardNonce();
  }
  /* ## Square ## */

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}