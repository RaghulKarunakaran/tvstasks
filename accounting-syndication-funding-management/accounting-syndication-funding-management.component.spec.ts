import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingSyndicationFundingManagementComponent } from './accounting-syndication-funding-management.component';

describe('AccountingSyndicationFundingManagementComponent', () => {
  let component: AccountingSyndicationFundingManagementComponent;
  let fixture: ComponentFixture<AccountingSyndicationFundingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountingSyndicationFundingManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingSyndicationFundingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
