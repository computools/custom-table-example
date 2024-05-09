import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({ selector: '[appTemplate]', standalone: true })
export class TemplateHeaderDirective {
  @Input('appTemplate') templateName = ''; // name of ng-template reference (header, body)

  constructor(public readonly template: TemplateRef<unknown>) {} // actual template ref
}
