import { Component, OnInit, ViewChild } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { FiltrosReporteEncargado } from "../../models/filtrosReporteEncargado.interface";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";
import * as moment from "moment/moment";
import { UsuarioEnSesion } from "../../../../models/usuario-en-sesion.interface";
import { RegistroReporteEncargado } from "../../models/registroReporteEncargado.interface";
import { tablaRin } from "../../constants/tabla-rines";

@Component({
  selector: 'app-reporte-encargado',
  templateUrl: './reporte-encargado.component.html',
  styleUrls: ['./reporte-encargado.component.scss'],
  providers: [DialogService]
})
export class ReporteEncargadoComponent implements OnInit {
  dataDetalle = tablaRin;

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

  fechaActual: Date = new Date();
  fechaValida: boolean = false;

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
    this.obtenerVelatorios();
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
      tipoReporte: [{ value: null, disabled: false }, [Validators.required]],
      placa: [{ value: null, disabled: false }, []],
      fechaVigenciaDesde: [{ value: null, disabled: false }, [Validators.required]],
      fecahVigenciaHasta: [{ value: null, disabled: false }, [Validators.required]],
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
    this.rangoFecha = `${moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD-MM-YYYY')} a
    ${moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD-MM-YYYY')}`
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

  obtenerVelatorios(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.velatorio = `#${usuario.idVelatorio}`;

    this.mantenimientoVehicularService.obtenerVelatorios(usuario.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const velatorio = respuesta.datos.find((v: { id: string | number; }) => (+v.id === +usuario.idVelatorio))?.desc;
        this.velatorio = `#${usuario.idVelatorio} ${velatorio || ''}`;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    });
  }

  validarFechas() {
    if (this.fmp.fechaVigenciaDesde.value > this.fmp.fecahVigenciaHasta.value && this.fmp.fecahVigenciaHasta.value) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La fecha inicial no puede ser mayor que la fecha final.');
      this.fechaValida = false;
    } else {
      this.fechaValida = true;
    }
  }

  cerrar() {
    if (this.mostrarDetalle) {
      this.mostrarDetalle = !this.mostrarDetalle;
    } else {
      void this.router.navigate(['/programar-mantenimiento-vehicular']);
    }
  }
}
