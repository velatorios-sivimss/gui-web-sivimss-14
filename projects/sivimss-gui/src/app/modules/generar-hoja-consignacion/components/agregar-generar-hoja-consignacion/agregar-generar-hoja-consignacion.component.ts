import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { BuscarCatalogo, BuscarProveedor, GenerarHoja, ArticulosBusqueda, ArticulosBusquedaDetalle } from '../../models/generar-hoja-consignacion.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { GenerarHojaConsignacionService } from '../../services/generar-hoja-consignacion.service';
import { GENERAR_FORMATO_BREADCRUMB } from '../../constants/breadcrumb';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { LazyLoadEvent } from 'primeng/api';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';

@Component({
  selector: 'app-agregar-generar-hoja-consignacion',
  templateUrl: './agregar-generar-hoja-consignacion.component.html',
  styleUrls: ['./agregar-generar-hoja-consignacion.component.scss'],
  providers: [DialogService, DynamicDialogRef]
})
export class AgregarGenerarHojaConsignacionComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGOS_ENTIDADES: number = 3;

  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public catalogoVelatorios: TipoDropdown[] = [];
  public catalogoPromotores: TipoDropdown[] = [];
  public mensajeModal: string = "";
  public realizoBusqueda: boolean = false;
  public articulos: ArticulosBusquedaDetalle[] = [];
  public totalArticulo: number = 0;
  public totalCosto: number = 0;
  public agregarGenerarHojaConsignacionForm!: FormGroup;
  public hoy = new Date();
  public hojaGenerada: boolean = false;
  public idHojaConsig: number = 0;
  public mode: 'detail' | 'create' = 'create';
  public mostrarModalConfirmacion: boolean = false;
  public mensajeArchivoConfirmacion: string = "";

  constructor(
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
  ) {
  }

  ngOnInit(): void {
    if (this.url.path().includes('detalle')) {
      this.mode = 'detail';
    }
    this.breadcrumbService.actualizar(GENERAR_FORMATO_BREADCRUMB);

    if (this.mode === 'detail') {
      this.obtenerDetalle();
    } else {
      if (!this.generarHojaConsignacionService.delegacionSeleccionada ||
        !this.generarHojaConsignacionService.velatorioSeleccionado ||
        !this.generarHojaConsignacionService.proveedorSeleccionado) {
        void this.router.navigate([`/generar-hoja-de-consignacion`], { relativeTo: this.activatedRoute });
      }
      this.buscarArticulos();
    }
  }

  paginar(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    // this.buscarPorFiltros(false);
  }

  cerrarDialogo() {
    this.ref.close();
  }

  obtenerDetalle() {
    this.loaderService.activar();
    this.articulos = [];
    this.generarHojaConsignacionService.obtenerDetalleHojaConsignacion(this.idHojaConsig)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<ArticulosBusqueda>) => {
          if (respuesta.datos) {
            console.log(respuesta);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
  }

  buscarArticulos(): void {
    this.loaderService.activar();
    this.articulos = [];
    this.generarHojaConsignacionService.buscarArticulos(this.datosProveedor())
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<ArticulosBusqueda>) => {
          if (respuesta.datos)
            this.articulos = respuesta.datos.articulosBusquedaDetalle;
          this.totalArticulo = respuesta.datos.totalArt ?? 0;
          this.totalCosto = respuesta.datos.totalCosto ?? 0;
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
          this.alertaService.mostrar(TipoAlerta.Exito, 'Agregado correctamente');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  vistaPrevia(): void {
    this.loaderService.activar();
    this.descargaArchivosService.descargarArchivo(this.generarHojaConsignacionService.reporteHojaConsignacion({ idHojaConsig: this.idHojaConsig })).pipe(
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

  datosGuardar(): GenerarHoja {
    return {
      idVelatorio: this.generarHojaConsignacionService.velatorioSeleccionado?.value,
      idProveedor: this.generarHojaConsignacionService.proveedorSeleccionado?.value,
      artConsig: this.articulos,
    }
  }

  datosProveedor(): BuscarProveedor {
    return {
      idDelegacion: this.generarHojaConsignacionService.delegacionSeleccionada?.value,
      idVelatorio: this.generarHojaConsignacionService.velatorioSeleccionado?.value,
      idProveedor: this.generarHojaConsignacionService.proveedorSeleccionado?.value,
      fecInicio: this.generarHojaConsignacionService.fecInicio,
      fecFin: this.generarHojaConsignacionService.fecFin,
    }
  }
}
