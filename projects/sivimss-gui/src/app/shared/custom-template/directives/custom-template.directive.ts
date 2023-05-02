import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appCustomTemplate]'
})
export class CustomTemplateDirective {

  @Input('appCustomTemplate') name: string = '';

  constructor(public template: TemplateRef<any>) {}

  getType(): string {
    return this.name;
  }

}
