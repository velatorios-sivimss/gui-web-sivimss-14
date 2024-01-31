import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {RealizarPagoService} from '../../../services/realizar-pago.service';
import {diferenciaUTC, mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {DetalleAyudaGastosFuneral} from '../../../modelos/ayudaGastosFuneral.interface';
import {RegistroAGF} from "../../../modelos/registroAGF.interface";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {finalize} from "rxjs/operators";
import {forkJoin, Observable} from "rxjs";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {AlertaService, TipoAlerta} from "../../../../../../shared/alerta/services/alerta.service";

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

  readonly POSICION_CATALOGO_RAMOS: number = 0;
  readonly POSICION_CATALOGO_IDENTIFICACIONES: number = 1;
  readonly POSICION_DETALLE_AGF: number = 2;

  readonly CAPTURA_DE_AGF: number = 1;
  readonly VALIDACION_DE_AGF: number = 2;
  readonly ERROR_AGF: number = 3;
  pasoRegistrarAGF: number = 1;
  aniosDiferencia: number = 0;

  datos_agf!: RegistroAGF;

  constructor(
    private formBuilder: FormBuilder,
    private realizarPagoService: RealizarPagoService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private router: Router,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
    private alertaService: AlertaService,
    private route: ActivatedRoute) {
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
    this.cargarCatalogos();
    this.inicializarAgfForm();
  }

  cargarCatalogos(): void {
    forkJoin([this.obtenerRamos(), this.obtenerIdentificaciones(), this.obtenerDetalleAGF()]).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: [HttpRespuesta<any>, HttpRespuesta<any>, HttpRespuesta<any>]): void => this.procesarCatalogos(respuesta),
      error: (error: HttpErrorResponse) => this.mostrarMensajeError(error)
    })
  }

  obtenerRamos(): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.obtenerRamos();
  }

  obtenerDetalleAGF(): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.obtenerDetalleAGF(this.idFinado);
  }

  obtenerIdentificaciones(): Observable<HttpRespuesta<any>> {
    return this.realizarPagoService.obtenerIdentificaciones();
  }

  private mostrarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    const ERROR: string = 'Error al consultar la información.';
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
  }

  procesarCatalogos(respuesta: [HttpRespuesta<any>, HttpRespuesta<any>, HttpRespuesta<any>]): void {
    const ramos = respuesta[this.POSICION_CATALOGO_RAMOS].datos || [];
    this.ramos = mapearArregloTipoDropdown(ramos, "desRamo", "idRamo");
    const identifiaciones = respuesta[this.POSICION_CATALOGO_IDENTIFICACIONES].datos || [];
    this.identificaciones = mapearArregloTipoDropdown(identifiaciones, "desTipoId", "idTipoId");
    this.detalleAGF = respuesta[this.POSICION_DETALLE_AGF].datos[0];
    const fechaDefuncion: Date = new Date(diferenciaUTC(this.detalleAGF.fecDeceso));
    this.aniosDiferencia = this.calcularDiferenciaEnAnios(fechaDefuncion);
  }

  seleccionarBeneficiario(): void {
    this.ref.close();
    const datos_agf: string = window.btoa(JSON.stringify(this.datos_agf));
    const fecDefuncion: string = this.obtenerFechaDefuncion(this.detalleAGF.fecDeceso);
    void this.router.navigate(['../../agf-seleccion-beneficiarios', this.detalleAGF.cveNss, fecDefuncion],
      {relativeTo: this.route, queryParams: {datos_agf}})
  }

  verificarTipoRamo(): void {
    this.datos_agf = this.crearRegistroAGF();
    const ramo = this.agfForm.get('ramo')?.value;
    if ([3].includes(ramo)) {
      this.seleccionarBeneficiario();
      return;
    }
    this.crearAGF();
  }

  obtenerFechaDefuncion(fecDeceso: string): string {
    if (!fecDeceso) return '';
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
      curp: [{value: false, disabled: false}, [Validators.requiredTrue]],
      actaDefuncion: [{value: false, disabled: false}, [Validators.requiredTrue]],
      cuentaGastos: [{value: false, disabled: false}, [Validators.requiredTrue]],
      documentoNSS: [{value: false, disabled: false}, [Validators.requiredTrue]],
    })
  }

  crearRegistroAGF(): RegistroAGF {
    return {
      idBeneficiario: 0,
      casillaActDef: this.agfForm.get('actaDefuncion')?.value,
      casillaCogf: this.agfForm.get('cuentaGastos')?.value,
      casillaCurp: this.agfForm.get('curp')?.value,
      casillaNssi: this.agfForm.get('documentoNSS')?.value,
      cveCURP: this.detalleAGF.cveCurp,
      cveNSS: this.detalleAGF.cveNss.toString(),
      fecDefuncion: this.detalleAGF.fecDeceso,
      idFinado: this.idFinado,
      idRamo: this.agfForm.get('ramo')?.value,
      idTipoId: this.agfForm.get('identificacionOficial')?.value,
      idVelatorio: this.detalleAGF.idVelatorio,
      numIdentificacion: this.agfForm.get('numeroIdentificacion')?.value,
      cveCURPBeneficiario: '',
      nombreBeneficiario: '',
      idPagoBitacora: this.idPagoBitacora
    }
  }

  crearAGF(): void {
    this.realizarPagoService.guardarAGF(this.datos_agf).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => this.manejoRespuestaExitosaPago(),
      error: (error: HttpErrorResponse): void => this.manejoRespuestaErrorPago(error)
    });
  }

  private manejoRespuestaExitosaPago(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Pago registrado correctamente');
    this.actualizarPagina();
  }

  private manejoRespuestaErrorPago(error: HttpErrorResponse): void {
    this.pasoRegistrarAGF = this.ERROR_AGF;
    console.log(error);
  }

  actualizarPagina(): void {
    window.location.reload();
  }

  concluirServicioAGF(): void {
    this.ref.close();
    window.location.reload();
  }

  cancelar(): void {
    this.ref.close();
  }

  esAnioBisiesto(anio: number): boolean {
    return (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
  }

  calcularDiferenciaEnAnios(fechaDada: Date): number {
    const fechaActual: Date = new Date();

    const anioActual: number = fechaActual.getFullYear();
    const anioFechaDada: number = fechaDada.getFullYear();

    let diferenciaEnAnios: number = anioActual - anioFechaDada;
    if (
      (fechaActual.getMonth() < fechaDada.getMonth()) ||
      (fechaActual.getMonth() === fechaDada.getMonth() && fechaActual.getDate() < fechaDada.getDate())
    ) {
      diferenciaEnAnios--;
    }
    for (let anio: number = anioFechaDada; anio < anioActual; anio++) {
      if (this.esAnioBisiesto(anio)) {
        diferenciaEnAnios--;
      }
    }
    return diferenciaEnAnios;
  }


  get fagf() {
    return this.agfForm.controls
  }
}
