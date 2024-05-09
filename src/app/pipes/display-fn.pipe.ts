import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayFn',
  standalone: true,
})
export class DisplayFnPipe implements PipeTransform {
  public transform(
    value: unknown,
    fn: (value: any, param?: any, param2?: any) => unknown | undefined,
    param?: unknown,
    param2?: unknown,
    param3?: unknown
  ): any {
    if (!fn) {
      return undefined;
    }
    return fn(value, param, param2);
  }
}
