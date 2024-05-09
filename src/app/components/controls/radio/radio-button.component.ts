import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioButtonItem {
  name: string;
  value: string;
}

let nextUniqueId = 0;

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent implements ControlValueAccessor {
  private _name = `radio-group-${nextUniqueId++}`;

  @Input() type: 'default' | 'bordered' = 'default';
  @Input() items: Array<RadioButtonItem> = [];

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  private innerValue: string | number | boolean = 0;

  public get value(): string | number | boolean {
    return this.innerValue;
  }

  public set value(v: string | number | boolean) {
    if (v != this.innerValue) {
      this.innerValue = v;
      this.change(v);
    }
  }

  public onChange: any = () => undefined;
  public onTouched: any = () => undefined;

  public writeValue(value: string | number | boolean): void {
    if (value != this.innerValue) {
      this.innerValue = value;
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public change(value: string | number | boolean): void {
    this.innerValue = value;
    this.onChange(value);
    this.onTouched(value);
  }
}
