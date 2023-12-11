import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {CATALOGOS_DUMMIES} from '../../../../proveedores/constants/dummies';
import {SeguimientoNuevoConvenio} from '../../models/seguimiento-nuevo-convenio.interface';
import {SEGUIMIENTO_CONVENIO_BREADCRUMB} from "../../constants/breadcrumb";
import {UsuarioEnSesion} from "../../../../../models/usuario-en-sesion.interface";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {
  mapearArregloTipoDropdown,
  obtenerNivelUsuarioLogueado,
  obtenerVelatorioUsuarioLogueado, validarUsuarioLogueado
} from "../../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";

interface FiltrosBasicosNuevoConvenio {
  idVelatorio: number | null
}

interface FiltrosNuevoConvenio {
  idVelatorio: number | null,
  folioConvenioPf: string,
  folioConvenioPsfpa: string,
  rfc: string
}

@Component({
  selector: 'app-seguimiento-nuevo-convenio',
  templateUrl: './seguimiento-nuevo-convenio.component.html',
  styleUrls: ['./seguimiento-nuevo-convenio.component.scss'],
  providers: [DialogService],
})
export class SeguimientoNuevoConvenioComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  central!: boolean;

  convenios: SeguimientoNuevoConvenio[] = [];
  convenioSeleccionado: SeguimientoNuevoConvenio = {};

  filtroForm!: FormGroup;
  paginacionConFiltrado: boolean = false;

  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private seguimientoConvenioService: SeguimientoNuevoConvenioService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SEGUIMIENTO_CONVENIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.catalogoNiveles = this.activatedRoute.snapshot.data["respuesta"];
    this.obtenerVelatorios();
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.central = obtenerNivelUsuarioLogueado(usuario) === 1;
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: obtenerNivelUsuarioLogueado(usuario), disabled: true}],
      velatorio: [{
        value: this.central ? null : obtenerVelatorioUsuarioLogueado(usuario),
        disabled: obtenerNivelUsuarioLogueado(usuario) === 3
      }],
      folioConvenioPf: [{value: null, disabled: false}],
      folioConvenioPsfpa: [{value: null, disabled: false}],
      rfcAfiliado: [{value: null, disabled: false}],
    });
  }

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const delegacion: null | string = this.central ? null : usuario?.idDelegacion ?? null;
    this.seguimientoConvenioService.obtenerVelatoriosPorDelegacion(delegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.solicitudExitosaVelatorios(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  solicitudExitosaVelatorios(respuesta: HttpRespuesta<any>): void {
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
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
    this.cargadorService.activar();
    const filtros: FiltrosBasicosNuevoConvenio = this.obtenerFiltroBasico();
    this.seguimientoConvenioService
      .buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaPaginacion(respuesta),
        error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
      });
  }

  obtenerFiltroBasico(): FiltrosBasicosNuevoConvenio {
    return {
      idVelatorio: this.filtroForm.get('velatorio')?.value
    }
  }

  procesarRespuestaPaginacion(respuesta: HttpRespuesta<any>): void {
    this.convenios = respuesta.datos.content;
    this.totalElementos = respuesta.datos.totalElements;
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.limpiarFormulario();
    this.numPaginaActual = 0;
    this.paginar();
  }

  limpiarFormulario(): void {
    if (!this.filtroForm) return;
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const nivel: number = obtenerNivelUsuarioLogueado(usuario);
    const velatorio: number | null = this.central ? null : obtenerVelatorioUsuarioLogueado(usuario);
    const DEFAULT = {nivel, velatorio}
    this.filtroFormDir.resetForm(DEFAULT);
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  paginarConFiltros(): void {
    const filtros = {};
    this.cargadorService.activar();
    this.seguimientoConvenioService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaPaginacion(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  obtenerFiltroConvenio(): FiltrosNuevoConvenio {
    return {
      folioConvenioPf: this.filtroForm.get('folioConvenioPf')?.value,
      folioConvenioPsfpa: this.filtroForm.get('folioConvenioPsfpa')?.value,
      idVelatorio: this.filtroForm.get('velatorio')?.value,
      rfc: this.filtroForm.get('rfcAfiliado')?.value
    }
  }

  abrirModalAgregarServicio(): void {
    // this.creacionRef = this.dialogService.open(AgregarArticulosComponent,{
    //   header:"Agregar artículo",
    //   width:"920px"
    // });
    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado correctamente');
    //   }
    // })
  }

  abrirCambioEstatus(servicio: SeguimientoNuevoConvenio): void {
    void this.router.navigate(['desactivar-convenio'], {relativeTo: this.activatedRoute});
    /*Preguntar si se puede usar 'let'*/
    // let header:string = "" ;
    // servicio.estatus?header="Activar artículo":header="Desactivar artículo";
    // this.creacionRef = this.dialogService.open(DetalleArticulosComponent, {
    //   header:header,
    //   width:"920px",
    //   data: {servicio:servicio, origen: "estatus"},
    // })

    // this.creacionRef.onClose.subscribe((servicio:Articulos) => {
    //   if(servicio.estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo activado correctamente');
    //   }else{
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio desactivado correctamente');
    //   }
    // })

  }

  abrirConcluirServicio(): void {
    // this.creacionRef = this.dialogService.open(ModificarArticulosComponent, {
    //   header:"Modificar artículo",
    //   width:"920px",
    // })

    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo modificado correctamente');
    //   }
    // })
  }

  abrirPanel(event: MouseEvent, convenioSeleccionado: SeguimientoNuevoConvenio): void {
    this.convenioSeleccionado = convenioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleCapilla(servicio: SeguimientoNuevoConvenio) {
    // this.creacionRef = this.dialogService.open(DetalleArticulosComponent, {
    //   header:"Detalle",
    //   width:"920px",
    //   data: {servicio:servicio, origen: "detalle"},
    // })
  }

  consultaServicioEspecifico(): string {
    return ''
  }

  abrirPreRegistroNuevoConvenio(): void {
    void this.router.navigate(['pre-registro-nuevo-convenio'], {relativeTo: this.activatedRoute});
  }


}
