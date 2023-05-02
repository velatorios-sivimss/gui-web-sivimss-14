import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TablePanelComponent} from './components/table-panel/table-panel.component';
import {TablePanelRowComponent} from './components/table-panel-row/table-panel-row.component';
import {TablePanelColumnComponent} from './components/table-panel-column/table-panel-column.component';
import {CustomTemplateModule} from "../custom-template/custom-template.module";

@NgModule({
  declarations: [
    TablePanelComponent,
    TablePanelRowComponent,
    TablePanelColumnComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TablePanelComponent,
    TablePanelRowComponent,
    TablePanelColumnComponent,
    CustomTemplateModule
  ]
})
export class TablePanelModule {
}
