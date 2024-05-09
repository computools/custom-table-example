import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface VarContext<T> {
  appVar: T | null;
}

@Directive({
  selector: '[appVar]',
  standalone: true,
})
export class VarDirective<T> {
  private _context: VarContext<T> = { appVar: null };

  constructor(_viewContainer: ViewContainerRef, _templateRef: TemplateRef<VarContext<T>>) {
    _viewContainer.createEmbeddedView(_templateRef, this._context);
  }

  @Input()
  set appVar(value: T) {
    this._context.appVar = value;
  }
}
