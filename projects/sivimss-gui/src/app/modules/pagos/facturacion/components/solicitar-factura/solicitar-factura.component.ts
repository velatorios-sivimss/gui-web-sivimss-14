import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {REGISTROS_PAGOS} from "../../constants/dummies";
import {TIPO_FACTURACION} from "../../constants/tipoFacturacion";
import {ActivatedRoute} from "@angular/router";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {FacturacionService} from "../../services/facturacion.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {DatosContratante} from "../../models/datosContratante.interface";
import {RegistroRFC} from "../../models/registroRFC.interface";
import {forkJoin, Observable} from "rxjs";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";

interface Folio {
  idRegistro: number,
  folio: string,
  idPagoBitacora: number
}

interface SolicitudDatosContratante {
  tipoFactura: string,
  idPagoBitacora: number,
  idRegistro: number
}

interface MetodoPagoFacturacion {
  desMetPagoFac: string,
  idMetPagoFac: number
}

interface FormaPagoFacturacion {

}

@Component({
  selector: 'app-solicitar-factura',
  templateUrl: './solicitar-factura.component.html',
  styleUrls: ['./solicitar-factura.component.scss']
})
export class SolicitarFacturaComponent implements OnInit {

  @ViewChild(FormGroupDirective)
  private filtroFormDir!: FormGroupDirective;

  solicitudForm!: FormGroup;
  datosContratanteForm!: FormGroup;
  datosCFDIForm!: FormGroup;
  indice: number = 0;
  tiposFactura: TipoDropdown[] = TIPO_FACTURACION;
  folios: TipoDropdown[] = [];
  servicios: any[] = REGISTROS_PAGOS;
  cfdi: TipoDropdown[] = [];
  metodosPago: TipoDropdown[] = [];
  formasPago: TipoDropdown[] = [];
  registroFolios: Folio[] = [];
  registroContratante!: DatosContratante;
  registroRFC!: RegistroRFC;
  tipoSolicitud!: 1 | 2 | 3 | 4;

  constructor(private formBuilder: FormBuilder,
              private readonly activatedRoute: ActivatedRoute,
              private facturacionService: FacturacionService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
    this.inicializarFormRFC();
    this.inicializarFormCFDI();
  }

  inicializarForm(): void {
    this.solicitudForm = this.formBuilder.group({
      tipoFactura: [{value: null, disabled: false}, [Validators.required]],
      folio: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  inicializarFormRFC(): void {
    this.datosContratanteForm = this.formBuilder.group({
      rfc: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  inicializarFormCFDI(): void {
    this.datosCFDIForm = this.formBuilder.group({
      cfdi: [{value: null, disabled: false}, [Validators.required]],
      metodoPago: [{value: null, disabled: false}, [Validators.required]],
      formaPago: [{value: null, disabled: false}, [Validators.required]],
      observaciones1: [{value: '000000000', disabled: true}, [Validators.required]],
      observaciones2: [{value: null, disabled: false}],
    });
  }

  limpiar(): void {
    if (this.solicitudForm) {
      this.filtroFormDir.resetForm({});
    }
  }

  protected readonly DIEZ_ELEMENTOS_POR_PAGINA = DIEZ_ELEMENTOS_POR_PAGINA;

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
    this.facturacionService.obtenerFolioODS(tipoFactura).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.registroFolios = respuesta.datos;
        this.folios = mapearArregloTipoDropdown(respuesta.datos, 'folio', 'folio');
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      }
    });
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


  buscarDatosContratante(): void {
    const solicitud: SolicitudDatosContratante = this.crearSolicitudDatosContratante();
    this.cargadorService.activar();
    this.facturacionService.obtenerInfoFolioFacturacion(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.registroContratante = respuesta.datos;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  crearSolicitudDatosContratante(): SolicitudDatosContratante {
    const tipoFactura = this.solicitudForm.get('tipoFactura')?.value;
    const folio = this.solicitudForm.get('folio')?.value;
    const folioSeleccionado = this.registroFolios.find(f => f.folio === folio);
    return {
      tipoFactura,
      idPagoBitacora: folioSeleccionado!.idPagoBitacora,
      idRegistro: folioSeleccionado!.idRegistro
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
        this.cargarCatalogosTipoPersona(this.registroRFC.tipoPersona)
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
    })
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
}
