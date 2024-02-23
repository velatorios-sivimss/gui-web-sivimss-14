import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from "@angular/forms";
import { TipoDropdown } from "../../../../../models/tipo-dropdown";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../../utils/constantes";
import { REGISTROS_PAGOS } from "../../constants/dummies";
import { TIPO_FACTURACION } from "../../constants/tipoFacturacion";
import { ActivatedRoute, Router } from "@angular/router";
import { mapearArregloTipoDropdown } from "../../../../../utils/funciones";
import { FacturacionService } from "../../services/facturacion.service";
import { HttpErrorResponse } from "@angular/common/http";
import { HttpRespuesta } from "../../../../../models/http-respuesta.interface";
import { LoaderService } from "../../../../../shared/loader/services/loader.service";
import { finalize } from "rxjs/operators";
import { DatosContratante } from "../../models/datosContratante.interface";
import { RegistroRFC } from "../../models/registroRFC.interface";
import { forkJoin, Observable } from "rxjs";
import { MensajesSistemaService } from "../../../../../services/mensajes-sistema.service";
import { SolicitudGenerarFact } from "../../models/solicitudGenerarFact.interface";
import { AlertaService, TipoAlerta } from "../../../../../shared/alerta/services/alerta.service";

interface Folio {
  idRegistro: number,
  folio: string,
  idPagoBitacora: number
}

interface RecibosPago {
  idPagoSFPA: number,
  folio: string,
  idRegistro: number
}
interface SolicitudDatosContratante {
  tipoFactura: string,
  idPagoBitacora: number,
  idRegistro: number
}

@Component({
  selector: 'app-solicitar-factura',
  templateUrl: './solicitar-factura.component.html',
  styleUrls: ['./solicitar-factura.component.scss']
})
export class SolicitarFacturaComponent implements OnInit {

  readonly DIEZ_ELEMENTOS_POR_PAGINA: number = DIEZ_ELEMENTOS_POR_PAGINA;

  @ViewChild("solicitudDirForm", { read: FormGroupDirective })
  private solicitudDirForm!: FormGroupDirective;

  @ViewChild("CFDIDirForm", { read: FormGroupDirective })
  private CFDIDirForm!: FormGroupDirective;

  @ViewChild("datosContratanteDirForm", { read: FormGroupDirective })
  private datosContratanteDirForm!: FormGroupDirective;

  solicitudForm!: FormGroup;
  datosContratanteForm!: FormGroup;
  datosCFDIForm!: FormGroup;
  indice: number = 0;
  tiposFactura: any[] = TIPO_FACTURACION;
  folios: TipoDropdown[] = [];
  recibosPago: TipoDropdown[] = [];
  servicios: any[] = REGISTROS_PAGOS;
  cfdi: TipoDropdown[] = [];
  metodosPago: TipoDropdown[] = [];
  formasPago: TipoDropdown[] = [];
  registroFolios: Folio[] = [];
  registrosRecibosPago: RecibosPago[] = [];
  registroContratante: DatosContratante | null = null;
  registroRFC: RegistroRFC | null = null;
  tipoSolicitud!: 1 | 2 | 3 | 4;

  validacionFactura: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private readonly router: Router,
    private route: ActivatedRoute,
    private facturacionService: FacturacionService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
    this.inicializarFormRFC();
    this.inicializarFormCFDI();
  }

  inicializarForm(): void {
    this.solicitudForm = this.formBuilder.group({
      tipoFactura: [{ value: null, disabled: false }, [Validators.required]],
      folio: [{ value: null, disabled: false }, [Validators.required]],
      numeroRecibo: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  inicializarFormRFC(): void {
    this.datosContratanteForm = this.formBuilder.group({
      rfc: [{ value: null, disabled: false }, [Validators.required]],
      correoElectronico: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  inicializarFormCFDI(): void {
    this.datosCFDIForm = this.formBuilder.group({
      cfdi: [{ value: null, disabled: false }, [Validators.required]],
      metodoPago: [{ value: null, disabled: false }, [Validators.required]],
      formaPago: [{ value: null, disabled: false }, [Validators.required]],
      observaciones1: [{ value: null, disabled: true }],
      observaciones2: [{ value: null, disabled: false }],
    });
  }

  limpiar(): void {
    if (this.solicitudForm && this.solicitudDirForm) {
      this.solicitudDirForm.resetForm({});
    }
    if (this.datosCFDIForm && this.CFDIDirForm) {
      this.CFDIDirForm.resetForm({});
    }
    if (this.datosContratanteForm && this.datosContratanteDirForm) {
      this.datosContratanteDirForm.resetForm({});
    }
    this.registroContratante = null;
    this.registroRFC = null;
    this.limpiarCatalogos();
  }


  get folio(): string {
    const tipoFactura = this.solicitudForm.get('tipoFactura')?.value;
    if (![1, 2, 3, 4].includes(tipoFactura)) return '';
    if (tipoFactura === 1) return 'Folio de ODS';
    if (tipoFactura === 3) return 'Número de permiso';
    return 'Folio del Convenio';
  }

  obtenerFolios(): void {
    const tipoFactura = this.solicitudForm.get('tipoFactura')?.value;
    this.tipoSolicitud = this.solicitudForm.get('tipoFactura')?.value;
    this.cargadorService.activar();
    this.limpiarFolios();
    this.facturacionService.obtenerFolioODS(tipoFactura).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.registroFolios = respuesta.datos;
        this.folios = mapearArregloTipoDropdown(respuesta.datos, 'folio', 'folio');
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  obtenerRecibosPago(): void {
    if (this.pf?.tipoFactura?.value === 4) {
      this.solicitudForm.get('numeroRecibo')?.setValidators(Validators.required);
      const folio = this.registroFolios.find((item: Folio) => item.folio === this.solicitudForm.get('folio')?.value)
      if (folio?.idRegistro) {
        this.cargadorService.activar();
        this.limpiarRecibosPago();
        this.facturacionService.obtenerRecibosPago(folio?.idRegistro).pipe(
          finalize(() => this.cargadorService.desactivar())
        ).subscribe({
          next: (respuesta: HttpRespuesta<any>): void => {
            this.registrosRecibosPago = respuesta.datos;
            this.recibosPago = mapearArregloTipoDropdown(respuesta.datos, 'folio', 'folio');
          },
          error: (error: HttpErrorResponse): void => {
            console.error("ERROR: ", error);
            this.mensajesSistemaService.mostrarMensajeError(error);
          }
        });
      }
    } else {
      this.solicitudForm.get('numeroRecibo')?.clearValidators();
    }
    this.solicitudForm.get('numeroRecibo')?.updateValueAndValidity();
  }

  limpiarFolios(): void {
    this.registroFolios = [];
    this.folios = [];
    this.solicitudForm.get('folio')?.setValue(null);
  }

  limpiarRecibosPago(): void {
    this.recibosPago = [];
    this.solicitudForm.get('numeroRecibo')?.setValue(null);
  }

  buscarDatosContratante(): void {
    if (this.solicitudForm.valid) {
      const solicitud: SolicitudDatosContratante = this.crearSolicitudDatosContratante();
      this.cargadorService.activar();
      this.facturacionService.obtenerInfoFolioFacturacion(solicitud).pipe(
        finalize(() => this.cargadorService.desactivar())
      ).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta.datos) {
            this.registroContratante = respuesta.datos;
            this.datosContratanteForm.get('rfc')?.setValue(this.registroContratante!.rfc);
            this.datosContratanteForm.get('correoElectronico')?.setValue(this.registroContratante!.correo);
          } else {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Exito, msg);
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.error("ERROR: ", error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
    }
  }

  crearSolicitudDatosContratante(): SolicitudDatosContratante {
    const tipoFactura = this.solicitudForm.get('tipoFactura')?.value;

    const folio = this.solicitudForm.get('folio')?.value;
    const folioSeleccionado = this.registroFolios.find(f => f.folio === folio);

    let idPagoBitacora: number = folioSeleccionado!.idPagoBitacora;
    let idRegistro: number = folioSeleccionado!.idRegistro;

    if (this.pf?.tipoFactura?.value === 4) {
      const numeroRecibo = this.solicitudForm.get('numeroRecibo')?.value;
      const reciboPago = this.registrosRecibosPago.find((item: RecibosPago) => item.folio === numeroRecibo);

      idPagoBitacora = reciboPago!.idPagoSFPA;
      idRegistro = reciboPago!.idRegistro;
    }

    return {
      tipoFactura,
      idPagoBitacora,
      idRegistro,
    }
  }

  buscarRFC(): void {
    const rfc = this.datosContratanteForm.get('rfc')?.value;
    this.cargadorService.activar();
    this.facturacionService.consultarRFC(rfc).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.registroRFC = respuesta.datos;
        this.cargarCatalogosTipoPersona(this.registroRFC!.tipoPersona);
        this.seleccionarObservaciones();
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  cargarCatalogosTipoPersona(tipoPersona: string): void {
    const POSICION_CFDI: number = 0;
    const POSICION_METODOS_PAGO: number = 1;
    const POSICION_FORMAS_PAGO: number = 2;
    this.limpiarCatalogos();
    this.cargadorService.activar();
    forkJoin([this.cargarCatalogoCFDI(tipoPersona), this.cargarCatalogoMetodosPago(tipoPersona), this.cargarCatalogoFormasPago(tipoPersona)]).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta): void => {
        const cfdi = respuesta[POSICION_CFDI].datos;
        this.cfdi = mapearArregloTipoDropdown(cfdi, 'desCfdi', 'idCfdi');
        const metodosPago = respuesta[POSICION_METODOS_PAGO].datos;
        this.metodosPago = mapearArregloTipoDropdown(metodosPago, 'desMetPagoFac', 'idMetPagoFac');
        const formasPago = respuesta[POSICION_FORMAS_PAGO].datos;
        this.formasPago = mapearArregloTipoDropdown(formasPago, 'desForPago', 'idForPago');
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  cargarCatalogoCFDI(tipoPersona: string): Observable<HttpRespuesta<any>> {
    return this.facturacionService.consultarCFDI(tipoPersona);
  }

  cargarCatalogoMetodosPago(tipoPersona: string): Observable<HttpRespuesta<any>> {
    return this.facturacionService.consultarMetodosPago(tipoPersona);
  }

  cargarCatalogoFormasPago(tipoPersona: string): Observable<HttpRespuesta<any>> {
    return this.facturacionService.consultarFormasPago(tipoPersona);
  }

  limpiarCatalogos(): void {
    this.cfdi = [];
    this.metodosPago = [];
    this.formasPago = [];
  }

  generarSolicitudFactura(): void {
    this.cargadorService.activar();
    const solicitudFactura: SolicitudGenerarFact = this.generarSolicitud();
    this.facturacionService.generarSolicitudPago(solicitudFactura).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Factura registrada correctamente');
        void this.router.navigate(['./..'], { relativeTo: this.route });
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      }
    })
  }

  generarSolicitud(): SolicitudGenerarFact {
    const cfdi = this.datosCFDIForm.get('cfdi')?.value;
    const CFDI = this.cfdi.find(registro => registro.value === cfdi);
    const metodoPago = this.datosCFDIForm.get('metodoPago')?.value;
    const METODO_PAGO = this.metodosPago.find(registro => registro.value === metodoPago);
    const formaPago = this.datosCFDIForm.get('formaPago')?.value;
    const FORMA_PAGO = this.formasPago.find(registro => registro.value === formaPago);
    const correo = this.datosContratanteForm.get('correoElectronico')?.value;
    const rfc = this.datosContratanteForm.get('rfc')?.value;
    const folio = this.solicitudForm.get('folio')?.value;
    const tipoFactura = this.solicitudForm.get('tipoFactura')?.value;
    const folioSeleccionado = this.registroFolios.find(f => f.folio === folio);
    const obsAutomatica = this.datosCFDIForm.get('observaciones1')?.value;
    const obsManual = this.datosCFDIForm.get('observaciones2')?.value;
    const [cveRegimenFiscal] = this.registroRFC?.regimenFiscal.split(" ") ?? '';
    return {
      concPago: this.registroContratante?.concPago ?? '',
      cveRegimenFiscal,
      fecPago: this.registroContratante?.fecPago ?? '',
      cfdi: { desCfdi: CFDI!.label, idCfdi: CFDI!.value as number },
      correo,
      domicilioFiscal: {
        calle: this.registroRFC!.domicilioFiscal.calle,
        email: this.registroRFC!.domicilioFiscal.email,
        paisResidencia: this.registroRFC!.domicilioFiscal.paisResidencia,
        telefono1: this.registroRFC!.domicilioFiscal.telefono1,
        telefono2: this.registroRFC!.domicilioFiscal.telefono2,
        calr: this.registroRFC!.domicilioFiscal.calr,
        ccrh: this.registroRFC!.domicilioFiscal.ccrh,
        cp: this.registroRFC!.domicilioFiscal.cp,
        dalr: this.registroRFC!.domicilioFiscal.dalr,
        dcrh: this.registroRFC!.domicilioFiscal.dcrh,
        caractDomicilio: this.registroRFC!.domicilioFiscal.caractDomicilio,
        ccolonia: this.registroRFC!.domicilioFiscal.ccolonia,
        centFed: this.registroRFC!.domicilioFiscal.centFed,
        clocalidad: this.registroRFC!.domicilioFiscal.clocalidad,
        cmunicipio: this.registroRFC!.domicilioFiscal.cmunicipio,
        dcolonia: this.registroRFC!.domicilioFiscal.dcolonia,
        dentFed: this.registroRFC!.domicilioFiscal.dentFed,
        dentreCalle1: this.registroRFC!.domicilioFiscal.dentreCalle1,
        dentreCalle2: this.registroRFC!.domicilioFiscal.dentreCalle2,
        dinmueble: this.registroRFC!.domicilioFiscal.dinmueble,
        dlocalidad: this.registroRFC!.domicilioFiscal.dlocalidad,
        dmunicipio: this.registroRFC!.domicilioFiscal.dmunicipio,
        dreferencia: this.registroRFC!.domicilioFiscal.dreferencia,
        dvialidad: this.registroRFC!.domicilioFiscal.dvialidad,
        faltaDom: this.registroRFC!.domicilioFiscal.faltaDom,
        nexterior: this.registroRFC!.domicilioFiscal.nexterior,
        ninterior: this.registroRFC!.domicilioFiscal.ninterior,
        tinmueble: this.registroRFC!.domicilioFiscal.tinmueble,
        ttel1: this.registroRFC!.domicilioFiscal.ttel1,
        ttel2: this.registroRFC!.domicilioFiscal.ttel2,
        tvialidad: this.registroRFC!.domicilioFiscal.tvialidad
      },
      folio,
      forPago: { desForPago: FORMA_PAGO!.label, idForPago: FORMA_PAGO!.value as number },
      idPagoBitacora: folioSeleccionado!.idPagoBitacora,
      idRegistro: folioSeleccionado!.idRegistro,
      idVelatorio: this.registroContratante!.idVelatorio,
      metPagoFac: { desMetPagoFac: METODO_PAGO!.label, idMetPagoFac: METODO_PAGO!.value as number },
      nomContratante: this.registroContratante!.nomContratante,
      obsAutomatica,
      obsManual,
      razonSocial: this.registroRFC!.razonSocial,
      regimenFiscal: this.registroRFC!.regimenFiscal,
      rfc,
      servicios: this.registroContratante!.servicios,
      tipoFactura,
      tipoPersona: this.registroRFC!.tipoPersona,
      totalPagado: this.registroContratante!.totalPagado.toString(),
      totalServicios: this.registroContratante!.totalServicios.toString(),
      finado: {
        fecFinado: this.registroContratante!.finado?.fecFinado ?? null,
        idFinado: this.registroContratante!.finado?.idFinado ?? null,
        nomFinado: this.registroContratante!.finado?.nomFinado ?? null
      }
    }
  }

  seleccionarObservaciones(): void {
    const idFactura = this.solicitudForm.get('tipoFactura')?.value;
    if (idFactura === 1) {
      this.datosCFDIForm.get('observaciones1')?.patchValue(this.crearObservacionesODS());
      return;
    }
    this.datosCFDIForm.get('observaciones1')?.patchValue(this.crearObservacionesConvenio());
  }

  crearObservacionesODS(): string {
    const folio = this.solicitudForm.get('folio')?.value
    const finado: string = this.registroContratante?.finado?.nomFinado ?? '';
    const fechaFinado: string = this.registroContratante?.finado?.fecFinado ?? '';
    const idMetodoPago = this.datosCFDIForm.get('metodoPago')?.value;
    const metodoPago: string = this.metodosPago.find(mP => mP.value === idMetodoPago)?.label ?? '';
    const idFormaPago = this.datosCFDIForm.get('formaPago')?.value;
    const formaPago: string = this.formasPago.find(fP => fP.value === idFormaPago)?.label ?? '';
    return `${folio} ${finado} ${fechaFinado} ${metodoPago} ${formaPago}`;
  }

  crearObservacionesConvenio(): string {
    const folio = this.solicitudForm.get('folio')?.value
    const idMetodoPago = this.datosCFDIForm.get('metodoPago')?.value;
    const metodoPago: string = this.metodosPago.find(mP => mP.value === idMetodoPago)?.label ?? '';
    const idFormaPago = this.datosCFDIForm.get('formaPago')?.value;
    const formaPago: string = this.formasPago.find(fP => fP.value === idFormaPago)?.label ?? '';
    return `${folio} ${metodoPago} ${formaPago}`;
  }

  get pf() {
    return this.solicitudForm?.controls;
  }

  get pr() {
    return this.datosContratanteForm?.controls;
  }

  get pcf() {
    return this.datosCFDIForm?.controls;
  }
}
