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
  mensajeConfirmacion: boolean = false;

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
    this.limpiarFormulario();
    const tipoSolicitud: number = this.solicitudPagoForm.get('tipoSolicitud')?.value as number;
    if (!this.validaciones.has(tipoSolicitud)) return;
    this.validaciones.get(tipoSolicitud)();
  }

  seleccionarBeneficiario(): void {
    const beneficiario = this.solicitudPagoForm.get('beneficiario')?.value;
    const registro = this.catalogoProveedores.find(r => r.nomProveedor === beneficiario);
    this.solicitudPagoForm.get('banco')?.patchValue(registro?.banco);
    this.solicitudPagoForm.get('cuenta')?.patchValue(registro?.cuenta);
    this.solicitudPagoForm.get('claveBancaria')?.patchValue(registro?.cveBancaria);
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
    this.solicitudPagoForm.get('referenciaUnidad')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaElaboracion')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nombreDestinatario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nomRemitente')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('beneficiario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('importe')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('observaciones')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.enable();
    this.solicitudPagoForm.get('importe')?.enable();
  }

  validacionesComprobacionBienesServicios(): void {
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaElaboracion')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('referenciaUnidad')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nombreDestinatario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nomRemitente')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('beneficiario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('observaciones')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.enable();
  }

  validacionesSolicitudRembolso(): void {
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaElaboracion')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nombreDestinatario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('referenciaUnidad')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nomRemitente')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('beneficiario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaInicial')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaFinal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('observaciones')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.disable();
    this.solicitudPagoForm.get('importe')?.disable();
  }

  validacionesSolicitudPago(): void {
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaElaboracion')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nombreDestinatario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('referenciaUnidad')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('nomRemitente')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('beneficiario')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('observaciones')?.setValidators([Validators.required]);
  }

  validacionesSolicitudConsignantes(): void {
  }

  validacionesPagoContrato(): void {
  }

  limpiarFormulario(): void {
    this.solicitudPagoForm.get('folioFiscal')?.patchValue(null);
    this.solicitudPagoForm.get('folioFiscal')?.clearValidators();
    this.solicitudPagoForm.get('folioFiscal')?.updateValueAndValidity();
    this.solicitudPagoForm.get('fechaElaboracion')?.patchValue(null);
    this.solicitudPagoForm.get('fechaElaboracion')?.clearValidators();
    this.solicitudPagoForm.get('fechaElaboracion')?.updateValueAndValidity();
    this.solicitudPagoForm.get('unidadSeleccionada')?.patchValue(1);
    this.solicitudPagoForm.get('unidadSeleccionada')?.clearValidators();
    this.solicitudPagoForm.get('unidadSeleccionada')?.updateValueAndValidity();
    this.unidades = this.recuperarUnidadesOperacionales();
    this.solicitudPagoForm.get('referenciaUnidad')?.patchValue(null);
    this.solicitudPagoForm.get('referenciaUnidad')?.clearValidators();
    this.solicitudPagoForm.get('referenciaUnidad')?.updateValueAndValidity();
    this.solicitudPagoForm.get('solicitadoPor')?.patchValue(null);
    this.solicitudPagoForm.get('solicitadoPor')?.clearValidators();
    this.solicitudPagoForm.get('solicitadoPor')?.updateValueAndValidity();
    this.solicitudPagoForm.get('nombreDestinatario')?.patchValue(null);
    this.solicitudPagoForm.get('nombreDestinatario')?.clearValidators();
    this.solicitudPagoForm.get('nombreDestinatario')?.updateValueAndValidity();
    this.solicitudPagoForm.get('nomRemitente')?.patchValue(null);
    this.solicitudPagoForm.get('nomRemitente')?.clearValidators();
    this.solicitudPagoForm.get('nomRemitente')?.updateValueAndValidity();
    this.solicitudPagoForm.get('referenciaTD')?.patchValue(null);
    this.solicitudPagoForm.get('referenciaTD')?.clearValidators();
    this.solicitudPagoForm.get('referenciaTD')?.updateValueAndValidity();
    this.solicitudPagoForm.get('beneficiario')?.patchValue(null);
    this.solicitudPagoForm.get('beneficiario')?.clearValidators();
    this.solicitudPagoForm.get('beneficiario')?.updateValueAndValidity();
    this.solicitudPagoForm.get('concepto')?.patchValue(null);
    this.solicitudPagoForm.get('concepto')?.clearValidators();
    this.solicitudPagoForm.get('concepto')?.updateValueAndValidity();
    this.solicitudPagoForm.get('importe')?.patchValue(null);
    this.solicitudPagoForm.get('importe')?.clearValidators();
    this.solicitudPagoForm.get('importe')?.updateValueAndValidity();
    this.solicitudPagoForm.get('importeLetra')?.patchValue(null);
    this.solicitudPagoForm.get('importeLetra')?.clearValidators();
    this.solicitudPagoForm.get('importeLetra')?.updateValueAndValidity();
    this.solicitudPagoForm.get('observaciones')?.patchValue(null);
    this.solicitudPagoForm.get('observaciones')?.clearValidators();
    this.solicitudPagoForm.get('observaciones')?.updateValueAndValidity();
    this.solicitudPagoForm.get('numeroContrato')?.patchValue(null);
    this.solicitudPagoForm.get('numeroContrato')?.clearValidators();
    this.solicitudPagoForm.get('numeroContrato')?.updateValueAndValidity();
    this.solicitudPagoForm.get('banco')?.patchValue(null);
    this.solicitudPagoForm.get('banco')?.clearValidators();
    this.solicitudPagoForm.get('banco')?.updateValueAndValidity();
    this.solicitudPagoForm.get('cuenta')?.patchValue(null);
    this.solicitudPagoForm.get('cuenta')?.clearValidators();
    this.solicitudPagoForm.get('cuenta')?.updateValueAndValidity();
    this.solicitudPagoForm.get('claveBancaria')?.patchValue(null);
    this.solicitudPagoForm.get('claveBancaria')?.clearValidators();
    this.solicitudPagoForm.get('claveBancaria')?.updateValueAndValidity();
    this.solicitudPagoForm.get('fechaInicial')?.patchValue(null);
    this.solicitudPagoForm.get('fechaInicial')?.clearValidators();
    this.solicitudPagoForm.get('fechaInicial')?.updateValueAndValidity();
    this.solicitudPagoForm.get('fechaFinal')?.patchValue(null);
    this.solicitudPagoForm.get('fechaFinal')?.clearValidators();
    this.solicitudPagoForm.get('fechaFinal')?.updateValueAndValidity();
  }

  get fc() {
    return this.solicitudPagoForm.controls;
  }
}
