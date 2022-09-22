import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeSyndicationPaymentComponent } from './make-syndication-payment.component';

describe('MakeSyndicationPaymentComponent', () => {
  let component: MakeSyndicationPaymentComponent;
  let fixture: ComponentFixture<MakeSyndicationPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakeSyndicationPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeSyndicationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
