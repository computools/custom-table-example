import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnFilterComponent } from '@app/components/base-table/components/column-filter/column-filter.component';
import { ColumnCollapseComponent } from '@app/components/custom-table/components/column-collapse/column-collapse.component';
import { IsArrayPipe } from '@app/pipes/is-array.pipe';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { CustomTableService } from '@app/components/custom-table/custom-table.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-custom-table-header-collapsible]',
  standalone: true,
  imports: [CommonModule, ColumnFilterComponent, ColumnCollapseComponent, IsArrayPipe],
  templateUrl: './custom-table-header-collapsible.component.html',
  styleUrls: ['./custom-table-header-collapsible.component.scss'],
})
export class CustomTableHeaderCollapsibleComponent<TableData extends ITableData> implements OnChanges {
  private _isCollapsed = false;
  @Input({ required: true })
  public set isCollapsed(isCollapsed: boolean) {
    this._isCollapsed = isCollapsed;
    if (this.isCollapsed) {
      this.customTableService.onCollapseColumn(this.config.collapsible!, false);
    }
  }

  public get isCollapsed(): boolean {
    return this._isCollapsed;
    // update collapsed when table data switched
  }

  @Input({ required: true }) public config!: ITableConfig<TableData>;
  @Input({ required: true }) public hasInnerColumns: boolean = false;
  @Input({ required: false }) public fieldForFilter: string | undefined;

  @HostBinding('class.empty-column') public emptyColumnClass = false;
  @HostBinding('attr.colspan') public colspan: string | number | undefined;
  @HostBinding('attr.rowspan') public rowspan: string | number | undefined;
  @HostBinding('style.left.px') public styleLeftPx: number | undefined;

  constructor(private customTableService: CustomTableService) {}

  public ngOnChanges(): void {
    this.emptyColumnClass = this.isCollapsed;
    this.colspan = this.isCollapsed ? 1 : this.hasInnerColumns ? this.config.columns?.length : this.config.colspan;
    this.rowspan = this.config.rowspan;
  }

  public switch(): void {
    if (this.isCollapsed) {
      this.customTableService.onExpandColumn(this.config.collapsible!);
    } else {
      this.customTableService.onCollapseColumn(this.config.collapsible!);
    }
  }
}
