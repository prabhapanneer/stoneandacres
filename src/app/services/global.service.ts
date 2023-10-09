import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {

  storeId: string = "624fd5a8a96c721d4bef5bc5";
  footer: string = "light"; // dark or light
  wsUrl: string = "https://yourstore.io/api";
  imgBaseurl: string = 'https://yourstore.io/api/';
  trial_features: any = [];

}