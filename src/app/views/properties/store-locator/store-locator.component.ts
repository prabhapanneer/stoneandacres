import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { PropertiesService } from '../../../services/properties.service';
import { CommonService } from '../../../services/common.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-store-locator',
  templateUrl: './store-locator.component.html',
  styleUrls: ['./store-locator.component.scss']
})

export class StoreLocatorComponent implements OnInit {

  pageLoader: boolean;
  template_setting: any = environment.template_setting;
  storeSubscription: Subscription;

  constructor(private sanitizer: DomSanitizer, private ps: PropertiesService, public cs: CommonService) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getList();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.getList();
    else this.pageLoader = true;
  }

  getList(): void {
    this.pageLoader = false;
    if(!this.cs.store_locations && this.cs.ys_features.indexOf('store_locator')!=-1) {
      this.pageLoader = true;
      this.ps.LOCATIONS().subscribe(result => {
        setTimeout(() => { this.pageLoader = false; }, 500);
        if(result.status) {
          this.cs.store_locations = result.data;
          this.cs.store_locations.location_list.forEach(obj => {
            obj.map_url = this.sanitizer.bypassSecurityTrustResourceUrl(obj.map_url);
            obj.address = this.cs.transformHtml(obj.address);
          });
        }
        else {
          console.log("response", result);
          this.cs.store_locations = {};
        }
      });
    }
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}