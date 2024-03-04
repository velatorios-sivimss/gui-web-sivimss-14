import {Component, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OverlayPanel} from 'primeng/overlaypanel';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {ContratarPSFPAService} from '../../services/contratar-psfpa.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {HttpErrorResponse} from '@angular/common/http';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {
  CATALOGO_NACIONALIDAD,
  CATALOGO_SEXO
} from "projects/sivimss-gui/src/app/modules/contratantes/constants/catalogos-complementarios";
import {finalize} from 'rxjs/operators';
import {mapearArregloTipoDropdown, validarUsuarioLogueadoOnline} from 'projects/sivimss-gui/src/app/utils/funciones';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from 'projects/sivimss-gui/src/app/utils/constantes';
import {CURP} from 'projects/sivimss-gui/src/app/utils/regex';
import * as moment from "moment";
import {ContratarPlanSFPA, Paquete} from '../../models/servicios-funerarios.interface';
import {RegistroService} from 'projects/sivimss-gui/src/app/pages/publico/pages/registro/services/registro.service';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {
  ServiciosFunerariosService
} from 'projects/sivimss-gui/src/app/modules/servicios-funerarios/services/servicios-funerarios.service';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { Subscription } from 'rxjs';
import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';
import { TransaccionPago } from '../../../../models/transaccion-pago.interface';
import { SolicitudPagos } from '../../../../models/solicitud-pagos.interface';
import { AutenticacionService } from 'projects/sivimss-gui/src/app/services/autenticacion.service';
import {GestorCredencialesService} from "../../../../../../services/gestor-credenciales.service";

@Component({
  selector: 'app-contratar-plan-servicios-funerarios-pago-anticipado',
  templateUrl:
    './contratar-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: [
    './contratar-plan-servicios-funerarios-pago-anticipado.component.scss',
  ],
  providers: [DescargaArchivosService, ServiciosFunerariosService, ContratarPSFPAService, GestorCredencialesService]
})
export class ContratarPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  @ViewChild('overlayPanel')
  overlayPanel!: OverlayPanel;

  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  promotorForm!: FormGroup;
  datosTitularForm!: FormGroup;
  datosTitularSubstitutoForm!: FormGroup;
  datosBeneficiario1Form!: FormGroup;
  datosBeneficiario2Form!: FormGroup;
  fechaActual: Date = new Date();
  beneficiarios = [];
  mostrarModalTipoArchivoIncorrecto: boolean = false;
  mostrarModalConfirmacionInformacionCapturada: boolean = false;
  ocultarBtnGuardar: boolean = false;
  mostrarRealizarPago: boolean = false;
  mostrarModalValidacionRegistro: boolean = false;
  mostrarModalDesactivarBeneficiarioGrupo: boolean = false;
  TIPO_CONTRATACION_PERSONA: string = 'persona';
  sexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  catalogoEstados: TipoDropdown[] = [];
  catalogoPaises: TipoDropdown[] = [];
  catPromotores: TipoDropdown[] = [];
  colonias: TipoDropdown[][] = [[], [], [], []];
  numeroPagos: TipoDropdown[] = [];
  paquetes: Paquete[] = [];
  paqueteSeleccionado!: Paquete;
  velatorio: string = '';
  idVelatorio: number | null = null;
  existeDatoRegistrado: boolean = false;
  tipoPersona: boolean = true;
  cajaValidacionDatosExistentes: any[] = [false, false, false, false];
  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;
  folioConvenio!: string;
  numPago!: number;
  idRegistro!: number;
  idPagoSFPA!: number;
  montoTotalPagar!: number;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly contratarPSFPAService: ContratarPSFPAService,
    private readonly registroService: RegistroService,
    private alertaService: AlertaService,
    private readonly loaderService: LoaderService,
    private readonly activatedRoute: ActivatedRoute,
    private mensajesSistemaService: MensajesSistemaService,
    private renderer: Renderer2,
    private readonly router: Router,
    private descargaArchivosService: DescargaArchivosService,
    private serviciosFunerariosService: ServiciosFunerariosService,
    private readonly autenticacionContratanteService: AutenticacionContratanteService,
    private autenticacionService: AutenticacionService,
    private gestorCredencialesService: GestorCredencialesService
  ) {
  }

  ngOnInit(): void {
    this.subs = this.autenticacionContratanteService.usuarioEnSesion$.subscribe(
      (usuarioEnSesion: UsuarioEnSesion | null) => {
        this.usuarioEnSesion = usuarioEnSesion;
        this.idVelatorio = this.activatedRoute.snapshot.queryParams.idVelatorio;
        this.velatorio = this.activatedRoute.snapshot.queryParams.velatorio;
        this.inicializarFormPromotor();
        this.inicializarFormDatosTitular();
        this.inicializarFormDatosTitularSubstituto();
        this.inicializarFormDatosBeneficiario1();
        this.inicializarFormDatosBeneficiario2();
        if (validarUsuarioLogueadoOnline()) return;
        this.obtenerPaises();
        this.obtenerEstados();
        this.obtenerPromotores();
        this.obtenerPaquete();
        this.cargarCatalogosLocalStorage();
        this.handleGestionPromotor();
        this.consultarCurpInicial();
      });
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoNumPagos = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_mesesPago');
    this.numeroPagos = mapearArregloTipoDropdown(catalogoNumPagos, 'desc', 'id');
  }

  inicializarFormPromotor(): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{value: false, disabled: false}, [Validators.nullValidator]],
      promotor: [{value: null, disabled: false}, [Validators.nullValidator]],
    });

    this.handleGestionPromotor();
  }

  cargarScript(callback: () => void): void {
    const elementoId: string = 'realizar-pago';
    if (!document.getElementById(elementoId)) {
      const body: HTMLElement = document.body;
      const elemento_ref = this.renderer.createElement('script');
      elemento_ref.type = 'text/javascript';
      elemento_ref.src = '../../../../../../assets/js/control-pagos.js';
      elemento_ref.id = elementoId;
      elemento_ref.async = true;
      elemento_ref.defer = true;
      this.renderer.appendChild(body, elemento_ref);
      elemento_ref.onload = callback;
    } else {
      callback();
    }
  }

  iniciarPago(): void {
    this.gestorCredencialesService.obtenerToken().subscribe({
      next: (respuesta) => this.procesarToken(respuesta)
    })

  }

  procesarToken(respuesta: HttpRespuesta<any>): void {
    const [credenciales] = respuesta.datos;
    const elemento_ref = document.querySelector('.realizar-pago');
    const e = document.getElementById('btn-realizar-pago');
    if (!elemento_ref) return;
    elemento_ref.setAttribute('data-objeto', JSON.stringify({
      referencia: 'Mensualidad SFPA',
      monto: this.montoTotalPagar,
      mode: credenciales.mode,
      code: credenciales.code,
      key: credenciales.key
    }));
    this.cargarScript(() => {});
    this.subscripcionMotorPagos();
    e?.click();
  }

  subscripcionMotorPagos(): void {
    // Escucha el evento personalizado
    document.addEventListener('datosRecibidos', (event) => {
      const data = (event as CustomEvent).detail;
      if (data.error && !data) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Error en la realización del pago en línea.');
        return;
      }
      if (data.transaction && data.transaction.status_detail === 3) {
        this.guardarPagoEnLinea(data);
      }
      if (data.transaction && [9, 11, 12].includes(data.transaction.status_detail)) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Pago rechazado.');
      }
    });
  }

  guardarPagoEnLinea(transaccion: TransaccionPago): void {
    this.loaderService.activar();
    const solicitud: SolicitudPagos = this.generarSolicitudPagosLinea(transaccion);
    this.contratarPSFPAService.guardarDatosPago(solicitud).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const id = respuesta.datos.idPagoLinea;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago realizado con éxito.');
        void this.router.navigate(['recibo-de-pago', id], {relativeTo: this.activatedRoute});
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      }
    })
  }

  generarSolicitudPagosLinea(pago: TransaccionPago): SolicitudPagos {
    let idMetodoPago: number = 4;
    if (+pago.transaction.payment_method_type === 0) idMetodoPago = 4;
    if (+pago.transaction.payment_method_type === 7) idMetodoPago = 3;

    let nombreTitular = `${this.fdt.nombre.value} ${this.fdt.primerApellido.value} ${this.fdt.segundoApellido.value}`;

    return {
      fecTransaccion: pago.transaction.payment_date, // pagos linea
      folio: this.folioConvenio,
      folioPago: "TEST-1", // pagos linea
      idFlujoPagos: 4,
      idMetodoPago, // debito o credito payment_method_type
      idRegistro: this.idRegistro,
      idVelatorio: this.idVelatorio,
      importe: this.montoTotalPagar,
      nomContratante: nombreTitular,
      nomTitular: nombreTitular, // pagos
      numAprobacion: pago.transaction.authorization_code, // pagos
      numTarjeta: pago.card.number, // pagos number
      referencia: pago.transaction.id, // pagos transaction_reference
      idPagoSFPA: this.idPagoSFPA,
    }
  }

  errorConectarPago(): void {
    this.alertaService.mostrar(TipoAlerta.Error, 'Error en el envío de la información para realizar el pago.');
  }

  inicializarFormDatosTitular(): void {
    this.datosTitularForm = this.formBuilder.group({
      curp: [{
        value: this.usuarioEnSesion?.curp,
        disabled: true
      }, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: null, disabled: true}, [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{value: null, disabled: true}],
      nss: [{value: null, disabled: true}, [Validators.required]],
      nombre: [{value: null, disabled: true}, [Validators.required]],
      primerApellido: [{value: null, disabled: true}, [Validators.required]],
      segundoApellido: [{value: null, disabled: true}, [Validators.required]],
      sexo: [{value: null, disabled: true}, [Validators.required]],
      otroSexo: [{value: null, disabled: true}],
      fechaNacimiento: [{value: null, disabled: true}, [Validators.required]],
      nacionalidad: [{value: null, disabled: true}],
      lugarNacimiento: [{value: null, disabled: true}, [Validators.required]],
      paisNacimiento: [{value: null, disabled: true}],
      telefono: [{value: null, disabled: false}, [Validators.required]],
      telefonoFijo: [{value: null, disabled: false}, [Validators.required]],
      correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{value: null, disabled: false}, [Validators.required]],
      calle: [{value: null, disabled: false}, [Validators.required]],
      numeroInterior: [{value: null, disabled: false}],
      numeroExterior: [{value: null, disabled: false}, [Validators.required]],
      colonia: [{value: null, disabled: false}, [Validators.required]],
      municipio: [{value: null, disabled: true}, [Validators.required]],
      estado: [{value: null, disabled: true}, [Validators.required]],
      paquete: [{value: null, disabled: false}, [Validators.required]],
      numeroPago: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  inicializarFormDatosTitularSubstituto(): void {
    this.datosTitularSubstitutoForm = this.formBuilder.group({
      datosIguales: [{value: false, disabled: false}, [Validators.required]],
      curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{value: null, disabled: false}],
      nss: [{value: null, disabled: false}, [Validators.required]],
      nombre: [{value: null, disabled: false}, [Validators.required]],
      primerApellido: [{value: null, disabled: false}, [Validators.required]],
      segundoApellido: [{value: null, disabled: false}, [Validators.required]],
      sexo: [{value: null, disabled: false}, [Validators.required]],
      otroSexo: [{value: null, disabled: false}],
      fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      nacionalidad: [{value: null, disabled: false}],
      lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],
      paisNacimiento: [{value: null, disabled: false}],
      telefono: [{value: null, disabled: false}, [Validators.required]],
      telefonoFijo: [{value: null, disabled: false}, []],
      correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{value: null, disabled: false}, [Validators.required]],
      calle: [{value: null, disabled: false}, [Validators.required]],
      numeroInterior: [{value: null, disabled: false}],
      numeroExterior: [{value: null, disabled: false}, [Validators.required]],
      colonia: [{value: null, disabled: false}, [Validators.required]],
      municipio: [{value: null, disabled: true}, [Validators.required]],
      estado: [{value: null, disabled: true}, [Validators.required]],
    });
  }

  inicializarFormDatosBeneficiario1(): void {
    this.datosBeneficiario1Form = this.formBuilder.group({
      curp: [{value: null, disabled: false}, [Validators.maxLength(18), Validators.pattern(CURP)]],
      rfc: [{value: null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
      matricula: [{value: null, disabled: false}],
      nss: [{value: null, disabled: false}, []],
      nombre: [{value: null, disabled: false}, []],
      primerApellido: [{value: null, disabled: false}, []],
      segundoApellido: [{value: null, disabled: false}, []],
      sexo: [{value: null, disabled: false}, []],
      otroSexo: [{value: null, disabled: false}],
      fechaNacimiento: [{value: null, disabled: false}, []],
      nacionalidad: [{value: null, disabled: false}],
      lugarNacimiento: [{value: null, disabled: false}, []],
      paisNacimiento: [{value: null, disabled: false}],
      telefono: [{value: null, disabled: false}, []],
      telefonoFijo: [{value: null, disabled: false}, []],
      correoElectronico: [{value: null, disabled: false}, [Validators.pattern(PATRON_CORREO)]],
      cp: [{value: null, disabled: false}, []],
      calle: [{value: null, disabled: false}, []],
      numeroInterior: [{value: null, disabled: false}],
      numeroExterior: [{value: null, disabled: false}, []],
      colonia: [{value: null, disabled: false}, []],
      municipio: [{value: null, disabled: true}, []],
      estado: [{value: null, disabled: true}, []],
    });
  }

  inicializarFormDatosBeneficiario2(): void {
    this.datosBeneficiario2Form = this.formBuilder.group({
      curp: [{value: null, disabled: false}, [Validators.maxLength(18), Validators.pattern(CURP)]],
      rfc: [{value: null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
      matricula: [{value: null, disabled: false}],
      nss: [{value: null, disabled: false}, []],
      nombre: [{value: null, disabled: false}, []],
      primerApellido: [{value: null, disabled: false}, []],
      segundoApellido: [{value: null, disabled: false}, []],
      sexo: [{value: null, disabled: false}, []],
      otroSexo: [{value: null, disabled: false}],
      fechaNacimiento: [{value: null, disabled: false}, []],
      nacionalidad: [{value: null, disabled: false}],
      lugarNacimiento: [{value: null, disabled: false}, []],
      paisNacimiento: [{value: null, disabled: false}],
      telefono: [{value: null, disabled: false}, []],
      telefonoFijo: [{value: null, disabled: false}, []],
      correoElectronico: [{value: null, disabled: false}, [Validators.pattern(PATRON_CORREO)]],
      cp: [{value: null, disabled: false}, []],
      calle: [{value: null, disabled: false}, []],
      numeroInterior: [{value: null, disabled: false}],
      numeroExterior: [{value: null, disabled: false}, []],
      colonia: [{value: null, disabled: false}, []],
      municipio: [{value: null, disabled: true}, []],
      estado: [{value: null, disabled: true}, []],
    });
  }

  convertirMayusculas(posicion: number): void {
    let formularios = [this.fdt.curp, this.fdt.rfc, this.fdts.curp, this.fdts.rfc, this.fdb1.curp, this.fdb1.rfc, this.fdb2.curp, this.fdb2.rfc];
    formularios[posicion].setValue(formularios[posicion].value.toUpperCase());
  }

  convertirMinusculas(posicion: number): void {
    let formularios = [this.fdt.correoElectronico, this.fdts.correoElectronico, this.fdb1.correoElectronico, this.fdb2.correoElectronico];
    formularios[posicion].setValue(formularios[posicion].value.toLowerCase());
  }

  seleccionaPaquete(paquete: Paquete): void {
    this.paqueteSeleccionado = paquete;
  }

  handleGestionPromotor() {
    if (this.fp.gestionadoPorPromotor.value) {
      this.fp.promotor.enable();
      this.fp.promotor.setValidators(Validators.required);
      this.fp.promotor.markAsTouched();
    } else {
      this.fp.promotor.setValue(null);
      this.fp.promotor.disable();
      this.fp.promotor.clearValidators();
    }
    this.fp.promotor.updateValueAndValidity();
  }

  consultarCorreo(posicion: number): void {
    let formularios = [this.fdt.correoElectronico, this.fdts.correoElectronico, this.fdb1.correoElectronico, this.fdb2.correoElectronico];
    if (!formularios[posicion].value) return;
    if (formularios[posicion]?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  consultarMatricula(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].matricula.value) return;
    this.loaderService.activar();
    this.serviciosFunerariosService.consultarMatriculaSiap(formularioEnUso[posicion].matricula.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
        }
      },
      error: (error: HttpErrorResponse): void => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(error.error.mensaje));
      }
    });
  }

  consultarNSS(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].nss.value) return;
    this.loaderService.activar();
    this.serviciosFunerariosService.consultarNSS(formularioEnUso[posicion].nss.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(
            TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje) || "El Número de Seguridad Social no existe.");
        } else {
          let fecha: Date | null = null;
          if (respuesta.datos.fechaNacimiento) {
            let [dia, mes, anio] = respuesta.datos.fechaNacimiento.split('/');
            fecha = new Date(+anio, +mes - 1, +dia);
          }
          let sexo: number = respuesta.datos.sexo?.idSexo == 1 ? 2 : 1;
          formularioEnUso[posicion].curp.setValue(respuesta.datos.curp);
          formularioEnUso[posicion].rfc.setValue(respuesta.datos.rfc);
          formularioEnUso[posicion].nss.setValue(formularioEnUso[posicion].nss.value);
          formularioEnUso[posicion].nombre.setValue(respuesta.datos.nombre);
          formularioEnUso[posicion].primerApellido.setValue(respuesta.datos.primerApellido);
          formularioEnUso[posicion].segundoApellido.setValue(respuesta.datos.segundoApellido);
          formularioEnUso[posicion].sexo.setValue(sexo);
          formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
          formularioEnUso[posicion].nacionalidad.setValue(1);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    });
  }

  sinEspacioDoble(posicion: number): void {
    let formularios = [
      this.fdt.nombre, this.fdt.primerApellido, this.fdt.segundoApellido,
      this.fdts.nombre, this.fdts.primerApellido, this.fdts.segundoApellido,
      this.fdb1.nombre, this.fdb1.primerApellido, this.fdb1.segundoApellido,
      this.fdb2.nombre, this.fdb2.primerApellido, this.fdb2.segundoApellido,
    ]
    if (formularios[posicion].value.charAt(0).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  cambiarSexo(posicion: number): void {
    let formulariosOtroSexo = [this.fdt.otroSexo, this.fdts.otroSexo, this.fdb1.otroSexo, this.fdb2.otroSexo];
    formulariosOtroSexo[posicion].patchValue(null);
  }

  cambiarNacionalidad(posicion: number): void {
    let formularios = [this.fdt.paisNacimiento, this.fdt.lugarNacimiento, this.fdts.paisNacimiento, this.fdts.lugarNacimiento];
    if (posicion === 0) {
      if (this.fdt.nacionalidad.value == 1) {
        formularios[0].reset();
        formularios[1].setValidators(Validators.required);
      } else {
        formularios[1].reset();
        formularios[1].patchValue(null);
        formularios[1].clearValidators();
        formularios[1].updateValueAndValidity();
      }
    } else if (this.fdts.nacionalidad.value == 1) {
      formularios[2].reset();
      formularios[3].setValidators(Validators.required);
    } else {
      formularios[3].reset();
      formularios[3].patchValue(null);
      formularios[3].clearValidators();
      formularios[3].updateValueAndValidity();
    }
  }

  cambiarNacionalidad2(posicion: number): void {
    let formularios = [this.fdb1.paisNacimiento, this.fdb1.lugarNacimiento, this.fdb2.paisNacimiento, this.fdb2.lugarNacimiento];
    if (posicion === 0) {
      if (this.fdb1.nacionalidad.value == 1) {
        formularios[0].reset();
      } else {
        formularios[1].reset();
        formularios[1].patchValue(null);
      }
    } else if (this.fdb2.nacionalidad.value == 1) {
      formularios[2].reset();
    } else {
      formularios[3].reset();
      formularios[3].patchValue(null);
    }
  }

  obtenerEstados() {
    this.registroService.obtenerEstados()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catalogoEstados = mapearArregloTipoDropdown(respuesta.datos, "estado", "idEstado");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerPaises() {
    this.registroService.obtenerPaises()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catalogoPaises = mapearArregloTipoDropdown(respuesta.datos, "pais", "idPais");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerPromotores() {
    this.contratarPSFPAService.obtenerPromotores()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catPromotores = mapearArregloTipoDropdown(respuesta.datos, 'NOMBRE', 'ID_PROMOTOR');
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerPaquete(): void {
    this.loaderService.activar();
    this.contratarPSFPAService
      .obtenerPaquetes()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Exito, msg);
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.paquetes = respuesta.datos || [];
            if (this.paquetes.length == 0) {
              this.alertaService.mostrar(
                TipoAlerta.Info,
                'No hay paquetes asignados al velatorio'
              );
            }
          } else {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Exito, msg);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  abrirPanel(event: MouseEvent): void {
    this.overlayPanel.toggle(event);
  }

  consultarCodigoPostal(posicion: number): void {
    let formularios = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularios[posicion].cp.value) {
      return;
    }
    this.loaderService.activar();
    this.contratarPSFPAService.consutaCP(formularios[posicion].cp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta) {
            this.colonias[posicion] = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
            formularios[posicion].colonia.setValue(respuesta.datos[0].nombre);
            formularios[posicion].municipio.setValue(
              respuesta.datos[0].municipio.nombre
            );
            formularios[posicion].estado.setValue(
              respuesta.datos[0].municipio.entidadFederativa.nombre
            );
            return;
          }
          formularios[posicion].colonia.patchValue(null);
          formularios[posicion].municipio.patchValue(null);
          formularios[posicion].estado.patchValue(null);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  validarRfc(formGroupName?: any) {
    if (formGroupName.rfc.value === '' || !formGroupName.rfc.value) {
      formGroupName.rfc.setErrors(null);
      formGroupName.rfc.clearValidators();
      formGroupName.rfc.updateValueAndValidity();
    } else {
      formGroupName.rfc.setValidators(Validators.maxLength(13));
      formGroupName.rfc.updateValueAndValidity();
      const regex: RegExp = new RegExp(/^([A-Z,Ñ&]{3,4}(\d{2})(0[1-9]|1[0-2])(0[1-9]|1\d|2\d|3[0-1])[A-Z|\d]{3})$/);
      if (!regex.test(formGroupName.rfc.value)) {
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C. no válido.');
        formGroupName.rfc.setErrors({'incorrect': true});
      } else {
        this.registroService.validarCurpRfc({rfc: formGroupName.rfc.value, curp: null}).subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            formGroupName.rfc.setErrors({'incorrect': true});
            if (respuesta.mensaje === 'USUARIO REGISTRADO') {
              this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C ya se encuentra registrado.');
              formGroupName.rfc.patchValue(null);
            } else {
              formGroupName.rfc.setErrors(null);
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error("ERROR: ", error);
          }
        });
      }
    }
  }

  cambioTipoSexo(formGroupName?: any) {
    formGroupName.otro.patchValue(null);
  }

  cambioNacionalidad(formGroupName?: any) {
    formGroupName.paisNacimiento.patchValue(null);
    formGroupName.lugarNacimiento.patchValue(null);
    if (formGroupName.nacionalidad.value === 1) {
      formGroupName.lugarNacimiento.setValidators(Validators.required);
      formGroupName.lugarNacimiento.updateValueAndValidity();
      formGroupName.paisNacimiento.setValue(119);
    } else {
      formGroupName.lugarNacimiento.clearValidators();
      formGroupName.lugarNacimiento.updateValueAndValidity();
    }
  }

  consultarCurpInicial(): void {
    const velatorio = this.idVelatorio || 0;
    this.contratarPSFPAService.obtenerDatosTitular(velatorio).subscribe({
      next: (respuesta) => {
        const [datosUsuario] = respuesta.datos;
        if (!datosUsuario) return;
        let fecha: Date | null = null;
        if (datosUsuario.fechaNacimiento) {
          const [dia, mes, anio] = datosUsuario.fechaNacimiento.split('-');
          fecha = new Date(anio + '/' + mes + '/' + dia);
        }
        this.fdt.rfc.setValue(datosUsuario.rfc)
        this.fdt.nss.setValue(datosUsuario.nss)
        this.fdt.nombre.setValue(datosUsuario.nombre)
        this.fdt.primerApellido.setValue(datosUsuario.primerApellido)
        this.fdt.segundoApellido.setValue(datosUsuario.segundoApellido)
        this.fdt.fechaNacimiento.setValue(fecha);
        let idSexo: number = (datosUsuario.sexo.toUpperCase() === "MUJER" ? 1 : 2)
        if (datosUsuario.sexo.toUpperCase() === "OTRO") idSexo = 3;
        this.fdt.sexo.setValue(idSexo);
        this.fdt.otroSexo.setValue(datosUsuario.otroSexo);
        if (+datosUsuario.idEstadoNacimiento !== 0) {
          this.fdt.nacionalidad.setValue(1);
          this.fdt.lugarNacimiento.setValue(datosUsuario.idEstadoNacimiento)
        } else {
          this.fdt.nacionalidad.setValue(2);
        }
      }
    })
  }

  consultarCurp(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].curp.value) return;
    if (formularioEnUso[posicion].curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }
    this.limpiarFormulario(posicion);
    this.loaderService.activar();
    this.registroService.validarCurpRfc({
      rfc: null,
      curp: formularioEnUso[posicion].curp.value
    }).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.mensaje === 'EXITO') {
          const datosUsuario = respuesta.datos;
          const [dia, mes, anio] = datosUsuario.fechNac.split('-');
          const fecha = new Date(anio + '/' + mes + '/' + dia);
          formularioEnUso[posicion].nombre.setValue(datosUsuario.nombre)
          formularioEnUso[posicion].primerApellido.setValue(datosUsuario.apellido1)
          formularioEnUso[posicion].segundoApellido.setValue(datosUsuario.apellido2)
          formularioEnUso[posicion].sexo.setValue(datosUsuario.sexo === "MUJER" ? 1 : 2)
          formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
        } else if (respuesta.mensaje === 'USUARIO REGISTRADO') {
          const datosUsuario = respuesta.datos[0];
          const [dia, mes, anio] = datosUsuario.fecNacimiento.split('/');
          const fecha = new Date(anio + '/' + mes + '/' + dia);
          if (datosUsuario.otroSexo && datosUsuario.otroSexo !== '') {
            datosUsuario.idSexo = 3;
          }
          formularioEnUso[posicion].nombre.setValue(datosUsuario.nomPersona)
          formularioEnUso[posicion].primerApellido.setValue(datosUsuario.paterno)
          formularioEnUso[posicion].segundoApellido.setValue(datosUsuario.materno)
          formularioEnUso[posicion].sexo.setValue(datosUsuario.idSexo)
          formularioEnUso[posicion].otroSexo.setValue(datosUsuario.otroSexo)
          formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
          if (+datosUsuario.idPais == 119 || !+datosUsuario.idPais) {
            formularioEnUso[posicion].nacionalidad.setValue(1);
            formularioEnUso[posicion].lugarNacimiento.setValue(datosUsuario.idLugarNac)
          } else {
            formularioEnUso[posicion].nacionalidad.setValue(2);
            formularioEnUso[posicion].paisNacimiento.setValue(datosUsuario.idPais)
          }
          datosUsuario.rfc ? formularioEnUso[posicion].rfc.setValue(datosUsuario.rfc) :
            formularioEnUso[posicion].rfc.setValue(formularioEnUso[posicion].rfc.value);
          datosUsuario.nss ? formularioEnUso[posicion].nss.setValue(datosUsuario.nss) :
            formularioEnUso[posicion].nss.setValue(formularioEnUso[posicion].nss.value);
          this.consultarCodigoPostal(posicion);
          this.cambiarNacionalidad(posicion);
          this.cambiarNacionalidad2(posicion);
        } else if (respuesta.mensaje === 'NO EXISTE CURP') {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
        } else {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error,
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
  }

  accentsTidy(s: string): string {
    let r = s.toLowerCase();
    r = r.replace(new RegExp(/[àáâãäå]/g), "a");
    r = r.replace(new RegExp(/æ/g), "ae");
    r = r.replace(new RegExp(/ç/g), "c");
    r = r.replace(new RegExp(/[èéêë]/g), "e");
    r = r.replace(new RegExp(/[ìíîï]/g), "i");
    r = r.replace(new RegExp(/ñ/g), "n");
    r = r.replace(new RegExp(/[òóôõö]/g), "o");
    r = r.replace(new RegExp(/œ/g), "oe");
    r = r.replace(new RegExp(/[ùúûü]/g), "u");
    r = r.replace(new RegExp(/[ýÿ]/g), "y");
    return r;
  };

  consultarRfc(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].rfc.value) return;
    if (formularioEnUso[posicion].rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
    return;
  }

  consultarLugarNacimiento(entidad: string, posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    const entidadEditada = this.accentsTidy(entidad);
    if (entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')) {
      formularioEnUso[posicion].lugarNacimiento.setValue(11);
      return
    }
    if (entidadEditada.toUpperCase().includes('DISTRITO FEDERAL') || entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')) {
      formularioEnUso[posicion].lugarNacimiento.setValue(7);
      return
    }
    this.catalogoEstados.forEach((element: any) => {
      const entidadIteracion = this.accentsTidy(element.label);
      if (entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())) {
        formularioEnUso[posicion].lugarNacimiento.setValue(element.value);
      }
    })
  }

  datosIguales(esIgual: boolean): void {
    if (!esIgual) {
      this.datosTitularSubstitutoForm.enable();
      this.fdts.municipio.disable();
      this.fdts.estado.disable()
      this.cajaValidacionDatosExistentes[2] = false;
      this.cajaValidacionDatosExistentes[3] = false;
      this.datosTitularSubstitutoForm.reset();
      this.fdts.datosIguales.setValue(false);
      return
    }
    this.colonias[1] = [{label: this.fdt.colonia.value, value: this.fdt.colonia.value}]
    this.cajaValidacionDatosExistentes[2] = this.cajaValidacionDatosExistentes[0];
    this.cajaValidacionDatosExistentes[3] = this.cajaValidacionDatosExistentes[1];
    this.datosTitularSubstitutoForm.disable();
    this.fdts.curp.setValue(this.fdt.curp.value);
    this.fdts.rfc.setValue(this.fdt.rfc.value);
    this.fdts.matricula.setValue(this.fdt.matricula.value);
    this.fdts.nss.setValue(this.fdt.nss.value);
    this.fdts.nombre.setValue(this.fdt.nombre.value);
    this.fdts.primerApellido.setValue(this.fdt.primerApellido.value);
    this.fdts.segundoApellido.setValue(this.fdt.segundoApellido.value);
    this.fdts.sexo.setValue(this.fdt.sexo.value);
    this.fdts.otroSexo.setValue(this.fdt.otroSexo.value);
    this.fdts.fechaNacimiento.setValue(this.fdt.fechaNacimiento.value);
    this.fdts.nacionalidad.setValue(this.fdt.nacionalidad.value);
    this.fdts.lugarNacimiento.setValue(this.fdt.lugarNacimiento.value);
    this.fdts.paisNacimiento.setValue(this.fdt.paisNacimiento.value);
    this.fdts.telefono.setValue(this.fdt.telefono.value);
    this.fdts.correoElectronico.setValue(this.fdt.correoElectronico.value);
    this.fdts.cp.setValue(this.fdt.cp.value);
    this.fdts.calle.setValue(this.fdt.calle.value);
    this.fdts.numeroInterior.setValue(this.fdt.numeroInterior.value);
    this.fdts.numeroExterior.setValue(this.fdt.numeroExterior.value);
    this.fdts.colonia.setValue(this.fdt.colonia.value);
    this.fdts.municipio.setValue(this.fdt.municipio.value);
    this.fdts.estado.setValue(this.fdt.estado.value);
    this.cambiarNacionalidad(1);
  }

  limpiarFormulario(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    formularioEnUso[posicion].nombre.patchValue(null);
    formularioEnUso[posicion].primerApellido.patchValue(null);
    formularioEnUso[posicion].segundoApellido.patchValue(null);
    formularioEnUso[posicion].sexo.patchValue(null);
    formularioEnUso[posicion].otroSexo.patchValue(null);
    formularioEnUso[posicion].fechaNacimiento.patchValue(null);
    formularioEnUso[posicion].nacionalidad.patchValue(null);
    formularioEnUso[posicion].lugarNacimiento.patchValue(null);
    formularioEnUso[posicion].paisNacimiento.patchValue(null);
    formularioEnUso[posicion].telefono.patchValue(null);
    formularioEnUso[posicion].correoElectronico.patchValue(null);
    formularioEnUso[posicion].cp.patchValue(null);
    formularioEnUso[posicion].calle.patchValue(null);
    formularioEnUso[posicion].numeroInterior.patchValue(null);
    formularioEnUso[posicion].numeroExterior.patchValue(null);
    formularioEnUso[posicion].colonia.patchValue(null);
    formularioEnUso[posicion].municipio.patchValue(null);
    formularioEnUso[posicion].estado.patchValue(null);

    if (posicion === 0) {
      formularioEnUso[posicion].telefonoFijo.patchValue(null);
    }
  }

  cancelar(): void {
    void this.router.navigate(["./externo-privado/consultar-mis-servicios-en-linea"]);
  }

  guardar(): void {
    if (this.fp.valid && this.fdt.fp.valid && this.fdts.fp.valid && this.fdb1.fp.valid && this.fdb2.fp.valid) {
      this.mostrarModalConfirmacionInformacionCapturada = true;
    }
    this.mostrarModalConfirmacionInformacionCapturada = true;
  }

  confirmarGuardar(): void {
    const configuracionArchivo: OpcionesArchivos = {};
    let objetoGuardar: ContratarPlanSFPA = this.generarObjetoPlanSFPA();
    this.loaderService.activar();
    this.contratarPSFPAService.insertarPlanSFPA(objetoGuardar).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.mostrarRealizarPago = true;
        this.promotorForm.disable();
        this.datosTitularForm.disable();
        this.datosTitularSubstitutoForm.disable();
        this.datosBeneficiario1Form.disable();
        this.datosBeneficiario2Form.disable();
        this.ocultarBtnGuardar = true;
        this.mostrarModalValidacionRegistro = true;
        this.folioConvenio = respuesta?.mensaje;
        this.idRegistro = respuesta.datos?.id;
        this.idPagoSFPA = respuesta.datos?.idPagoMensual;
        this.montoTotalPagar = +respuesta.datos?.pagoMensual;
        if (respuesta.datos?.reporte) {
          const file = new Blob(
            [this.descargaArchivosService.base64_2Blob(
              respuesta.datos.reporte,
              this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
            {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
          const url = window.URL.createObjectURL(file);
          window.open(url);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(5));
      }
    })
  }

  generarObjetoPlanSFPA(): ContratarPlanSFPA {
    let objetoTitularSubstituto = {
      persona: 'titular substituto', //Si es la misma persona no mandar este objeto
      rfc: this.fdts.rfc.value,
      curp: this.fdts.curp.value,
      matricula: this.fdts.matricula?.value ?? "",
      nss: this.fdts.nss.value,
      nomPersona: this.fdts.nombre.value,
      primerApellido: this.fdts.primerApellido.value,
      segundoApellido: this.fdts.segundoApellido.value,
      sexo: this.fdts.sexo.value,
      otroSexo: this.fdts.otroSexo?.value ?? "",
      fecNacimiento: moment(this.fdts.fechaNacimiento.value).format('yyyy-MM-DD'),
      idPais: this.fdts.paisNacimiento?.value ?? 119,
      idEstado: this.fdts.lugarNacimiento?.value ?? null,
      telefono: this.fdts.telefono.value,
      telefonoFijo: null,
      correo: this.fdts.correoElectronico.value,
      tipoPersona: "",
      ine: null,
      cp: {
        desCalle: this.fdts.calle.value,
        numExterior: this.fdts.numeroExterior.value,
        numInterior: this.fdts.numeroInterior?.value ?? "",
        codigoPostal: this.fdts.cp.value,
        desColonia: this.fdts.colonia.value,
        desMunicipio: this.fdts.municipio.value,
        desEstado: this.fdts.estado.value,
      }
    }

    let objetoBeneficiario1 = {
      persona: 'beneficiario 1',
      rfc: this.fdb1.rfc.value,
      curp: this.fdb1.curp.value,
      matricula: this.fdb1.matricula?.value ?? "",
      nss: this.fdb1.nss.value,
      nomPersona: this.fdb1.nombre.value,
      primerApellido: this.fdb1.primerApellido.value,
      segundoApellido: this.fdb1.segundoApellido.value,
      sexo: this.fdb1.sexo.value,
      otroSexo: this.fdb1.otroSexo?.value ?? "",
      fecNacimiento: this.fdb1.fechaNacimiento.value ? moment(this.fdb1.fechaNacimiento.value).format('yyyy-MM-DD') : null,
      idPais: this.fdb1.paisNacimiento?.value ?? 119,
      idEstado: this.fdb1.lugarNacimiento?.value ?? null,
      telefono: this.fdb1.telefono.value,
      telefonoFijo: null,
      correo: this.fdb1.correoElectronico.value,
      tipoPersona: "",
      ine: null,
      cp: {
        desCalle: this.fdb1.calle.value,
        numExterior: this.fdb1.numeroExterior.value,
        numInterior: this.fdb1.numeroInterior?.value ?? "",
        codigoPostal: this.fdb1.cp.value,
        desColonia: this.fdb1.colonia.value,
        desMunicipio: this.fdb1.municipio.value,
        desEstado: this.fdb1.estado.value,
      }
    }

    let objetoBeneficiario2 = {
      persona: 'beneficiario 2',
      rfc: this.fdb2.rfc.value,
      curp: this.fdb2.curp.value,
      matricula: this.fdb2.matricula?.value ?? "",
      nss: this.fdb2.nss.value,
      nomPersona: this.fdb2.nombre.value,
      primerApellido: this.fdb2.primerApellido.value,
      segundoApellido: this.fdb2.segundoApellido.value,
      sexo: this.fdb2.sexo.value,
      otroSexo: this.fdb2.otroSexo?.value ?? "",
      fecNacimiento: this.fdb2.fechaNacimiento.value ? moment(this.fdb2.fechaNacimiento.value).format('yyyy-MM-DD') : null,
      idPais: this.fdb2.paisNacimiento?.value ?? 119,
      idEstado: this.fdb2.lugarNacimiento?.value ?? null,
      telefono: this.fdb2.telefono.value,
      telefonoFijo: null,
      correo: this.fdb2.correoElectronico.value,
      tipoPersona: "",
      ine: null,
      cp: {
        desCalle: this.fdb2.calle.value,
        numExterior: this.fdb2.numeroExterior.value,
        numInterior: this.fdb2.numeroInterior?.value ?? "",
        codigoPostal: this.fdb2.cp.value,
        desColonia: this.fdb2.colonia.value,
        desMunicipio: this.fdb2.municipio.value,
        desEstado: this.fdb2.estado.value,
      }
    }

    const numPagoTmp = this.numeroPagos.find((e: TipoDropdown) => e.value === this.fdt.numeroPago.value)?.label ?? 0;
    this.numPago = +numPagoTmp;

    let objetoTitular: ContratarPlanSFPA = {
      idVelatorio: this.idVelatorio ? +this.idVelatorio : null,
      idTipoContratacion: 1,
      idPaquete: this.fdt.paquete.value,
      monPrecio: this.paqueteSeleccionado.monPrecio,
      idTipoPagoMensual: this.fdt.numeroPago.value,
      numPagoMensual: this.numPago,
      indTitularSubstituto: this.fdts.datosIguales.value ? 1 : 0, //Cuando te vas a contratante SI 1 no 0
      indPromotor: this.fp.gestionadoPorPromotor.value ? 1 : 0,// si = 1, No = 0
      idPromotor: this.fp.promotor.value,
      titularesBeneficiarios: [
        {
          persona: 'titular',
          rfc: this.fdt.rfc.value,
          curp: this.fdt.curp.value,
          matricula: this.fdt.matricula?.value ?? "",
          nss: this.fdt.nss.value,
          nomPersona: this.fdt.nombre.value,
          primerApellido: this.fdt.primerApellido.value,
          segundoApellido: this.fdt.segundoApellido.value,
          sexo: this.fdt.sexo.value,
          otroSexo: this.fdt.otroSexo?.value ?? "",
          fecNacimiento: this.fdt.fechaNacimiento.value ? moment(this.fdt.fechaNacimiento.value).format('yyyy-MM-DD') : null,
          idPais: this.fdt.paisNacimiento?.value ?? 119,
          idEstado: this.fdt.lugarNacimiento?.value ?? null,
          telefono: this.fdt.telefono.value,
          telefonoFijo: this.fdt.telefonoFijo.value,
          correo: this.fdt.correoElectronico.value,
          tipoPersona: "",
          ine: null,
          cp: {
            desCalle: this.fdt.calle.value,
            numExterior: this.fdt.numeroExterior.value,
            numInterior: this.fdt.numeroInterior?.value ?? "",
            codigoPostal: this.fdt.cp.value,
            desColonia: this.fdt.colonia.value,
            desMunicipio: this.fdt.municipio.value,
            desEstado: this.fdt.estado.value,
          }
        }
      ]
    }
    if (objetoTitular.indTitularSubstituto == 0) {
      objetoTitular.titularesBeneficiarios.push(objetoTitularSubstituto)
    }
    if (objetoBeneficiario1.curp && objetoBeneficiario1.curp !== '') objetoTitular.titularesBeneficiarios.push(objetoBeneficiario1);
    if (objetoBeneficiario2.curp && objetoBeneficiario2.curp !== '') objetoTitular.titularesBeneficiarios.push(objetoBeneficiario2);

    return objetoTitular;
  }

  get fp() {
    return this.promotorForm.controls;
  }

  get fdt() {
    return this.datosTitularForm.controls;
  }

  get fdts() {
    return this.datosTitularSubstitutoForm.controls;
  }

  get fdb1() {
    return this.datosBeneficiario1Form.controls;
  }

  get fdb2() {
    return this.datosBeneficiario2Form.controls;
  }
}
