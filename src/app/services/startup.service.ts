import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class StartupService {

  randomNum: string;

  load() {
    if(localStorage.getItem("random_num")) {
      this.randomNum = localStorage.getItem("random_num");
    }
    else {
      let cd = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      this.randomNum = cd.getFullYear()+''+cd.getMonth()+''+cd.getDate()+''+cd.getHours()+''+cd.getMinutes();
      localStorage.setItem("random_num", this.randomNum);
    }
  }

}