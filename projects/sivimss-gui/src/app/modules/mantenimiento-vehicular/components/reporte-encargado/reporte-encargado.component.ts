import { Component, OnInit, ViewChild } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { FiltrosReporteEncargado } from "../../models/filtrosReporteEncargado.interface";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";
import * as moment from "moment/moment";
import { UsuarioEnSesion } from "../../../../models/usuario-en-sesion.interface";
import { RegistroReporteEncargado } from "../../models/registroReporteEncargado.interface";
import { tablaRin } from "../../constants/tabla-rines";
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';

@Component({
  selector: 'app-reporte-encargado',
  templateUrl: './reporte-encargado.component.html',
  styleUrls: ['./reporte-encargado.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class ReporteEncargadoComponent implements OnInit {
  dataDetalle = tablaRin;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0
  mostrarModalConfirmacion: boolean = false;
  mensajeArchivoConfirmacion: string = "";
  velatorio: string = '';
  totalVehiculos: number = 0;
  rangoFecha: string = '';
  registrosReporte: RegistroReporteEncargado[] = [];
  registroSeleccionado!: RegistroReporteEncargado;

  filtroForm!: FormGroup

  tipoReportes: TipoDropdown[] = [];
  catalogoPlacas: TipoDropdown[] = [];

  mostrarDetalle: boolean = false;
  mostrarTabla: boolean = false;

  readonly POSICION_CATALOGOS_PLACAS: number = 0;
  readonly POSICION_CATALOGOS_TIPO_MTTO: number = 1;

  fechaActual: Date = new Date();
  fechaValida: boolean = false;
  tipoBusqueda: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
  ) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.inicializarFiltroForm();
    this.obtenerVelatorios();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoPlacas = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGOS_PLACAS].datos.content, "DES_PLACAS", "DES_PLACAS");
    this.tipoReportes = respuesta[this.POSICION_CATALOGOS_TIPO_MTTO];
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.mostrarTabla = false;
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      tipoReporte: [{ value: null, disabled: false }, [Validators.required]],
      placa: [{ value: null, disabled: false }, []],
      fechaVigenciaDesde: [{ value: null, disabled: false }, [Validators.required]],
      fecahVigenciaHasta: [{ value: null, disabled: false }, [Validators.required]],
    });

    this.obtenerPlacas();
  }

  paginar(event?: LazyLoadEvent): void {
    if (this.filtroForm.valid) {
      if (event?.first !== undefined && event.rows !== undefined) {
        this.numPaginaActual = Math.floor(event.first / event.rows);
      } else {
        this.numPaginaActual = 0;
      }
    }
  }

  buscar(): void {
    this.rangoFecha = `${moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD-MM-YYYY')} a
    ${moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD-MM-YYYY')}`
    this.mostrarTabla = true;
    this.loaderService.activar();
    if (this.fmp.tipoReporte.value == 1) {
      this.tipoBusqueda = 1;
      this.mantenimientoVehicularService.buscarPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, this.crearSolicitudFiltrosPrograma())
        .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
          next: (respuesta: HttpRespuesta<any>): void => {
            this.totalVehiculos = respuesta.datos.totalElements;
            this.totalElementos = respuesta.datos.totalElements;
            this.registrosReporte = respuesta.datos.content;
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
          }
        });
    } else {
      this.tipoBusqueda = 2;
      this.mantenimientoVehicularService.buscarReporteEncargado(this.numPaginaActual, this.cantElementosPorPagina, this.crearSolicitudFiltrosVerificacion())
        .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
          next: (respuesta: HttpRespuesta<any>): void => {
            this.totalVehiculos = respuesta.datos.totalElements;
            this.totalElementos = respuesta.datos.totalElements;
            this.registrosReporte = respuesta.datos.content;
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
          }
        });
    }
  }

  crearSolicitudFiltrosPrograma(): FiltrosReporteEncargado {
    return {
      fecFin: moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD/MM/YYYY'),
      fecInicio: moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD/MM/YYYY'),
      placa: this.filtroForm.get('placa')?.value,
    }
  }

  crearSolicitudFiltrosVerificacion(): FiltrosReporteEncargado {
    return {
      fechaFin: moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD/MM/YYYY'),
      fechaInicio: moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD/MM/YYYY'),
      placa: this.filtroForm.get('placa')?.value,
    }
  }

  abrirDetallereporteEncargado(registro: RegistroReporteEncargado): void {
    this.registroSeleccionado = registro;
    this.mostrarDetalle = true;
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.velatorio = `#${usuario.idVelatorio}`;

    this.mantenimientoVehicularService.obtenerVelatorios(usuario.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const velatorio = respuesta.datos.find((v: { id: string | number; }) => (+v.id === +usuario.idVelatorio))?.desc;
        this.velatorio = `#${usuario.idVelatorio} ${velatorio || ''}`;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  validarFechas() {
    if (this.fmp.fechaVigenciaDesde.value > this.fmp.fecahVigenciaHasta.value && this.fmp.fecahVigenciaHasta.value) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
      this.fechaValida = false;
    } else {
      this.fechaValida = true;
    }
  }

  cerrar() {
    if (this.mostrarDetalle) {
      this.mostrarDetalle = !this.mostrarDetalle;
    } else {
      void this.router.navigate(['/programar-mantenimiento-vehicular']);
    }
  }

  generarReporteTabla(tipoReporte: string): void {
    if (this.filtroForm.invalid || !this.fechaValida) return;
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.mantenimientoVehicularService.generarReporteEncargado(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.mostrarModalConfirmacion = true;
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
    });
  }

  filtrosArchivos(tipoReporte: string) {
    return {
      numReporte: this.fmp.tipoReporte.value,
      fechaInicio: moment(this.fmp.fechaVigenciaDesde.value).format('DD-MM-YYYY'),
      fechaFin: moment(this.fmp.fecahVigenciaHasta.value).format('DD-MM-YYYY'),
      placas: this.fmp.placa.value ? this.fmp.placa.value : null,
      tipoReporte,
    }
  }

  obtenerPlacas() {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    let datos = {
      delegacion: +usuario.idDelegacion,
      velatorio: +usuario.idVelatorio,
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

  get fmp() {
    return this.filtroForm?.controls;
  }
}
