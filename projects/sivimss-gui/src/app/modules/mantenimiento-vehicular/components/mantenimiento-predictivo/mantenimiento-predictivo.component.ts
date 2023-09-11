import { Component, OnInit, ViewChild } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService } from "primeng/dynamicdialog";
import { VehiculoMantenimiento } from "../../models/vehiculoMantenimiento.interface";
import { UsuarioEnSesion } from "../../../../models/usuario-en-sesion.interface";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { HttpErrorResponse } from "@angular/common/http";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { FiltrosMantenimientoPredictivo } from "../../models/filtrosMantenimientoPredictivo.interface";
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-mantenimiento-predictivo',
  templateUrl: './mantenimiento-predictivo.component.html',
  styleUrls: ['./mantenimiento-predictivo.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class MantenimientoPredictivoComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0

  vehiculos: VehiculoMantenimiento[] = []
  vehiculoSeleccionado!: VehiculoMantenimiento;
  realizoBusqueda: boolean = false;
  filtroForm!: FormGroup
  verDetallePredictivo: boolean = false;
  rangoFecha: string = '';
  mostrarModalConfirmacion: boolean = false;
  mensajeArchivoConfirmacion: string = "";
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  catalogoPlacas: TipoDropdown[] = [];
  catalogoPeriodo: TipoDropdown[] = [];
  tipoMantenimientos: TipoDropdown[] = [];
  titulos: string[] = ['Aceite', 'Agua', 'Calibración Neumáticos', 'Combustible', 'Código de Falla', 'Batería'];
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);
  titulosSeleccionados: string[] = [];
  velatorio: string = '';
  niveles: any =
    {
      BAJO: '1',
      MEDIO: '5',
      CORRECTO: '10'
    };

  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;
  readonly POSICION_CATALOGOS_PLACAS: number = 2;
  readonly POSICION_CATALOGOS_TIPO_MTTO: number = 3;
  readonly POSICION_CATALOGOS_PERIODO: number = 4;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private alertaService: AlertaService,
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
    this.catalogoPeriodo = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGOS_PERIODO].datos, "DES_PERIODO", "ID_MTTO_PERIODO");
  }

  get fmp() {
    return this.filtroForm?.controls;
  }

  inicializarFiltroForm(): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: +usuario.idOficina, disabled: true }],
      delegacion: [{ value: +usuario.idDelegacion, disabled: +usuario.idOficina >= 2 }, [Validators.required]],
      velatorio: [{ value: +usuario.idVelatorio, disabled: +usuario.idOficina === 3 }, []],
      placa: [{ value: null, disabled: false }, [Validators.required]],
      periodo: [{ value: null, disabled: false }, []],
      tipoMantenimiento: [{ value: null, disabled: false }, [Validators.required]],
    });

    this.obtenerPlacas();
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
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  limpiar(): void {
    this.realizoBusqueda = false;
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);

    this.filtroForm.get('nivel')?.patchValue(+usuario.idOficina);

    if (+usuario.idOficina >= 2) {
      this.filtroForm.get('delegacion')?.patchValue(+usuario.idDelegacion);
    }

    if (+usuario.idOficina === 3) {
      this.filtroForm.get('velatorio')?.patchValue(+usuario.idVelatorio);
    } else {
      this.catalogoVelatorios = [];
    }

    this.obtenerPlacas();
    this.cargarVelatorios(true);
    this.vehiculos = [];
    this.verDetallePredictivo = false;
  }

  buscar(): void {
    const filtros: FiltrosMantenimientoPredictivo = this.generarSolicitudFiltros();
    this.mantenimientoVehicularService.buscarReporteMttoPreventivo(filtros).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.realizoBusqueda = true;
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
    const periodo = this.filtroForm.get('periodo')?.value;
    this.rangoFecha = this.catalogoPeriodo.find(cP => cP.value === periodo)?.label ?? '';
    const velatorio = this.filtroForm.get('velatorio')?.value;
    this.velatorio = this.catalogoVelatorios.find(cV => cV.value === velatorio)?.label ?? '';
    return {
      delegacion: this.filtroForm.get('delegacion')?.value,
      nivelOficina: this.filtroForm.get('nivel')?.value,
      placa: this.filtroForm.get('placa')?.value,
      velatorio: this.filtroForm.get('velatorio')?.getRawValue() === '' ? null : this.filtroForm.get('velatorio')?.getRawValue(),
      periodo: this.filtroForm.get('periodo')?.value ? String(this.filtroForm.get('periodo')?.value) : null,
      tipoMtto: mtto,
    }
  }

  obtenerPlacas() {
    let datos = {
      delegacion: this.fmp.delegacion.value === '' ? null : this.fmp.delegacion.getRawValue(),
      velatorio: this.fmp.velatorio.value === '' ? null : this.fmp.velatorio.getRawValue(),
    };

    this.mantenimientoVehicularService.obtenerPlacas(datos).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoPlacas = mapearArregloTipoDropdown(respuesta.datos, "DES_PLACAS", "DES_PLACAS");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  generarReporteTabla(tipoReporte: string): void {
    if (this.filtroForm.invalid) return;
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);
    this.descargaArchivosService.descargarArchivo(this.mantenimientoVehicularService.generarReportePredictivo(busqueda), configuracionArchivo).pipe(
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

  filtrosArchivos(tipoReporte: string) {
    let tipoMttoDesc: string | null = null;
    let valor: string | null = null;
    // && this.vehiculos[0].TOTAL_VEHICULOS !== 0
    if (this.vehiculos.length === 1) {
      tipoMttoDesc = this.tipoMantenimientos.find(item => item.value === this.fmp.tipoMantenimiento.value)?.label ?? '';
      switch (tipoMttoDesc) {
        case "Aceite":
          valor = this.niveles[this.vehiculos[0].DES_NIVEL_ACEITE || 'BAJO'];
          break;
        case "Agua":
          valor = this.niveles[this.vehiculos[0].DES_NIVEL_AGUA || 'BAJO'];
          break;
        case "Calibración Neumáticos":
          valor = this.niveles[this.vehiculos[0].DES_NIVEL_AGUA || 'BAJO'];
          break;
        case "Combustible":
          valor = this.niveles[this.vehiculos[0].DES_NIVEL_COMBUSTIBLE || 'BAJO'];
          break;
        case "Código de Falla":
          valor = this.niveles[this.vehiculos[0].DES_NIVEL_CODIGOFALLO || 'BAJO'];
          break;
        case "Batería":
          valor = this.niveles[this.vehiculos[0].DES_NIVEL_BATERIA || 'BAJO'];
          break;
        case "Todos":
          tipoMttoDesc = null;
          valor = null;
          break;
      }
    }
    return {
      idDelegacion: this.fmp.delegacion.value ? +this.fmp.delegacion.value : null,
      idVelatorio: this.fmp.velatorio.value ? +this.fmp.velatorio.value : null,
      periodo: this.fmp.periodo.value ? String(this.fmp.periodo.value) : null,
      tipoMtto: tipoMttoDesc,
      valor: valor,
      placas: this.fmp.placa.value,
      tipoReporte
    }
  }

}
