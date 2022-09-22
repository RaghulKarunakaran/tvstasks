import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AccountingReportsCommonInterface, DateFormat, NameOfCalenderPeriods, SplitMethodDetails } from '@app/definition/accounting-reports/account-report';
import { CalenderPeriods, SplitMethod } from '@app/definition/accounting-reports/account-report.enum';
import { NgbDatePickerInterAccountingReports } from '@app/definition/state';
import { CommonService } from '@app/services/common.service';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fora-make-syndication-payment',
  templateUrl: './make-syndication-payment.component.html',
  styleUrls: ['./make-syndication-payment.component.scss'],
})
export class MakeSyndicationPaymentComponent implements OnInit {
  public userDetails: any;
  public maxDateRage!: { month: number; day: number; year: number };
  public ngbDate!: NgbDatePickerInterAccountingReports;  
  public selectedMonthFilter: number = CalenderPeriods.Daily;
  public isFromDate!: boolean;
  public fromDate: string = moment().format(DateFormat);
  public toDate: string = moment().format(DateFormat);  
  public dateRage!: string;
  private ngbDatePicker: NgbDate = this.ngbCalender.getToday();
  public readonly dateFilterList: AccountingReportsCommonInterface[] =  NameOfCalenderPeriods;
  public isFilterSelected: boolean = false;
  public isCustomDateRage: boolean = false;
  private getLastTransactions: any;
  public splitMethodInfo: AccountingReportsCommonInterface[] = SplitMethodDetails;
  public selectedSplitMethod: number = SplitMethod.EffectiveInterest;
  public brandedCompanyId!: number;
  public balanceSheet: any; 
  public searchForm!: FormGroup;
  public advancedSearchForm!: FormGroup;
  public placeHolder: String = 'Search by Partner Name';
  public summaries : boolean = false;
  public entries : boolean = false;
  constructor(private commonService: CommonService,     
    private ngbCalender: NgbCalendar,
    private toastr: ToastrService, 
    public modalService: NgbModal) {
      if (this.commonService.getStorage('userDetails') !== null && this.commonService.getStorage('userDetails') !== undefined) {
        this.userDetails = JSON.parse(this.commonService.getStorage('userDetails') as string);
      }
      this.maxDateRage = {
        month: Number(moment().format('MM')),
        day: Number(moment().format('DD')),
        year: Number(moment().format('YYYY')),
      };
      this.dateRage = `${moment().format(DateFormat)} - ${moment().format(
        DateFormat
      )}`; // date rage by default daily
      this.ngbDate = {
        dateRageFromDate: this.fromDate
          ? this.converToStartDate(this.fromDate)
          : this.ngbDatePicker,
        dateRageToDate: this.toDate
          ? this.converToStartDate(this.toDate)
          : this.ngbDatePicker,
      };
      this.toDate = moment().format(DateFormat);
      this.GetFilter();
      
      this.searchForm = new FormGroup({
      '1companyName': new FormControl(''),
    });
    this.advancedSearchForm = new FormGroup({
      '1businessPhoneNumber': new FormControl(''),
      '2taxId': new FormControl(''),
      '3appId': new FormControl(''),
    });

  }

  ngOnInit(): void {}
  public advancedSearch(formgroup: FormGroup) {}
  public downloadExcel(ind: string) {}

  private converToStartDate(val: string): any {
    return {
      month: Number(moment(val).format('MM')) - 1,
      day: moment(val).format('DD'),
      year: moment(val).format('YYYY'),
    };
  }
  private GetFilter() {
    let url = `SyndicatingPayoutHistoryDropdown?UserId=${this.userDetails.userId}`
    this.commonService.getAllDealServiceCall(url).subscribe((res) => {
      if (res && res?.success) {
        this.balanceSheet = res?.data?.balanceSheet;
      }
    })
  }
  public dateFilter(val: string): void {
    this.isFilterSelected = true;
    if (this.selectedMonthFilter !== CalenderPeriods.Custom) {
      const date: Date = new Date();
      let firstDay: Date = new Date(moment(this.fromDate).format());
      let lastDay: Date = new Date(moment(this.toDate).format());
      switch (this.selectedMonthFilter) {
        case CalenderPeriods.Monthly: {
          if (val === '+') {
            if (
              firstDay.getFullYear() < date.getFullYear() ||
              (firstDay.getFullYear() === date.getFullYear() &&
                firstDay.getMonth() < date.getMonth())
            ) {
              firstDay = new Date(
                firstDay.getFullYear(),
                firstDay.getMonth() + 1,
                1
              );
              lastDay = new Date(
                lastDay.getFullYear(),
                lastDay.getMonth() + 2,
                0
              );
            }
          } else {
            firstDay = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() - 1,
              1
            );
            lastDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), 0);
          }
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        case CalenderPeriods.Yearly: {
          if (val === '+') {
            if (firstDay.getFullYear() < date.getFullYear()) {
              firstDay = new Date(firstDay.getFullYear() + 1, 0, 1);
              lastDay = new Date(lastDay.getFullYear() + 2, 0, 0);
            }
          } else {
            firstDay = new Date(firstDay.getFullYear() - 1, 0, 1);
            lastDay = new Date(lastDay.getFullYear(), 0, 0);
          }
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        case CalenderPeriods.Weekly: {
          if (val === '+') {
            if (
              firstDay.getFullYear() < date.getFullYear() ||
              (firstDay.getFullYear() === date.getFullYear() &&
                firstDay.getMonth() < date.getMonth()) ||
              (firstDay.getFullYear() === date.getFullYear() &&
                firstDay.getMonth() === date.getMonth() &&
                firstDay.getDate() + 7 <= date.getDate())
            ) {
              firstDay = new Date(
                firstDay.getFullYear(),
                firstDay.getMonth(),
                firstDay.getDate() + 7
              );
              lastDay = new Date(
                lastDay.getFullYear(),
                lastDay.getMonth(),
                lastDay.getDate() + 7
              );
            }
          } else {
            firstDay = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth(),
              firstDay.getDate() - 7
            );
            lastDay = new Date(
              lastDay.getFullYear(),
              lastDay.getMonth(),
              lastDay.getDate() - 7
            );
          }
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        case CalenderPeriods.Daily: {
          if (val === '+') {
            if (
              firstDay.getFullYear() < date.getFullYear() ||
              (firstDay.getFullYear() === date.getFullYear() &&
                firstDay.getMonth() < date.getMonth()) ||
              (firstDay.getFullYear() === date.getFullYear() &&
                firstDay.getMonth() === date.getMonth() &&
                firstDay.getDate() < date.getDate())
            ) {
              firstDay = new Date(
                firstDay.getFullYear(),
                firstDay.getMonth(),
                firstDay.getDate() + 1
              );
            }
          } else {
            firstDay = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth(),
              firstDay.getDate() - 1
            );
          }
          lastDay = firstDay;
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        default: {
          break;
        }
      }
      this.dateRage = `${moment(this.fromDate).format(DateFormat)} - ${moment(
        this.toDate
      ).format(DateFormat)}`;
      this.ngbDate = {
        dateRageFromDate: this.fromDate
          ? this.converToStartDate(this.fromDate)
          : this.ngbDatePicker,
        dateRageToDate: this.toDate
          ? this.converToStartDate(this.toDate)
          : this.ngbDatePicker,
      };
    }
    if (this.getLastTransactions) {
      // const sendObj = this.GetsendObj(
      //   this.getLastTransactions[0],
      //   this.getLastTransactions[1]
      // );
      // if (sendObj) {
      //   //this.ndsFilterEmitter.emit(sendObj);
      //   //this.getBatchedTransactions(sendObj, '');
      // }
    }
  }
  // date rage mat-select onchange event
  public dateChangeEvent(val: number): void {
    switch (val) {
      case CalenderPeriods.Monthly:
        break;
      case CalenderPeriods.Weekly:
        break;
      case CalenderPeriods.Yearly:
        break;
      case CalenderPeriods.Custom:
        this.isCustomDateRage = !this.isCustomDateRage;
        break;
      default:
        this.dateRage = `${moment().format(DateFormat)} - ${moment().format(
          DateFormat
        )}`;
        break;
    }
  }

  public dateOkAndCancelEvent(val: string): void {
    if (val !== 'close') {
      this.dateRage = `${moment(this.fromDate).format(DateFormat)} - ${moment(
        this.toDate
      ).format(DateFormat)}`;
    } else {
      const date: Date = new Date();
      this.isCustomDateRage = !this.isCustomDateRage;
      this.selectedMonthFilter = CalenderPeriods.Daily;
      this.fromDate = moment(date).format(DateFormat);
      this.toDate = moment(date).format(DateFormat);
      this.dateRage = `${moment(this.fromDate).format(DateFormat)} - ${moment(
        this.toDate
      ).format(DateFormat)}`;
      this.ngbDate = {
        dateRageFromDate: this.fromDate
          ? this.converToStartDate(this.fromDate)
          : this.ngbDatePicker,
        dateRageToDate: this.toDate
          ? this.converToStartDate(this.toDate)
          : this.ngbDatePicker,
      };
    }
    this.createFilterData('', 'dateOkAndCancelEvent');
  }
  public openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'cost-center-management',
    });
  }

  public onDateSelect(): void {
    this.commonService.ngbMonthAutoChange();
  }

  public onDateClick(type: string): void {
    if (type === 'from') {
      this.fromDate = this._alignDateFormat(
        `${this.ngbDate.dateRageFromDate.month}/${this.ngbDate.dateRageFromDate.day}/${this.ngbDate.dateRageFromDate.year}`
      );
      this.isFromDate = this.fromDate.length > 0 ? false : true;
    } else {
      this.toDate = this._alignDateFormat(
        `${this.ngbDate.dateRageToDate.month}/${this.ngbDate.dateRageToDate.day}/${this.ngbDate.dateRageToDate.year}`
      );
    }
    this.selectedMonthFilter = CalenderPeriods.Daily;
  }

  private _alignDateFormat(date: string): string {
    return moment(new Date(`${date}`)).format(DateFormat);
  }

  public isFormDataValidationEvent(event: string): void {
    this.isFromDate = event?.length !== 8;
  }

  public createFilterData(event: any, type: string) {
    this.isFilterSelected = true;
    if (type === 'selectedMonthFilter' && event !== CalenderPeriods.Custom) {
      let date: Date = new Date();
      switch (event) {
        case CalenderPeriods.Monthly: {
          let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        case CalenderPeriods.Yearly: {
          let firstDay = new Date(date.getFullYear(), 0, 1);
          let lastDay = new Date(date.getFullYear() + 1, 0, 0);
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        case CalenderPeriods.Weekly: {
          let firstDay = moment().startOf('week').toDate();
          let lastDay = moment().endOf('week').toDate();
          this.fromDate = moment(firstDay).format(DateFormat);
          this.toDate = moment(lastDay).format(DateFormat);
          break;
        }
        case CalenderPeriods.Daily: {
          this.fromDate = moment(date).format(DateFormat);
          this.toDate = moment(date).format(DateFormat);
          break;
        }
        default: {
          break;
        }
      }
      this.dateRage = `${moment(this.fromDate).format(DateFormat)} - ${moment(
        this.toDate
      ).format(DateFormat)}`;
      this.ngbDate = {
        dateRageFromDate: this.fromDate
          ? this.converToStartDate(this.fromDate)
          : this.ngbDatePicker,
        dateRageToDate: this.toDate
          ? this.converToStartDate(this.toDate)
          : this.ngbDatePicker,
      };
    }
    // let sendObj = this.GetsendObj(event, type);
    // if (sendObj) {
    //   this.getBatchedTransactions(sendObj, '');
    // }
  }
}
