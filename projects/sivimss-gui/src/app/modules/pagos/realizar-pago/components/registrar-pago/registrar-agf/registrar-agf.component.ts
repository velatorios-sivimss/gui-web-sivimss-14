import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {RealizarPagoService} from '../../../services/realizar-pago.service';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {DetalleAyudaGastosFuneral} from '../../../modelos/ayudaGastosFuneral.interface';
import * as moment from "moment/moment";
import {RegistroAGF} from "../../../modelos/registroAGF.interface";
import {RegistroPago} from "../../../modelos/registroPago.interface";
import {forkJoin, Observable} from "rxjs";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-registrar-agf',
  templateUrl: './registrar-agf.component.html',
  styleUrls: ['./registrar-agf.component.scss']
})
export class RegistrarAgfComponent implements OnInit {
  agfForm!: FormGroup;
  detalleAGF!: DetalleAyudaGastosFuneral;
  ramos: TipoDropdown[] = [];
  identificaciones: TipoDropdown[] = [];
  indice: number = 0;
  idFinado!: number;
  idPagoBitacora!: number;
  idFlujoPago!: number;
  idRegistro!: number;
  importeTotal!: number;

  readonly CAPTURA_DE_AGF: number = 1;
  readonly VALIDACION_DE_AGF: number = 2;
  pasoRegistrarAGF: number = 1;

  readonly POSICION_CATALOGO_RAMOS: number = 0;
  readonly POSICION_CATALOGO_IDENTIFICACIONES: number = 1;
  readonly POSICION_DETALLE_AGF: number = 2;

  constructor(
    private formBuilder: FormBuilder,
    private realizarPagoService: RealizarPagoService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private router: Router,
    private route: ActivatedRoute,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
  ) {
    this.obtenerDatosAGF();
  }

  obtenerDatosAGF(): void {
    this.idFinado = this.config.data.idFinado;
    this.idPagoBitacora = this.config.data.idPagoBitacora;
    this.idFlujoPago = this.config.data.idFlujoPago;
    this.idRegistro = this.config.data.idRegistro;
    this.importeTotal = this.config.data.importePago;
  }

  ngOnInit(): void {
    this.cargadorService.activar();
    this.cargarCatalogos();
    this.obtenerDetalleAGF();
    this.inicializarAgfForm();
  }

  aceptar(): void {
    this.ref.close();
    const registroAGF: RegistroAGF = this.crearRegistroAGF();
    const datos_agf: string = window.btoa(JSON.stringify(registroAGF));
    const registroPago: RegistroPago = this.crearRegistroPago();
    const datos_pago: string = window.btoa(JSON.stringify(registroPago))
    const fecDefuncion: string = this.obtenerFechaDefuncion(this.detalleAGF.fecDeceso);
    void this.router.navigate(['../agf-seleccion-beneficiarios', this.detalleAGF.cveNss, fecDefuncion],
      {relativeTo: this.route, queryParams: {datos_agf, datos_pago}})
  }

  cargarCatalogos(): void {
    forkJoin([this.obtenerRamos(), this.obtenerIdentificaciones(), this.obtenerDetalleAGF()]).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>, HttpRespuesta<any>]): void => this.procesarCatalogos(respuesta),
      error: (error: HttpErrorResponse) => this.mostrarMensajeError(error)
    })
  }

  private mostrarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  procesarCatalogos(respuesta: [HttpRespuesta<any>, HttpRespuesta<any>, HttpRespuesta<any>]): void {
    const ramos = respuesta[this.POSICION_CATALOGO_RAMOS].datos || [];
    this.ramos = mapearArregloTipoDropdown(ramos, "desRamo", "idRamo");
    const identifiaciones = respuesta[this.POSICION_CATALOGO_IDENTIFICACIONES].datos || [];
    this.identificaciones = mapearArregloTipoDropdown(identifiaciones, "desTipoId", "idTipoId");
    this.detalleAGF = respuesta[this.POSICION_DETALLE_AGF].datos[0];
  }

  obtenerFechaDefuncion(fecDeceso: string): string {
    const partes: string[] = fecDeceso.split('/');
    if (partes.length !== 3) return '';
    const [dia, mes, anio] = partes;
    return `${anio}${mes}${dia}`;
  }

  private inicializarAgfForm(): void {
    this.agfForm = this.formBuilder.group({
      ramo: [{value: null, disabled: false}, [Validators.required]],
      identificacionOficial: [{value: null, disabled: false}, [Validators.required]],
      numeroIdentificacion: [{value: null, disabled: false}, [Validators.required]],
      curp: [{value: false, disabled: false}],
      actaDefuncion: [{value: false, disabled: false}],
      cuentaGastos: [{value: false, disabled: false}],
      documentoNSS: [{value: false, disabled: false}],
    })
  }

  obtenerRamos(): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.obtenerRamos();
  }

  obtenerDetalleAGF(): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.obtenerDetalleAGF(this.idFinado);
  }

  crearRegistroAGF(): RegistroAGF {
    return {
      casillaActDef: this.agfForm.get('actaDefuncion')?.value,
      casillaCogf: this.agfForm.get('cuentaGastos')?.value,
      casillaCurp: this.agfForm.get('curp')?.value,
      casillaNssi: this.agfForm.get('documentoNSS')?.value,
      cveCURP: this.detalleAGF.cveCurp,
      cveNSS: this.detalleAGF.cveNss,
      fecDefuncion: this.detalleAGF.fecDeceso,
      idFinado: this.idFinado,
      idRamo: this.agfForm.get('ramo')?.value,
      idTipoId: this.agfForm.get('identificacionOficial')?.value,
      idVelatorio: this.detalleAGF.idVelatorio,
      numIdentificacion: this.agfForm.get('numeroIdentificacion')?.value,
      cveCURPBeneficiario: "",
      nombreBeneficiario: "",
      idPagoDetalle: null
    }
  }

  crearRegistroPago(): RegistroPago {
    let fechaValeAGF = moment(new Date()).format('YYYY-MM-DD');
    return {
      descBanco: null,
      fechaPago: null,
      fechaValeAGF: fechaValeAGF,
      idFlujoPago: this.idFlujoPago,
      idMetodoPago: 2,
      idPagoBitacora: this.idPagoBitacora,
      idRegistro: this.idRegistro,
      importePago: this.importeTotal,
      importeRegistro: this.importeTotal,
      numAutorizacion: ""
    }
  }

  obtenerIdentificaciones(): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.obtenerIdentificaciones();
  }

  cancelar(): void {
    this.ref.close();
  }

  get fagf() {
    return this.agfForm.controls
  }
}
