import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown'
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service'
import {ActivatedRoute, Router} from '@angular/router'
import {NuevaVerificacionComponent} from '../nueva-verificacion/nueva-verificacion/nueva-verificacion.component'
import {
  RegistroMantenimientoComponent
} from '../registro-mantenimiento/registro-mantenimiento/registro-mantenimiento.component'
import {
  SolicitudMantenimientoComponent
} from '../solicitud-mantenimiento/solicitud-mantenimiento/solicitud-mantenimiento.component'
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../services/mantenimiento-vehicular.service";
import {MANTENIMIENTO_VEHICULAR_BREADCRUMB} from "../../constants/breadcrumb";
import {FiltrosMantenimientoVehicular} from "../../models/filtrosMantenimientoVehicular.interface";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {OverlayPanel} from "primeng/overlaypanel";
import {LazyLoadEvent} from "primeng/api";
import {VehiculoMantenimiento} from "../../models/vehiculoMantenimiento.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type OpcionMtto = 'registroMtto' | 'mtto' | 'verificacion';

@Component({
  selector: 'app-programar-mantenimiento-vehicular',
  templateUrl: './programar-mantenimiento-vehicular.component.html',
  styleUrls: ['./programar-mantenimiento-vehicular.component.scss'],
  providers: [DialogService]
})
export class ProgramarMantenimientoVehicularComponent implements OnInit, OnDestroy {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;
  modificarModal: boolean = false;
  detalleModal: boolean = false;

  vehiculos: VehiculoMantenimiento[] = [];
  vehiculoSeleccionado!: VehiculoMantenimiento;

  filtroForm!: FormGroup;

  solicitudMttoRef!: DynamicDialogRef;
  nuevaVerificacionRef!: DynamicDialogRef;
  registroMttoRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(MANTENIMIENTO_VEHICULAR_BREADCRUMB);
    this.inicializarFiltroForm()
    this.cargarCatalogos();
    this.cargarDatosUsuario();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGOS_DELEGACIONES];
  }

  cargarDatosUsuario(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm.get('nivel')?.patchValue(parseInt(usuario.idOficina));
    this.deshabilitarFiltros(parseInt(usuario.idOficina));
    this.filtroForm.get('delegacion')?.patchValue(parseInt(usuario.idDelegacion));
    this.cargarVelatorios();
    this.filtroForm.get('velatorio')?.patchValue(parseInt(usuario.idVelatorio));
  }

  deshabilitarFiltros(id: number): void {
    if (id > 1) {
      this.filtroForm.get('delegacion')?.disable()
    }
    if (id > 2) {
      this.filtroForm.get('velatorio')?.disable()
    }
  }

  cargarVelatorios(): void {
    this.catalogoVelatorios = [];
    this.filtroForm.get('velatorio')?.patchValue("");
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.mantenimientoVehicularService.obtenerVelatorios(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    })
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: true}],
      delegacion: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      placa: [{value: null, disabled: false}, [Validators.required]],
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
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
    if (!localStorage.getItem('sivimss_token')) return;
    this.cargadorService.activar();
    this.mantenimientoVehicularService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.vehiculos = respuesta!.datos.content;
        this.totalElementos = respuesta!.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  paginarConFiltros(): void {
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosMantenimientoVehicular {
    return {}
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  abrirModalnuevaVerificacion(): void {
    this.nuevaVerificacionRef = this.dialogService.open(NuevaVerificacionComponent, {
      data: {vehiculo: this.vehiculoSeleccionado},
      header: "Nueva verificación",
      width: "920px"
    });
  }

  abrirModalSolicitudMantenimiento(): void {
    this.solicitudMttoRef = this.dialogService.open(SolicitudMantenimientoComponent, {
      header: "Solicitud de mantenimiento",
      width: "920px",
      data: {vehiculo: this.vehiculoSeleccionado},
    })
  }

  abrirModalRegistroMantenimiento(): void {
    this.registroMttoRef = this.dialogService.open(RegistroMantenimientoComponent, {
      header: "Registro de mantenimiento vehicular",
      width: "920px",
      data: {vehiculo: this.vehiculoSeleccionado},
    })
  }

  abrirModalModificar(): void {
    this.modificarModal = true;
  }

  abrirModalDetalle(vehiculoSeleccionado: VehiculoMantenimiento): void {
    this.vehiculoSeleccionado = vehiculoSeleccionado;
    this.detalleModal = true;
  }

  abrirModalExportarPDF(): void {
  }

  abrirModalExportarExcel(): void {
  }

  seleccionarDetalle(opcion: OpcionMtto) {
    if (opcion === 'mtto') {
      this.router.navigate(['./detalle-solicitud-mantenimiento'], {
        relativeTo: this.route,
        queryParams: {id: this.vehiculoSeleccionado.ID_MTTO_SOLICITUD}
      });
      return;
    }
    if (opcion === 'registroMtto') {
      this.router.navigate(['./detalle-registro-mantenimiento'], {relativeTo: this.route});
      return;
    }
    this.router.navigate(['./detalle-verificacion'], {
      relativeTo: this.route,
      queryParams: {id: this.vehiculoSeleccionado.ID_MTTOVERIFINICIO}
    });
  }

  abrirPanel(event: MouseEvent, vehiculoSeleccionado: VehiculoMantenimiento): void {
    this.vehiculoSeleccionado = vehiculoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  get f() {
    return this.filtroForm?.controls;
  }

  ngOnDestroy(): void {
    if (this.solicitudMttoRef) {
      this.solicitudMttoRef.destroy();
    }
    if (this.nuevaVerificacionRef) {
      this.nuevaVerificacionRef.destroy();
    }
    if (this.registroMttoRef) {
      this.registroMttoRef.destroy();
    }
  }

}
