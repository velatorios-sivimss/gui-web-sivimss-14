
import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LazyLoadEvent } from 'primeng/api';
import { SERVICIO_BREADCRUMB } from '../../constants/breadcrumb';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { BusquedaFiltro, ClavesEstatus, GenerarReporte, NotaRemision } from '../../models/nota-remision.interface';
import { GenerarNotaRemisionService } from '../../services/generar-nota-remision.service';
import * as moment from "moment/moment";
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { mensajes } from '../../../reservar-salas/constants/mensajes';

@Component({
  selector: 'app-generar-nota-remision',
  templateUrl: './generar-nota-remision.component.html',
  styleUrls: ['./generar-nota-remision.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;
  readonly POSICION_VELATORIOS: number = 2;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  notasRemision: NotaRemision[] = [];
  notaRemisionSeleccionada: NotaRemision = {
    id: 0,
    idNota: 0
  };
  filtroForm!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;
  hayCamposObligatorios: boolean = false;
  fechaActual: Date = new Date();
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  foliosGenerados: TipoDropdown[] = [];
  clavesEstatus: ClavesEstatus = {
    1: 'Sin nota',
    2: 'Generada',
    3: 'Cancelada',
  };

  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private generarNotaRemisionService: GenerarNotaRemisionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private descargaArchivosService: DescargaArchivosService,
    private readonly loaderService: LoaderService,
  ) { }


  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
    this.obtenerFoliosGenerados();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: 1, disabled: true }],
      delegacion: [{ value: null, disabled: false }],
      velatorio: [{ value: null, disabled: false }],
      folio: [{ value: null, disabled: false }],
      fechaInicial: [{ value: null, disabled: false }],
      fechaFinal: [{ value: null, disabled: false }],
    });
  }

  generarNotaRemision(): void {
    this.router.navigate([`detalle-orden-servicio/${this.notaRemisionSeleccionada.id}`], { relativeTo: this.activatedRoute });
  }

  verDetalleNotaRemision(): void {
    this.router.navigate([`detalle-formato/1/${this.notaRemisionSeleccionada.id}`], { relativeTo: this.activatedRoute });
  }

  cancelarNotaRemision(): void {
    this.router.navigate([`cancelar-formato/1/${this.notaRemisionSeleccionada.id}`], { relativeTo: this.activatedRoute });
  }

  abrirPanel(event: MouseEvent, notaRemisionSeleccionada: NotaRemision): void {
    this.notaRemisionSeleccionada = notaRemisionSeleccionada;
    this.overlayPanel.toggle(event);
  }

  paginar(event?: LazyLoadEvent): void {
    if (event && event.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    this.generarNotaRemisionService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta) => {
        if (respuesta!.datos?.content.length > 0) {
          this.notasRemision = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        } else {
          const mensaje = this.alertas?.filter((msj: any) => {
            return msj.idMensaje == respuesta.mensaje;
          });
          if (mensaje && mensaje.length > 0) {
            this.alertaService.mostrar(TipoAlerta.Precaucion, mensaje[0].desMensaje);
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        if (mensaje && mensaje.length > 0) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        }
      }
    );
  }

  buscarFoliosNotaRemision() {
    this.numPaginaActual = 0;
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.generarNotaRemisionService.buscarPorFiltros(this.obtenerObjetoParaFiltrado(), this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta) => {
        if (respuesta!.datos?.content.length > 0) {
          this.notasRemision = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        } else {
          this.notasRemision = [];
          this.totalElementos = 0;
          const mensaje = this.alertas?.filter((msj: any) => {
            return msj.idMensaje == respuesta.mensaje;
          });
          if (mensaje && mensaje.length > 0) {
            this.alertaService.mostrar(TipoAlerta.Precaucion, mensaje[0].desMensaje);
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error.error.mensaje;
        })
        if (mensaje && mensaje.length > 0) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        }
      }
    );
  }

  obtenerObjetoParaFiltrado(): BusquedaFiltro {
    return {
      idNivel: +this.f.nivel.value || null,
      idDelegacion: +this.f.delegacion.value || null,
      idVelatorio: +this.f.velatorio.value || null,
      folioODS: this.f.folio.value?.label,
      fecIniODS: this.f.fechaInicial.value ? moment(this.f.fechaInicial.value).format('DD/MM/YYYY') : null,
      fecFinODS: this.f.fechaFinal.value ? moment(this.f.fechaFinal.value).format('DD/MM/YYYY') : null,
    }
  }


  limpiar(): void {
    this.alertaService.limpiar();
    this.filtroForm.reset();
    this.f.nivel.setValue(1);
    this.paginar();
  }

  obtenerFoliosGenerados() {
    this.generarNotaRemisionService.buscarTodasOdsGeneradas().subscribe(
      (respuesta) => {
        let filtrado: TipoDropdown[] = [];
        if (respuesta!.datos.length > 0) {
          respuesta!.datos.forEach((e: any) => {
            filtrado.push({
              label: e.nombre,
              value: e.id,
            });
          });
          this.foliosGenerados = filtrado;
        } else {
          this.foliosGenerados = [];
        }
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    );
  }

  obtenerVelatorios() {
    this.generarNotaRemisionService.obtenerVelatoriosPorDelegacion(this.f.delegacion.value).subscribe(
      (respuesta) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta!.datos, "desc", "id");
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    );
  }

  generarReporteNotaRemision(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.generarNotaRemisionService.generarReporteNotaRemision(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error) => {
        console.log(error);
      },
    )
  }

  generarReporteTabla(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    let busqueda = this.obtenerObjetoParaFiltrado();
    busqueda = { ...busqueda, tipoReporte }

    this.descargaArchivosService.descargarArchivo(this.generarNotaRemisionService.generarReporteTabla(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error) => {
        console.log(error);
      },
    )
  }

  filtrosArchivos(tipoReporte: string): GenerarReporte {
    return {
      idNota: this.notaRemisionSeleccionada.idNota,
      idOrden: this.notaRemisionSeleccionada.id,
      tipoReporte,
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }

}
