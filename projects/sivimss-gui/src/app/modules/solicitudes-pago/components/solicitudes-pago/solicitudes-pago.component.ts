import {SolicitudPago} from '../../models/solicitud-pagos.interface';
import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {SolicitudesPagoService} from '../../services/solicitudes-pago.service';
import {ActivatedRoute, Router} from '@angular/router';
import { FiltrosSolicitudPago } from '../../models/filtros-solicitud-pagos.interface';
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {mapearArregloTipoDropdown, validarUsuarioLogueado} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import * as moment from "moment/moment";
import { CATALOGOS_DUMMIES, CATALOGO_NIVEL } from '../../../articulos/constants/dummies';
import { SolicitarSolicitudPagoComponent } from '../solicitar-solicitud-pago/solicitar-solicitud-pago.component';
import { CancelarSolicitudPagoComponent } from '../cancelar-solicitud-pago/cancelar-solicitud-pago.component';
import { RechazarSolicitudPagoComponent } from '../rechazar-solicitud-pago/rechazar-solicitud-pago.component';
import { VerDetalleSolicitudPagoComponent } from '../ver-detalle-solicitud/ver-detalle-solicitud.component';

type ListadoSolicitudPago = Required<SolicitudPago> & { id: string }

@Component({
  selector: 'app-solicitudes-pago',
  templateUrl: './solicitudes-pago.component.html',
  styleUrls: ['./solicitudes-pago.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class SolicitudesPagoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  solicitudesPago: SolicitudPago[] = [];
  solicitudPagoSeleccionado!: SolicitudPago;
  filtroFormSolicitudesPago!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  cancelarRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  fechaActual: Date = new Date();
  fechaAnterior: Date = new Date();

  paginacionConFiltrado: boolean = false;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private solicitudesPagoService: SolicitudesPagoService,
    private router: Router,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
    this.fechaAnterior.setDate(this.fechaActual.getDate() - 1);
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catatalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
    this.obtenerVelatorios();
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormSolicitudesPago = this.formBuilder.group({
      nivel: [{value: +usuario.idOficina, disabled: true}],
      delegacion: [{value: +usuario.idDelegacion, disabled: +usuario.idOficina > 1}],
      velatorio: [{value: +usuario.idVelatorio, disabled: +usuario.idOficina === 3}],
      promotores: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroFormSolicitudesPago.get('fechaInicial')?.value;
    const fechaFinal = this.filtroFormSolicitudesPago.get('fechaFinal')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroFormSolicitudesPago.get('fechaInicial')?.patchValue(null);
    this.filtroFormSolicitudesPago.get('fechaFinal')?.patchValue(null);
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
    const filtros = {
      idNivel: this.filtroFormSolicitudesPago.get("nivel")?.value,
      idDelegacion: this.filtroFormSolicitudesPago.get("delegacion")?.value,
      idVelatorio: this.filtroFormSolicitudesPago.get("velatorio")?.value,
    }
    this.solicitudesPago = [
      {  
        id: 1,
        idVelatorio: 1,
        folio: '000001',
        ejercFiscal: 'TASASL12107034Y',
        fechaElaboracion: 'Jorge',
        tipoSolic: 'Sanchez',
        estatus: 'Prado',
      },
      {
        id: 2,
        idVelatorio: 2,
        folio: '000002',
        ejercFiscal: 'TASASL12107034Y',
        fechaElaboracion: 'Edwin',
        tipoSolic: 'Ruiz',
        estatus: 'Cardenas',
      },
      {
        id: 3,
        idVelatorio: 3,
        folio: '000003',
        ejercFiscal: 'TASASL12107034Y',
        fechaElaboracion: 'Nataly',
        tipoSolic: 'Sanchez',
        estatus: 'Hernandez',
      },
    ];
    this.totalElementos=10;
  }

  abrirPanel(event: MouseEvent, solicitudPagoSeleccionado: ListadoSolicitudPago): void {
    debugger
    this.solicitudPagoSeleccionado = solicitudPagoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  
  abrirDetalleSolicitudPago(solicitudPagoSeleccionado: ListadoSolicitudPago): void {
    this.solicitudPagoSeleccionado = solicitudPagoSeleccionado;
    this.cancelarRef = this.dialogService.open(
      VerDetalleSolicitudPagoComponent,
      {
        header: 'Solicitud de comprobación de bienes y servicios',
        width: '880px',
        data: solicitudPagoSeleccionado.id
      },
    )
  }

  abrirModalGenerarSolicitudPago(): void {
    debugger
    this.cancelarRef = this.dialogService.open(
      SolicitarSolicitudPagoComponent,
      {
        header: 'Generar solicitud de pago',
        width: '880px',
      },
    )
  }

  abrirModalCancelarSolicitudPago(): void {
    debugger
    this.cancelarRef = this.dialogService.open(
      CancelarSolicitudPagoComponent,
      {
        header: 'Cancelar solicitud de pago',
        width: '880px',
      },
    )
  }

  abrirModalRechazarSolicitudPago(): void {
    debugger
    this.cancelarRef = this.dialogService.open(
      RechazarSolicitudPagoComponent,
      {
        header: 'Rechazar solicitud de pago',
        width: '880px',
      },
    )
  }

  paginarConFiltros(): void {
    const filtros: FiltrosSolicitudPago = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.solicitudesPagoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.solicitudesPago = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosSolicitudPago {
    return {
      idNivel: this.filtroFormSolicitudesPago.get("nivel")?.value,
      idDelegacion: this.filtroFormSolicitudesPago.get("delegacion")?.value,
      idVelatorio: this.filtroFormSolicitudesPago.get("velatorio")?.value,
      fecIniODS: this.filtroFormSolicitudesPago.get("fechaInicial")?.value,
      fecFinODS: this.filtroFormSolicitudesPago.get("fechaFinal")?.value,
      ejercFiscal: this.filtroFormSolicitudesPago.get("ejercFiscal")?.value,
      tipoSolic: this.filtroFormSolicitudesPago.get("tipoSolic")?.value,
      folio: this.filtroFormSolicitudesPago.get("folio")?.value,
      rutaNombreReporte: "reportes/generales/ReporteFiltrosRecPagos.jrxml",
      tipoReporte: "pdf"
    }
  }

  limpiar(): void {
    this.filtroFormSolicitudesPago.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormSolicitudesPago.get('nivel')?.patchValue(+usuario.idOficina);
    this.filtroFormSolicitudesPago.get('delegacion')?.patchValue(+usuario.idDelegacion);
    this.filtroFormSolicitudesPago.get('velatorio')?.patchValue(+usuario.idVelatorio);
    this.obtenerVelatorios();
    this.paginar();
  }

  obtenerVelatorios(): void {
    const idDelegacion = this.filtroFormSolicitudesPago.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.solicitudesPagoService.obtenerVelatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  get f() {
    return this.filtroFormSolicitudesPago?.controls;
  }

}
