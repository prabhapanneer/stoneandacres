import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PropertiesService } from '../../services/properties.service';
import { CommonService } from '../../services/common.service';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})

export class SearchComponent implements OnInit {

  afterSearchEvent: boolean;
  searchLoader: boolean; searchTerm: String;
  imgBaseUrl: string = environment.img_baseurl;
  template_setting: any = environment.template_setting;
  product_list: any = [];

  constructor(
    private pApi: PropertiesService, public cs: CommonService, private activeRoute: ActivatedRoute, private router: Router
  ) { }

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe((params: Params) => {
      this.searchTerm = ""; this.product_list = [];
      this.afterSearchEvent = false; this.searchLoader = false;
      if(params['q']) {
        this.searchTerm = params['q']; this.afterSearchEvent = true;
        if(this.searchTerm.length >= 3) {
          this.searchLoader = true;
          this.pApi.SEARCH_PRODUCT({ name: this.searchTerm }).subscribe(result => {
            setTimeout(() => { this.searchLoader = false; }, 500);
            if(result.status) {
              this.product_list = result.list;
              this.product_list.forEach(obj => {
                if(obj.hold_till) {
                  let balanceStock = obj.stock;
                  if(new Date() < new Date(obj.hold_till)) balanceStock = obj.stock - obj.hold_qty;
                  obj.stock = balanceStock;
                }
              });
            }
            else console.log("response", result);
          });
        }
      }
    });
  }

  onSubmit() {
    this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
  }

}