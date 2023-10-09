export const environment = {
  production: true,
  header_root: 'header', // header (or) sc-header
  header_type: 'type-3',
  store_id: "624fd5a8a96c721d4bef5bc5",
  img_baseurl: 'https://yourstore.io/api/',
  img_host: "https://yourstore.io", // for _s split
  gtag_tracking: false,
  facebook_pixel: false,
  gtag_conversion_id: "",
  template_setting: {
    headroom: true,
    header_type: "container-fluid",
    body_type: "container",
    home_type: "container",
    primary_slider: "fs_slider", // fs_slider, slider, ''
    highlights: 0, // 0 or greater than 0
    explore_all: "View More",
    purchase_txt: "",
    products_per_page: 24,
    display_products_count: true,
    currency_format: '1.0',
    qty_scale: false, // - qty +(product page)
    enable_product_inc: false, // for allow to order single qty of each product only(cart page)
    display_estimated_delivery_time: true,
    disp_brand: true,
    display_unit: true,
    product_swiper: true,
    display_goback: true,
    breadcrumb: true,
    enable_buynow: true,
    social_share: true,
    related_products_limit: 10,
    blog_count: 10,
    price_range: false,
    category_grid_options: false,
    purchase_badge: false,
    p_card: false,
    pp_img_tag: false,
    accept_terms: false,
    customer_gst: true,
    icon_type: 'icon' // 'icon' (or) 'icon-outline'
  },
  cod_sms: {
    valid_in_seconds: 60,
    interval_in_mins: 60,
    limit: 3
  },
  port: 4004,
  domain: "onetuft.com"
};