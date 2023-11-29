import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { BuscarProveedor, GenerarHoja, ArticulosBusqueda, ArticulosBusquedaDetalle, HojaConsignacionDetalle, ArticulosConsignacion } from '../../models/generar-hoja-consignacion.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize, of } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { LazyLoadEvent } from 'primeng/api';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import * as moment from 'moment';
import { mapearArregloTipoDropdown, validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { PrevisualizacionArchivoComponent } from '../previsualizacion-archivo/previsualizacion-archivo.component';

@Component({
  selector: 'app-agregar-generar-hoja-consignacion',
  templateUrl: './agregar-generar-hoja-consignacion.component.html',
  styleUrls: ['./agregar-generar-hoja-consignacion.component.scss'],
  providers: [DialogService, DynamicDialogRef, DescargaArchivosService]
})
export class AgregarGenerarHojaConsignacionComponent implements OnInit {
  readonly POSICION_HOJA_CONSIGNACION_DETALLE: number = 0;
  readonly POSICION_CATALOGOS_NIVELES: number = 1;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 2;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public catalogoProveedores: TipoDropdown[] = [];
  public mensajeModal: string = "";
  public realizoBusqueda: boolean = false;
  public articulos: ArticulosBusquedaDetalle[] = [];
  public totalArticulo: number = 0;
  public totalCosto: any;
  public agregarGenerarHojaConsignacionForm!: FormGroup;
  public fechaActual: string = '';
  public horaActual: string = '';
  public hojaGenerada: boolean = false;
  public idHojaConsig: number = 0;
  public mode: 'detail' | 'create' = 'create';
  public mostrarModalConfirmacion: boolean = false;
  public mensajeArchivoConfirmacion: string = "";
  public folio: string = "";
  public delegacionSeleccionada: string = "";
  public velatorioSeleccionado: string = "";
  public filtroForm!: FormGroup;
  public hoy: Date = new Date();
  public vistaBusqueda: boolean = true;
  public busquedaRealizada: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private url: LocationStrategy,
    public ref: DynamicDialogRef,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private router: Router,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    public generarHojaConsignacionService: GenerarHojaConsignacionService,
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.inicializarFiltroForm();
    this.cargarVelatorios(true);
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);
    if (this.url.path().includes('detalle')) {
      this.mode = 'detail';
      this.hojaGenerada = true;
      this.vistaBusqueda = false;
      this.activatedRoute.params.subscribe(params => {
        this.idHojaConsig = +params['idHojaConsignacion'];
      });
      let hojaConsignacionDetalle: HojaConsignacionDetalle =
        this.route.snapshot.data["respuesta"][this.POSICION_HOJA_CONSIGNACION_DETALLE].datos;
      this.seteoDetalle(hojaConsignacionDetalle);
    }
  }

  inicializarFiltroForm() {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: new FormControl({ value: +usuario?.idOficina, disabled: true }, [Validators.required]),
      delegacion: new FormControl({ value: +usuario?.idDelegacion, disabled: +usuario?.idOficina >= 2 }, [Validators.required]),
      velatorio: new FormControl({ value: +usuario?.idVelatorio, disabled: +usuario?.idOficina === 3 }, [Validators.required]),
      proveedor: new FormControl({ value: null, disabled: false }, [Validators.required]),
      fecInicio: new FormControl({ value: null, disabled: false }, [Validators.required]),
      fecFin: new FormControl({ value: null, disabled: false }, [Validators.required]),
    });
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles =
      respuesta[this.mode === 'create' ? this.POSICION_CATALOGOS_NIVELES - 1 : this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones =
      respuesta[this.mode === 'create' ? this.POSICION_CATALOGOS_DELEGACIONES - 1 : this.POSICION_CATALOGOS_DELEGACIONES];
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

  paginar(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
  }

  cerrarDialogo() {
    this.ref.close();
  }

  regresar() {
    if (this.vistaBusqueda || this.mode === 'detail') {
      void this.router.navigate([`/generar-hoja-de-consignacion`], { relativeTo: this.activatedRoute });
    }
    this.vistaBusqueda = true;
  }

  obtenerDetalle() {
    this.loaderService.activar();
    this.articulos = [];
    this.generarHojaConsignacionService.obtenerDetalleHojaConsignacion(this.idHojaConsig)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<HojaConsignacionDetalle>) => {
          if (respuesta.datos) {
            this.seteoDetalle(respuesta.datos);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
  }

  seteoDetalle(hojaConsignacionDetalle: HojaConsignacionDetalle) {
    this.articulos = hojaConsignacionDetalle.artResponse;
    this.totalArticulo = hojaConsignacionDetalle.totalArt ?? 0;
    this.totalCosto = hojaConsignacionDetalle.totalCosto ?? '';
    this.folio = hojaConsignacionDetalle.folio ?? '';
    this.delegacionSeleccionada = hojaConsignacionDetalle.delegacion ?? '';
    this.velatorioSeleccionado = hojaConsignacionDetalle.velatorio ?? '';
    this.fechaActual = hojaConsignacionDetalle.fecElaboracion ?? '';
    this.horaActual = hojaConsignacionDetalle.hrElaboracion ?? '';
  }

  buscarArticulos(): void {
    this.loaderService.activar();
    this.busquedaRealizada = false;
    this.articulos = [];
    this.generarHojaConsignacionService.buscarArticulos(this.datosProveedor())
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<ArticulosBusqueda>) => {
          if (respuesta.datos && respuesta.datos.artResponse.length > 0) {
            this.vistaBusqueda = false;
            this.delegacionSeleccionada =
              this.catalogoDelegaciones.find((delegacion: TipoDropdown) => delegacion.value === this.ff.delegacion.value)?.label ?? "";
            this.velatorioSeleccionado =
              this.catalogoVelatorios.find((velatorio: TipoDropdown) => velatorio.value === this.ff.velatorio.value)?.label ?? "";
            this.fechaActual = moment().format('DD/MM/YYYY');
            this.horaActual = moment().format('HH:mm');
            this.articulos = respuesta.datos.artResponse ?? [];
            this.totalArticulo = respuesta.datos.totalArt ?? 0;
            this.totalCosto = respuesta.datos.totalCosto ?? '';
          }

          if (respuesta.mensaje === '45') {
            this.busquedaRealizada = true;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
  }

  guardar() {
    this.loaderService.activar();
    this.generarHojaConsignacionService.generarHoja(this.datosGuardar()).pipe(
      finalize(() => {
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          this.hojaGenerada = true;
          this.idHojaConsig = respuesta.datos;
          this.obtenerDetalle();
          this.alertaService.mostrar(TipoAlerta.Exito, 'Agregado correctamente');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  vistaPrevia(): void {
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: 'Hoja de Consignación' };
    this.loaderService.activar();
    this.generarHojaConsignacionService.reporteHojaConsignacion({ idHojaConsig: this.idHojaConsig }).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        const file = new Blob([respuesta], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);
        let archivoRef: DynamicDialogRef = this.dialogService.open(PrevisualizacionArchivoComponent, {
          data: url,
          header: "",
          width: "1000px",
        });
        archivoRef.onClose.subscribe((response: any) => {
          if (response) {
            this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
              finalize(() => this.loaderService.desactivar())
            ).subscribe({
              next: (respuesta: any) => {
                if (respuesta) {
                  this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
                  this.mostrarModalConfirmacion = true;
                }
              },
              error: (error: HttpErrorResponse) => {
                console.error("ERROR: ", error);
                const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
                this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
              }
            });
          }
        })
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  datosGuardar(): GenerarHoja {
    let artConsig: ArticulosConsignacion[] = [];
    this.articulos?.forEach((item: ArticulosBusquedaDetalle) => {
      artConsig.push({
        ...item,
        costoConIva: item.costoConIva ? Number(item.costoConIva.replace(/[^\d.]*/g, '')) : null,
      })
    });
    return {
      idVelatorio: this.ff.velatorio.getRawValue(),
      idProveedor: this.ff.proveedor.getRawValue(),
      artConsig,
    }
  }

  datosProveedor(): BuscarProveedor {
    return {
      idDelegacion: this.ff.delegacion.getRawValue() === '' ? null : this.ff.delegacion.getRawValue(),
      idVelatorio: this.ff.velatorio.getRawValue() === '' ? null : this.ff.velatorio.getRawValue(),
      idProveedor: this.ff.proveedor.getRawValue() === '' ? null : this.ff.proveedor.getRawValue(),
      fecInicio:
        !this.ff.fecInicio.value || this.ff.fecInicio.getRawValue() === '' ? null : moment(this.ff.fecInicio.value).format('DD/MM/YYYY'),
      fecFin:
        !this.ff.fecFin.value || this.ff.fecFin.getRawValue() === '' ? null : moment(this.ff.fecFin.value).format('DD/MM/YYYY'),
    }
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
  }

  buscar(): void {
    if (validarAlMenosUnCampoConValor(this.filtroForm.value)) {
      if (this.ff.fecInicio.value > this.ff.fecFin.value && this.ff.fecFin.value) {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(20);
        this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
        return;
      }
      this.buscarArticulos();
    } else {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Selecciona por favor un criterio de búsqueda.');
      this.filtroForm.markAllAsTouched();
    }
  }

  get ff() {
    return this.filtroForm.controls;
  }
}
