import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { CommonService } from '../../services/common.service';
import { RedirectService } from '../../services/redirect.service';
import { WishlistService } from '../../services/wishlist.service';
import { CartlistService } from '../../services/cartlist.service';
import { CurrencyConversionService } from '../../services/currency-conversion.service';

@Component({
  selector: 'app-main',
  templateUrl: './'+environment.header_root+'-types/'+environment.header_type+'/main-header.html',
  styleUrls: ['./'+environment.header_root+'-types/'+environment.header_type+'/main-header.scss']
})

export class MainComponent implements OnInit {
  
  ts: any = environment.template_setting;
  imgBaseUrl: string = environment.img_baseurl;
  env: any = environment;

	constructor(
    public router: Router, public cs: CommonService, @Inject(DOCUMENT) private document, public rs: RedirectService,
    private wishService: WishlistService, private cartService: CartlistService, public cc: CurrencyConversionService
	) { }

  ngOnInit() {
    this.cs.moveNavigation();
    if(!this.rs.catalogLoaded) {
      this.rs.CATALOG_MENU().subscribe(result => {
        this.rs.catalogLoaded = true;
        if(result.status) {
          // catalogs
          this.rs.catalog_list = result.catalogs;
          // menus
          this.cs.menu_list = result.menus;
          this.cs.menu_list.forEach(menu => {
            menu.sec_count = menu.sections.length + menu.menu_images.length;
            if(menu.sections.length) {
              let secIndex = menu.sections.findIndex(sec => sec.categories.length);
              if(secIndex==-1) {
                menu.sections_in_one_col = true;
                menu.sec_count = 1 + menu.menu_images.length;
              }
            }
            if(menu.link_status && menu.link_type=='category') {
              let urlDetails = this.findUrl(menu);
              if(urlDetails.link_type) menu.link_type = urlDetails.link_type;
              if(urlDetails.link) menu.link = urlDetails.link;
            }
            // section
            if(menu.sections?.length) {
              menu.sections.forEach(sec => {
                if(sec.link_status && sec.link_type=='category') {
                  let urlDetails = this.findUrl(sec);
                  if(urlDetails.link_type) sec.link_type = urlDetails.link_type;
                  if(urlDetails.link) sec.link = urlDetails.link;
                }
                // category
                if(sec.categories?.length) {
                  sec.categories.forEach(cat => {
                    if(cat.link_status && cat.link_type=='category') {
                      let urlDetails = this.findUrl(cat);
                      if(urlDetails.link_type) cat.link_type = urlDetails.link_type;
                      if(urlDetails.link) cat.link = urlDetails.link;
                    }
                    // sub category
                    if(cat.sub_categories?.length) {
                      cat.sub_categories.forEach(subCat => {
                        if(subCat.link_status && subCat.link_type=='category') {
                          let urlDetails = this.findUrl(subCat);
                          if(urlDetails.link_type) subCat.link_type = urlDetails.link_type;
                          if(urlDetails.link) subCat.link = urlDetails.link;
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          // footer seo links
          this.cs.footer_seo_links = result.footer_links;
          this.cs.footer_seo_links.forEach(el => {
            el.links.forEach(lObj => {
              if(lObj.link_type=='category') {
                let urlDetails = this.findUrl(lObj);
                if(urlDetails.link_type) lObj.link_type = urlDetails.link_type;
                if(urlDetails.link) lObj.link = urlDetails.link;
              }
            });
          });
          // update customer details
          if(this.cs.customer_token) {
            this.rs.USER_DETAILS().subscribe(result => {
              if(result.status) {
                this.wishService.resetWishList(result.data.wish_list);
                this.cartService.resetCartList(result.data.cart_list);
                this.cs.setCustomerData(result.data);
              }
              else {
                console.log("user response", result);
                localStorage.removeItem("customer_token");
                delete this.cs.customer_token;
                this.cs.user_details = {};
                this.wishService.resetWishList([]);
                this.cartService.resetCartList([]);
                this.router.navigate(["/account"]);
              }
            });
          }
        }
        else console.log("menu response", result);
      });
    }
  }

  findUrl(menu) {
    let catList = this.rs.catalog_list;
    let cInd = catList.findIndex(el => el._id==menu.category_id);
    if(cInd!=-1) {
      menu.link_type = 'internal';
      menu.link = '/category/'+catList[cInd]._id;
      if(catList[cInd].seo_status) menu.link = '/category/'+catList[cInd].seo_details?.page_url;
    }
    return menu;
  }

  onCurrencyChange() {
    this.cc.currency = this.cs.temp_currency;
    this.cs.setCurrency(this.cs.temp_currency);
    localStorage.setItem("by_sc", this.cs.encode(this.cs.temp_currency));
    this.cartService.findCurrency();
  }

  resetmm() {
    this.document.getElementById('reset-menu')?.click();
  }

  openCart() {
    this.document.getElementById("sidecart-trigger")?.click();
  }

}