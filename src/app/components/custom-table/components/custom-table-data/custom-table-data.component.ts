import { Component, HostBinding, Input, OnChanges, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { TableUtils } from '@app/utils/table.utils';
import { CustomTableComponent } from '@app/components/custom-table/custom-table.component';
import { DisplayFnPipe } from '@app/pipes/display-fn.pipe';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-custom-table-data]',
  standalone: true,
  imports: [CommonModule, DisplayFnPipe],
  templateUrl: './custom-table-data.component.html',
  styleUrls: ['./custom-table-data.component.scss'],
})
export class CustomTableDataComponent<TableData extends ITableData> implements OnChanges {
  @Input({ required: true }) public config!: ITableConfig<TableData>;
  @Input({ required: true }) public data!: TableData;
  @Input({ required: false }) public activeField: string = '';

  @HostBinding('class.data-with-action') public dataWithActionClass = false;
  @HostBinding('class.data-with-action_active') public dataWithActionActiveClass = false;
  @HostBinding('class.collapsed') public collapsedClass = false;
  @HostBinding('style') public style: { [p: string]: unknown } | null | undefined;

  public getFormattedData = TableUtils.getFormattedData;

  constructor(public dynamicTable: CustomTableComponent<TableData>) {}

  public ngOnChanges(): void {
    this.dataWithActionClass = !!this.config.dialog && !!this.config.dialog(this.data);
    this.dataWithActionActiveClass = !!this.activeField && this.activeField === this.config.fieldName + this.data.id;
    this.style = TableUtils.getStylesConfig(this.data, this.config);
  }

  public getColumnTemplate = (
    data: TableData,
    template: TemplateRef<unknown> | ((data: TableData) => TemplateRef<unknown> | undefined)
  ): TemplateRef<unknown> | undefined => {
    return typeof template === 'function' ? template(data) : template;
  };
}
