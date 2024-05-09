import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnFilterComponent } from '@app/components/base-table/components/column-filter/column-filter.component';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { IsArrayPipe } from '@app/pipes/is-array.pipe';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-custom-table-header]',
  standalone: true,
  imports: [CommonModule, ColumnFilterComponent, IsArrayPipe],
  templateUrl: './custom-table-header.component.html',
  styleUrls: ['./custom-table-header.component.scss'],
})
export class CustomTableHeaderComponent<TableData extends ITableData> implements OnChanges {
  @Input({ required: true }) public config!: ITableConfig<TableData>;
  @Input({ required: true }) public hasInnerColumns: boolean = false;
  @Input({ required: false }) public collapsed: boolean = false;
  @Input({ required: false }) public fieldForFilter: string | undefined;

  @HostBinding('class.collapsed') public collapsedClass = false;
  @HostBinding('attr.colspan') public colspan: string | number | undefined;
  @HostBinding('attr.rowspan') public rowspan: string | number | undefined;
  @HostBinding('style') public style: { [p: string]: unknown } | undefined;

  public ngOnChanges(): void {
    this.collapsedClass = this.collapsed;
    this.colspan = this.hasInnerColumns ? this.config.columns?.length : this.config.colspan;
    this.rowspan = this.config.rowspan;
  }
}
