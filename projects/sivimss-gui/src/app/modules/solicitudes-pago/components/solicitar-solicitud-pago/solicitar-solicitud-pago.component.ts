import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {TipoDropdown} from '../../../../models/tipo-dropdown';
import {finalize} from "rxjs/operators";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {SolicitudesPagoService} from '../../services/solicitudes-pago.service';
import {PartidaPresupuestal, CrearSolicitudPago} from '../../models/solicitud-pagos.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {AlertaService, TipoAlerta} from '../../../../shared/alerta/services/alerta.service';
import {HttpErrorResponse} from "@angular/common/http";
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";

interface RegistroVelatorio {
  desVelatorio: string,
  idVelatorio: number,
  nomResponsable: string
}

interface RegistroUnidadOperativa {
  idSubdireccion: number,
  nomResponsable: string,
  nomSubdireccion: string,
  referencia: string
}

interface RegistroProveedor {
  cveBancaria: number,
  nomProveedor: string,
  cuenta: string,
  banco: string
}

@Component({
  selector: 'app-solicitar-solicitud-pago',
  templateUrl: './solicitar-solicitud-pago.component.html',
  styleUrls: ['./solicitar-solicitud-pago.component.scss']
})
export class SolicitarSolicitudPagoComponent implements OnInit {

  validaciones: Map<number, any> = new Map();

  readonly POSICION_CATALOGO_TIPOSOLICITUD: number = 1;
  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGO_UNIDAD: number = 3;
  readonly POSICION_CATALOGO_BANCO: number = 4;

  solicitudPagoForm!: FormGroup;
  catatalogoTipoSolicitud: TipoDropdown[] = [];

  datosSolicitudPago!: CrearSolicitudPago;
  fechaActual: Date = new Date();
  partidaPresupuestal: PartidaPresupuestal [] = [];

  unidades: TipoDropdown[] = [];
  beneficiarios: TipoDropdown[] = [];
  catalogoVelatorios: RegistroVelatorio[] = [];
  catalogoUnidades: RegistroUnidadOperativa[] = [];
  catalogoProveedores: RegistroProveedor[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public config: DynamicDialogConfig,
    private cargadorService: LoaderService,
    private formBulder: FormBuilder,
    public referencia: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService
  ) {
    this.validaciones.set(1, () => this.validacionesBienesServiciosPorComprobar())
    this.validaciones.set(2, () => this.validacionesComprobacionBienesServicios())
    this.validaciones.set(3, () => this.validacionesSolicitudRembolso())
    this.validaciones.set(4, () => this.validacionesSolicitudPago())
    this.validaciones.set(5, () => this.validacionesSolicitudConsignantes())
    this.validaciones.set(6, () => this.validacionesPagoContrato())
  }

  ngOnInit(): void {
    this.obtenerCatalogos();
    this.inicializarTipoSolicitud();
    this.partidaPresupuestal = [
      {
        idPartida: 1,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      },
      {
        idPartida: 2,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      }
    ];
  }

  obtenerCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const catalogoTipoSolicitud = respuesta[this.POSICION_CATALOGO_TIPOSOLICITUD];
    this.catatalogoTipoSolicitud = mapearArregloTipoDropdown(catalogoTipoSolicitud.datos, "desTipoSolicitud", "tipoSolicitud");
    this.catalogoVelatorios = respuesta[this.POSICION_CATALOGO_VELATORIO].datos;
    this.catalogoUnidades = respuesta[this.POSICION_CATALOGO_UNIDAD].datos;
    this.catalogoProveedores = respuesta[this.POSICION_CATALOGO_BANCO].datos;
    this.beneficiarios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_BANCO].datos, "nomProveedor", "nomProveedor");
    this.unidades = this.recuperarUnidadesOperacionales();
  }

  inicializarTipoSolicitud(): void {
    this.solicitudPagoForm = this.formBulder.group({
      tipoSolicitud: [{value: null, disabled: false}, [Validators.required]],
      folioFiscal: [{value: null, disabled: false}],
      fechaElaboracion: [{value: null, disabled: false}],
      unidadSeleccionada: [{value: 1, disabled: false}],
      referenciaUnidad: [{value: null, disabled: false}],
      solicitadoPor: [{value: null, disabled: true}],
      nombreDestinatario: [{value: null, disabled: false}],
      nomRemitente: [{value: null, disabled: false}],
      referenciaTD: [{value: null, disabled: true}],
      beneficiario: [{value: null, disabled: false}],
      concepto: [{value: null, disabled: false}],
      importe: [{value: null, disabled: false}],
      importeLetra: [{value: null, disabled: true}],
      observaciones: [{value: null, disabled: false}],
      numeroContrato: [{value: null, disabled: false}],
      banco: [{value: null, disabled: true}],
      cuenta: [{value: null, disabled: true}],
      claveBancaria: [{value: null, disabled: true}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
  }

  seleccionarValidaciones(): void {
    const tipoSolicitud: number = this.solicitudPagoForm.get('tipoSolicitud')?.value as number;
    if (!this.validaciones.has(tipoSolicitud)) return;
    this.validaciones.get(tipoSolicitud)();
  }

  crearSolicitudPago(): void {
    this.cargadorService.activar();
    const idTipo = this.solicitudPagoForm.get('tipoSolicitud')?.value;
    this.solicitudesPagoService.guardar(this.datosSolicitudPago).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Solicitud de pago generada correctamente')
        this.referencia.close(false);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, "Error al guardar la información de la solicitud de pago. Intenta nuevamente.");
      }
    });
  }

  recuperarUnidadesAdministrativas(): TipoDropdown[] {
    return this.catalogoVelatorios.map(({desVelatorio, idVelatorio}) => {
      return {label: `${desVelatorio}-${idVelatorio}`, value: idVelatorio}
    });
  }

  recuperarUnidadesOperacionales(): TipoDropdown[] {
    return this.catalogoUnidades.map(({referencia, idSubdireccion}) => {
      return {label: `${referencia}-${idSubdireccion}`, value: idSubdireccion}
    });
  }

  cambiarTipoUnidad(tipoUnidad: number): void {
    this.solicitudPagoForm.get('referenciaUnidad')?.patchValue(null);
    this.solicitudPagoForm.get('solicitadoPor')?.patchValue(null);
    this.unidades = tipoUnidad === 1 ? this.recuperarUnidadesOperacionales() : this.recuperarUnidadesAdministrativas();
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get tipoSolicitud(): number {
    return this.solicitudPagoForm.get('tipoSolicitud')?.value
  }

  generarSolicitudPago(): CrearSolicitudPago {
    return {
      concepto: "",
      cveFolioConsignados: "",
      cveFolioGastos: "",
      ejercicioFiscal: 0,
      fechaFinal: "",
      fechaInicial: "",
      idContratBenef: 0,
      idEstatusSol: 0,
      idTipoSolic: 0,
      idUnidadOperativa: 0,
      idVelatorio: 0,
      nomDestinatario: "",
      nomRemitente: "",
      numReferencia: 0,
      observaciones: ""
    }
  }

  convertirImporte(): void {
    this.solicitudPagoForm.get('importeLetra')?.patchValue('');
    const importe = this.solicitudPagoForm.get('importe')?.value;
    const importeLetra: string = convertirNumeroPalabra(+importe);
    this.solicitudPagoForm.get('importeLetra')?.patchValue(importeLetra[0].toUpperCase() + importeLetra.substring(1));
  }

  seleccionarResponsable(): void {
    const tipoUnidad = this.solicitudPagoForm.get('unidadSeleccionada')?.value;
    const idUnidad = this.solicitudPagoForm.get('referenciaUnidad')?.value;
    if (tipoUnidad === 1) {
      const responsable = this.catalogoUnidades.find(cu => cu.idSubdireccion === idUnidad)?.nomResponsable ?? '';
      this.solicitudPagoForm.get('solicitadoPor')?.patchValue(responsable);
      return;
    }
    const responsable = this.catalogoVelatorios.find(cu => cu.idVelatorio === idUnidad)?.nomResponsable ?? '';
    this.solicitudPagoForm.get('solicitadoPor')?.patchValue(responsable);
  }

  validacionesBienesServiciosPorComprobar(): void {
    this.solicitudPagoForm.get('referenciaUnidad')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('fechaElaboracion')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('nombreDestinatario')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('nomRemitente')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('beneficiario')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('concepto')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('importe')?.setValidators([Validators.required])
    this.solicitudPagoForm.get('observaciones')?.setValidators([Validators.required])
  }

  validacionesComprobacionBienesServicios(): void {
  }

  validacionesSolicitudRembolso(): void {
  }

  validacionesSolicitudPago(): void {
  }

  validacionesSolicitudConsignantes(): void {
  }

  validacionesPagoContrato(): void {
  }

  get fc() {
    return this.solicitudPagoForm.controls;
  }
}
