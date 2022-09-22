import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import {
  AccountingReportsCommonInterface,
  DateFormat,
  NameOfCalenderPeriods,
  ReportByDetails,
  SplitMethodDetails,
  fundMgmtBalanceSheet,
  fundMgmtBalanceFilter,
} from '@app/definition/accounting-reports/account-report';
import {
  CalenderPeriods,
  FundBalanceFilter,
  FundBalanceSheet,
  ReportBy,
  SplitMethod,
} from '@app/definition/accounting-reports/account-report.enum';
import { NgbDatePickerInterAccountingReports } from '@app/definition/state';
import { LedgerEntryReport } from '@app/definition/syndication-partners/syndication-partners';
import { CommonService } from '@app/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { EnvironmentService } from '@app/services/environment/environment.service';
import { NgbCalendar, NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Subject } from 'rxjs';
const environment = new EnvironmentService().getCurrentEnvConfig();

@Component({
  selector: 'fora-fundings-management',
  templateUrl: './fundings-management.component.html',
  styleUrls: ['./fundings-management.component.scss'],
})
export class FundingsManagementComponent implements OnInit {
  public selectedMonthFilter: number = CalenderPeriods.Daily;
  public selectedReportedBy: number = ReportBy.BankSettlementDate;
  public selectedBalanceFilter: number = FundBalanceFilter.All;
  public selectedBalanceSheet: number = FundBalanceSheet.All;
  public isFromDate!: boolean;
  public fromDate: string = moment().format(DateFormat);
  public toDate: string = moment().format(DateFormat);
  public brandedCompanyId: string = '';
  public isCustomDateRage: boolean = false;
  public splitMethodInfo: AccountingReportsCommonInterface[] =
    SplitMethodDetails;
  public reportedByDetails: AccountingReportsCommonInterface[] =
    ReportByDetails;

  public LedgerEntryReportInfo: AccountingReportsCommonInterface[] =
    LedgerEntryReport;
  public readonly dateFilterList: AccountingReportsCommonInterface[] =
    NameOfCalenderPeriods;
  public balanceSheetList: AccountingReportsCommonInterface[] =
    fundMgmtBalanceSheet;
  public balanceFilterList: AccountingReportsCommonInterface[] =
    fundMgmtBalanceFilter;
  public dateFilterVal!: string;
  public dateRage!: string;
  public maxDateRage!: { month: number; day: number; year: number };
  public ngbDate!: NgbDatePickerInterAccountingReports;
  public selectedSplitMethod: number = SplitMethod.EffectiveInterest;
  public userDetails: any;
  public newDataTableConfig: Array<object> | any;
  private ngbDatePicker: NgbDate = this.ngbCalender.getToday();
  private getLastTransactions: any;
  public searchForm!: FormGroup;
  public advancedSearchForm!: FormGroup;
  public btFilter: boolean = false;
  public isFilterDataAvilable!: boolean;
  public isFilterSelected: boolean = false;
  public searchParameter: String = '';

  constructor(
    private modalService: NgbModal,
    private ngbCalender: NgbCalendar,
    private commonService: CommonService,
    private toastr: ToastrService
  ) {
    this.userDetails = this.commonService.getStorage('userDetails')
      ? JSON.parse(this.commonService.getStorage('userDetails') as string)
      : null;
    this.searchForm = new FormGroup({
      '1companyName': new FormControl(''),
    });
    this.advancedSearchForm = new FormGroup({
      '1businessPhoneNumber': new FormControl(''),
      '2taxId': new FormControl(''),
      '3appId': new FormControl(''),
    });
    this.dateRage = `${moment().format(DateFormat)} - ${moment().format(
      DateFormat
    )}`;
  }

  ngOnInit(): void {
    let sendobj = this.GetsendObj('', '');
    this.isFilterSelected = true;
    this.getFundingMgmtData(sendobj, '');
  }
  downloadExcel(option) {}
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
    let sendObj = this.GetsendObj(event, type);
    if (sendObj) {
      this.getFundingMgmtData(sendObj, '');
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
  public dateFilter(val: string): void {
    //this.isFilterSelected = true;
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
      const sendObj = this.GetsendObj(
        this.getLastTransactions[0],
        this.getLastTransactions[1]
      );
      if (sendObj) {
        //this.ndsFilterEmitter.emit(sendObj);
        this.getFundingMgmtData(sendObj, '');
      }
    }
  }
  private converToStartDate(val: string): any {
    return {
      month: Number(moment(val).format('MM')) - 1,
      day: moment(val).format('DD'),
      year: moment(val).format('YYYY'),
    };
  }
  public isFormDataValidationEvent(event: string): void {
    this.isFromDate = event?.length !== 8;
  }
  OpenBt() {}
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
  private GetsendObj(event: any, type: string): any {
    this.getLastTransactions = [event, type];
    if (
      type !== 'selectedMonthFilter' ||
      (type === 'selectedMonthFilter' && event !== CalenderPeriods.Custom)
    ) {
      return {
        userId: this.userDetails.userId,
        roleName: this.userDetails.roleName,
        balanceFilter: this.selectedBalanceFilter,
        brandedCompanyID: this.selectedBalanceSheet,
        opportunityFilter: '',
        searchText: this.searchParameter,
        activated: '',
      };
    }
  }
  getFundingMgmtData(sendObj: any, callBackEvent: any) {
    try {
      let url = `${environment.apisyndicationpartnerUrl}/GetFundBalanceManagement`;
      this.commonService.postCallByURL(url, sendObj).subscribe(
        (result: any) => {
          if (result && result.success) {
            let data = result?.data;
            this.AddToDataTable(data, callBackEvent);
          } else {
            //this.commonService.isTokenValid()
          }
        },
        (err) => {
          this.toastr.error('Error!', JSON.stringify(err));
        }
      );
    } catch (e) {
      this.toastr.error('Error!', JSON.stringify(e));
    }
  }
  AddToDataTable(data: any, callBackEvent: any) {
    try {
      this.newDataTableConfig = {
        isShowPagination: false,
        isDynamicPagination: false,
        isDynamicSorting: true,
        isShowFooter: true,
        filterKey: 'dealID',
        totalRecords: data?.totalCount,
        displayedColumns: [
          'syndicatingPartnerName',
          'merchantCompanyName',
          'dealStatusID',
          'uwDealStatusID',
          'totalExpectedFunded',
          'totalExpectedCommission',
          'totalExpected',
          'totalReceived',
          'totalPositiveNot_Applied',
          'totalRefunded',
          `totalBounced`,
          'outstandingBalance',
        ],
        highLightedRowClassName: '',
        highLightedRowValue: '',
        highLightedColumnClassName: '',
        highLightedColumnValue: '',
        displayedColumnsList: {
          syndicatingPartnerName: {
            columnName: 'Partner Name',
            parameter: 'syndicatingPartnerName',
            format: 'text',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          merchantCompanyName: {
            columnName: 'Company Name',
            parameter: 'merchantCompanyName',
            format: 'text',
            navigation: true,
            class: 'sysTextColor',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          dealStatusID: {
            columnName: 'Deal Status',
            parameter: 'dealStatusID',
            format: 'text',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          uwDealStatusID: {
            columnName: 'UW Deal Status',
            parameter: 'uwDealStatusID',
            format: 'text',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalExpectedFunded: {
            columnName: 'Expected Funded',
            parameter: 'totalExpectedFunded',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalExpectedCommission: {
            columnName: 'Expected Commissions',
            parameter: 'totalExpectedCommission',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalExpected: {
            columnName: 'Expected Total',
            parameter: 'totalExpected',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalReceived: {
            columnName: 'Received Total',
            parameter: 'totalReceived',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalPositiveNot_Applied: {
            columnName: 'Not Applied',
            parameter: 'totalPositiveNot_Applied',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalRefunded: {
            columnName: 'Refunded Total',
            parameter: 'totalRefunded',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          totalBounced: {
            columnName: 'Bounced Total',
            parameter: 'totalBounced',
            format: 'currency',
            navigation: false,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          outstandingBalance: {
            columnName: 'Outstanding Balance',
            parameter: 'outstandingBalance',
            format: 'currency',
            navigation: true,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: true,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
        },
        dataSource: new MatTableDataSource<any>(data),
      };
    } catch (e) {}
    //console.log("newDataTableConfig",this.newDataTableConfig?.currentPageSize,this.newDataTableConfig?.currentPageIndex,this.newDataTableConfig?.totalRecords);
  }
  actionCallBack(event: any) {
    console.log(event);
    //let { data, keyName } = event;
  }
  advancedSearch(formGroups: FormGroup) {
    //this.isFilterSelected = true;
    if (formGroups) {
      const formGroup = formGroups;
      for (var key in formGroup.value) {
        formGroup.value[key] = formGroups.controls[key].value;
        if (formGroup.value[key]) {
          this.searchParameter = formGroups.controls[key].value;
        } else {
          this.searchParameter = '';
        }
      }
      let sendObj = this.GetsendObj('', '');
      if (sendObj) {
        this.getFundingMgmtData(sendObj, '');
      }
    }
  }
  opensdFilter() {}
}
