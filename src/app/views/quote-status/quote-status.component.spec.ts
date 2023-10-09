import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteStatusComponent } from './quote-status.component';

describe('QuoteStatusComponent', () => {
  let component: QuoteStatusComponent;
  let fixture: ComponentFixture<QuoteStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
