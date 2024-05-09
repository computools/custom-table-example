import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DOCUMENT, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterOperator } from '@app/components/base-table/models/filter-operator';
import { FilterMatchMode } from '@app/components/base-table/models/filter-match-mode';
import { SortOrder } from '@app/components/base-table/models/sort-order';
import { IColumnFilterData } from '@app/components/base-table/models/column-filter-data.interface';
import { FilterMetadata } from '@app/components/base-table/models/filter-metadata.interface';
import { SortMeta } from '@app/components/base-table/models/sort-meta.interface';
import { BaseTableComponent } from '@app/components/base-table/base-table.component';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { TableService } from '@app/components/base-table/services/table.service';
import { ArrayUtils } from '@app/utils/array.utils';
import { ObjectUtils } from '@app/utils/object.utils';
import { TableUtils } from '@app/utils/table.utils';
import { overlayPositions } from './overlay-positions';
import { RadioButtonComponent } from '@app/components/controls/radio/radio-button.component';
import { AutocompleteInputComponent } from '@app/components/controls/autocomplete-input/autocomplete-input.component';

@Component({
  selector: 'app-column-filter',
  templateUrl: './column-filter.component.html',
  styleUrls: ['./column-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    ReactiveFormsModule,
    RadioButtonComponent,
    NgSwitch,
    NgSwitchCase,
    NgFor,
    AutocompleteInputComponent,
  ],
})
export class ColumnFilterComponent implements OnInit, OnDestroy {
  @Input() public field: string = '';
  @Input() public type: 'text' | 'numeric' | 'date' = 'text';
  @Input() public operator: string = FilterOperator.AND;
  @Input() public matchMode: string = '';

  public readonly sortValues = [
    { name: 'Сортировка A → Z', value: '1' },
    { name: 'Сортировка Z → A', value: '-1' },
  ];
  public readonly MatchMode = FilterMatchMode;
  public readonly overlayPositions = overlayPositions;
  public filtersForm = new FormGroup({
    search: new FormControl<string[] | null>(null),
  });
  public sortControl = new FormControl(SortOrder.DEFAULT);
  public isFiltersMenuOpen = false;
  public filtersCount = 0;
  public sortState = 0;
  public data: IColumnFilterData[] = [];
  private subscription: Subscription | undefined = undefined;
  private window: Window;
  private destroyRef = inject(DestroyRef);

  public get filters(): FilterMetadata[] | undefined {
    return this.dt.filters[this.field];
  }

  private set filters(filters: FilterMetadata[] | undefined) {
    this.dt.filters[this.field] = filters;
  }

  private set sort(sort: SortMeta) {
    this.dt.sort = sort;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public dt: BaseTableComponent<ITableData>,
    private tableService: TableService,
    private cdr: ChangeDetectorRef
  ) {
    this.window = this.document.defaultView as Window;
  }

  public ngOnInit(): void {
    if (!this.filters) {
      this.initFieldFilterConstraint();
    }
    this.tableService.dataSource$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.data = this.getData();
      },
    });
    this.data = this.getData();
    this.initState();
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  public toggleFiltersMenu(): void {
    this.isFiltersMenuOpen = !this.isFiltersMenuOpen;
  }

  public closeFiltersMenu(resetFilters = false): void {
    this.isFiltersMenuOpen = false;
    if (resetFilters) {
      this.resetFiltersToApplied();
      this.resetSortToApplied();
    } else if (this.sortState && !this.isFiltersMenuOpen) {
      this.subscription = this.tableService.sortSource$.subscribe((sortSource) => {
        if (sortSource?.field !== this.field) {
          this.sortControl.patchValue(SortOrder.DEFAULT);
          this.sortState = 0;
          this.cdr.detectChanges();
          this.subscription?.unsubscribe();
        }
      });
    } else {
      this.subscription?.unsubscribe();
    }
  }

  public apply(): void {
    this.updateFiltersState();
    this.updateSortState();
    this.closeFiltersMenu();
  }

  public clearFilter(): void {
    this.filtersForm.patchValue({ search: null });
    this.sortControl.patchValue(0);
    this.apply();
  }

  private initState(): void {
    if (this.filters) {
      this.filters.forEach((filter) => {
        this.filtersForm.setValue({ search: filter.value });
        this.filtersCount = this.filtersForm.value.search?.length ?? 0;
      });
    }
    this.sortState = this.getSortedState();
  }

  private initFieldFilterConstraint(): void {
    this.filters = [{ value: null, matchMode: this.MatchMode.SEARCH, operator: this.operator }];
  }

  private getData(): IColumnFilterData[] {
    const formattedData = this.dt.processedData.map((data) => {
      return data.map((item) => {
        if (!Array.isArray(item)) {
          return this.getFilterNameAndValue(item);
        } else {
          return item.map(this.getFilterNameAndValue);
        }
      });
    });
    const oneDimensionFormattedData: { name: string; value: string }[] = [];
    formattedData.forEach((formattedGroup) => {
      if (ArrayUtils.getArrayDepth(formattedGroup) === 1) {
        oneDimensionFormattedData.push(...(formattedGroup as { name: string; value: string }[]));
      } else if (ArrayUtils.getArrayDepth(formattedGroup) === 2) {
        (formattedGroup as { name: string; value: string }[][]).forEach((formatted) => {
          oneDimensionFormattedData.push(...formatted);
        });
      }
    });
    return [...new Map(oneDimensionFormattedData.filter(Boolean).map((item) => [item.name, item])).values()];
  }

  private getFilterNameAndValue = (item: ITableData): { name: string; value: string } => {
    const name = TableUtils.getFormattedData(
      item,
      TableUtils.findColumnByFieldName(this.dt.columns, this.field),
      this.field
    );
    const value = ObjectUtils.resolveFieldData(item, this.field);
    return { name: name?.toString() ?? '', value: value?.toString() ?? '' };
  };

  private updateFiltersState(): void {
    this.filters = [
      {
        value: this.filtersForm.value.search,
        matchMode: FilterMatchMode.SEARCH,
        operator: this.operator,
      },
    ];
    this.filtersCount = this.filtersForm.value.search?.length ?? 0;
    this.dt.filter();
  }

  private updateSortState(): void {
    this.sort = {
      field: this.field,
      order: Number.parseInt(this.sortControl.value?.toString() ?? SortOrder.DEFAULT.toString()) ?? SortOrder.DEFAULT,
    };
    this.sortState = this.getSortedState();
    this.dt.applySort();
  }

  private resetFiltersToApplied(): void {
    const activeSearchFilters =
      this.filters?.find((filter) => filter.matchMode === FilterMatchMode.SEARCH)?.value ?? null;
    this.filtersForm.patchValue({ search: activeSearchFilters });
  }

  private resetSortToApplied(): void {
    this.sortControl.patchValue(this.sortState);
  }

  private getSortedState(): number {
    return this.dt.isSorted(this.field) ? this.dt.sort?.order ?? SortOrder.DEFAULT : SortOrder.DEFAULT;
  }
}
