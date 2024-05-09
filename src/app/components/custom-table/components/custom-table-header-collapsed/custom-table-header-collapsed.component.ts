import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { ITableCollapsibleConfig } from '@app/components/base-table/models/table-collapsible-config.interface';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-custom-table-header-collapsed]',
  standalone: true,
  templateUrl: './custom-table-header-collapsed.component.html',
  styleUrls: ['./custom-table-header-collapsed.component.scss'],
  imports: [NgIf],
})
export class CustomTableHeaderCollapsedComponent implements OnChanges {
  @Input({ required: true }) public config!: ITableCollapsibleConfig;
  @Input({ required: false }) public subheaderRowsLength: number | undefined;
  @Input({ required: false }) public rowspanAdditional = 1;

  @HostBinding('attr.rowspan') public rowspan: number | undefined;
  @HostBinding('class.header-collapsed') public headerCollapsedClass = true;

  public ngOnChanges(): void {
    this.rowspan = this.rowspanAdditional + (this.subheaderRowsLength ?? 0);
  }
}
