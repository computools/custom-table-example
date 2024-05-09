import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { IEditableColumnMeta } from '@app/components/base-table/models/editable-column-meta.interface';
import { SortMeta } from '@app/components/base-table/models/sort-meta.interface';

@Injectable()
export class TableService {
  private editSource = new Subject<IEditableColumnMeta>();
  private sortSource = new Subject<SortMeta>();
  private dataSource = new Subject<any>();
  private resetSource = new Subject();

  public editSource$ = this.editSource.asObservable();
  public sortSource$ = this.sortSource.asObservable();
  public resetSource$ = this.resetSource.asObservable();
  public dataSource$ = this.dataSource.asObservable();

  public onEdit(editMeta: IEditableColumnMeta): void {
    this.editSource.next(editMeta);
  }

  public onSort(sortMeta: SortMeta): void {
    this.sortSource.next(sortMeta);
  }

  public onResetChange(): void {
    this.resetSource.next(null);
  }

  public onDataChange(value: any): void {
    this.dataSource.next(value);
  }
}
