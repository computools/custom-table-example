import { Component, HostBinding, Input, OnChanges, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITableData } from '@app/components/base-table/models/table-data.interface';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { TableUtils } from '@app/utils/table.utils';
import { CustomTableComponent } from '@app/components/custom-table/custom-table.component';
import { ObjectUtils } from '@app/utils/object.utils';
import { DisplayFnPipe } from '@app/pipes/display-fn.pipe';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-custom-table-inner-data]',
  standalone: true,
  imports: [CommonModule, DisplayFnPipe],
  templateUrl: './custom-table-inner-data.component.html',
  styleUrls: ['./custom-table-inner-data.component.scss'],
})
export class CustomTableInnerDataComponent<TableData extends ITableData> implements OnInit, OnChanges {
  public innerDataConfig!: ITableConfig<TableData>;

  @Input({ required: true }) public config!: ITableConfig<TableData>;

  @Input({ required: true })
  public set innerConfig(innerConfig: ITableConfig<TableData>) {
    this.innerDataConfig = innerConfig;
  }

  @Input({ required: true }) public data!: TableData;
  @Input({ required: false }) public activeField!: string;

  @HostBinding('class.data-with-action') public dataWithActionClass = false;
  @HostBinding('class.data-with-action_active') public dataWithActionActiveClass = false;
  @HostBinding('style') public style: { [p: string]: unknown } | null | undefined;

  public getFormattedData = TableUtils.getFormattedData;
  public fieldName!: string;

  constructor(public table: CustomTableComponent<TableData>) {}

  public ngOnInit(): void {
    this.fieldName = this.resolveFieldName(this.config, this.innerDataConfig);
  }

  public ngOnChanges(): void {
    this.dataWithActionClass = !!this.innerDataConfig.dialog && !!this.innerDataConfig.dialog(this.data);
    this.dataWithActionActiveClass = this.activeField === this.fieldName + this.data.id;
    this.style =
      (this.config.stylesConfig || this.innerDataConfig.stylesConfig) &&
      TableUtils.getStylesConfig(this.data, this.config, this.fieldName);
  }

  public resolveFieldName = (column: ITableConfig<TableData>, innerColumn?: ITableConfig<TableData>): string => {
    return !innerColumn ? column.fieldName : (column.fieldName ? column.fieldName + '.' : '') + innerColumn.fieldName;
  };

  public getColumnTemplate = (
    data: TableData,
    template: TemplateRef<unknown> | ((data: TableData) => TemplateRef<unknown> | undefined)
  ): TemplateRef<unknown> | undefined => {
    return typeof template === 'function' ? template(data) : template;
  };

  public resolveFieldData = (data: TableData, field: string): string | number | null => {
    return ObjectUtils.resolveFieldData(data, field);
  };
}
