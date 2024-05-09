import { Injectable } from '@angular/core';
import { FilterMatchMode } from '@app/components/base-table/models/filter-match-mode';
import { ObjectUtils } from '@app/utils/object.utils';

@Injectable({ providedIn: 'root' })
export class FilterService {
  public filter(value: any[], fields: any[], filterValue: any, filterMatchMode: FilterMatchMode): any {
    const filteredItems: any[] = [];

    if (value) {
      for (const item of value) {
        for (const field of fields) {
          const fieldValue = ObjectUtils.resolveFieldData(item, field);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (this.filters[filterMatchMode](fieldValue, filterValue, filterLocale)) {
            filteredItems.push(item);
            break;
          }
        }
      }
    }

    return filteredItems;
  }

  public filters: { [key: string]: (value: any, filter: any) => any } = {
    search: (value: string, filter: string[]): boolean => {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return filter.includes(value.toString());
    },
  };
}
