import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { BuscarGenerarHojaConsignacion, GenerarHojaConsignacion, GenerarHojaConsignacionBusqueda } from "../../models/generar-hoja-consignacion.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { mapearArregloTipoDropdown, validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { AgregarGenerarHojaConsignacionComponent } from '../agregar-generar-hoja-consignacion/agregar-generar-hoja-consignacion.component';
import * as moment from 'moment';
import { FacturaProveedorComponent } from '../factura-proveedor/factura-proveedor.component';

interface HttpResponse {
  respuesta: string;
  promotor: GenerarHojaConsignacion;
}

@Component({
  selector: 'app-generar-hoja-consignacion',
  templateUrl: './generar-hoja-consignacion.component.html',
  styleUrls: ['./generar-hoja-consignacion.component.scss'],
  providers: [DialogService, DescargaArchivosService, DynamicDialogRef]
})
export class GenerarHojaConsignacionComponent implements OnInit {
  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public catalogoProveedores: TipoDropdown[] = [];
  public mostrarModalConfirmacion: boolean = false;
  public busquedaRealizada: boolean = false;
  public mensajeArchivoConfirmacion: string = "";

  public hojasConsignacion: GenerarHojaConsignacionBusqueda[] = [
    {
      idHojaConsignacion: 1,
      fecHojaConsignacion: '14/09/2023',
      folioHojaConsignacion: '14/09/2023',
    }
  ];
  public actividadSeleccionada!: GenerarHojaConsignacionBusqueda;
  public detalleRef!: DynamicDialogRef;
  public filtroForm!: FormGroup;
  public promotoresFiltrados: TipoDropdown[] = [];
  public fechaActual: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generarHojaConsignacionService: GenerarHojaConsignacionService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
    this.cargarVelatorios(true);
  }

  inicializarFiltroForm() {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: new FormControl({ value: +usuario?.idOficina, disabled: true }, [Validators.required]),
      delegacion: new FormControl({ value: +usuario?.idDelegacion, disabled: +usuario?.idOficina >= 2 }, [Validators.required]),
      velatorio: new FormControl({ value: +usuario?.idVelatorio, disabled: +usuario?.idOficina === 3 }, [Validators.required]),
      proveedor: new FormControl({ value: null, disabled: false }, [Validators.required]),
      folio: new FormControl({ value: null, disabled: false }, []),
      fecInicio: new FormControl({ value: null, disabled: false }, [Validators.required]),
      fecFin: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGOS_DELEGACIONES];
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.filtroForm.get('velatorio')?.patchValue("");
    }
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.generarHojaConsignacionService.velatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
        this.cargarProveedores();
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  cargarProveedores(): void {
    const idVelatorio = this.filtroForm.get('velatorio')?.value;
    if (!idVelatorio) return;
    this.generarHojaConsignacionService.obtenerCatalogos({ idCatalogo: 1, idVelatorio }).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoProveedores = mapearArregloTipoDropdown(respuesta.datos, "proveedor", "idProveedor");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  buscar(): void {
    if (validarAlMenosUnCampoConValor(this.filtroForm.value)) {
      if (this.ff.fecInicio.value > this.ff.fecFin.value && this.ff.fecFin.value) {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(20);
        this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
        return;
      }
      this.paginar();
    } else {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Selecciona por favor un criterio de búsqueda.');
      this.filtroForm.markAllAsTouched();
    }
  }

  paginar(event?: LazyLoadEvent): void {
    if (this.filtroForm.valid) {
      if (event?.first !== undefined && event.rows !== undefined) {
        this.numPaginaActual = Math.floor(event.first / event.rows);
      } else {
        this.numPaginaActual = 0;
      }
      this.buscarPorFiltros();
    }
  }

  paginarPorFiltros(): void {
    this.numPaginaActual = 0;
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.loaderService.activar();
    this.hojasConsignacion = [];
    this.generarHojaConsignacionService.buscarPorFiltros(this.datosPromotoresFiltros(), this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.hojasConsignacion = respuesta.datos ?? [];
          this.totalElementos = respuesta.datos?.totalElements ?? 0;
          this.busquedaRealizada = true;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }

        this.hojasConsignacion = [
          {
            idHojaConsignacion: 1,
            fecHojaConsignacion: '14/09/2023',
            folioHojaConsignacion: '14/09/2023',
          }
        ]
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  datosPromotoresFiltros(): BuscarGenerarHojaConsignacion {
    return {
      idDelegacion: this.ff.delegacion.getRawValue() === '' ? null : this.ff.delegacion.getRawValue(),
      idVelatorio: this.ff.velatorio.getRawValue() === '' ? null : this.ff.velatorio.getRawValue(),
      idProveedor: this.ff.proveedor.getRawValue() === '' ? null : this.ff.proveedor.getRawValue(),
      folio: this.ff.folio.getRawValue() === '' ? null : this.ff.folio.getRawValue(),
      fecInicio:
        !this.ff.fecInicio.value || this.ff.fecInicio.getRawValue() === '' ? null : moment(this.ff.fecInicio.value).format('DD/MM/YYYY'),
      fecFin:
        !this.ff.fecFin.value || this.ff.fecFin.getRawValue() === '' ? null : moment(this.ff.fecFin.value).format('DD/MM/YYYY'),
    }
  }

  agregarFormatoActividades(): void {
    void this.router.navigate([`agregar-hoja`], { relativeTo: this.activatedRoute });
  }

  modificarFormatoActividades(actividadSeleccionada: GenerarHojaConsignacionBusqueda): void {
    void this.router.navigate([`modificar-hoja/${actividadSeleccionada.idHojaConsignacion}`], { relativeTo: this.activatedRoute });
  }

  detalleFormatoActividades(actividadSeleccionada: GenerarHojaConsignacionBusqueda): void {
    void this.router.navigate([`detalle-de-hoja/${actividadSeleccionada.idHojaConsignacion}`], { relativeTo: this.activatedRoute });
  }

  abrirPanel(event: MouseEvent, actividadSeleccionada: GenerarHojaConsignacionBusqueda): void {
    this.actividadSeleccionada = actividadSeleccionada;
    this.overlayPanel.toggle(event);
  }

  abrirModalCargarFactura(): void {
    this.detalleRef = this.dialogService.open(FacturaProveedorComponent, {
      header: "Factura proveedor",
      width: "920px",
      data: {actividad: this.actividadSeleccionada},
    });
  }

  agregarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiar(): void {
    this.busquedaRealizada = false;
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm.get('nivel')?.patchValue(+usuario?.idOficina);

    if (+ usuario?.idOficina >= 2) {
      this.filtroForm.get('delegacion')?.patchValue(+usuario?.idDelegacion);
    }

    if (+usuario?.idOficina === 3) {
      this.filtroForm.get('velatorio')?.patchValue(+usuario?.idVelatorio);
    } else {
      this.catalogoVelatorios = [];
    }
    this.cargarVelatorios(true);
    this.hojasConsignacion = [];
    this.totalElementos = 0;
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  generarReporteTabla(tipoReporte: string): void {
    if (this.filtroForm.invalid) return;
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.generarHojaConsignacionService.generarReporteConsulta(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: () => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.mostrarModalConfirmacion = true;
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      },
    });
  }

  filtrosArchivos(tipoReporte: string) {
    return {
      idDelegacion: this.ff.delegacion.getRawValue() === '' ? null : this.ff.delegacion.getRawValue(),
      idVelatorio: this.ff.velatorio.getRawValue() === '' ? null : this.ff.velatorio.getRawValue(),
      idProveedor: this.ff.proveedor.getRawValue() === '' ? null : this.ff.proveedor.getRawValue(),
      folio: this.ff.folio.getRawValue() === '' ? null : this.ff.folio.getRawValue(),
      fecInicio:
        !this.ff.fecInicio.value || this.ff.fecInicio.getRawValue() === '' ? null : moment(this.ff.fecInicio.value).format('DD/MM/YYYY'),
      fecFin:
        !this.ff.fecFin.value || this.ff.fecFin.getRawValue() === '' ? null : moment(this.ff.fecFin.value).format('DD/MM/YYYY'),

      tipoReporte,
    }
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
