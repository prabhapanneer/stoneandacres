import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyQuotationsComponent } from './my-quotations.component';

describe('MyQuotationsComponent', () => {
  let component: MyQuotationsComponent;
  let fixture: ComponentFixture<MyQuotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyQuotationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
