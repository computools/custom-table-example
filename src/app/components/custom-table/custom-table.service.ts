import { Injectable, ViewContainerRef } from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { BehaviorSubject, distinctUntilChanged, filter } from 'rxjs';
import { ITableCollapsibleConfig } from '@app/components/base-table/models/table-collapsible-config.interface';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableDialogData } from '@app/components/custom-table/model/table-dialog-data.interface';

@Injectable()
export class CustomTableService {
  private collapsibleColumnsSource = new BehaviorSubject<{
    config: ITableCollapsibleConfig[];
    collapsedByUser: boolean;
  } | null>(null);
  private collapsibleDataGroupsSource = new BehaviorSubject<number[]>([]);

  public collapsibleColumnSource$ = this.collapsibleColumnsSource.asObservable().pipe(
    filter(Boolean),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );
  public collapsibleDataGroupsSource$ = this.collapsibleDataGroupsSource
    .asObservable()
    .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)));

  constructor(
    private dialog: Dialog,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  public updateCollapsedColumns(selectedColumns: ITableCollapsibleConfig[]): void {
    this.collapsibleColumnsSource.next({ config: selectedColumns, collapsedByUser: false });
  }

  public onCollapseColumn(selectedColumn: ITableCollapsibleConfig, collapsedByUser = true): void {
    const collapsibleColumns = this.collapsibleColumnsSource.value?.config ?? [];
    // update collapsed column
    if (collapsibleColumns.some((column) => column.id === selectedColumn.id)) {
      this.collapsibleColumnsSource.next({
        config: collapsibleColumns.map((column) => {
          return column.id === selectedColumn.id ? selectedColumn : column;
        }),
        collapsedByUser,
      });
    } else {
      this.collapsibleColumnsSource.next({
        config: [...collapsibleColumns, selectedColumn],
        collapsedByUser,
      });
    }
  }

  public onExpandColumn(selectedColumn: ITableCollapsibleConfig, collapsedByUser = true): void {
    const collapsibleColumns = this.collapsibleColumnsSource.value?.config ?? [];
    this.collapsibleColumnsSource.next({
      config: collapsibleColumns.filter((column) => column.id !== selectedColumn.id),
      collapsedByUser,
    });
  }

  public onSwitchCollapsibleDataGroup(dataGroupIndex: number): void {
    if (this.collapsibleDataGroupsSource.value.includes(dataGroupIndex)) {
      this.collapsibleDataGroupsSource.next(
        this.collapsibleDataGroupsSource.value.filter((index) => index !== dataGroupIndex)
      );
    } else {
      this.collapsibleDataGroupsSource.next([...this.collapsibleDataGroupsSource.value, dataGroupIndex]);
    }
  }

  public openDialog<T extends ComponentType<unknown>, TableData extends ITableData>(
    target: HTMLElement,
    component: T,
    data?: ITableDialogData<TableData>
  ): DialogRef<unknown, unknown> {
    const targetCoordinates = target.getBoundingClientRect();
    return this.dialog.open(component, {
      data,
      disableClose: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      backdropClass: 'cdk-overlay-transparent-backdrop',
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo({
          x: targetCoordinates.x,
          y: targetCoordinates.y,
          width: target.offsetWidth,
          height: target.offsetHeight,
        })
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetY: 2,
            offsetX: -4,
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
            offsetY: 2,
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetY: -2,
            offsetX: -4,
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
            offsetX: -2,
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'bottom',
            offsetX: -2,
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom',
          },
        ]),
    });
  }
}
