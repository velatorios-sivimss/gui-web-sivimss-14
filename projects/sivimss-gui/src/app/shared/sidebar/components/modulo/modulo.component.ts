import {Component, HostListener, Input} from '@angular/core';
import {AutenticacionService, Modulo} from "projects/sivimss-gui/src/app/services/autenticacion.service";
import {MenuSidebarService} from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import {obtenerNivelUsuarioLogueado} from "../../../../utils/funciones";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-modulo',
  templateUrl: './modulo.component.html',
  styleUrls: ['./modulo.component.scss'],
  providers: [AutenticacionService]
})
export class ModuloComponent {

  @Input()
  modulo!: Modulo;

  @Input()
  esModuloRaiz: boolean = false;

  @Input()
  abierto: boolean = false;

  nivel: number = 0;
  permisosCentral: string[] = ['31']

  constructor(private readonly menuSidebarService: MenuSidebarService,
              private readonly autenticacionService: AutenticacionService,) {
    const usuarioContratante: UsuarioEnSesion = this.autenticacionService.obtenerUsuarioEnSesion();
    this.nivel = obtenerNivelUsuarioLogueado(usuarioContratante)
  }


  abrirCerrarModulo() {
    this.abierto = !this.abierto;
  }

  @HostListener('click', ['$event'])
  seleccionarModulo(event: MouseEvent) {
    event.stopPropagation();
    this.menuSidebarService.seleccionarOpcionMenu(this.modulo.ruta as string);
  }

  get clasesModulo() {
    return {
      'es-raiz': this.esModuloRaiz,
      'seleccionado': this.modulo.activo,
      'abierto': false
    };
  }

}
