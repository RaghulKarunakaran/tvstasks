import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingsManagementComponent } from './fundings-management.component';

describe('FundingsManagementComponent', () => {
  let component: FundingsManagementComponent;
  let fixture: ComponentFixture<FundingsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundingsManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
