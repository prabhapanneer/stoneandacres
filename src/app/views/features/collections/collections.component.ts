import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FeaturesService } from '../../../services/features.service';
import { CommonService } from '../../../services/common.service';
import { RedirectService } from '../../../services/redirect.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})

export class CollectionsComponent implements OnInit {

  pageLoader: boolean;
  searchField: string;
  selectedIndex: number = 0;
  template_setting: any = environment.template_setting;
  storeSubscription: Subscription;
  
  constructor(private fApi: FeaturesService, public cs: CommonService, @Inject(DOCUMENT) private document, public rs: RedirectService) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getDataList();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.getDataList();
    else this.pageLoader = true;
  }

  getDataList(): void {
    this.pageLoader = false;
    if(!this.cs.collection_list.length && this.cs.ys_features.indexOf('collections')!=-1) {
      this.pageLoader = true;
      this.fApi.COLLECTIONS().subscribe(result => {
        if(result.status) this.cs.collection_list = result.list;
        else console.log("response", result);
        setTimeout(() => { this.pageLoader = false; }, 500);
      });
    }
  }

  scroll(el: HTMLElement) {
    const element = this.document.querySelector('#heading-'+el);
    if (element) element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}