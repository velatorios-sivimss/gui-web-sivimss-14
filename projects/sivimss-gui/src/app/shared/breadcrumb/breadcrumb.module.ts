import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BreadcrumbComponent} from './components/breadcrumb/breadcrumb.component';
import {BreadcrumbService} from "./services/breadcrumb.service";

@NgModule({
  declarations: [
    BreadcrumbComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BreadcrumbComponent
  ],
  providers: [
    BreadcrumbService
  ]
})
export class BreadcrumbModule {
}
