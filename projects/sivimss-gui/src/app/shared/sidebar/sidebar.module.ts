import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from "primeng/accordion";
import {
  BotonHamburguesaComponent
} from "projects/sivimss-gui/src/app/shared/sidebar/components/boton-hamburguesa/boton-hamburguesa.component";
import {
  MenuSidebarComponent
} from "projects/sivimss-gui/src/app/shared/sidebar/components/menu-sidebar/menu-sidebar.component";
import {
  TemplateWithSidebarComponent
} from "projects/sivimss-gui/src/app/shared/sidebar/components/template-with-sidebar/template-with-sidebar.component";
import { SidebarConfig } from "projects/sivimss-gui/src/app/shared/sidebar/models/sidebar-config";
import { MenuSidebarService } from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import {
  INICIALIZAR_SIDEBAR_ABIERTO,
  TIEMPO_TRANSICION,
  WIDTH_SIDEBAR
} from "projects/sivimss-gui/src/app/shared/sidebar/tokens/sidebar.tokens";
import { TiempoTransicionDirective } from 'projects/sivimss-gui/src/app/shared/sidebar/directives/tiempo-transicion.directive';
import { WidthMenuSidebarDirective } from './directives/width-menu-sidebar.directive';
import { ModuloComponent } from './components/modulo/modulo.component';

@NgModule({
  declarations: [
    TiempoTransicionDirective,
    MenuSidebarComponent,
    BotonHamburguesaComponent,
    TemplateWithSidebarComponent,
    WidthMenuSidebarDirective,
    ModuloComponent,
  ],
  imports: [
    CommonModule,
    AccordionModule
  ],
  exports: [
    MenuSidebarComponent,
    BotonHamburguesaComponent,
    TemplateWithSidebarComponent,
  ],
  providers: [
    MenuSidebarService
  ]
})
export class SidebarModule {
  static forRoot(config: SidebarConfig): ModuleWithProviders<SidebarModule> {
    return {
      ngModule: SidebarModule,
      providers: [
        {
          provide: TIEMPO_TRANSICION,
          useValue: config.tiempoTransicion
        },
        {
          provide: WIDTH_SIDEBAR,
          useValue: config.widthMenuSidebar
        },
        {
          provide: INICIALIZAR_SIDEBAR_ABIERTO,
          useValue: config.inicializarMenuSidebarAbierto
        }
      ]
    };
  }
}
