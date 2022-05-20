// let storeId = "5d0ca4c89f21de0314f98f24";
let storeId = "624fd5a8a96c721d4bef5bc5";

export const environment = {
  production: true,
  header: 'type-3',
  ws_url: 'https://yourstore.io/api',
  img_baseurl: 'https://yourstore.io/api/',
  img_host: "https://yourstore.io", // for _s split
  store_id: storeId,
  gtag_tracking: false,
  facebook_pixel: false,
  gtag_conversion_id: "",
  razorpay_payment_url: "https://api.razorpay.com/v1/checkout/embedded",
  razorpay_redirect_url: "https://yourstore.io/api/store_details/razorpay_payment/"+storeId,
  ccavenue_payment_url: "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
  ccavenue_redirect_url: "https://yourstore.io/api/store_details/ccavenue_payment/success/"+storeId,
  ccavenue_cancel_url: "https://yourstore.io/api/store_details/ccavenue_payment/failure/"+storeId,
  gpay_redirect_url: "https://yourstore.io/api/store_details/gpay_payment/"+storeId,
  band_logo: "band-logo-black.svg",
  template_setting: {
    header_type: "container-fluid",
    body_type: "container",
    announcement_bar: true, // as well as let set $aannouncement-bar value in variable.scss
    primary_slider: true,
    products_per_page: 24,
    display_products_count: true,
    currency_format: '1.0',
    qty_scale: true, // - qty +(product page)
    enable_product_inc: true, // for allow to order single qty of each product only(cart page)
    display_estimated_delivery_time: true,
    display_unit: true,
    product_swiper: true,
    display_goback: true,
    breadcrumb: true,
    enable_buynow: true,
    social_share: true,
    related_products_limit: 10,
    blog_count: 10
  },
  cod_sms: {
    valid_in_seconds: 60,
    interval_in_mins: 60,
    limit: 3
  },
  port: 4004,
  domain: "onetuft.com"
};