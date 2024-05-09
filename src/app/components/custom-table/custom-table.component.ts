import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AsyncPipe,
  DecimalPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
} from '@angular/common';
import { asyncScheduler, debounceTime, map, Observable, shareReplay, Subject, takeUntil, tap } from 'rxjs';
import { ColumnFilterComponent } from '@app/components/base-table/components/column-filter/column-filter.component';
import { TemplateHeaderDirective } from '@app/components/base-table/directives/template-header.directive';
import { BaseTableComponent } from '@app/components/base-table/base-table.component';
import { CustomTableHeaderCollapsedComponent } from '@app/components/custom-table/components/custom-table-header-collapsed/custom-table-header-collapsed.component';
import { CustomTableHeaderComponent } from '@app/components/custom-table/components/custom-table-header/custom-table-header.component';
import { CustomTableHeaderCollapsibleComponent } from '@app/components/custom-table/components/custom-table-header-collapsible/custom-table-header-collapsible.component';
import { ColumnCollapseComponent } from '@app/components/custom-table/components/column-collapse/column-collapse.component';
import { CustomTableDataComponent } from '@app/components/custom-table/components/custom-table-data/custom-table-data.component';
import { CustomTableInnerDataComponent } from '@app/components/custom-table/components/custom-table-inner-data/custom-table-inner-data.component';
import { CustomTableService } from '@app/components/custom-table/custom-table.service';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { DataArray } from '@app/components/base-table/models/table-data-array';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { ArrayUtils } from '@app/utils/array.utils';
import { ITableRowConfig } from '@app/components/custom-table/model/table-row-config';
import { ICustomTableFooterConfig } from '@app/components/custom-table/model/custom-table-footer-config.interface';
import { IEditableColumnMeta } from '@app/components/base-table/models/editable-column-meta.interface';
import { ITableCollapsibleConfig } from '@app/components/base-table/models/table-collapsible-config.interface';
import { ITableDataRow } from '@app/components/base-table/models/table-row.interface';
import { ITableDialogData } from '@app/components/custom-table/model/table-dialog-data.interface';
import { ObjectUtils } from '@app/utils/object.utils';
import { DisplayFnPipe } from '@app/pipes/display-fn.pipe';
import { ICustomTableHeaderConfig } from '@app/components/custom-table/model/custom-table-header-config.interface';
import { VarDirective } from '@app/directives/var.directive';

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    ColumnFilterComponent,
    TemplateHeaderDirective,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgTemplateOutlet,
    NgForOf,
    NgIf,
    DecimalPipe,
    BaseTableComponent,
    NgStyle,
    AsyncPipe,
    VarDirective,
    CustomTableHeaderCollapsedComponent,
    CustomTableHeaderComponent,
    CustomTableHeaderCollapsibleComponent,
    ColumnCollapseComponent,
    CustomTableDataComponent,
    CustomTableInnerDataComponent,
    DisplayFnPipe,
  ],
  providers: [CustomTableService],
})
export class CustomTableComponent<TableData extends ITableData> implements AfterViewInit, OnDestroy {
  public _enableVirtualScroll = false;
  public _data!: DataArray<TableData>;
  @Input({ required: true }) public columns: ITableConfig<TableData>[] = [];

  @Input({ required: true })
  public set data(data: TableData[] | DataArray<TableData>) {
    this._data =
      ArrayUtils.getArrayDepth(data) >= 2 ? (data as DataArray<TableData>) : ([data] as DataArray<TableData>);
    // check if table view exists and columns weren't collapsed programmatically
    if (this.appTable && !this.wereColumnsCollapsedByUser) {
      this.collapseColumnsByDefault();
    }
  }

  @Input({ required: false }) public rows?: ITableRowConfig | undefined;
  @Input({ required: false }) public footerColumns?: ICustomTableFooterConfig[][] | undefined = [];
  @Input({ required: false }) public showIndex = false;
  @Input({ required: false }) public minWidth100 = true;
  @Input({ required: false }) public parentContainerSelector = 'app-table-layout-content';
  @Input({ required: false }) public disableNoDataLogic = false;
  @Input({ required: false }) public enablePagination = false;

  @Input({ required: false })
  public set enableVirtualScroll(enableVirtualScroll: boolean) {
    this._enableVirtualScroll = enableVirtualScroll;
    this.withVirtualScrollClass = this._enableVirtualScroll;
  }

  @ViewChild(BaseTableComponent) public appTable!: BaseTableComponent<TableData>;
  @Output() dataEdit = new EventEmitter<{ meta: IEditableColumnMeta; data: TableData | TableData[] }>();
  @Output() public rowSelect = new EventEmitter<TableData | null>();
  @Output() public collapsed = new EventEmitter<ITableCollapsibleConfig[]>();
  @HostBinding('class.with-virtual-scroll') withVirtualScrollClass = false;
  public dataUpdate = new Date();
  public activeField = '';
  public selectedRowId: number | string | null = null;
  public collapsedColumns$!: Observable<ITableCollapsibleConfig[]>;
  public collapsedDataGroups$: Observable<number[]> = this.dynamicTableService.collapsibleDataGroupsSource$;
  private wereColumnsCollapsedByUser = false;
  private parentContainer: Element | null = null;
  private destroy$ = new Subject<void>();
  public currentVisibleScrolledIndex = 0;

  public trackByColumn = (_: number, column: ITableConfig<TableData>): string => {
    return column.fieldName;
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private dynamicTableService: CustomTableService,
    private elementRef: ElementRef
  ) {}

  public onScrollIndexChanged(data: number): void {
    this.currentVisibleScrolledIndex = data;
  }

  public toTableRowType = (item: unknown): ITableDataRow<TableData> => {
    return item as ITableDataRow<TableData>;
  };

  public toDataRowType = (item: ITableDataRow<TableData>): ITableDataRow<TableData> => {
    return item as ITableDataRow<TableData>;
  };

  public isDataEmpty = (data: TableData[] | DataArray<TableData>): boolean => {
    if (this.disableNoDataLogic) {
      return false;
    }
    if (Array.isArray(data[0])) {
      return (data as TableData[][]).every((item) => !item.length);
    } else {
      return !(data as TableData[]).length;
    }
  };

  public ngAfterViewInit(): void {
    this.collapsedColumns$ = this.dynamicTableService.collapsibleColumnSource$.pipe(
      tap((data) => {
        if (data.collapsedByUser) {
          this.collapsed.emit(data.config);
          this.wereColumnsCollapsedByUser = true;
        }
      }),
      map((data) => data.config),
      takeUntil(this.destroy$),
      shareReplay(1)
    );

    this.collapsedColumns$.pipe(debounceTime(0), takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
    // recall formatting data when data changed
    // ToDo: optimisation?
    this.appTable?.tableService.editSource$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.dataUpdate = new Date();
        this.cdr.markForCheck();
      },
    });
    this.parentContainer = (this.elementRef.nativeElement as HTMLElement).closest(this.parentContainerSelector);
    this.collapseColumnsByDefault();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getIndex = (dataIndex: number): number => {
    if (this.enablePagination && this.appTable?.paginationControl.value) {
      const { page, pageSize } = this.appTable.paginationControl.value;
      return page === 1 ? dataIndex : (page - 1) * pageSize + dataIndex;
    } else {
      return dataIndex;
    }
  };

  public haveInnerColumns = (columns: ITableConfig<TableData>[]): boolean => {
    return columns.some((column) => column.columns);
  };

  public resolveFieldName = (column: ITableConfig<TableData>, innerColumn?: ITableConfig<TableData>): string => {
    return !innerColumn ? column.fieldName : (column.fieldName ? column.fieldName + '.' : '') + innerColumn.fieldName;
  };

  public isHeaderCollapsed = (
    collapsedColumns: ITableCollapsibleConfig[],
    selectedColumn: ICustomTableHeaderConfig
  ): boolean => {
    if (!collapsedColumns || !selectedColumn.collapsible) {
      return false;
    }
    return collapsedColumns.some((column) => column.id === selectedColumn.collapsible?.id);
  };

  public isColumnNotCollapsed = (
    collapsedColumns: ITableCollapsibleConfig[],
    index: number,
    parentColumn?: ITableConfig<TableData>
  ): boolean => {
    return !this.isColumnCollapsed(collapsedColumns, index, parentColumn);
  };

  public isColumnCollapsed = (
    collapsedColumns: ITableCollapsibleConfig[],
    index: number,
    parentColumn?: ITableConfig<TableData>
  ): boolean => {
    if (!collapsedColumns) {
      return false;
    }
    // case when we collapse parent column of inner columns
    if (parentColumn && parentColumn.collapsible) {
      return collapsedColumns.some((column) => column.id === parentColumn.collapsible?.id);
      // case when we collapse using additional header
    } else {
      for (const column of collapsedColumns) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (index >= column.fromColumn && index <= column.toColumn) {
          return true;
        }
      }
    }
    return false;
  };

  public showDataCollapsed = (
    collapsedColumns: ITableCollapsibleConfig[],
    index: number,
    parentColumn?: ITableConfig<TableData>
  ): boolean => {
    if (!collapsedColumns) {
      return false;
    }
    // case when we collapse parent column of inner columns
    if (parentColumn && parentColumn.collapsible) {
      return collapsedColumns.some((column) => column.id === parentColumn.collapsible?.id);
      // case when we collapse using additional header
    } else {
      for (const column of collapsedColumns) {
        if (index === column.fromColumn) {
          return true;
        }
      }
    }
    return false;
  };

  public getCollapsedColumn = (
    collapsedColumns: ITableCollapsibleConfig[],
    index: number,
    parentColumn?: ITableConfig<TableData>
  ): ITableCollapsibleConfig | undefined => {
    if (!collapsedColumns) {
      return;
    }
    // case when we collapse parent column of inner columns
    if (parentColumn && parentColumn.collapsible) {
      return collapsedColumns.find((column) => column.id === parentColumn.collapsible?.id);
      // case when we collapse using additional header
    } else {
      for (const column of collapsedColumns) {
        if (index === column.fromColumn) {
          return column;
        }
      }
    }
    return;
  };

  // update collapsed columns by ids from outside
  public updateCollapsedColumns(columnsIds: string[]): void {
    const collapsedColumns: ITableCollapsibleConfig[] = [];
    this.dynamicTableService.updateCollapsedColumns(collapsedColumns);
    this.wereColumnsCollapsedByUser = true;
  }

  public switchCollapsibleDataGroup(dataGroupIndex: number): void {
    this.dynamicTableService.onSwitchCollapsibleDataGroup(dataGroupIndex);
    asyncScheduler.schedule(() => {
      console.log('scroll viewport', this.appTable.scrollViewport);
      this.appTable.scrollViewport?.checkViewportSize();
    }, 0);
  }

  public isDataGroupCollapsed = (collapsedDataGroups: number[], dataGroupIndex: number): boolean => {
    return collapsedDataGroups.includes(dataGroupIndex);
  };

  public dataClick(
    target: EventTarget | null,
    data: TableData,
    rowIndex: number,
    column: ITableConfig<TableData>,
    innerColumn?: ITableConfig<TableData>
  ): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.rows?.[data.id]?.selectable) {
      this.selectedRowId = this.selectedRowId === data.id ? null : data.id;
      this.rowSelect.emit(this.selectedRowId ? data : null);
      return;
    }
    if ((!column.dialog && !innerColumn?.dialog) || !target) {
      return;
    }
    const dialogGetter = innerColumn && innerColumn.dialog ? innerColumn!.dialog : column.dialog!;
    const dialogComponent = dialogGetter(data);
    if (!dialogComponent) return;

    this.setActiveField(data.id, column, innerColumn);

    const dialog = this.dynamicTableService.openDialog(
      target as HTMLElement,
      dialogComponent,
      this.getDialogData(data, column, innerColumn)
    );

    if (dialog) {
      dialog.closed.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.resetActiveField();
        this.cdr.markForCheck();
      });
    }
  }

  public resetSelectedRow(): void {
    this.selectedRowId = null;
    this.rowSelect.emit(null);
  }

  private getDialogData(
    data: TableData,
    column: ITableConfig<TableData>,
    innerColumn?: ITableConfig<TableData>
  ): ITableDialogData<TableData> {
    const field = this.resolveFieldName(column, innerColumn);
    return {
      dt: this.appTable,
      data: data,
      field,
      value: ObjectUtils.resolveFieldData(data, field),
    };
  }

  private setActiveField(
    id: number | string,
    column: ITableConfig<TableData>,
    innerColumn?: ITableConfig<TableData>
  ): void {
    const field = this.resolveFieldName(column, innerColumn);
    this.activeField = field + id;
  }

  private resetActiveField(): void {
    this.activeField = '';
  }

  public scrollParentContainerToTheTop(): void {
    if (!this.parentContainer || this._enableVirtualScroll) {
      return;
    }
    this.parentContainer.scroll({ top: 0 });
  }

  public onDataEdit(data: { meta: IEditableColumnMeta; data: TableData | TableData[] }): void {
    this.dataEdit.emit(data);
  }

  private collapseColumnsByDefault(): void {
    let collapsed = false;
    this.columns.forEach((column) => {
      collapsed = this.updateIsColumnCollapsedByDefault(column) || collapsed;
    });
    if (collapsed) {
      this.cdr.detectChanges();
    }
  }

  private updateIsColumnCollapsedByDefault(column: ITableConfig<TableData>): boolean {
    let updated = false;
    const shouldCollapse = column.collapsible?.collapsedByDefault;
    if (column.collapsible && shouldCollapse !== undefined) {
      updated = true;
      if (shouldCollapse) {
        this.dynamicTableService.onCollapseColumn(column.collapsible, false);
      } else {
        this.dynamicTableService.onExpandColumn(column.collapsible, false);
      }
    }
    return updated;
  }
}
