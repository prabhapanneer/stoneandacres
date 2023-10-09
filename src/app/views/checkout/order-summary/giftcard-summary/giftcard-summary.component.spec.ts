import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftcardSummaryComponent } from './giftcard-summary.component';

describe('GiftcardSummaryComponent', () => {
  let component: GiftcardSummaryComponent;
  let fixture: ComponentFixture<GiftcardSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiftcardSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftcardSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
