import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isArray',
  standalone: true,
})
export class IsArrayPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return Array.isArray(value);
  }
}
