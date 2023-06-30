import {BalanceCaja} from '../../models/balance-caja.interface';
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
import {BalanceCajaService} from '../../services/balance-caja.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FiltrosBalanceCaja} from "../../models/filtros-balance-caja.interface";
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

type ListadoBalanceCaja = Required<BalanceCaja> & { id: string }

@Component({
  selector: 'app-balance-caja',
  templateUrl: './balance-caja.component.html',
  styleUrls: ['./balance-caja.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class BalanceCajaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  balanceCaja: BalanceCaja[] = [];
  balanceCajaSeleccionado!: BalanceCaja;
  filtroFormBalanceCaja!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

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
    private balanceCajaService: BalanceCajaService,
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

  abrirDetalleComision(balanceCajaSeleccionado: ListadoBalanceCaja): void {
    this.balanceCajaSeleccionado = balanceCajaSeleccionado;
    this.router.navigate([`comisiones/detalle-comision/${balanceCajaSeleccionado.id}`]).then(() => { }).catch(() => { });
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormBalanceCaja = this.formBuilder.group({
      nivel: [{value: +usuario.idOficina, disabled: true}],
      delegacion: [{value: +usuario.idDelegacion, disabled: +usuario.idOficina > 1}],
      velatorio: [{value: +usuario.idVelatorio, disabled: +usuario.idOficina === 3}],
      promotores: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
  }

  validarMismaFechaInicioFin(): void {
    const fechaInicial = this.filtroFormBalanceCaja.get('fechaInicial')?.value;
    const fechaFinal = this.filtroFormBalanceCaja.get('fechaFinal')?.value;
    if ([fechaInicial, fechaFinal].some(f => f === null)) return;
    if (moment(fechaInicial).format('YYYY-MM-DD') !== moment(fechaFinal).format('YYYY-MM-DD')) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
    this.filtroFormBalanceCaja.get('fechaInicial')?.patchValue(null);
    this.filtroFormBalanceCaja.get('fechaFinal')?.patchValue(null);
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
      idNivel: this.filtroFormBalanceCaja.get("nivel")?.value,
      idDelegacion: this.filtroFormBalanceCaja.get("delegacion")?.value,
      idVelatorio: this.filtroFormBalanceCaja.get("velatorio")?.value,
    }
    this.balanceCaja = [ 
      {
        id: 1,
        numEmpleado: '000001',
        curp: 'TASASL12107034Y',
        nombre: 'Jorge',
        primerApellido: 'Sanchez',
        segundoApellido: 'Prado',
      },
      {
        id: 2,
        numEmpleado: '000002',
        curp: 'TASASL12107034Y',
        nombre: 'Edwin',
        primerApellido: 'Ruiz',
        segundoApellido: 'Cardenas',
      },
      {
        id: 3,
        numEmpleado: '000003',
        curp: 'TASASL12107034Y',
        nombre: 'Nataly',
        primerApellido: 'Sanchez',
        segundoApellido: 'Hernandez',
      },
    ];
    this.totalElementos=10;
  }

  paginarConFiltros(): void {
    const filtros: FiltrosBalanceCaja = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.balanceCajaService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.balanceCaja = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosBalanceCaja {
    return {
      idNivel: this.filtroFormBalanceCaja.get("nivel")?.value,
      idDelegacion: this.filtroFormBalanceCaja.get("delegacion")?.value,
      idVelatorio: this.filtroFormBalanceCaja.get("velatorio")?.value,
      promotores: this.filtroFormBalanceCaja.get("promotores")?.value,
      fecIniODS: this.filtroFormBalanceCaja.get("fechaInicial")?.value,
      fecFinODS: this.filtroFormBalanceCaja.get("fechaFinal")?.value,
      rutaNombreReporte: "reportes/generales/ReporteFiltrosRecPagos.jrxml",
      tipoReporte: "pdf"
    }
  }

  limpiar(): void {
    this.filtroFormBalanceCaja.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroFormBalanceCaja.get('nivel')?.patchValue(+usuario.idOficina);
    this.filtroFormBalanceCaja.get('delegacion')?.patchValue(+usuario.idDelegacion);
    this.filtroFormBalanceCaja.get('velatorio')?.patchValue(+usuario.idVelatorio);
    this.obtenerVelatorios();
    this.paginar();
  }

  obtenerVelatorios(): void {
    const idDelegacion = this.filtroFormBalanceCaja.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.balanceCajaService.obtenerVelatoriosPorDelegacion(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  get f() {
    return this.filtroFormBalanceCaja?.controls;
  }

}
