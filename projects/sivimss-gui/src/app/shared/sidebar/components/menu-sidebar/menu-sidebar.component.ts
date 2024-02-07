import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {HttpRespuesta} from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import {AutenticacionService, Modulo} from "projects/sivimss-gui/src/app/services/autenticacion.service";
import {MenuSidebarService} from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import {idsModulos} from "projects/sivimss-gui/src/app/utils/constantes-menu";
import {Observable, Subscription} from "rxjs";
import {filter, map} from "rxjs/operators";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.scss']
})
export class MenuSidebarComponent implements OnInit, OnDestroy {
  readonly NOMBRE_ICONO_POR_DEFECTO: string = 'default-icon.svg';
  abierto$!: Observable<boolean>;
  modulos$!: Observable<Modulo[]>;
  subs!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly menuSidebarService: MenuSidebarService,
    private readonly autenticacionService: AutenticacionService,
  ) {
  }

  ngOnInit(): void {
    this.abierto$ = this.menuSidebarService.menuSidebar$;
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.modulos$ = this.autenticacionService.obtenerModulosPorIdRol(usuario.idRol).pipe(
      map((respuesta: HttpRespuesta<Modulo[]>): Modulo[] => {
        return this.agregarPropiedadesExtras(respuesta.datos);
      })
    );
    this.gestionarObsOpcionesSeleccionadas();
  }

  agregarPropiedadesExtras(modulos: Modulo[]): Modulo[] {
    return modulos.map((modulo) => {
      const moduloConPropiedadesExtras = {
        ...modulo,
        ruta: idsModulos[modulo.idModulo].ruta,
        icono: idsModulos[modulo.idModulo].icono ?? this.NOMBRE_ICONO_POR_DEFECTO
      };      
      if (moduloConPropiedadesExtras.modulos !== null) {
        moduloConPropiedadesExtras.modulos = this.agregarPropiedadesExtras(moduloConPropiedadesExtras.modulos);
      }
      return moduloConPropiedadesExtras;
    });
  }

  gestionarObsOpcionesSeleccionadas() {
    this.subs = this.menuSidebarService.opcionMenuSeleccionada$.pipe(
      filter((ruta: string | null) => !!ruta)
    ).subscribe((ruta: string | null) => {
      if (ruta === 'reservar-salas') {
        this.router.navigate(["/reservar-salas", {outlets: {salas: 'salas'}}]).then(() => {
        }).catch(() => {
        });
      } else {
        this.router.navigate([ruta]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

}
