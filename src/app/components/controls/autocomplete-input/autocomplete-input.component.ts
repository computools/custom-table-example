import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IAutocompleteInputItem } from '@app/components/controls/autocomplete-input/models/autocomplete-input-item.interface';
import { DisplayFnPipe } from '@app/pipes/display-fn.pipe';

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DisplayFnPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutocompleteInputComponent,
      multi: true,
    },
  ],
})
export class AutocompleteInputComponent implements ControlValueAccessor, OnInit {
  @Input() public placeholder = '';
  @Input() public items: IAutocompleteInputItem[] = [];
  public input = '';
  public selectedItems: string[] = [];
  public filteredItems: IAutocompleteInputItem[] = [];

  private _value: string[] = [];
  public set value(value: string[]) {
    this._value = value;
    this.selectedItems = value ?? [];
    this.onChange(value);
    this.onTouch(value);
  }

  public get value(): string[] {
    return this._value;
  }

  public onChange: (val: string[]) => undefined = () => undefined;
  public onTouch: (val: string[]) => undefined = () => undefined;

  public ngOnInit(): void {
    this.filteredItems = this.items;
  }

  public writeValue(value: string[]): void {
    this.value = value;
  }

  public registerOnChange(fn: (val: string[]) => undefined): void {
    this.onChange = fn;
  }

  public registerOnTouched(onTouched: (val: string[]) => undefined): void {
    this.onTouch = onTouched;
  }

  public clear(): void {
    this.input = '';
    this.onInput('');
  }

  public onInput(stringForSearch: string): void {
    if (!stringForSearch) {
      this.filteredItems = [...this.items.map((item) => item)];
    }
    this.filteredItems = this.items
      .map((item) => item)
      .filter((item) => {
        return item.name.toLowerCase().includes(stringForSearch.toLowerCase());
      });
  }

  public onSelect(value: string): void {
    if (this.selectedItems.includes(value)) {
      this.selectedItems = this.selectedItems.filter((val) => val != value);
    } else {
      this.selectedItems = [...this.selectedItems, value];
    }
    this.value = this.selectedItems;
    this.onChange(this.value);
  }

  public isItemSelected = (selectedItems: string[], item: string): boolean => {
    return selectedItems.includes(item.toString());
  };
}
