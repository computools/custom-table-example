import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomTableComponent } from '@app/components/custom-table/custom-table.component';
import { ITableConfig } from '@app/components/base-table/models/table-config.interface';
import { ITestData } from '@app/test-data.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public data: ITestData[] = [
    {
      id: 1,
      firstName: 'Name',
      lastName: 'LastName',
      data1: { innerData1: 'Inner data 1', innerData2: 'Inner data 2' },
      data2: { innerData3: 'Inner data 3', innerData4: 'Inner data 4' },
    },
    {
      id: 2,
      firstName: 'Name',
      lastName: 'LastName',
      data1: { innerData1: 'Inner data 1', innerData2: 'Inner data 2' },
      data2: { innerData3: 'Inner data 3', innerData4: 'Inner data 4' },
    },
    {
      id: 3,
      firstName: 'Name',
      lastName: 'LastName',
      data1: { innerData1: 'Inner data 1', innerData2: 'Inner data 2' },
      data2: { innerData3: 'Inner data 3', innerData4: 'Inner data 4' },
    },
  ];
  public columns: ITableConfig<ITestData>[] = [
    { name: 'Id', fieldName: 'id', rowspan: 2 },
    { name: 'First name', fieldName: 'firstName', rowspan: 2 },
    { name: 'Last name', fieldName: 'lastName', rowspan: 2 },
    {
      name: 'Data part 1',
      fieldName: 'data1',
      collapsible: {
        id: 'data1',
        position: 'header',
      },
      columns: [
        { name: 'Inner data 1', fieldName: 'innerData1' },
        { name: 'Inner data 2', fieldName: 'innerData2' },
      ],
    },
    {
      name: 'Data part 2',
      fieldName: 'data2',
      collapsible: {
        id: 'data2',
        position: 'header',
      },
      columns: [
        { name: 'Inner data 3', fieldName: 'innerData3' },
        { name: 'Inner data 4', fieldName: 'innerData4' },
      ],
    },
  ];
}
