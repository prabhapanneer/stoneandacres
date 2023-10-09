import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteOrderDetailsComponent } from './quote-order-details.component';

describe('QuoteOrderDetailsComponent', () => {
  let component: QuoteOrderDetailsComponent;
  let fixture: ComponentFixture<QuoteOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteOrderDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
