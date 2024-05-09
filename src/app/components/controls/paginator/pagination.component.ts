import { Component, DestroyRef, forwardRef, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPaginationValue } from '@app/components/controls/paginator/pagination-value.interface';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaginationComponent),
      multi: true,
    },
  ],
})
export class PaginationComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input({ required: false }) public value: IPaginationValue = { page: 1, pageSize: 25 };
  @Input({ required: true }) public total = 25;
  @Input({ required: false }) public visibleRangeLength = 3;
  @Input({ required: false }) public pageSizes = [
    { id: 0, name: 'All rows' },
    { id: 25, name: '25 rows' },
    { id: 50, name: '50 rows' },
    { id: 100, name: '100 rows' },
  ];
  public pageSizeControl = new FormControl(this.pageSizes[1]);
  public totalPages: number = 0;
  public visiblePages: number[] = [];
  private destroyRef = inject(DestroyRef);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onChange(value: IPaginationValue): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched(): void {}

  public registerOnChange(fn: (val: IPaginationValue) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public writeValue(value: IPaginationValue): void {
    if (!value) return;

    this.value = value;
    this.updateTotalPages();
    this.updateVisiblePages();
  }

  public ngOnInit(): void {
    this.updateVisiblePages();
    this.pageSizeControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.selectPageSize(value!.id || 10000);
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['total'] || changes['value']) {
      this.updateTotalPages();
      this.updateVisiblePages();
    }
  }

  public selectPage(page: number): void {
    this.value = { ...this.value, page };
    this.updateVisiblePages();
    this.onChange(this.value);
  }

  public selectPageSize(pageSize: number): void {
    this.value = { page: 1, pageSize };
    this.updateTotalPages();
    this.updateVisiblePages();
    this.onChange(this.value);
  }

  private updateVisiblePages(): void {
    const length = Math.min(this.totalPages, this.visibleRangeLength);

    const startIndex = Math.max(Math.min(this.value.page - Math.ceil(length / 2), this.totalPages - length), 0);

    this.visiblePages = Array.from(new Array(length).keys(), (item) => item + startIndex + 1);
  }

  private updateTotalPages(): void {
    this.totalPages = Math.ceil(this.total / this.value.pageSize);
  }
}
