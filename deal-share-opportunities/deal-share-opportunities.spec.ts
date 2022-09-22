import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealShareOpportunitiesComponent } from './deal-share-opportunities.component';

describe('DealShareOpportunitiesComponent', () => {
  let component: DealShareOpportunitiesComponent;
  let fixture: ComponentFixture<DealShareOpportunitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealShareOpportunitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealShareOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
