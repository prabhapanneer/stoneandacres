import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThankyouPageBrochurComponent } from './thankyou-page-brochur.component';

describe('ThankyouPageBrochurComponent', () => {
  let component: ThankyouPageBrochurComponent;
  let fixture: ComponentFixture<ThankyouPageBrochurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThankyouPageBrochurComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThankyouPageBrochurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
