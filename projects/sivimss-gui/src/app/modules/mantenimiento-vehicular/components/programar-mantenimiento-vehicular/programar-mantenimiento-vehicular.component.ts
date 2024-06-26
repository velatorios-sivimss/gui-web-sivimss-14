import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes'
import { FormBuilder, FormGroup } from '@angular/forms'
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown'
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service'
import { ActivatedRoute, Router } from '@angular/router'
import { NuevaVerificacionComponent } from '../nueva-verificacion/nueva-verificacion.component'
import {
  RegistroMantenimientoComponent
} from '../registro-mantenimiento/registro-mantenimiento.component'
import {
  SolicitudMantenimientoComponent
} from '../solicitud-mantenimiento/solicitud-mantenimiento.component'
import { finalize } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { MANTENIMIENTO_VEHICULAR_BREADCRUMB } from "../../constants/breadcrumb";
import { FiltrosMantenimientoVehicular } from "../../models/filtrosMantenimientoVehicular.interface";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import { LazyLoadEvent } from "primeng/api";
import { VehiculoMantenimiento } from "../../models/vehiculoMantenimiento.interface";
import { UsuarioEnSesion } from "../../../../models/usuario-en-sesion.interface";
import { mapearArregloTipoDropdown, validarUsuarioLogueado } from "../../../../utils/funciones";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface'
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service'

type OpcionMtto = 'registroMtto' | 'mtto' | 'verificacion';

@Component({
  selector: 'app-programar-mantenimiento-vehicular',
  templateUrl: './programar-mantenimiento-vehicular.component.html',
  styleUrls: ['./programar-mantenimiento-vehicular.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class ProgramarMantenimientoVehicularComponent implements OnInit, OnDestroy {
  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;
  readonly POSICION_CATALOGOS_PLACAS: number = 3;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  realizoBusqueda: boolean = false;
  paginacionConFiltrado: boolean = false;
  modificarModal: boolean = false;
  detalleModal: boolean = false;

  mostrarModalConfirmacion: boolean = false;
  mensajeConfirmacion: string = "";

  vehiculos: VehiculoMantenimiento[] = [];
  vehiculoSeleccionado!: VehiculoMantenimiento;
  once: boolean = true;
  filtroFormProgramarMantenimiento!: FormGroup;
  cicloCompleto: boolean = false;
  solicitudMttoRef!: DynamicDialogRef;
  nuevaVerificacionRef!: DynamicDialogRef;
  registroMttoRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  catalogoPlacas: TipoDropdown[] = [];

  usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private loaderService: LoaderService,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
    private descargaArchivosService: DescargaArchivosService,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(MANTENIMIENTO_VEHICULAR_BREADCRUMB);
    this.inicializarFiltroForm()
    this.cargarCatalogos();
    this.cargarVelatorios(true);
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGOS_DELEGACIONES];
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.filtroFormProgramarMantenimiento.get('velatorio')?.patchValue("");
    }
    const idDelegacion = this.filtroFormProgramarMantenimiento.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.mantenimientoVehicularService.obtenerVelatorios(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormProgramarMantenimiento = this.formBuilder.group({
      nivel: [{ value: +usuario?.idOficina, disabled: true }],
      delegacion: [{ value: +usuario?.idDelegacion, disabled: +usuario.idOficina >= 2 }, []],
      velatorio: [{ value: +usuario?.idVelatorio, disabled: +usuario.idOficina === 3 }, []],
      placa: [{ value: null, disabled: false }, []],
    });

    this.obtenerPlacas();
  }

  obtenerPlacas() {
    let datos = {
      delegacion: this.f.delegacion.value === '' ? null : this.f.delegacion.getRawValue(),
      velatorio: this.f.velatorio.value === '' ? null : this.f.velatorio.getRawValue(),
    };

    this.mantenimientoVehicularService.obtenerPlacas(datos).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoPlacas = mapearArregloTipoDropdown(respuesta.datos, "DES_PLACAS", "DES_PLACAS");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    this.paginacionConFiltrado = false;
    if (validarUsuarioLogueado()) return;
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
    if (!localStorage.getItem('sivimss_token')) return;
    this.loaderService.activar();
    this.mantenimientoVehicularService.buscarPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, this.crearSolicitudFiltros())
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.vehiculos = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
          this.realizoBusqueda = true;

          const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
          if (usuario?.idRol == '17' && this.vehiculos.length > 0 && this.once) {
            this.vehiculoSeleccionado = this.vehiculos[0];
            this.abrirModalnuevaVerificacion();
            this.once = false;
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  paginarConFiltros(): void {
    const filtros: FiltrosMantenimientoVehicular | null = this.crearSolicitudFiltrosPorNivel();
    if (filtros) {
      if (!Object.values(filtros).some(v => (v))) {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(22);
        this.mostrarModalConfirmacion = true;
        this.mensajeConfirmacion = msg;
        return;
      }
      this.loaderService.activar();
      this.mantenimientoVehicularService.buscarPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, filtros)
        .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
          next: (respuesta: HttpRespuesta<any>): void => {
            this.vehiculos = respuesta.datos.content;
            this.totalElementos = respuesta.datos.totalElements;
            this.realizoBusqueda = true;
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
            this.mensajesSistemaService.mostrarMensajeError(error);
          }
        });
    }
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltrosPorNivel(): FiltrosMantenimientoVehicular | null {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    switch (+usuario.idOficina) {
      case 1:
        return {
          delegacion: this.f.delegacion.getRawValue() === '' ? null : this.f.delegacion.getRawValue(),
          velatorio: this.f.velatorio.getRawValue() === '' ? null : this.f.velatorio.getRawValue(),
          placa: this.f.placa.getRawValue() === '' ? null : this.f.placa.getRawValue()
        }
      case 2:
        return {
          velatorio: this.f.velatorio.getRawValue() === '' ? null : this.f.velatorio.getRawValue(),
          placa: this.f.placa.getRawValue() === '' ? null : this.f.placa.getRawValue()
        }
      case 3:
        return {
          placa: this.f.placa.getRawValue() === '' ? null : this.f.placa.getRawValue()
        }
      default:
        return null;
    }
  }

  crearSolicitudFiltros(): FiltrosMantenimientoVehicular {
    return {
      nivelOficina: this.f.nivel.getRawValue() === '' ? null : this.f.nivel.getRawValue(),
      delegacion: this.f.delegacion.getRawValue() === '' ? null : this.f.delegacion.getRawValue(),
      velatorio: this.f.velatorio.getRawValue() === '' ? null : this.f.velatorio.getRawValue(),
      placa: this.f.placa.getRawValue() === '' ? null : this.f.placa.getRawValue()
    }
  }

  limpiar(): void {
    this.realizoBusqueda = false;
    this.filtroFormProgramarMantenimiento.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormProgramarMantenimiento.get('nivel')?.patchValue(+usuario.idOficina);

    if (+usuario.idOficina >= 2) {
      this.filtroFormProgramarMantenimiento.get('delegacion')?.patchValue(+usuario.idDelegacion);
    }

    if (+usuario.idOficina === 3) {
      this.filtroFormProgramarMantenimiento.get('velatorio')?.patchValue(+usuario.idVelatorio);
    } else {
      this.catalogoVelatorios = [];
    }
    this.obtenerPlacas();
    this.cargarVelatorios(true);
    this.vehiculos = [];
    this.totalElementos = 0;
    this.paginar();
  }

  abrirModalnuevaVerificacion(): void {
    this.nuevaVerificacionRef = this.dialogService.open(NuevaVerificacionComponent, {
      data: { vehiculo: this.vehiculoSeleccionado, cicloCompleto: this.cicloCompleto },
      header: "Verificar al inicio de la jornada",
      width: "920px"
    });
  }

  abrirModalSolicitudMantenimiento(): void {
    this.solicitudMttoRef = this.dialogService.open(SolicitudMantenimientoComponent, {
      header: "Solicitud de mantenimiento vehicular",
      width: "920px",
      data: { vehiculo: this.vehiculoSeleccionado, mode: 'create', cicloCompleto: this.cicloCompleto },
    })
  }

  abrirModalRegistroMantenimiento(): void {
    this.registroMttoRef = this.dialogService.open(RegistroMantenimientoComponent, {
      header: "Registro de mantenimiento vehicular",
      width: "920px",
      data: { vehiculo: this.vehiculoSeleccionado, mode: 'create', cicloCompleto: this.cicloCompleto },
    });
  }

  seleccionarDetalle(opcion: OpcionMtto): void {
    if (opcion === 'mtto') {
      void this.router.navigate(['./detalle-solicitud'], {
        relativeTo: this.route,
        queryParams: { id: this.vehiculoSeleccionado.ID_MTTO_SOLICITUD }
      });
      return;
    }
    if (opcion === 'registroMtto') {
      void this.router.navigate(['./detalle-registro'],
        { relativeTo: this.route, queryParams: { id: this.vehiculoSeleccionado.ID_MTTO_REGISTRO } });
      return;
    }
    void this.router.navigate(['./detalle-verificacion'], {
      relativeTo: this.route,
      queryParams: { id: this.vehiculoSeleccionado.ID_MTTOVERIFINICIO }
    });
  }

  abrirModalModificarVerificacion(): void {
    this.modificarModal = !this.modificarModal;
    this.nuevaVerificacionRef = this.dialogService.open(NuevaVerificacionComponent, {
      data: { id: this.vehiculoSeleccionado.ID_MTTOVERIFINICIO },
      header: "Modificar verificación",
      width: "920px"
    });
  }

  abrirModalModificarSolicitud(): void {
    this.modificarModal = !this.modificarModal;
    this.registroMttoRef = this.dialogService.open(SolicitudMantenimientoComponent, {
      header: "Modificar solicitud de mantenimiento",
      width: "920px",
      data: { id: this.vehiculoSeleccionado.ID_MTTO_SOLICITUD, vehiculo: this.vehiculoSeleccionado },
    });
  }

  abrirModalModificarRegistro(): void {
    this.modificarModal = !this.modificarModal;
    this.registroMttoRef = this.dialogService.open(RegistroMantenimientoComponent, {
      header: "Modificar registro de mantenimiento vehicular",
      width: "920px",
      data: { id: this.vehiculoSeleccionado.ID_MTTO_REGISTRO, vehiculo: this.vehiculoSeleccionado },
    });
  }

  abrirPanel(event: MouseEvent, vehiculoSeleccionado: VehiculoMantenimiento): void {
    this.cicloCompleto = false;
    if (vehiculoSeleccionado.ID_MTTOVERIFINICIO && vehiculoSeleccionado.ID_MTTO_SOLICITUD && vehiculoSeleccionado.ID_MTTO_REGISTRO) {
      this.cicloCompleto = true;
    }
    this.vehiculoSeleccionado = vehiculoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  irADetalle(vehiculo: any): void {
    if (vehiculo?.ID_MTTOVEHICULAR) {
      void this.router.navigate(['/programar-mantenimiento-vehicular/detalle-mantenimiento', vehiculo.ID_MTTOVEHICULAR],
        { queryParams: { tabview: 0 } });
    }
  }

  generarReporteTabla(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.mantenimientoVehicularService.generarReporteTabla(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: () => {
        this.mensajeConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.mostrarModalConfirmacion = true;
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        if (mensaje) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje);
        } else {
          this.alertaService.mostrar(TipoAlerta.Error, "Error en la descarga del documento. Intenta nuevamente.");
        }
      },
    });
  }

  filtrosArchivos(tipoReporte: string) {
    return {
      idNivelOficina: this.f.nivel.value ? +this.f.nivel.value : null,
      idDelegacion: this.f.delegacion.value ? +this.f.delegacion.value : null,
      idVelatorio: this.f.velatorio.value ? +this.f.velatorio.value : null,
      placas: this.f.placa.value ? this.f.placa.value : null,
      rutaNombreReporte: "reportes/generales/ReporteProgramarMttoVehicular.jrxml",
      tipoReporte,
    }
  }

  get f() {
    return this.filtroFormProgramarMantenimiento?.controls;
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
