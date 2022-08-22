import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandOwnersComponent } from './land-owners.component';

describe('LandOwnersComponent', () => {
  let component: LandOwnersComponent;
  let fixture: ComponentFixture<LandOwnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandOwnersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
