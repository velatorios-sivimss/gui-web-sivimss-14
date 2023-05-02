import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidaRolDirective } from 'projects/sivimss-gui/src/app/shared/valida-rol/directives/valida-rol.directive';


@NgModule({
  declarations: [
    ValidaRolDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ValidaRolDirective
  ]
})
export class ValidaRolModule {
}
