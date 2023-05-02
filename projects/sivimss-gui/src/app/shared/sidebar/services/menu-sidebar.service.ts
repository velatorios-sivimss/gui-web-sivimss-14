import { Inject, Injectable } from '@angular/core';
import { INICIALIZAR_SIDEBAR_ABIERTO } from "projects/sivimss-gui/src/app/shared/sidebar/tokens/sidebar.tokens";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class MenuSidebarService {
  private estadoSidebarSubject: BehaviorSubject<boolean>;
  private opcionMenuSeleccionadaSubject: BehaviorSubject<string | null>;
  menuSidebar$: Observable<boolean>;
  opcionMenuSeleccionada$: Observable<string | null>;

  constructor(@Inject(INICIALIZAR_SIDEBAR_ABIERTO) inicializarSidebarAbiertoToken: boolean) {
    this.estadoSidebarSubject = new BehaviorSubject<boolean>(inicializarSidebarAbiertoToken);
    this.opcionMenuSeleccionadaSubject = new BehaviorSubject<string | null>(null);
    this.menuSidebar$ = this.estadoSidebarSubject.asObservable();
    this.opcionMenuSeleccionada$ = this.opcionMenuSeleccionadaSubject.asObservable();
  }

  toggle(): void {
    this.estadoSidebarSubject.next(!this.estadoSidebarSubject.getValue());
  }

  seleccionarOpcionMenu(ruta: string) {
    this.opcionMenuSeleccionadaSubject.next(ruta);
  }

  limpiarRutaSeleccionada(){
    this.opcionMenuSeleccionadaSubject.next(null);
  }

}
