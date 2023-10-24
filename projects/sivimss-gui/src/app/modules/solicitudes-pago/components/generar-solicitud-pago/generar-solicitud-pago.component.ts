import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute} from "@angular/router";
import {TipoDropdown} from '../../../../models/tipo-dropdown';
import {finalize} from "rxjs/operators";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {SolicitudesPagoService} from '../../services/solicitudes-pago.service';
import {CrearSolicitudPago, PartidaPresupuestal} from '../../models/solicitud-pagos.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {AlertaService, TipoAlerta} from '../../../../shared/alerta/services/alerta.service';
import {HttpErrorResponse} from "@angular/common/http";
import {convertirNumeroPalabra} from "../../funciones/convertirNumeroPalabra";
import * as moment from "moment/moment";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

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
  banco: string,
  idProveedor: number,
  numeroContrato?: string
}

@Component({
  selector: 'app-generar-solicitud-pago',
  templateUrl: './generar-solicitud-pago.component.html',
  styleUrls: ['./generar-solicitud-pago.component.scss']
})
export class GenerarSolicitudPagoComponent implements OnInit {

  validaciones: Map<number, any> = new Map();

  readonly POSICION_CATALOGO_TIPOSOLICITUD: number = 1;
  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGO_UNIDAD: number = 3;
  readonly POSICION_CATALOGO_BANCO: number = 4;

  solicitudPagoForm!: FormGroup;
  catatalogoTipoSolicitud: TipoDropdown[] = [];

  fechaActual: Date = new Date();
  partidaPresupuestal: PartidaPresupuestal [] = [];
  partidaPresupuestalSeleccionada: PartidaPresupuestal[] = [];

  unidades: TipoDropdown[] = [];
  beneficiarios: TipoDropdown[] = [];
  catalogoVelatorios: RegistroVelatorio[] = [];
  catalogoUnidades: RegistroUnidadOperativa[] = [];
  catalogoProveedores: RegistroProveedor[] = [];
  mensajeConfirmacion: boolean = false;

  constructor(
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
    this.validaciones.set(2, () => this.validacionesBasicas())
    this.validaciones.set(3, () => this.validacionesSolicitudRembolso())
    this.validaciones.set(4, () => this.validacionesBasicas())
    this.validaciones.set(5, () => this.validacionesSolicitudConsignantes())
    this.validaciones.set(6, () => this.validacionesPagoContrato())
  }

  ngOnInit(): void {
    this.obtenerCatalogos();
    this.inicializarTipoSolicitud();
  }

  obtenerCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const catalogoTipoSolicitud = respuesta[this.POSICION_CATALOGO_TIPOSOLICITUD];
    this.catatalogoTipoSolicitud = mapearArregloTipoDropdown(catalogoTipoSolicitud.datos, "desTipoSolicitud", "tipoSolicitud");
    this.catalogoVelatorios = respuesta[this.POSICION_CATALOGO_VELATORIO].datos;
    this.catalogoUnidades = respuesta[this.POSICION_CATALOGO_UNIDAD].datos;
    this.catalogoProveedores = respuesta[this.POSICION_CATALOGO_BANCO].datos;
    this.beneficiarios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_BANCO].datos, "nomProveedor", "idProveedor");
    this.unidades = this.recuperarUnidadesOperacionales();
  }

  inicializarTipoSolicitud(): void {
    const ref = this.config.data;
    this.solicitudPagoForm = this.formBulder.group({
      tipoSolicitud: [{value: null, disabled: false}, [Validators.required]],
      folioFiscal: [{value: null, disabled: false}],
      fechaElaboracion: [{value: null, disabled: false}, [Validators.required]],
      unidadSeleccionada: [{value: 1, disabled: false}],
      referenciaUnidad: [{value: null, disabled: false}, [Validators.required]],
      solicitadoPor: [{value: null, disabled: true}],
      nombreDestinatario: [{value: null, disabled: false}, [Validators.required]],
      nomRemitente: [{value: null, disabled: false}, [Validators.required]],
      referenciaTD: [{value: ref + 1, disabled: true}],
      beneficiario: [{value: null, disabled: false}, [Validators.required]],
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

  seleccionarBeneficiario(): void {
    const beneficiario = this.solicitudPagoForm.get('beneficiario')?.value;
    const registro = this.catalogoProveedores.find(r => r.idProveedor === beneficiario);
    this.solicitudPagoForm.get('banco')?.setValue(registro?.banco);
    this.solicitudPagoForm.get('cuenta')?.setValue(registro?.cuenta);
    this.solicitudPagoForm.get('claveBancaria')?.setValue(registro?.cveBancaria);
    if ([5, 6].includes(this.tipoSolicitud)) this.solicitudPagoForm.get('numeroContrato')?.setValue(registro?.numeroContrato);
  }

  crearSolicitudPago(): void {
    this.cargadorService.activar();
    const solicitud: CrearSolicitudPago = this.generarSolicitudPago();
    this.solicitudesPagoService.guardar(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos) this.guardarFolios(respuesta.datos);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        const ERROR: string = 'Error al guardar la información. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
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
    this.solicitudPagoForm.get('referenciaUnidad')?.setValue(null);
    this.solicitudPagoForm.get('solicitadoPor')?.setValue(null);
    this.unidades = +tipoUnidad === 1 ? this.recuperarUnidadesOperacionales() : this.recuperarUnidadesAdministrativas();
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get tipoSolicitud(): number {
    return this.solicitudPagoForm.get('tipoSolicitud')?.value
  }

  generarSolicitudPago(): CrearSolicitudPago {
    const unidadSeleccionada = this.solicitudPagoForm.get('unidadSeleccionada')?.value
    const referenciaUnidad = this.solicitudPagoForm.get('referenciaUnidad')?.value
    const tipoSolicitud = this.solicitudPagoForm.get('tipoSolicitud')?.value;
    const impTotal = this.solicitudPagoForm.get('importe')?.value;
    return {
      concepto: this.solicitudPagoForm.get('concepto')?.value,
      cveFolioConsignados: null,
      cveFolioGastos: this.solicitudPagoForm.get('folioFiscal')?.value,
      ejercicioFiscal: null,
      fechaFinal: this.validarFecha(this.solicitudPagoForm.get('fechaFinal')?.value),
      fechaInicial: this.validarFecha(this.solicitudPagoForm.get('fechaInicial')?.value),
      idContratBenef: null,
      idEstatusSol: 1,
      idTipoSolic: tipoSolicitud,
      idUnidadOperativa: +unidadSeleccionada === 1 ? referenciaUnidad : null,
      idVelatorio: +unidadSeleccionada === 2 ? referenciaUnidad : null,
      nomDestinatario: this.solicitudPagoForm.get('nombreDestinatario')?.value,
      nomRemitente: this.solicitudPagoForm.get('nomRemitente')?.value,
      numReferencia: this.solicitudPagoForm.get('referenciaTD')?.value ?? '1',
      fechaElabora: this.validarFecha(this.solicitudPagoForm.get('fechaElaboracion')?.value),
      impTotal: impTotal.toString().replace('$ ', ''),
      observaciones: this.solicitudPagoForm.get('observaciones')?.value,
      idProveedor: [1, 4, 5].includes(tipoSolicitud) ? this.solicitudPagoForm.get('beneficiario')?.value : null,
      beneficiario: [2, 3].includes(tipoSolicitud) ? this.solicitudPagoForm.get('beneficiario')?.value : null,
    }
  }

  validarFecha(fecha: string): string {
    if (!fecha) return '';
    return moment(fecha).format('DD/MM/YYYY')
  }

  modificarImporteLocal(event: any): void {
    this.solicitudPagoForm.patchValue({
      importe: event.value >= 0 && event.value <= 10000000 ? event.value : this.solicitudPagoForm.value.amount
    });
    this.convertirImporte();
  }

  convertirImporte(): void {
    this.solicitudPagoForm.get('importeLetra')?.setValue('');
    const importe = this.solicitudPagoForm.get('importe')?.value;
    if (!importe) return;
    importe.toString().replace('$ ', '');
    const importeLetra: string = convertirNumeroPalabra(+importe);
    this.solicitudPagoForm.get('importeLetra')?.setValue(importeLetra[0].toUpperCase() + importeLetra.substring(1) + ' pesos');
  }

  seleccionarResponsable(): void {
    const tipoUnidad = this.solicitudPagoForm.get('unidadSeleccionada')?.value;
    const idUnidad = this.solicitudPagoForm.get('referenciaUnidad')?.value;
    if (+tipoUnidad === 1) {
      const responsable: string = this.catalogoUnidades.find(cu => cu.idSubdireccion === idUnidad)?.nomResponsable ?? '';
      this.solicitudPagoForm.get('solicitadoPor')?.setValue(responsable);
      return;
    }
    const responsable: string = this.catalogoVelatorios.find(cu => cu.idVelatorio === idUnidad)?.nomResponsable ?? '';
    this.solicitudPagoForm.get('solicitadoPor')?.setValue(responsable);
  }

  validacionesBienesServiciosPorComprobar(): void {
    this.solicitudPagoForm.get('concepto')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('importe')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.enable();
    this.solicitudPagoForm.get('importe')?.enable();
  }

  validacionesSolicitudRembolso(): void {
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaInicial')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaFinal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.disable();
    this.solicitudPagoForm.get('concepto')?.setValue('Reembolso del fondo fijo revolvente');
    this.solicitudPagoForm.get('importe')?.disable();
  }

  validacionesSolicitudConsignantes(): void {
    this.solicitudPagoForm.get('fechaInicial')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('fechaFinal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('importe')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('importe')?.disable();
    this.solicitudPagoForm.get('numeroContrato')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('numeroContrato')?.disable();
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.disable();
    this.solicitudPagoForm.get('concepto')?.setValue('Pago de artículos funerarios comercializados.');
  }

  validacionesPagoContrato(): void {
    this.solicitudPagoForm.get('importe')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('numeroContrato')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('numeroContrato')?.disable();
    this.solicitudPagoForm.get('importe')?.disable();
    this.validacionesBasicas();
  }

  validacionesBasicas(): void {
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('concepto')?.enable();
  }

  limpiarFormulario(): void {
    const ref = this.config.data;
    this.mensajeConfirmacion = false;
    this.solicitudPagoForm.get('folioFiscal')?.setValue(null);
    this.solicitudPagoForm.get('folioFiscal')?.clearValidators();
    this.solicitudPagoForm.get('fechaElaboracion')?.setValue(null);
    this.solicitudPagoForm.get('unidadSeleccionada')?.setValue(1);
    this.solicitudPagoForm.get('referenciaUnidad')?.setValue(null);
    this.solicitudPagoForm.get('solicitadoPor')?.setValue(null);
    this.solicitudPagoForm.get('solicitadoPor')?.clearValidators();
    this.solicitudPagoForm.get('nombreDestinatario')?.setValue(null);
    this.solicitudPagoForm.get('nomRemitente')?.setValue(null);
    this.solicitudPagoForm.get('referenciaTD')?.setValue(ref + 1);
    this.solicitudPagoForm.get('referenciaTD')?.clearValidators();
    this.solicitudPagoForm.get('beneficiario')?.setValue(null);
    this.solicitudPagoForm.get('concepto')?.setValue(null);
    this.solicitudPagoForm.get('concepto')?.clearValidators();
    this.solicitudPagoForm.get('importe')?.setValue(null);
    this.solicitudPagoForm.get('importe')?.clearValidators();
    this.solicitudPagoForm.get('importeLetra')?.setValue(null);
    this.solicitudPagoForm.get('importeLetra')?.clearValidators();
    this.solicitudPagoForm.get('observaciones')?.setValue(null);
    this.solicitudPagoForm.get('observaciones')?.clearValidators();
    this.solicitudPagoForm.get('numeroContrato')?.setValue(null);
    this.solicitudPagoForm.get('numeroContrato')?.clearValidators();
    this.solicitudPagoForm.get('banco')?.setValue(null);
    this.solicitudPagoForm.get('cuenta')?.setValue(null);
    this.solicitudPagoForm.get('cuenta')?.clearValidators();
    this.solicitudPagoForm.get('banco')?.clearValidators();
    this.solicitudPagoForm.get('claveBancaria')?.setValue(null);
    this.solicitudPagoForm.get('claveBancaria')?.clearValidators();
    this.solicitudPagoForm.get('fechaInicial')?.setValue(null);
    this.solicitudPagoForm.get('fechaInicial')?.clearValidators();
    this.solicitudPagoForm.get('fechaFinal')?.setValue(null);
    this.solicitudPagoForm.get('fechaFinal')?.clearValidators();
    this.unidades = this.recuperarUnidadesOperacionales();
    this.seleccionarValidaciones();
    this.partidaPresupuestalSeleccionada = [];
    this.partidaPresupuestal = [];
  }

  get fc() {
    return this.solicitudPagoForm.controls;
  }

  buscarFactura(): void {
    const folio = this.solicitudPagoForm.get("folioFiscal")?.value;
    const tipoSolicitud = this.solicitudPagoForm.get("tipoSolicitud")?.value;
    if (!folio) return;
    if (folio.length !== 36) {
      const ERROR: string = 'El folio fiscal no es válido.\n' +
        'Verifica tu información.';
      this.alertaService.mostrar(TipoAlerta.Precaucion, ERROR);
      return
    }
    if ([3, 5, 6].includes(tipoSolicitud)) {
      this.buscarFacturaAgregar(folio);
      return;
    }
    this.cargadorService.activar();
    this.solicitudesPagoService.busquedaFolioFactura(folio).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length === 0) {
          this.limpiarImportes();
        }
        this.partidaPresupuestal = respuesta.datos;
        const [partidaSeleccionada] = this.partidaPresupuestal;
        this.solicitudPagoForm.get('importe')?.setValue(partidaSeleccionada.importeTotal);
        this.convertirImporte();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  buscarFacturaAgregar(folio: string): void {
    this.cargadorService.activar();
    this.solicitudesPagoService.busquedaFolioFactura(folio).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length === 0) {
          this.solicitudPagoForm.get('folioFiscal')?.setValue(null);
          const ERROR: string = 'El folio fiscal de la factura de gastos no existe.\n' +
            'Verifica tu información.';
          this.alertaService.mostrar(TipoAlerta.Precaucion, ERROR);
          return;
        }
        this.partidaPresupuestalSeleccionada = respuesta.datos;
        this.partidaPresupuestalSeleccionada[0].idPartida = folio;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  agregarFactura(): void {
    if (this.validarFacturaRepetida()) return;
    this.partidaPresupuestal = [...this.partidaPresupuestal, ...this.partidaPresupuestalSeleccionada];
    this.solicitudPagoForm.get('folioFiscal')?.setValue(null);
    this.solicitudPagoForm.get('folioFiscal')?.clearValidators();
    this.solicitudPagoForm.get('folioFiscal')?.updateValueAndValidity();
    const importe: number = this.sumarImportes();
    this.solicitudPagoForm.get('importe')?.setValue(importe);
    this.partidaPresupuestalSeleccionada = [];
    this.convertirImporte();
  }

  validarFacturaRepetida(idFolio?: string): boolean {
    const folios: string[] = this.partidaPresupuestal.map(r => r.idPartida.toString());
    if (!idFolio) idFolio = this.partidaPresupuestalSeleccionada[0].idPartida.toString();
    if (!folios.includes(idFolio)) return false;
    this.solicitudPagoForm.get('folioFiscal')?.setValue(null);
    this.solicitudPagoForm.get('folioFiscal')?.clearValidators();
    this.solicitudPagoForm.get('folioFiscal')?.updateValueAndValidity();
    this.partidaPresupuestalSeleccionada = [];
    this.alertaService.mostrar(TipoAlerta.Info, 'El folio introducido ya se encuentra agregado');
    return true;
  }

  eliminarFacturas(id: number): void {
    this.partidaPresupuestal.splice(id, 1);
    const importe: number = this.sumarImportes();
    this.solicitudPagoForm.get('importe')?.setValue(importe === 0 ? null : importe);
    this.convertirImporte();
    if (this.partidaPresupuestal.length > 0) return;
    this.solicitudPagoForm.get('folioFiscal')?.setValidators([Validators.required]);
    this.solicitudPagoForm.get('folioFiscal')?.updateValueAndValidity();
  }

  limpiarImportes(): void {
    const ERROR: string = 'El folio fiscal de la factura de gastos no existe.\n' +
      'Verifica tu información.';
    this.alertaService.mostrar(TipoAlerta.Precaucion, ERROR);
    this.solicitudPagoForm.get('folioFiscal')?.setValue(null);
    this.solicitudPagoForm.get('importe')?.setValue(null);
    this.convertirImporte();
  }

  sumarImportes(): number {
    return this.partidaPresupuestal.reduce((suma: number, registro: PartidaPresupuestal) => +registro.importeTotal + suma, 0);
  }

  agregarSolicitudPago(): void {
    const folio = this.solicitudPagoForm.get("folioFiscal")?.value;
    if (!folio) return;
    this.cargadorService.activar();
    this.solicitudesPagoService.busquedaFolioFactura(folio).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.solicitudPagoForm.get('folioFiscal')?.setValue(null);
        if (respuesta.datos.length === 0) {
          const ERROR: string = 'El folio fiscal de la factura de gastos no existe.\n' +
            'Verifica tu información.';
          this.alertaService.mostrar(TipoAlerta.Precaucion, ERROR);
          return;
        }
        const partidaPresupuestal: PartidaPresupuestal[] = [...respuesta.datos];
        partidaPresupuestal[0].idPartida = folio;
        if (this.validarFacturaRepetida(partidaPresupuestal[0].idPartida.toString())) return;
        this.partidaPresupuestal = [...this.partidaPresupuestal, ...partidaPresupuestal];
        this.solicitudPagoForm.get('folioFiscal')?.clearValidators();
        this.solicitudPagoForm.get('folioFiscal')?.updateValueAndValidity();
        const importe: number = this.sumarImportes();
        this.solicitudPagoForm.get('importe')?.setValue(importe);
        this.convertirImporte();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  reAjustarImporte(): void {
    const importe: string = this.partidaPresupuestal[0].importeTotal ?? 0;
    this.solicitudPagoForm.get('importe')?.setValue(importe);
    this.convertirImporte();
  }

  guardarFolios(id: number): void {
    const tipoSolicitud: number = this.solicitudPagoForm.get('tipoSolicitud')?.value as number;
    if (![3, 5, 6].includes(tipoSolicitud)) {
      this.mostrarMensajeSolicitudCorrecta();
      return;
    }
    const cveFolios: string[] = this.partidaPresupuestal.map(r => r.idPartida.toString());
    const solicitud = {idSolicitud: id, cveFolios}
    this.solicitudesPagoService.guardarFoliosSolicitud(solicitud).subscribe({
      next: (): void => {
        this.mostrarMensajeSolicitudCorrecta();
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    })
  }

  mostrarMensajeSolicitudCorrecta(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Tu solicitud de pago ha sido generada exitosamente.')
    this.referencia.close();
  }

}
