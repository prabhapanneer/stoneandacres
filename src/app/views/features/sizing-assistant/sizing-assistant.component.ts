import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { FeaturesService } from '../../../services/features.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sizing-assistant',
  templateUrl: './sizing-assistant.component.html',
  styleUrls: ['./sizing-assistant.component.scss']
})

export class SizingAssistantComponent implements OnInit {

  measurement_list: any = []; store_mm_sets: any = [];
  assistIndex: number = 0; pageLoader: boolean;
  assist_list: any = []; assist_details: any;
  imgBaseUrl: string = environment.img_baseurl;
  storeSubscription: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, private router: Router, private activeRoute: ActivatedRoute,
    public cs: CommonService, private fApi: FeaturesService
  ) {
    this.storeSubscription = this.cs.storeDataListener.subscribe(() => {
      this.getData();
    });
  }

  ngOnInit(): void {
    if(this.cs.storeDataLoaded) this.getData();
    else this.pageLoader = true;
  }

  getData(): void {
    this.pageLoader = true;
    if(this.cs.ys_features.indexOf('sizing_assistant')!=-1) {
      this.activeRoute.params.subscribe((params: Params) => {
        this.pageLoader = true; this.measurement_list = [];
        this.fApi.SIZING_ASSISTANT({sizing_id: params['id']}).subscribe(result => {
          setTimeout(() => { this.pageLoader = false; }, 500);
          if(result.status) {
            this.assist_details = result.data;
            if(this.assist_details.assistant_types && this.assist_details.assistant_types.length) {
              this.assist_list = this.assist_details.assistant_types;
              this.assistIndex = 0;
              this.assist_list[this.assistIndex].filtered_option_list = this.assist_list[this.assistIndex].option_list;
              if(this.assist_list[this.assistIndex].type=='either_or') {
                if(!this.assist_list[this.assistIndex].selected_option) {
                  this.assist_list[this.assistIndex].selected_option = this.assist_list[this.assistIndex].filtered_option_list[0]._id;
                }
                this.getRadioNextList(this.assist_list[this.assistIndex].selected_option)
              }
            }
            // measurement sets
            this.store_mm_sets = result.measurements;
          }
          else {
            console.log("response", result);
            this.router.navigate(['/']);
          }
        });
      });
    }
  }

  getRadioNextList(optionId) {
    let currentStyleDetails = this.assist_list[this.assistIndex];
    // if next option list exist
    if(this.assist_list[this.assistIndex+1])
    {
      let optionIndex = currentStyleDetails.option_list.findIndex(obj => obj._id==optionId);
      if(optionIndex!=-1) {
        let currentSelectedOption = currentStyleDetails.option_list[optionIndex];
        let filterList = this.assist_list[this.assistIndex+1].option_list;
        this.assist_list[this.assistIndex+1].filtered_option_list = filterList.filter(obj => obj.link_to=='all' || obj.link_to==currentSelectedOption.heading);
      }
    }
  }
  getCheckboxNextList() {
    // if next option list exist
    if(this.assist_list[this.assistIndex+1])
    {
      let selectedItems = [];
      this.assist_list[this.assistIndex].filtered_option_list.forEach(obj => {
        if(obj.aistyle_option_checked) selectedItems.push(obj.heading);
      });
      let filterList = this.assist_list[this.assistIndex+1].option_list;
      this.assist_list[this.assistIndex+1].filtered_option_list = filterList.filter(obj => obj.link_to=='all' || selectedItems.indexOf(obj.link_to)!=-1);
    }
  }
  onNext() {
    this.assistIndex = this.assistIndex+1;
    this.cs.pageScrollTop();
    if(this.assist_list[this.assistIndex].type=='either_or') {
      if(this.assist_list[this.assistIndex].selected_option) {
        if(this.assist_list[this.assistIndex].filtered_option_list.findIndex(obj => obj._id==this.assist_list[this.assistIndex].selected_option) == -1) {
          this.assist_list[this.assistIndex].selected_option = this.assist_list[this.assistIndex].filtered_option_list[0]._id;
        }
      }
      else {
        this.assist_list[this.assistIndex].selected_option = this.assist_list[this.assistIndex].filtered_option_list[0]._id;
      }
      this.getRadioNextList(this.assist_list[this.assistIndex].selected_option);
    }
  }

  // save measurement
  onSave() {
    this.processAiStyles(this.assist_list).then((resp) => {
      if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("by_s_mm", this.cs.encode(this.measurement_list));
      this.cs.goBack();
    });
  }
  onSaveWithUpdatedMm() {
    if(isPlatformBrowser(this.platformId)) sessionStorage.setItem("by_s_mm", this.cs.encode(this.measurement_list));
    this.cs.goBack();
  }

  // view measurement
  onViewMeasurement(modalName) {
    this.processAiStyles(this.assist_list).then((resp) => {
      modalName.show();
    });
  }

  processAiStyles(list) {
    return new Promise((resolve, reject) => {
      for(let section of list) {
        if(section.type=='either_or') {
          let optIndex = section.option_list.findIndex(obj => obj._id==section.selected_option);
          if(optIndex!=-1) this.updateMmList(section.option_list[optIndex].mm_sets);
        }
        else if(section.filtered_option_list) {
          section.filtered_option_list.forEach(option => {
            if(option.aistyle_option_checked) this.updateMmList(option.mm_sets);
          });
        }
      }
      resolve(true);
    });
  }
  updateMmList(mm_sets) {
    mm_sets.forEach(set => {
      let mmIndex = this.measurement_list.findIndex(obj => obj.mmset_id==set.mmset_id);
      if(mmIndex!=-1) {
        let selectedSet = this.measurement_list[mmIndex];
        set.list.forEach(obj => {
          let listIndex = selectedSet.list.findIndex(elem => elem.name==obj.name);
          if(listIndex!=-1) selectedSet.list[listIndex].value += obj.value;
        });
      }
      else {
        mm_sets.forEach(set => {
          set.image = null;
          let mmSetIndex = this.store_mm_sets.findIndex(obj => obj._id==set.mmset_id);
          if(mmSetIndex!=-1) {
            set.name = this.store_mm_sets[mmSetIndex].name;
            set.image = this.store_mm_sets[mmSetIndex].image;
          }
          let newMmList = [];
          set.list.forEach(obj => {
            newMmList.push({ name: obj.name, value: obj.value });
          });
          this.measurement_list.push({ mmset_id: set.mmset_id, name: set.name, image: set.image, list: newMmList })
        });
      }
    });
  }

  incQty(i, j) {
    this.measurement_list[i].list[j].value += 0.5;
    if((this.measurement_list[i].list[j].value % 1) != 0) this.measurement_list[i].list[j].value = parseFloat(this.measurement_list[i].list[j].value.toFixed(2));
  }
  decQty(i, j) {
    this.measurement_list[i].list[j].value -= 0.5;
    if((this.measurement_list[i].list[j].value % 1) != 0) this.measurement_list[i].list[j].value = parseFloat(this.measurement_list[i].list[j].value.toFixed(2));
  }

  ngOnDestroy() {
    this.storeSubscription.unsubscribe();
  }

}