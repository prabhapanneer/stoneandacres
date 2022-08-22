import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thankyou-page',
  templateUrl: './thankyou-page.component.html',
  styleUrls: ['./thankyou-page.component.scss']
})
export class ThankyouPageComponent implements OnInit {

  constructor( public router: Router) { }

  ngOnInit(): void {
    setTimeout(() => { this.router.navigate(['/']) }, 10000);
  }

}
