import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTemplateDirective } from './directives/custom-template.directive';

@NgModule({
  declarations: [
    CustomTemplateDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[
    CustomTemplateDirective
  ]
})
export class CustomTemplateModule { }
