import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonService } from '@app/services/common.service';
import { EnvironmentService } from '@app/services/environment/environment.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
const environment = new EnvironmentService().getCurrentEnvConfig();

@Component({
  selector: 'fora-deal-share-opportunities',
  templateUrl: './deal-share-opportunities.component.html',
  styleUrls: ['./deal-share-opportunities.component.scss'],
})
export class DealShareOpportunitiesComponent implements OnInit {
  public userDetails: any;

  public dataTableConfig!: any;
  public callBackPagination: Subject<any> = new Subject<any>();
  public pageSize: number = 50;
  public pageIndex: number = 0;
  public getAllSortingData: any = [];
  public searchForm!: FormGroup;
  public advancedSearchForm!: FormGroup;
  public placeHolder: string = 'Search By DBA Name,PO Phone No,PO First Name';
  public dynamicPaginationReinitiate: Subject<any> = new Subject<any>();
  private dealShareInitialData!: Subscription;
  public isfavoritecheck: boolean = false;
  public isSearchButtonClicked: boolean = false;
  public filteredValueURL: string = '';
  public isFilterSelected: boolean = false;

  constructor(
    private commonService: CommonService,
    private toastr: ToastrService,
    private router: Router
  ) {
    if (
      this.commonService.getStorage('userDetails') !== null &&
      this.commonService.getStorage('userDetails') !== undefined
    ) {
      this.userDetails = JSON.parse(
        this.commonService.getStorage('userDetails') as string
      );
    }
    this.searchForm = new FormGroup({
      Search: new FormControl(''),
    });
    this.getInitialData();
  }

  ngOnInit(): void {}

  getInitialData() {
    this.isFilterSelected = true;
    this.userDetails = JSON.parse(this.commonService.getStorage('userDetails'));
    let url = `${
      environment.apisyndicationpartnerUrl
    }/OpportunitiesOverview?ShowOnlyFavorities=${this.isfavoritecheck}&PageNo=${
      this.pageIndex + 1
    }&DisplayRowCount=${this.pageSize}&UserId=${
      this.userDetails.userId
    }&RoleName=${this.userDetails.roleName}`;
    this.getopportunityoverviewList(url, '');
  }

  callBackPaginateUnderWrittingDeals(event: any) {
    let filteredURL = ``;
    if (filteredURL) {
      this.getopportunityoverviewList(
        `OpportunitiesOverview?PageNo=${event.pageIndex + 1}&DisplayRowCount=${
          event.pageSize
        }&${filteredURL}&UserId=` +
          this.userDetails?.userId +
          `&SortingField=` +
          event.sortingField +
          `&SortingOrder=` +
          event.sortingOrder,
        event
      );
    } else {
      this.getopportunityoverviewList(
        `OpportunitiesOverview?PageNo=${event.pageIndex + 1}&DisplayRowCount=${
          event.pageSize
        }&UserId=` +
          this.userDetails?.userId +
          `&SortingField=` +
          event.sortingField +
          `&SortingOrder=` +
          event.sortingOrder,
        event
      );
    }
  }

  dynamicPaginationCallBack(event: any) {
    //console.log("dynamicPaginationCallBack",event);
    let url = `${
      environment.apisyndicationpartnerUrl
    }/OpportunitiesOverview?ShowOnlyFavorities=${this.isfavoritecheck}&PageNo=${
      event.pageIndex + 1
    }&DisplayRowCount=${event.pageSize}&UserId=${
      this.userDetails.userId
    }&RoleName=${this.userDetails.roleName}`;
    if (event.sortingField && event.sortingOrder) {
      if (event.sortingField == 'typeText') {
        event.sortingField = 'type';
      }
      if (event.sortingField == 'statusText') {
        event.sortingField = 'status';
      }
      if (event.sortingField == 'lastCollectionActivityText') {
        event.sortingField = 'lastCollectionActivity';
      }
      if (event.sortingField == 'returnCode') {
        event.sortingField = 'latestReturnCodeId';
      }
      url +=
        `&SortingField=` +
        event.sortingField +
        `&SortingOrder=` +
        event.sortingOrder;
    }
    if (this.filteredValueURL) {
      url += `&${this.filteredValueURL}`;
    }
    this.getopportunityoverviewList(url, event);
  }

  getopportunityoverviewList(actionUrl: string, callBackEvent: any) {
    //getAllDealServiceCall changed to getCallByURL
    if (this.toastr) this.toastr.clear();
    try {
      this.commonService.getCallByURL(actionUrl).subscribe(
        (result: any) => {
          if (result && result.success) {
            const res = result.data;
            this.AddToDataTable(res, '');
            setTimeout(() => {
              this.callBackPagination.next(
                this.dataTableConfig.currentPageSize
              );
            }, 800);
          } else {
            this.commonService.isTokenValid();
          }
        },
        (err) => {
          this.toastr.error('Error!', JSON.stringify(err));
        }
      );
    } catch (e) {
      this.toastr.error('Syntax error');
    }
  }

  AddToDataTable(data: any, callBackEvent: any) {
    try {
      this.dataTableConfig = {
        isShowPagination: true,
        isDynamicPagination: true,
        isDynamicSorting: true,
        isShowFooter: true,
        filterKey: 'dealID',
        currentPageSize: callBackEvent ? callBackEvent.pageSize : this.pageSize,
        currentPageIndex: callBackEvent
          ? callBackEvent.pageIndex
          : this.pageIndex,
        totalRecords: data?.totalCount,
        displayedColumns: [
          'favorite',
          'dba',
          'uwDealStatus',
          'minPartnerContribution',
          'maxPartnerContribution',
          'acceptanceStatus',
          'contractsStatus',
          'fundsStatus',
          'particPercentage',
          'particAmount',
          'commRate',
          'commAmount',
          'totalDue',
          'receivedAmount',
        ],
        highLightedRowClassName: '',
        highLightedRowValue: '',
        highLightedColumnClassName: '',
        highLightedColumnValue: '',
        displayedColumnsList: {
          favorite: {
            columnName: 'Fav',
            parameter: 'favorite',
            format: 'icon',
            navigation: true,
            class: '',
            accordionOpen: false,
            isShowAccordionLabel: false,
            sorting: false,
            combineParameter: '',
            footerLabel: '',
            footerClass: '',
            footerValue: '',
          },
          dba: {
            columnName: 'DBA',
            parameter: 'dba',
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
          uwDealStatus: {
            columnName: 'UW Deal Status',
            parameter: 'uwDealStatus',
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
          minPartnerContribution: {
            columnName: 'Min Partner Contribution',
            parameter: 'minPartnerContribution',
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
          maxPartnerContribution: {
            columnName: 'Max Partner Contribution',
            parameter: 'maxPartnerContribution',
            format: 'date',
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
          acceptanceStatus: {
            columnName: 'Acceptance Status',
            parameter: 'acceptanceStatus',
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
          contractsStatus: {
            columnName: 'Contract Status',
            parameter: 'contractsStatus',
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
          fundsStatus: {
            columnName: 'Fund Status',
            parameter: 'fundsStatus',
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
          particPercentage: {
            columnName: 'Parti Percent',
            parameter: 'particPercentage',
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
          particAmount: {
            columnName: 'Parti Amount',
            parameter: 'particAmount',
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
          commRate: {
            columnName: 'Commission Rate',
            parameter: 'commRate',
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
          commAmount: {
            columnName: 'Commission Amount',
            parameter: 'commAmount',
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
          totalDue: {
            columnName: 'Total Due',
            parameter: 'totalDue',
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
          receivedAmount: {
            columnName: 'Received Amount',
            parameter: 'receivedAmount',
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
        },
        dataSource: new MatTableDataSource<any>(
          data?.opportunitiesOverviewInfos
        ),
      };
      if (this.isFilterSelected) {
        setTimeout(() => {
          this.dynamicPaginationReinitiate.next(this.dataTableConfig);
          this.isFilterSelected = false;
        }, 500);
      }
    } catch (e) {}
  }

  //dynamicPaginationCallBack(event: any) {
  //  let getIndex = this.getAllSortingData.findIndex(
  //    (x) => x.key === event.sortingField
  //  );
  //  if (getIndex != -1) {
  //    this.getAllSortingData[getIndex].sortingOrder = event.sortingOrder;
  //  } else {
  //    let setColumnName = event.sortingField;
  //    if (
  //      setColumnName &&
  //      this.dataTableConfig.displayedColumnsList[setColumnName].parameter
  //    ) {
  //      this.getAllSortingData.push({
  //        sortingField:
  //          this.dataTableConfig.displayedColumnsList[setColumnName].columnName,
  //        sortingOrder: event.sortingOrder,
  //        key: event.sortingField,
  //      });
  //    }
  //  }
  //}

  actionCallBack(event: any) {
    if (event?.columnDetails?.parameter === 'dba') {
      this.router.navigate(['./syndicatingPartners/home/deal-share-details']);
    }
    else if (event?.columnDetails?.parameter === 'contractsStatus') {
      this.router.navigate(['./syndicatingPartners/home/contract']);
    }
    if (event?.columnDetails?.parameter === 'favorite') {
      debugger;
      if (event.data.favorite === 'true') {
        event.data.favorite = 'false';
        return;
      }
      if (event.data.favorite === 'false') {
        event.data.favorite = 'true';
        return;
      }
      let url = `${environment.apisyndicationpartnerUrl}/SetFavouriteOpportunities`;
      let sendObj = {
        userId: this.userDetails.userId,
        roleName: this.userDetails.roleName,
        uwDealId: event?.data?.uwDealId,
      };
      this.commonService.postCallByURL(url, sendObj).subscribe();
      this.getInitialData();
    }
  }

  advancedSearch(formGroups: FormGroup) {
    this.isFilterSelected = true;
    if (formGroups) {
      let filtersQueryParams = '';
      let checkValid = false;
      const formGroup = formGroups;
      for (var key in formGroup.value) {
        formGroup.value[key] = formGroups.controls[key].value;
        if (formGroup.value[key]) {
          checkValid = true;
          let setQueryHeader = key;
          if (key == 'Search') {
            filtersQueryParams += `${setQueryHeader}=${btoa(
              formGroup.value[key]
            )}`;
          } else {
            filtersQueryParams += `${setQueryHeader}=${formGroup.value[key]}`;
          }
        }
      }
      this.filteredValueURL = filtersQueryParams;
      if (checkValid) {
        this.isSearchButtonClicked = true;
        let url = `${
          environment.apisyndicationpartnerUrl
        }/OpportunitiesOverview?${this.filteredValueURL}&ShowOnlyFavorities=${
          this.isfavoritecheck
        }&PageNo=${this.pageIndex + 1}&DisplayRowCount=${
          this.pageSize
        }&UserId=${this.userDetails.userId}&RoleName=${
          this.userDetails.roleName
        }`;
        this.getopportunityoverviewList(url, '');
      } else {
        if (this.toastr.currentlyActive > 0) {
          this.toastr.clear();
        }
        this.toastr.warning('Please enter a value');
        let url = `${
          environment.apisyndicationpartnerUrl
        }/OpportunitiesOverview?ShowOnlyFavorities=${
          this.isfavoritecheck
        }&PageNo=${this.pageIndex + 1}&DisplayRowCount=${
          this.pageSize
        }&UserId=${this.userDetails.userId}&RoleName=${
          this.userDetails.roleName
        }`;
        this.getopportunityoverviewList(url, '');
      }
    } else {
      let url = `${
        environment.apisyndicationpartnerUrl
      }/OpportunitiesOverview?ShowOnlyFavorities=${
        this.isfavoritecheck
      }&PageNo=${this.pageIndex + 1}&DisplayRowCount=${this.pageSize}&UserId=${
        this.userDetails.userId
      }&RoleName=${this.userDetails.roleName}`;
      this.getopportunityoverviewList(url, '');
    }
  }

  toggleFavChkBx() {
    this.isFilterSelected = true;
    this.isfavoritecheck = !this.isfavoritecheck;
    let url = `${
      environment.apisyndicationpartnerUrl
    }/OpportunitiesOverview?ShowOnlyFavorities=${this.isfavoritecheck}&PageNo=${
      this.pageIndex + 1
    }&DisplayRowCount=${this.pageSize}&UserId=${
      this.userDetails.userId
    }&RoleName=${this.userDetails.roleName}`;
    this.getopportunityoverviewList(url, '');
  }

  ngOnDestroy(): void {
    this.dealShareInitialData?.unsubscribe();
  }
}
