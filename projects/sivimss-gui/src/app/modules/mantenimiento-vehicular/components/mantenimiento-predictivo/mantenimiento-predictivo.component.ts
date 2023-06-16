import {Component, OnInit, ViewChild} from '@angular/core';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {ActivatedRoute, Router} from '@angular/router';
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService} from "primeng/dynamicdialog";
import {VehiculoMantenimiento} from "../../models/vehiculoMantenimiento.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpErrorResponse} from "@angular/common/http";
import {MantenimientoVehicularService} from "../../services/mantenimiento-vehicular.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {FiltrosMantenimientoPredictivo} from "../../models/filtrosMantenimientoPredictivo.interface";
import * as moment from "moment";

@Component({
  selector: 'app-mantenimiento-predictivo',
  templateUrl: './mantenimiento-predictivo.component.html',
  styleUrls: ['./mantenimiento-predictivo.component.scss'],
  providers: [DialogService]
})
export class MantenimientoPredictivoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0

  vehiculos: VehiculoMantenimiento[] = []
  vehiculoSeleccionado!: VehiculoMantenimiento;

  filtroForm!: FormGroup
  verDetallePredictivo: boolean = false;
  rangoFecha: string = '';

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  catalogoPlacas: TipoDropdown[] = [];
  tipoMantenimientos: TipoDropdown[] = [];
  titulos: string[] = ['Aceite', 'Agua', 'Calibración Neumáticos', 'Combustible', 'Código de Falla', 'Batería'];
  titulosSeleccionados: string[] = [];

  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;
  readonly POSICION_CATALOGOS_PLACAS: number = 2;
  readonly POSICION_CATALOGOS_TIPO_MTTO: number = 3;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private mensajesSistemaService: MensajesSistemaService,
  ) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.inicializarFiltroForm();
    this.cargarVelatorios(true);
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGOS_DELEGACIONES];
    this.catalogoPlacas = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGOS_PLACAS].datos.content, "DES_PLACAS", "DES_PLACAS");
    this.tipoMantenimientos = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGOS_TIPO_MTTO].datos, "DES_MTTO_REPORTE_TIPO", "ID_MTTO_REPORTE_TIPO");
  }

  get fmp() {
    return this.filtroForm?.controls;
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: +usuario.idOficina, disabled: true}],
      delegacion: [{value: +usuario.idDelegacion, disabled: +usuario.idOficina === 2}, [Validators.required]],
      velatorio: [{value: +usuario.idVelatorio, disabled: +usuario.idOficina === 3}, [Validators.required]],
      placa: [{value: null, disabled: false}, [Validators.required]],
      tipoMantenimiento: [{value: null, disabled: false}, [Validators.required]],
      fechaVigenciaDesde: [{value: null, disabled: false}, [Validators.required]],
      fecahVigenciaHasta: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.filtroForm.get('velatorio')?.patchValue("");
    }
    const idDelegacion = this.filtroForm.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.mantenimientoVehicularService.obtenerVelatorios(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  limpiar(): void {
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm.get('nivel')?.patchValue(+usuario.idRol);
    this.filtroForm.get('delegacion')?.patchValue(+usuario.idDelegacion);
    this.filtroForm.get('velatorio')?.patchValue(+usuario.idVelatorio);
    this.cargarVelatorios(true);
  }

  buscar(): void {
    const filtros: FiltrosMantenimientoPredictivo = this.generarSolicitudFiltros();
    this.mantenimientoVehicularService.buscarReporteMttoPreventivo(filtros).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos?.content.length > 0) {
          this.vehiculos = respuesta.datos.content;
          this.vehiculoSeleccionado = respuesta.datos.content[0];
          this.verDetallePredictivo = true;
        } else {
          this.verDetallePredictivo = false;
          this.vehiculos = [];
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      }
    });
  }

  generarSolicitudFiltros(): FiltrosMantenimientoPredictivo {
    const mtto: number = this.filtroForm.get('tipoMantenimiento')?.value;
    this.titulosSeleccionados = (mtto > this.titulos.length) ? this.titulos : [this.titulos[mtto - 1]];
    console.log(this.titulosSeleccionados)
    this.rangoFecha = `${moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD/MM/YYYY')} a
    ${moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD/MM/YYYY')}`
    return {
      delegacion: this.filtroForm.get('delegacion')?.value,
      fechaFinal: moment(this.filtroForm.get('fecahVigenciaHasta')?.value).format('DD/MM/YYYY'),
      fechaInicio: moment(this.filtroForm.get('fechaVigenciaDesde')?.value).format('DD/MM/YYYY'),
      nivelOficina: this.filtroForm.get('nivel')?.value,
      placa: this.filtroForm.get('placa')?.value,
      tipoMtto: mtto,
      velatorio: this.filtroForm.get('velatorio')?.value
    }
  }

}
