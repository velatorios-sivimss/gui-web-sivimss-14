import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {OrdenSubrogacion} from "../../models/generar-orden-subrogacion.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ConfirmationService, LazyLoadEvent} from "primeng/api";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {GenerarOrdenSubrogacionService} from '../../services/generar-orden-subrogacion.service';
import {finalize} from "rxjs/operators";
import {of} from "rxjs";
import * as moment from "moment/moment";
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-generar-orden-subrogacion',
  templateUrl: './generar-orden-subrogacion.component.html',
  styleUrls: ['./generar-orden-subrogacion.component.scss'],
  providers: [DialogService, DescargaArchivosService, ConfirmationService, DynamicDialogConfig, DatePipe]
})
export class GenerarOrdenSubrogacionComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;

  mensajeArchivoConfirmacion: string = "";
  mostrarModalConfirmacion: boolean = false;

  formulario!: FormGroup;
  paginacionConFiltrado: boolean = false;

  catalogoFoliosOds: string[] = [];
  catalogoFoliosOdsCompleto: any[] = [];
  catalogoProveedores: string[] = [];
  catalogoProveedoresCompleto: any[] = [];
  catalogoProveedoresConId: any[] = [];
  ordenes: any[] = [];
  ordenSeleccionada!: any;

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
  filtroForm!: FormGroup;
  modificarRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  constructor(
    public config: DynamicDialogConfig,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
    private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService,
    private mensajesSistemaService: MensajesSistemaService,
    private descargaArchivosService: DescargaArchivosService,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.cargarVelatorios(true);
    this.inicializarCatalogos();
    this.inicializarFormulario();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFormulario(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: +usuario.idOficina, disabled: false}, []],
      velatorio: [{value: +usuario.idVelatorio, disabled: false}, []],
      folio: new FormControl({value: null, disabled: false}, []),
      proveedor: new FormControl({value: null, disabled: false}, []),
      fecha: new FormControl({value: null, disabled: false}, []),
    });
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.filtroForm.get('velatorio')?.patchValue("");
    }
    if (!usuario.idDelegacion) return;
    this.generarOrdenSubrogacionService.obtenerVelatorios(usuario.idDelegacion).subscribe({
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
    let formularios = [this.f.folio];
    let value = formularios[posicion].value ? formularios[posicion].value.trim() : '';
    let nuevoValor = value.replace(/[^a-zA-Z0-9ñÑ-\s]+/g, '');
    nuevoValor = nuevoValor.replace(/\s+/g, ' ');
    formularios[posicion].setValue(nuevoValor)
  }

  sinEspacioInicial(posicion: number): void {
    let formularios = [this.f.folio]
    if (formularios[posicion].value.charAt(posicion).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  validarNombreProveedor(posicion: number): void {
    let formularios = [this.f.proveedor];
    let value = formularios[posicion].value ? formularios[posicion].value.trim() : '';
    let nuevoValor = value.replace(/[^a-zA-Z0-9ñÑ\s]+/g, '');
    nuevoValor = nuevoValor.replace(/\s+/g, ' ');
    formularios[posicion].setValue(nuevoValor)
  }

  sinEspacioInicialProveedor(posicion: number): void {
    let formularios = [this.f.proveedor]
    if (formularios[posicion].value.charAt(posicion).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  consultarFoliosODS(event: any): void {
    let usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.loaderService.activar();
    this.generarOrdenSubrogacionService.consultarFolios(this.f.folio.value, usuario.idVelatorio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.catalogoFoliosOds = [];
          this.catalogoFoliosOdsCompleto = [];
          this.catalogoFoliosOdsCompleto = respuesta.datos;
          respuesta.datos.forEach((orden: any) => {
            this.catalogoFoliosOds.push(orden.folioOrdenServicio);
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  consultarProveedor(event: any): void {
    let usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.loaderService.activar();
    this.generarOrdenSubrogacionService.consultarProveedor(usuario.idVelatorio, this.f.proveedor.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.catalogoProveedoresConId = [];
          this.catalogoProveedoresConId = respuesta.datos;
          this.catalogoProveedores = [];
          respuesta.datos.forEach((proveedor: any) => {
            this.catalogoProveedores.push(proveedor.nombreProveedor);
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
    this.generarOrdenSubrogacionService.buscarPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, filtros)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        // this.ordenes = [];
        this.ordenes = respuesta.datos.content;
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
    this.generarOrdenSubrogacionService.buscarPorFiltros(0, this.cantElementosPorPagina, filtros)
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.ordenes = [];
        this.ordenes = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  validarFechaFinal(): void {
    if (!this.f.fechaInicial?.value || !this.f.fechaFinal?.value) {
      return;
    }
    if (this.f.fechaInicial.value > this.f.fechaFinal.value) {
      this.mostrarModalFechaMayor = true;
    }
  }

  generarArchivo(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }
    this.loaderService.activar();
    const busqueda = this.mapearDatosReporte(tipoReporte);
    busqueda.tipoReporte = tipoReporte;
    this.generarOrdenSubrogacionService.generarReporte(busqueda).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const file = new Blob([this.descargaArchivosService.base64_2Blob(
            respuesta.datos, this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)}
        );
        this.descargaArchivosService.descargarArchivo(of(file), configuracionArchivo).pipe(
          finalize(() => this.loaderService.desactivar())
        ).subscribe({
          next: (repuesta) => {
            if (respuesta) {
              this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
              this.mostrarModalConfirmacion = true;
            }
          },
          error: (error) => {
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(64))
          }
        })
      },
      error: (error: HttpErrorResponse) => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, msg);
      }
    })
  }

  abrirPanel(event: MouseEvent, ordenSeleccionada: OrdenSubrogacion): void {
    this.ordenSeleccionada = ordenSeleccionada;
    this.generarOrdenSubrogacionService.ordenSeleccionada = ordenSeleccionada;
    this.overlayPanel.toggle(event);
  }

  detalleOrdenSubrogacion(): void {
    void this.router.navigate([`detalle`], {relativeTo: this.activatedRoute});
  }

  generarOrdenSubrogacion(esModificacion: boolean): void {
    void this.router.navigate([`formato/${esModificacion}`], {relativeTo: this.activatedRoute});
  }

  mapearFiltrosBusqueda(): any {
    let folio = this.catalogoFoliosOdsCompleto.filter((o) => 
    {
      if (o.folioOrdenServicio.includes("-")) {
        return o.folioOrdenServicio === this.filtroForm.get("folio")?.value;
      } else {
        return o.folioOrdenServicio.replace("-","") === this.filtroForm.get("folio")?.value;
      }
    });
    let proveedor: any = this.catalogoProveedoresConId.filter((p) => p.nombreProveedor === this.filtroForm.get("proveedor")?.value);
    return {
      idVelatorio: this.filtroForm.get("velatorio")?.value === "" ? null : this.filtroForm.get("velatorio")?.value,
      folio: folio.length > 0 ? folio[0].idOrdenServicio : null,
      idProveedor: proveedor.length > 0 ? proveedor[0].folioProveedor : null,
      fecha: this.filtroForm.get("fecha")?.value ? this.datePipe.transform(this.filtroForm.get("fecha")?.value, 'YYYY-MM-dd') : null,
    }
  }

  mapearDatosReporte(tipoReporteSeleccionado: string): any {
    let folio = this.catalogoFoliosOdsCompleto.filter((o) => 
    {
      if (o.folioOrdenServicio.includes("-")) {
        return o.folioOrdenServicio === this.filtroForm.get("folio")?.value;
      } else {
        return o.folioOrdenServicio.replace("-","") === this.filtroForm.get("folio")?.value;
      }
    });
    let proveedor: any = this.catalogoProveedoresConId.filter((p) => p.nombreProveedor === this.filtroForm.get("proveedor")?.value);
    return {
      idVelatorio: this.filtroForm.get("velatorio")?.value === "" ? null : this.filtroForm.get("velatorio")?.value,
      folioOrdenServicio: folio.length > 0 ? folio[0].idOrdenServicio : null,
      idProveedor: proveedor.length > 0 ? proveedor[0].folioProveedor : null,
      fecha: this.filtroForm.get("fecha")?.value ? this.datePipe.transform(this.filtroForm.get("fecha")?.value, 'YYYY-MM-dd') : null,
      tipoReporte: tipoReporteSeleccionado
    }
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.cargarVelatorios(true);
    this.inicializarFormulario();
    this.paginar();
  }

  get f() {
    return this.filtroForm.controls;
  }

}
