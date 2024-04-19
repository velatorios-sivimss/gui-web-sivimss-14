import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective} from "@angular/forms";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA, MAX_WIDTH} from "../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Rol} from "../../models/rol.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {RolService} from '../../services/rol.service';
import {FiltrosRol} from '../../models/filtrosRol.interface';
import {ModificarRolComponent} from "../modificar-rol/modificar-rol.component";
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import {LazyLoadEvent} from 'primeng/api';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {
  ConfirmacionMovimientoComponent
} from "../confirmacion-movimiento/confirmacion-movimiento.component";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {ROLES_BREADCRUMB} from "../../constants/breadcrumb";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {ESTATUS_ROL} from "../../constants/estatus";
import {SolicitudCambioEstatus} from "../../models/solicitudCambioEstatus.interface";
import {AutenticacionService} from "../../../../services/autenticacion.service";

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  providers: [DialogService, AutenticacionService]
})
export class RolesComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  catalogo_nivelOficina: TipoDropdown[] = [];
  estatus: TipoDropdown[] = ESTATUS_ROL;
  catRol: TipoDropdown[] = [];
  roles: Rol[] = [];

  rolSeleccionado!: Rol;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;
  cambiarEstatusRef!: DynamicDialogRef;
  filtroForm!: FormGroup;

  readonly POSICION_CATALOGO_ROLES: number = 0;
  readonly POSICION_CATALOGO_NIVELES: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private rolService: RolService,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private authService: AutenticacionService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(ROLES_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const roles = respuesta[this.POSICION_CATALOGO_ROLES].datos;
    this.catRol = mapearArregloTipoDropdown(roles, 'des_rol', 'id');
    this.catalogo_nivelOficina = respuesta[this.POSICION_CATALOGO_NIVELES]
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (this.authService.validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
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
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaPaginacion(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  procesarRespuestaPaginacion(respuesta: HttpRespuesta<any>): void {
    this.roles = respuesta.datos.content || [];
    this.totalElementos = respuesta.datos.totalElements || 0;
  }

  paginarConFiltros(): void {
    const solicitudFiltros: FiltrosRol = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.rolService.buscarPorFiltros(solicitudFiltros, this.numPaginaActual, this.cantElementosPorPagina).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaPaginacion(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
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
      this.filtroFormDir.resetForm();
    }
    this.numPaginaActual = 0;
    this.paginar();
  }

  cambiarEstatus(rol: Rol): void {
    const titulo: string = rol.estatusRol ? "Activar" : "Desactivar";
    const DETALLE_CONFIG: DynamicDialogConfig<any> = this.crearConfiguracionDialogo(titulo + " rol", rol);
    this.cambiarEstatusRef = this.dialogService.open(ConfirmacionMovimientoComponent, DETALLE_CONFIG);
    this.cambiarEstatusRef.onClose.subscribe((respuesta: any): void => this.verificarCambioEstatus(respuesta));
  }

  verificarCambioEstatus(respuesta: any): void {
    if (respuesta?.estatus) {
      const {datosRol: {idRol, estatusRol}} = respuesta;
      const solicitudId: SolicitudCambioEstatus = {idRol, "estatusRol": estatusRol ? 1 : 0}
      this.rolService.cambiarEstatus(solicitudId).subscribe({
        next: (): void => this.mostarMensajeCambioEstatus(solicitudId.estatusRol),
        error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
      });
    }
    this.limpiar();
  }

  mostarMensajeCambioEstatus(estatus: 1 | 0): void {
    const mensaje: string = estatus === 1 ? 'Activado correctamente.' : 'Desactivado correctamente.';
    this.alertaService.mostrar(TipoAlerta.Exito, mensaje);
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
    const MODIFICAR_CONFIG: DynamicDialogConfig<any> = this.crearConfiguracionDialogo("Modificar rol", this.rolSeleccionado);
    this.modificacionRef = this.dialogService.open(ModificarRolComponent, MODIFICAR_CONFIG);
    this.modificacionRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  crearConfiguracionDialogo(header: string, data: Rol): DynamicDialogConfig {
    return {header, width: MAX_WIDTH, data}
  }

  procesarRespuestaModal(respuesta: RespuestaModalRol = {}): void {
    if (!respuesta.actualizar) return;
    this.limpiar();
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
