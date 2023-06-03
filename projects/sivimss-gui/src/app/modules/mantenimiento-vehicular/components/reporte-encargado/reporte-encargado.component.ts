import {Component, OnInit, ViewChild} from '@angular/core';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {CATALOGOS_DUMMIES} from '../../../inventario-vehicular/constants/dummies';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {OverlayPanel} from "primeng/overlaypanel";
import {VehiculoMantenimiento} from "../../models/vehiculoMantenimiento.interface";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {FiltrosReporteEncargado} from "../../models/filtrosReporteEncargado.interface";
import {MantenimientoVehicularService} from "../../services/mantenimiento-vehicular.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import * as moment from "moment/moment";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {RegistroReporteEncargado} from "../../models/registroReporteEncargado.interface";

@Component({
  selector: 'app-reporte-encargado',
  templateUrl: './reporte-encargado.component.html',
  styleUrls: ['./reporte-encargado.component.scss'],
  providers: [DialogService]
})
export class ReporteEncargadoComponent implements OnInit {
  data = [{dia: "Lunes", valor: 38},];
  dataDetalle = [{rin: "No. 11", presicion: 38}, {rin: "No. 11", presicion: 38}, {rin: "No. 11", presicion: 38},];

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0

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

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private mantenimientoVehicularService: MantenimientoVehicularService,
  ) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.inicializarFiltroForm();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.velatorio = `#${usuario.idVelatorio}`;
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoPlacas = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGOS_PLACAS].datos.content, "DES_PLACAS", "DES_PLACAS");
    this.tipoReportes = respuesta[this.POSICION_CATALOGOS_TIPO_MTTO];
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get fmp() {
    return this.filtroForm?.controls;
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      tipoReporte: [{value: null, disabled: false}, [Validators.required]],
      placa: [{value: null, disabled: false}, [Validators.required]],
      fechaVigenciaDesde: [{value: null, disabled: false}, [Validators.required]],
      fecahVigenciaHasta: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  buscar(): void {
    const filtros: FiltrosReporteEncargado = this.crearSolicitudFiltros();
    this.mostrarTabla = true;
    this.mantenimientoVehicularService.buscarReporteEncargado(filtros).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.totalVehiculos = respuesta.datos.totalElements;
        this.registrosReporte = respuesta.datos.content;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      }
    });
  }

  crearSolicitudFiltros(): FiltrosReporteEncargado {
    this.rangoFecha = `${moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD/MM/YYYY')} a
    ${moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD/MM/YYYY')}`
    return {
      fechaFinal: moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD/MM/YYYY'),
      fechaInicio: moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD/MM/YYYY'),
      placa: this.filtroForm.get('placa')?.value,
      tipoReporte: this.filtroForm.get('tipoReporte')?.value
    }
  }

  abrirDetallereporteEncargado(registro: RegistroReporteEncargado): void {
    this.registroSeleccionado = registro;
    this.mostrarDetalle = true;
  }


}
