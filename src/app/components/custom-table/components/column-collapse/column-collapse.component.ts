import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-column-collapse',
  templateUrl: './column-collapse.component.html',
  styleUrls: ['./column-collapse.component.scss'],
  standalone: true,
})
export class ColumnCollapseComponent {
  @Input({ required: false }) public isCollapse = false;
  @Input({ required: false }) isHorizontal = false;
}
