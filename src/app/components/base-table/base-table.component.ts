import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { NgForOf, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableService } from '@app/components/base-table/services/table.service';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { DataArray } from '@app/components/base-table/models/table-data-array';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { SortMeta } from '@app/components/base-table/models/sort-meta.interface';
import { FilterMetadata } from '@app/components/base-table/models/filter-metadata.interface';
import { IFixedHeaderConfig } from '@app/components/base-table/models/fixed-header-config.interface';
import { IEditableColumnMeta } from '@app/components/base-table/models/editable-column-meta.interface';
import { TemplateHeaderDirective } from '@app/components/base-table/directives/template-header.directive';
import { ITableDataRow, TableRowType } from '@app/components/base-table/models/table-row.interface';
import { FilterService } from '@app/components/base-table/services/filter.service';
import { FilterOperator } from '@app/components/base-table/models/filter-operator';
import { FilterMatchMode } from '@app/components/base-table/models/filter-match-mode';
import { SortOrder } from '@app/components/base-table/models/sort-order';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { PaginationComponent } from '@app/components/controls/paginator/pagination.component';
import { ArrayUtils } from '@app/utils/array.utils';
import { ObjectUtils } from '@app/utils/object.utils';
import { DisplayFnPipe } from '@app/pipes/display-fn.pipe';

const constants = {
  TEMPLATE: {
    header: 'header',
    body: 'body',
    footer: 'footer',
  },
};

@Component({
  selector: 'app-base-table',
  templateUrl: './base-table.component.html',
  styleUrls: ['./base-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [TableService, CdkVirtualScrollViewport],
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgForOf,
    NgTemplateOutlet,
    NgIf,
    PaginationComponent,
    ReactiveFormsModule,
    ScrollingModule,
    DisplayFnPipe,
  ],
})
export class BaseTableComponent<TableData extends ITableData> implements AfterViewInit, OnChanges, OnDestroy {
  public readonly TEMPLATE = constants.TEMPLATE;
  private _data: DataArray<TableData> = [];
  private _columns: ITableConfig<TableData>[] = [];
  private _footerColumns: ITableConfig<TableData>[][] = [];
  private _enablePagination: boolean | undefined = false;
  private filteredData: DataArray<TableData> | null = null;
  public visibleData: { items: DataArray<TableData>; total: number } = {
    items: [],
    total: 0,
  };
  public readonly paginationControl = new FormControl({
    page: 1,
    pageSize: 25,
  });
  private paginationSubscription: Subscription | undefined;

  @Input({ required: false }) public enableVirtualScroll = false;
  @Input({ required: false }) public sort: SortMeta | undefined;
  @Input({ required: false }) public filters: {
    [s: string]: FilterMetadata[] | undefined;
  } = {};
  @Input({ required: false }) public fixedHeader: IFixedHeaderConfig | undefined;
  @Input({ required: false }) public minWidth100 = true;
  private ObjectUtils: any;

  @Input({ required: false })
  public set enablePagination(enablePagination: boolean | undefined) {
    this._enablePagination = enablePagination;
    this.updatePagination();
  }

  public get enablePagination(): boolean | undefined {
    return this._enablePagination;
  }

  @Input() get data(): DataArray<TableData> {
    return this._data;
  }

  set data(val: DataArray<TableData> | null) {
    this._data = ObjectUtils.cloneDeep(val) ?? [];
    this.tableService.onDataChange(this.data);
    this._filter();
    this._sort();
  }

  @Input() get columns(): ITableConfig<TableData>[] {
    return this._columns;
  }

  set columns(cols: ITableConfig<TableData>[]) {
    this._columns = cols;
  }

  @Input() get footerColumns(): ITableConfig<TableData>[][] {
    return this._footerColumns;
  }

  set footerColumns(cols: ITableConfig<TableData>[][]) {
    this._footerColumns = cols;
  }

  get processedData(): DataArray<TableData> {
    return this.filteredData || this.data || [];
  }

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFilter: EventEmitter<{
    filters: { [s: string]: FilterMetadata | FilterMetadata[] | undefined };
    filteredValue: DataArray<TableData>;
  }> = new EventEmitter();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onSort = new EventEmitter<SortMeta>();
  @Output() scrollIndexChanged = new EventEmitter<number>();
  @Output() pageChanged = new EventEmitter<void>();
  @Output() dataEdit = new EventEmitter<{
    meta: IEditableColumnMeta;
    data: TableData;
  }>();
  @ContentChildren(TemplateHeaderDirective, { read: TemplateHeaderDirective })
  public templates: QueryList<TemplateHeaderDirective> = new QueryList();
  @ViewChild(CdkVirtualScrollViewport, { static: false }) scrollViewport: CdkVirtualScrollViewport | undefined;
  private destroyRef = inject(DestroyRef);

  public trackByTemplateName = (_: number, template: TemplateHeaderDirective): string => {
    return template.templateName;
  };

  public trackByDataId = (_: number, item: ITableDataRow<TableData>): string | number => {
    let id: string | number = _;
    if ('data' in item) {
      id = item.data.id;
    }
    return id;
  };

  constructor(
    public tableService: TableService,
    public filterService: FilterService,
    private cdr: ChangeDetectorRef
  ) {}

  public ngOnChanges(): void {
    this.initVisibleData();
  }

  public ngAfterViewInit(): void {
    this.scrollViewport?.renderedRangeStream
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((range) => this.scrollIndexChanged.emit(range.start));
  }

  public ngOnDestroy(): void {
    if (this.paginationSubscription) {
      this.paginationSubscription.unsubscribe();
    }
  }

  public getRowsList = (items: (TableData[] | TableData[][])[]): ITableDataRow<TableData>[] => {
    const result: ITableDataRow<TableData>[] = [];
    items.forEach((dataGroup, dataGroupIndex) => {
      dataGroup.forEach((item, dataIndex) => {
        if (!Array.isArray(item)) {
          result.push({
            type: TableRowType.Data,
            dataGroupIndex: dataGroupIndex,
            dataIndex: dataIndex,
            data: item,
          });
        } else {
          item.forEach((innerItem, innerItemIndex) => {
            result.push({
              type: TableRowType.Data,
              dataGroupIndex: dataGroupIndex,
              dataIndex: innerItemIndex,
              data: innerItem,
            });
          });
        }
      });
    });
    return result;
  };

  public isSorted(field: string): boolean {
    return !!this.sort?.field && this.sort.field === field;
  }

  public haveFooter = (templates: QueryList<TemplateHeaderDirective>): boolean => {
    return templates.some((template) => {
      return template.templateName === this.TEMPLATE.footer;
    });
  };

  private initVisibleData = (): void => {
    if (this.enablePagination) {
      this.visibleData = {
        items: [this.processedData?.[0].slice(0, this.paginationControl.value!.pageSize)],
        total: this.processedData?.[0].length ?? 0,
      };
      this.paginationControl.patchValue({
        page: 1,
        pageSize: this.paginationControl.value?.pageSize ?? 25,
      });
    } else {
      this.visibleData = {
        items: this.processedData,
        total: this.processedData.length,
      };
    }
  };

  private changePage = (pagination: { page: number; pageSize: number } | null): void => {
    if (!pagination) return;
    const startIndex = (pagination.page - 1) * pagination.pageSize;

    const items = [this.processedData?.[0].slice(startIndex, startIndex + pagination.pageSize)];

    this.visibleData = { items, total: this.processedData?.[0].length };
    this.pageChanged.emit();
  };

  private updatePagination(): void {
    if (this.paginationSubscription) {
      this.paginationSubscription.unsubscribe();
    }
    if (this.enablePagination) {
      this.paginationSubscription = this.paginationControl.valueChanges.subscribe(this.changePage);
    }
  }

  public applySort(): void {
    if (!this.sort) {
      return;
    }
    this._sort();
    this.onSort.emit(this.sort);
    this.initVisibleData();
    this.pageChanged.emit();
  }

  private _sort(): void {
    if (!this.sort) {
      return;
    }

    if (this.sort && this.sort.field) {
      this.sortData(this.data);
      this.sortData(this.filteredData);
      this._data = [...this.data];
      this.tableService.onSort(this.sort);
    }
  }

  public filter(): void {
    if (!this.data) {
      return;
    }
    this._filter();
    this.onFilter.emit({
      filters: this.filters,
      filteredValue: this.filteredData || this.data,
    });
  }

  private _filter(): void {
    if (!this.data) {
      return;
    }
    if (!this.hasFilter()) {
      this.filteredData = null;
    } else {
      this.filteredData = [];
      this.data.forEach((dataGroup) => {
        if (ArrayUtils.getArrayDepth(dataGroup) === 1) {
          this.filteredData?.push(this.filterDataGroup(dataGroup as TableData[]));
        } else if (ArrayUtils.getArrayDepth(dataGroup) === 2) {
          const dataFilteredValue: TableData[][] = [];
          (dataGroup as TableData[][]).forEach((innerDataGroup) => {
            dataFilteredValue.push(this.filterDataGroup(innerDataGroup));
          });
          this.filteredData?.push(dataFilteredValue);
        }
      });
    }
    this.tableService.onDataChange(this.data);
    this.cdr.markForCheck();
  }

  private filterDataGroup(dataGroup: TableData[]): TableData[] {
    const dataFilteredValue: TableData[] = [];
    dataGroup.forEach((data) => {
      let localMatch = true;
      let localFiltered = false;
      for (const prop in this.filters) {
        if (Object.prototype.hasOwnProperty.call(this.filters, prop)) {
          localFiltered = true;
          const filterField = prop;
          const filterMeta = this.filters[filterField];

          if (Array.isArray(filterMeta)) {
            for (const meta of filterMeta) {
              if (Array.isArray(data)) {
                data.forEach((item) => {
                  localMatch = this.executeLocalFilter(filterField, item, meta);
                });
              } else {
                localMatch = this.executeLocalFilter(filterField, data, meta);
              }

              if (
                (meta.operator === FilterOperator.OR && localMatch) ||
                (meta.operator === FilterOperator.AND && !localMatch)
              ) {
                break;
              }
            }
          }
          if (!localMatch) {
            break;
          }
        }
      }
      const matches = localFiltered && localMatch;
      if (matches) {
        dataFilteredValue.push(data);
      }
    });
    return dataFilteredValue;
  }

  private hasFilter(): boolean {
    let empty = true;
    for (const prop in this.filters) {
      if (Object.prototype.hasOwnProperty.call(this.filters, prop)) {
        empty = false;
        break;
      }
    }

    return !empty;
  }

  private executeLocalFilter(field: string, rowData: TableData, filterMeta: FilterMetadata): boolean {
    const filterValue = filterMeta.value;
    const filterMatchMode = filterMeta.matchMode || FilterMatchMode.SEARCH;
    const dataFieldValue = ObjectUtils.resolveFieldData(rowData, field);
    const filterConstraint = this.filterService.filters[filterMatchMode];

    return filterConstraint(dataFieldValue, filterValue);
  }

  private sortData(tableData: DataArray<TableData> | null): void {
    if (!tableData) {
      return;
    }
    tableData.forEach((data) => {
      if (ArrayUtils.getArrayDepth(data) === 1) {
        this.sortDataGroup(data as TableData[]);
      } else if (ArrayUtils.getArrayDepth(data) === 2) {
        (data as TableData[][]).forEach(this.sortDataGroup);
      }
    });
  }

  private sortDataGroup = (data: TableData[]): void => {
    data.sort((data1, data2) => {
      const value1 = ObjectUtils.resolveFieldData(data1, this.sort?.field) ?? '';
      const value2 = ObjectUtils.resolveFieldData(data2, this.sort?.field) ?? '';
      let result: SortOrder;

      if (value1 == null && value2 != null) result = SortOrder.DESC;
      else if (value1 != null && value2 == null) result = SortOrder.ASC;
      else if (value1 == null && value2 == null) result = SortOrder.DEFAULT;
      else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
      else result = value1 < value2 ? SortOrder.DESC : value1 > value2 ? SortOrder.ASC : SortOrder.DEFAULT;

      return (this.sort?.order ?? SortOrder.DEFAULT) * result;
    });
  };
}
