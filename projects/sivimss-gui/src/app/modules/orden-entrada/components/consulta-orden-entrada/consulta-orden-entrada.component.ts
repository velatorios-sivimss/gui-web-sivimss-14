import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import * as moment from "moment/moment";

import {LazyLoadEvent} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";

import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OrdenEntradaService} from "../../services/orden-entrada.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {DialogService} from "primeng/dynamicdialog";
import {ActivatedRoute} from "@angular/router";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {CatalogoFolioODE} from "../../models/catalogos.interface";
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import {DatePipe} from '@angular/common';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';

@Component({
  selector: 'app-consulta-orden-entrada',
  templateUrl: './consulta-orden-entrada.component.html',
  styleUrls: ['./consulta-orden-entrada.component.scss'],
  providers: [DialogService, DescargaArchivosService, DatePipe]
})
export class ConsultaOrdenEntradaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_DELEGACIONES: number = 0;
  readonly POSICION_NIVELES: number = 1;
  readonly POSICION_CONTRATOS: number = 2;
  readonly POSICION_PAGINADO_ORDENES_ENTRADA: number = 3;
  readonly ORDEN_ENTRADA_ESTATUS_CERRADA: number = 3;

  mensajeArchivoConfirmacion: string = "";
  mostrarModalConfirmacion: boolean = false;

  formulario!: FormGroup;
  paginacionConFiltrado: boolean = false;

  folioCatalogosODE!: CatalogoFolioODE[];
  catalogoOrdenesEntrada: string[] = [];
  catalogoProveedores: string[] = [];

  ordenesEntrada: any[] = [];
  ordenEntradaSeleccionada!: any;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  fechaActual = new Date();
  fechaRango = moment().subtract(10, 'years').toDate();
  mostrarModalFechaMayor: boolean = false;

  mostrarModalCerrarODE: boolean = false;

  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  numPaginaActual: number = 0;
  totalElementos: number = 0;

  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ordenEntradaService: OrdenEntradaService,
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private descargaArchivosService: DescargaArchivosService,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.cargarVelatorios(true);
    this.inicializarFormulario();
    this.inicializarCatalogos();
  }

  inicializarFormulario(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.formulario = this.formBuilder.group({
      nivel: [{value: +usuario.idOficina, disabled: false}],
      velatorio: [{value: +usuario.idVelatorio, disabled: false}],
      ordenEntrada: [{value: null, disabled: false}],
      proveedor: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}, [Validators.required]],
      fechaFinal: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.folioCatalogosODE = respuesta[this.POSICION_CONTRATOS].datos;
    this.ordenesEntrada = respuesta[this.POSICION_PAGINADO_ORDENES_ENTRADA].datos.content;
    this.totalElementos = respuesta[this.POSICION_PAGINADO_ORDENES_ENTRADA].datos.totalElements;
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.formulario.get('velatorio')?.patchValue("");
    }
    if (!usuario.idDelegacion) return;
    this.ordenEntradaService.obtenerVelatorios(usuario.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  validarNombre(posicion: number): void {
    let formularios = [this.f.ordenEntrada];
    let value = formularios[posicion].value;
    let nuevoValor = value.replace(/[^a-zA-Z0-9ñÑ\s]+/g, '');
    nuevoValor = nuevoValor.replace(/\s+/g, ' ');
    formularios[posicion].setValue(nuevoValor)
  }

  sinEspacioInicial(posicion: number): void {
    let formularios = [this.f.ordenEntrada]
    if (formularios[posicion].value.charAt(posicion).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  consultarOrdenesEntrada(event: any): void {
    let usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.loaderService.activar();
    this.ordenEntradaService.consultarOrdenesEntrada(this.f.ordenEntrada.value, usuario.idVelatorio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.catalogoOrdenesEntrada = [];
          respuesta.datos.forEach((ordenEntrada: any) => {
            this.catalogoOrdenesEntrada.push(ordenEntrada.NUM_FOLIO);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  consultarProveedor(event: any): void {
    this.loaderService.activar();
    this.ordenEntradaService.consultarProveedor(this.f.proveedor.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.catalogoProveedores = [];
          respuesta.datos.forEach((proveedor: any) => {
            this.catalogoProveedores.push(proveedor.NOM_PROVEEDOR);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  buscar(): void {
    this.validarFechaFinal();
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    this.paginacionConFiltrado = false;
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
    let filtros: any = this.mapearFiltrosBusqueda();
    this.loaderService.activar();
    this.ordenEntradaService.buscarPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, filtros)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.ordenesEntrada = [];
        this.ordenesEntrada = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  paginarConFiltros(): void {
    let filtros: any = this.mapearFiltrosBusqueda();
    this.loaderService.activar();
    this.ordenEntradaService.buscarPorFiltros(0, this.cantElementosPorPagina, filtros)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.ordenesEntrada = [];
        this.ordenesEntrada = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  abrirPanel(event: MouseEvent, orden: any): void {
    this.ordenEntradaSeleccionada = orden;
    this.overlayPanel.toggle(event);
  }

  validarFechaFinal(): void {
    if (!this.f.fechaInicial?.value || !this.f.fechaFinal?.value) {
      return;
    }
    if (this.f.fechaInicial.value > this.f.fechaFinal.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  abrirModalCerrarODE(): void {
    this.mostrarModalCerrarODE = true;
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    this.loaderService.activar();
    const busqueda = this.mapearDatosReporte(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.ordenEntradaService.generarReporteOrdenEntrada(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
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

  cerrarOrdenEntrada() {
    this.loaderService.activar();
    this.ordenEntradaService.actualizarOrdenEntrada(this.ordenEntradaSeleccionada.ID_ODE, this.ORDEN_ENTRADA_ESTATUS_CERRADA).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.mostrarModalCerrarODE = false;
        this.alertaService.mostrar(TipoAlerta.Exito, "Orden de entrada cerrada correctamente.");
        this.paginarConFiltros();
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  mapearFiltrosBusqueda(): any {
    return {
      idVelatorio: this.formulario.get("velatorio")?.value === "" ? null : this.formulario.get("velatorio")?.value,
      numFolioOrdenEntrada: this.formulario.get("ordenEntrada")?.value,
      nomProveedor: this.formulario.get("proveedor")?.value,
      fechaInicio: this.formulario.get("fechaInicial")?.value ? this.datePipe.transform(this.formulario.get("fechaInicial")?.value, 'YYYY-MM-dd') : null,
      fechaFin: this.formulario.get("fechaFinal")?.value ? this.datePipe.transform(this.formulario.get("fechaFinal")?.value, 'YYYY-MM-dd') : null,
    }
  }

  mapearDatosReporte(tipoReporteSeleccionado: string): any {
    return {
      idVelatorio: this.formulario.get("velatorio")?.value === "" ? null : this.formulario.get("velatorio")?.value,
      numFolioOrdenEntrada: this.formulario.get("ordenEntrada")?.value,
      tipoReporte: tipoReporteSeleccionado
    }
  }

  limpiar(): void {
    this.formulario.reset();
    this.cargarVelatorios(true);
    this.inicializarFormulario();
    this.paginar();
  }

  get f() {
    return this.formulario.controls;
  }

}
