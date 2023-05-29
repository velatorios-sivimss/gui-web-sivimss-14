import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Rol} from "../../models/rol.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {RolService} from '../../services/rol.service';
import {Catalogo} from 'projects/sivimss-gui/src/app/models/catalogos.interface';
import {FiltrosRol} from '../../models/filtrosRol.interface';
import {ModificarRolComponent} from "../modificar-rol/modificar-rol.component";
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import {LazyLoadEvent} from 'primeng/api';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {
  ConfirmacionMovimientoComponent
} from "../confirmacion-movimiento/confirmacion-movimiento.component";
import {validarUsuarioLogueado} from "../../../../utils/funciones";
import {ROLES_BREADCRUMB} from "../../constants/breadcrumb";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";

const MAX_WIDTH: string = "876px";

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  providers: [DialogService]
})
export class RolesComponent implements OnInit {

  base64: string = ''

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  ultimaNumPagina: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;
  filtroForm!: FormGroup;

  catalogo_nivelOficina!: TipoDropdown[];
  estatus!: TipoDropdown[];
  catRol: Rol[] = [];
  roles: Rol[] = [];
  rolSeleccionado!: Rol;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;
  cambiarEstatusRef!: DynamicDialogRef;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private rolService: RolService,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(ROLES_BREADCRUMB);
    const roles = this.route.snapshot.data["respuesta"];
    this.catRol = roles[0].datos.map((rol: Catalogo) => ({label: rol.des_rol, value: rol.id})) || [];
    this.catalogo_nivelOficina = roles[1].map((nivel: any) => ({label: nivel.label, value: nivel.value})) || [];
    this.estatus = [{label: "Activo", value: 1}, {label: "Inactivo", value: 0}];
    this.inicializarFiltroForm();
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginar();
    }
  }

  paginar(): void {
    this.cargadorService.activar();
    this.rolService.obtenerCatRolesPaginadoSinFiltro(this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.roles = respuesta.datos.content || [];
        this.totalElementos = respuesta.datos.totalElements || 0;
        this.ultimaNumPagina = respuesta.datos.number;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  paginarConFiltros(): void {
    const solicitudFiltros: FiltrosRol = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.rolService.buscarPorFiltros(solicitudFiltros, this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.roles = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
        this.ultimaNumPagina = respuesta.datos.number;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosRol {
    return {
      idRol: this.filtroForm.get("rol")?.value,
      idOficina: this.filtroForm.get("nivel")?.value,
      estatusRol: this.filtroForm.get("estatus")?.value
    };
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    if (this.filtroForm) {
      this.filtroForm.reset();
    }
    this.numPaginaActual = 0;
    this.paginar();
  }

  cambiarEstatus(rol: Rol): void {
    const titulo: string = rol.estatusRol ? "Activar" : "Desactivar"
    const DETALLE_CONFIG: DynamicDialogConfig = {
      header: titulo + " rol",
      width: MAX_WIDTH,
      data: rol
    }
    this.cambiarEstatusRef = this.dialogService.open(ConfirmacionMovimientoComponent, DETALLE_CONFIG);

    this.cambiarEstatusRef.onClose.subscribe((respuesta: any): void => {
      if (respuesta && respuesta.estatus) {
        const solicitudId = {
          "idRol": respuesta.datosRol.idRol,
          "estatusRol": respuesta.datosRol.estatusRol ? 1 : 0
        }
        this.rolService.cambiarEstatus(solicitudId).subscribe({
          next: (): void => {
            if (solicitudId.estatusRol === 1) {
              this.alertaService.mostrar(TipoAlerta.Exito, 'Activado correctamente. ' + rol.desRol);
            } else {
              this.alertaService.mostrar(TipoAlerta.Exito, 'Desactivado correctamente. ' + rol.desRol);
            }
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
            this.mensajesSistemaService.mostrarMensajeError(error.message);
          }
        });
        return;
      }
      this.numPaginaActual = this.ultimaNumPagina;
      this.seleccionarPaginacion();
    });
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      rol: [{value: null, disabled: false}],
      nivel: [{value: null, disabled: false}],
      estatus: [{value: null, disabled: false}],
    });
  }

  abrirPanel(event: MouseEvent, rolSeleccionado: Rol): void {
    this.rolSeleccionado = rolSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalModificarRol(): void {
    const MODIFICAR_CONFIG: DynamicDialogConfig = {
      header: "Modificar rol",
      width: MAX_WIDTH,
      data: this.rolSeleccionado
    }
    this.modificacionRef = this.dialogService.open(ModificarRolComponent, MODIFICAR_CONFIG);
    this.modificacionRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  procesarRespuestaModal(respuesta: RespuestaModalRol = {}): void {
    if (respuesta.actualizar) {
      this.limpiar();
    }
  }

  ngOnDestroy(): void {
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
    if (this.modificacionRef) {
      this.modificacionRef.destroy();
    }
  }

}
