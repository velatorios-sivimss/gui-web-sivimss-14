import {Component, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {OverlayPanel} from 'primeng/overlaypanel';
import {
  ModalRegistrarBeneficiarioComponent
} from './components/modal-registrar-beneficiario/modal-registrar-beneficiario.component';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {
  ModalEditarBeneficiarioComponent
} from './components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import {
  DIEZ_ELEMENTOS_POR_PAGINA,
  PATRON_CORREO, PATRON_RFC,
} from 'projects/sivimss-gui/src/app/utils/constantes';
import {
  ModalDesactivarBeneficiarioComponent
} from './components/modal-desactivar-beneficiario/modal-desactivar-beneficiario.component';
import {
  BusquedaConveniosPFServic
} from '../../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {finalize} from 'rxjs';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
  DatosGeneralesContratante
} from '../../../consulta-convenio-prevision-funeraria/models/DatosGeneralesContratante.interface';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {
  CATALOGO_ENFERMEDAD_PREEXISTENTE
} from 'projects/sivimss-gui/src/app/modules/convenios-prevision-funeraria/constants/catalogos-funcion';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {Beneficiarios} from '../../../consulta-convenio-prevision-funeraria/models/Beneficiarios.interface';
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {SolicitudPagos} from "../../../../models/solicitud-pagos.interface";
import {TransaccionPago} from "../../../../models/transaccion-pago.interface";

@Component({
  selector: 'app-contratar-convenio-prevision-funeraria',
  templateUrl: './contratar-convenio-prevision-funeraria.component.html',
  styleUrls: ['./contratar-convenio-prevision-funeraria.component.scss'],
})
export class ContratarConvenioPrevisionFunerariaComponent implements OnInit, OnDestroy {
  formPersona!: FormGroup;
  formEmpresa!: FormGroup;
  promotores: any[] = [];
  paquetes: any[] = [];
  paises: any[] = [];
  beneficiarios: Beneficiarios[] = [];
  personasGrupo: any[] = [];
  colonias: any[] = [];
  coloniasEmpresa: any[] = [];
  datosGeneralesContrante: DatosGeneralesContratante =
    {} as DatosGeneralesContratante;
  fechaActual: Date = new Date();
  enfermedadPrexistenteArray: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;
  parentesco: any[] = [];
  itemBeneficiarios: Beneficiarios = {} as Beneficiarios;

  @ViewChild('overlayPanel')
  overlayPanel!: OverlayPanel;
  @ViewChild('overlayPanelGrupo')
  overlayPanelGrupo!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = this.personasGrupo.length;

  mostrarModalTipoArchivoIncorrecto: boolean = false;
  mostrarModalConfirmacionInformacionCapturada: boolean = false;
  mostrarModalValidacionRegistro: boolean = false;
  mostrarModalDesactivarBeneficiarioGrupo: boolean = false;
  validaIne: boolean = false;
  mostrarPorPersona: boolean = true;
  mostrarPorContrato: boolean = false;
  muestraOtraEnfermedad: boolean = false;
  mostrarBontonGaurdarPersona: boolean = true;
  mostrarBotonAgregarBeneficiario: boolean = false;
  deshabilitarTipo: boolean = false;
  seleccionarPromotorEmpresa: boolean = false;

  TIPO_CONTRATACION_PERSONA: string = 'persona';
  TIPO_CONTRATACION_GRUPO: string = 'grupo';
  velatorio: string = '';
  folioConvenio: string = '';
  nombreCompleto: string = '';
  delegacion: string = '';
  fecha: string = '';
  inputSeleccionado: string = '';

  nombreIne: string | null = null;
  validaCurp: boolean = false;
  nombreCurp: string | null = null;
  validaRfc: boolean = false;
  nombreRfc: string | null = null;
  archivoIne: string | null = null;
  archivoCurp: string | null = null;
  archivoRfc: string | null = null;
  seleccionarPromotor: boolean = false;
  idPaquete: string | null = null;
  tipoContratacion: string = 'persona';
  idConvenioPf: number | null = null;
  idDomicilio: number | null = null;
  idVelatorio: number | null = null;
  idContratante: number | null = null;
  claseRadioPaquetes: string = "radioPaquetes";
  mostrarMensajeGuardado: boolean = false;
  mensajeConfirmacionGuardado: string = "";
  banderaCheckPersona: boolean = true;
  banderaCheckGrupo: boolean = true;
  refBeneficiario!: DynamicDialogRef;
  confirmacionModalCerrar: boolean = false;
  mensajeGenerico: string = '';
  mostrarMensajeGenerico: boolean = false;

  confirmacionGuardado: boolean = false;
  mensajeConfirmacionGuardar: string = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly formBuilderEmpresa: FormBuilder,
    public readonly dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly router: Router,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.cargarScript(() => {
    });
    this.subscripcionMotorPagos()
    this.formPersona = this.crearFormPersona();
    this.formEmpresa = this.crearFormularioEmpresa();
    setTimeout(() => {
      this.buscarDatosGenerales();
    }, 100);

    setTimeout(() => {
      this.buscarPromotores();
    }, 200);
    setTimeout(() => {
      this.buscarPaises();
    }, 300);
    setTimeout(() => {
      this.buscarPaquete();
    }, 600);
    setTimeout(() => {
      this.buscarParentesco();
      this.mensajeConfirmacionGuardado = this.mensajesSistemaService.obtenerMensajeSistemaPorId(160)
      this.mensajeConfirmacionGuardar = this.mensajesSistemaService.obtenerMensajeSistemaPorId(195)
    }, 900);

    this.idVelatorio = this.rutaActiva.snapshot.queryParams.idVelatorio;
    this.velatorio = this.rutaActiva.snapshot.queryParams.velatorio;
    this.delegacion = this.rutaActiva.snapshot.queryParams.delegacion;
    if (this.rutaActiva.snapshot.queryParams.idConvenio)
      this.buscarConvenioEmpresa(
        this.rutaActiva.snapshot.queryParams.idConvenio
      );
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
    this.consultaConveniosService.guardarDatosPago(solicitud).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const id = respuesta.datos.idPagoLinea;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago realizado con éxito.');
        void this.router.navigate(['recibo-de-pago', id], {relativeTo: this.rutaActiva});
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
    return {
      fecTransaccion: pago.transaction.payment_date, // pagos linea
      folio: this.folioConvenio,
      folioPago: "TEST-1", // pagos linea
      idCliente: 433, //pagos linea (local storage)
      idFlujoPagos: 2,
      idMetodoPago, // debito o credito payment_method_type
      idRegistro: this.idConvenioPf, // idConvenio
      idVelatorio: this.idVelatorio,
      importe: 1,
      nomContratante: this.nombreCompleto,
      nomTitular: "Mario Dominguez Serrano", // pagos
      numAprobacion: pago.transaction.authorization_code, // pagos
      numTarjeta: pago.card.number, // pagos number
      referencia: pago.transaction.id // pagos transaction_reference

    }
  }

  clickContratacion(tipoContratacion: string): void {
    this.mostrarPorPersona = false;
    this.mostrarPorContrato = true;
    if (tipoContratacion === 'persona') {
      this.mostrarPorPersona = true;
      this.mostrarPorContrato = false;
    }
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
    const elemento_ref = document.querySelector('.realizar-pago');
    if (!elemento_ref) return;
    //TODO Validar referencia a mandar
    elemento_ref.setAttribute('data-objeto', JSON.stringify({referencia: 'NPF', monto: 1}));
  }

  crearFormPersona(): FormGroup {
    return this.formBuilder.group({
      tipoContratacion: [
        {
          value: this.TIPO_CONTRATACION_PERSONA,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      datosPersonales: this.formBuilder.group({
        matricula: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        rfc: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        curp: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        nombre: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        otro: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        idVelatorio: [
          {
            value: this.rutaActiva.snapshot.queryParams.idVelatorio,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        idContratante: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        idPersona: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
      }),
      domicilio: this.formBuilder.group({
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(5)],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        pais: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(45)],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(45)],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.maxLength(45)],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [
            Validators.required,
            Validators.pattern(PATRON_CORREO),
            Validators.maxLength(45),
          ],
        ],
        telefono: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(10)],
        ],
        enfermedadPrexistente: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
      }),

      formPaquete: this.formBuilder.group({
        paquete: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator]
        ]
      }),
      archivos: this.formBuilder.group({
        archivoIne: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        archivoCurp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        archivoRfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),


      gestionadoPorPromotor: [
        {
          value: true,
          disabled: false,
        },
        [Validators.nullValidator,
          Validators.required],
      ],
      promotor: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator,
          Validators.required],
      ],
    });
  }

  crearFormularioEmpresa(): FormGroup {
    return this.formBuilderEmpresa.group({
      datosGrupo: this.formBuilderEmpresa.group({
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(45)],
        ],
        razonSocial: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(45)],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(13), Validators.pattern(PATRON_RFC)],
        ],
        pais: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(5)],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(45)],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(45)],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.maxLength(45)],
        ],
        telefono: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.maxLength(10)],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [
            Validators.pattern(PATRON_CORREO),
            Validators.maxLength(45),
          ],
        ],
      }),
      gestionadoPorPromotor: [
        {
          value: true,
          disabled: false,
        },
        [Validators.nullValidator,
          Validators.required],
      ],
      promotor: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator,
          Validators.required],
      ],
    });
  }

  buscarDatosGenerales(): void {
    this.loaderService.activar();
    this.consultaConveniosService
      .buscarDatosGeneralesContratante(
        this.rutaActiva.snapshot.queryParams.idVelatorio
      )
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.datosGeneralesContrante = respuesta.datos;
            this.folioConvenio = '';
            this.nombreCompleto =
              this.datosGeneralesContrante.nombre +
              ' ' +
              this.datosGeneralesContrante.primerApellido +
              ' ' +
              this.datosGeneralesContrante.segundoApellido;
            this.delegacion = this.datosGeneralesContrante.delegacion;
            this.fecha = this.datosGeneralesContrante.fecha;
            this.llenarForm(this.datosGeneralesContrante);
          } else this.mostrarMensaje(Number(respuesta.mensaje));
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
  }

  buscarPromotores(): void {
    this.loaderService.activar();
    this.consultaConveniosService
      .buscarPromotores()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito' && respuesta.datos != null) {
            this.promotores = respuesta.datos;
          } else this.mostrarMensaje(Number(respuesta.mensaje));
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
  }

  buscarPaises(): void {
    this.loaderService.activar();
    this.consultaConveniosService
      .buscarPaises()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.paises = respuesta.datos;
          } else this.mostrarMensaje(Number(respuesta.mensaje));
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
  }

  buscarPaquete(): void {
    this.loaderService.activar();
    this.consultaConveniosService
      .buscarPaquetes(this.rutaActiva.snapshot.queryParams.idVelatorio)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.mostrarMensaje(Number(respuesta.mensaje));
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
          } else this.mostrarMensaje(Number(respuesta.mensaje));
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
  }

  buscarParentesco(): void {
    this.consultaConveniosService
      .parentesco()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }
          if (respuesta.mensaje === 'Exito')
            this.parentesco = mapearArregloTipoDropdown(
              respuesta.datos,
              'nombreParentesco',
              'idParentesco'
            );
          else {
            this.mostrarMensaje(Number(respuesta.mensaje));
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
          );
        },
      });
  }

  get f() {
    return this.formPersona.controls;
  }

  get formEm() {
    return this.formEmpresa.controls;
  }

  get datosPersonales() {
    return (this.formPersona.controls['datosPersonales'] as FormGroup).controls;
  }

  get domicilio() {
    return (this.formPersona.controls['domicilio'] as FormGroup).controls;
  }

  get datosGrupo() {
    return (this.formEmpresa.controls['datosGrupo'] as FormGroup).controls;
  }

  get datosPromotor() {
    return (this.formEmpresa.controls['promotor'] as FormGroup).controls;
  }

  get archivos() {
    return (this.formPersona.controls['archivos'] as FormGroup).controls;
  }

  llenarForm(datosGeneralesContrante: DatosGeneralesContratante): void {
    this.datosPersonales.nombre.setValue(datosGeneralesContrante.nombre);
    this.datosPersonales.curp.setValue(datosGeneralesContrante.curp);
    this.datosPersonales.fechaNacimiento.setValue(
      datosGeneralesContrante.fechaNacimiento
    );
    this.datosPersonales.primerApellido.setValue(
      datosGeneralesContrante.primerApellido
    );
    this.datosPersonales.segundoApellido.setValue(
      datosGeneralesContrante.segundoApellido
    );
    this.datosPersonales.lugarNacimiento.setValue(
      datosGeneralesContrante.estado
    );
    this.datosPersonales.matricula.setValue(datosGeneralesContrante.matricula);
    this.datosPersonales.rfc.setValue(datosGeneralesContrante.rfc);
    this.datosPersonales.idPersona.setValue(datosGeneralesContrante.idPersona);
    this.datosPersonales.sexo.setValue(datosGeneralesContrante.sexo);
    this.datosPersonales.otro.setValue(datosGeneralesContrante.otroSexo);
    this.datosPersonales.matricula.setValue(datosGeneralesContrante.matricula);
  }

  handleClick(controlName: string): void {
    let elements = document.getElementById(controlName);
    this.inputSeleccionado = controlName;
    elements?.click();
  }

  getBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  addAttachment(fileInput: any): void {
    const extensionesPermitidas = ['pdf', 'gif', 'jpeg', 'jpg'];
    const maxSize = 5000000;
    const fileReaded = fileInput.target.files[0];
    const tipoArchivo = fileReaded.type.split('/');
    if (!extensionesPermitidas.includes(tipoArchivo[1])) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(97));
      return
    }

    this.mensajeGenerico = this.mensajesSistemaService.obtenerMensajeSistemaPorId(98)

    if (fileReaded.size > maxSize) {
      const tamanioEnMb = maxSize / 1000000;
      this.alertaService.mostrar(
        TipoAlerta.Info,
        `El tamaño máximo permititido es de ${tamanioEnMb} MB`
      );

      if (this.inputSeleccionado == 'archivoIneUpload')
        this.archivos.archivoIne.setValue(null);
      else if (this.inputSeleccionado == 'archivoCURPUpload')
        this.archivos.archivoCurp.setValue(null);
      else if (this.inputSeleccionado == 'archivoRFCUpload')
        this.archivos.archivoRfc.setValue(null);

      return;
    }

    let nombreArchivo = '';

    this.getBase64(fileReaded).then((data: any) => {
      if (this.inputSeleccionado == 'archivoIneUpload') {
        nombreArchivo =
          'INE-' + this.datosPersonales.curp.value + '.' + tipoArchivo[1];
        this.archivos.archivoIne.setValue(nombreArchivo);
        this.nombreIne = nombreArchivo;
        this.validaIne = true;
        this.archivoIne = data;
      } else if (this.inputSeleccionado == 'archivoCURPUpload') {
        nombreArchivo =
          'CURP-' + this.datosPersonales.curp.value + '.' + tipoArchivo[1];
        this.archivos.archivoCurp.setValue(nombreArchivo);
        this.validaCurp = true;
        this.nombreCurp = nombreArchivo;
        this.archivoCurp = data;
      } else if (this.inputSeleccionado == 'archivoRFCUpload') {
        nombreArchivo =
          'RFC-' + this.datosPersonales.curp.value + '.' + tipoArchivo[1];
        this.archivos.archivoRfc.setValue(nombreArchivo);
        this.validaRfc = true;
        this.nombreRfc = nombreArchivo;
        this.nombreRfc = nombreArchivo;
        this.archivoRfc = data;
      }
    });
    this.mostrarMensajeGenerico = true;
  }

  guardarEmpresa(): void {
    if (!this.formEmpresa.valid) {
      return;
    }
    this.banderaCheckPersona = false;

    let parametros = {
      idVelatorio: this.rutaActiva.snapshot.queryParams.idVelatorio,
      idPromotor: this.formEmpresa.controls.promotor?.value ?? null,
      calle: this.datosGrupo.calle.value,
      noExterior: this.datosGrupo.numeroExterior.value,
      noInterior: this.datosGrupo.numeroInterior.value,
      cp: this.datosGrupo.codigoPostal.value,
      colonia: this.datosGrupo.asentamientoColonia.value,
      municipio: this.datosGrupo.municipio.value,
      estado: this.datosGrupo.estado.value,
      nombre: this.datosGrupo.nombre.value,
      razonSocial: this.datosGrupo.razonSocial.value,
      rfcEmpresa: this.datosGrupo.rfc.value,
      idPais: this.datosGrupo.pais.value,
      telefono: this.datosGrupo.telefono.value,
      correo: this.datosGrupo.correoElectronico.value,
    };

    this.consultaConveniosService
      .agregarContratoEmpresa(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              'Grupo agregado correctamente'
            );

            let datos = respuesta.datos;
            this.mostrarBontonGaurdarPersona = false;
            this.idConvenioPf = datos.idConvenioPF;
            this.idDomicilio = datos.idDomicilio;
            this.folioConvenio = datos.folio;
            this.idContratante = datos.idContratante;
            this.mostrarBotonAgregarBeneficiario = true;
            this.deshabilitarTipo = true;
          } else {
            console.log(respuesta);
            this.mostrarMensaje(5);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(5);
        },
      });
  }

  guardarPersona(): void {
    if (!this.formPersona.valid) {
      return;
    }
    if (this.idPaquete === null) {
      this.mostrarMensaje(900);
      return;
    }

    this.banderaCheckGrupo = false;

    this.loaderService.activar();
    let parametros = {
      idDomicilio: this.datosGeneralesContrante.idDomicilio,
      idVelatorio: this.rutaActiva.snapshot.queryParams.idVelatorio,
      idTipoContratacion: 1,
      idPromotor: this.f.promotor.value,
      idPaquete: this.idPaquete,
      idEnfermedad: this.domicilio.enfermedadPrexistente.value,
      otraEnfermedad: this.domicilio.otro.value,
      idPersona: this.datosGeneralesContrante.idPersona,
      cveMatricula: this.datosGeneralesContrante.matricula,
      calle: this.domicilio.calle.value,
      noExterior: this.domicilio.numeroExterior.value,
      noInterior: this.domicilio.numeroInterior.value,
      cp: this.domicilio.codigoPostal.value,
      colonia: this.domicilio.asentamientoColonia.value,
      municipio: this.domicilio.municipio.value,
      estado: this.domicilio.estado.value,
      validaIne: this.validaIne,
      nombreIne: this.nombreIne,
      validaCurp: this.validaCurp,
      nombreCurp: this.nombreCurp,
      validaRfc: this.validaRfc,
      nombreRfc: this.nombreRfc,
      archivoIne: this.archivoIne,
      archivoCurp: this.archivoCurp,
      archivoRfc: this.archivoRfc,
    };

    this.consultaConveniosService
      .agregarContratoPersona(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {

            let datos = respuesta.datos;

            this.mostrarBontonGaurdarPersona = false;
            this.idConvenioPf = datos.idConvenioPF;
            this.idDomicilio = datos.idDomicilio;
            this.folioConvenio = datos.folio;
            this.idContratante = datos.idContratante;
            this.mostrarBotonAgregarBeneficiario = true;
            this.deshabilitarTipo = true;
          } else {
            this.mostrarMensaje(5);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(5);
        },
      });
  }

  mostrarMensaje(numero: number): void {
    switch (numero) {
      case 5:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al guardar la información. Intenta nuevamente.'
        );
        break;
      case 33:
        this.alertaService.mostrar(TipoAlerta.Info, 'R.F.C. no valido.');
        break;
      case 52:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al consultar la información.'
        );
        break;
      case 184:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El servicio de RENAPO  no esta disponible.'
        );
        break;
      case 185:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El código postal no existe.'
        );
        break;
      case 186:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'El servicio no responde, no permite más llamadas.'
        );
        break;
      case 187:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
        break;

      case 802:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El beneficiario ya fue registrado con anterioridad, ingrese un beneficiario diferente.'
        );
        break;

      case 900:
        this.alertaService.mostrar(TipoAlerta.Info, 'Selecciona un paquete.');
        break;
      default:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
        break;
    }
  }

  cambioEnfermedadPrexistente(): void {
    let valorEnfermedad = this.domicilio.enfermedadPrexistente.value;
    this.muestraOtraEnfermedad = false;
    this.domicilio.otro.setValue(null);

    if (Number(valorEnfermedad) == 4) {
      this.muestraOtraEnfermedad = true;
    }
  }

  buscarCodigoPostal(): void {
    this.loaderService.activar();
    this.consultaConveniosService
      .buscarCodigoPostal(this.domicilio.codigoPostal.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (!respuesta) {
            this.mostrarMensaje(185);
            this.limpiaInputsCp();
            return;
          }
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.limpiaInputsCp();
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            if (respuesta.datos.length == 0) {
              this.limpiaInputsCp();
              this.alertaService.mostrar(
                TipoAlerta.Info,
                'Ingrese un código postal valido'
              );
            } else {
              this.colonias = mapearArregloTipoDropdown(
                respuesta.datos,
                'nombre',
                'nombre'
              );
              this.domicilio.asentamientoColonia.setValue(
                respuesta.datos[0].nombre
              );
              this.domicilio.estado.setValue(
                respuesta.datos[0].municipio.entidadFederativa.nombre
              );
              this.domicilio.municipio.setValue(
                respuesta.datos[0].municipio.nombre
              );
              this.domicilio.pais.setValue(119);
            }
          } else {
            console.log(respuesta);
            this.limpiaInputsCp();
            this.mostrarMensaje(Number(respuesta.mensaje));
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
          );
        },
      });
  }

  limpiaInputsCp(): void {
    this.colonias = [];
    this.domicilio.asentamientoColonia.setValue(null);
    this.domicilio.estado.setValue(null);
    this.domicilio.municipio.setValue(null);
  }

  buscarCodigoPostalEmpresa(): void {
    if (this.datosGrupo.codigoPostal.value.length < 5) return;

    this.loaderService.activar();
    this.consultaConveniosService
      .buscarCodigoPostal(this.datosGrupo.codigoPostal.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
          if (!respuesta) {
            this.mostrarMensaje(185);
            this.limpiaInputsCpEmpresa();
            return;
          }
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.limpiaInputsCpEmpresa();
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            if (respuesta.datos.length == 0) {
              this.limpiaInputsCpEmpresa();
              this.alertaService.mostrar(
                TipoAlerta.Info,
                'Ingrese un código postal valido'
              );
            } else {
              this.coloniasEmpresa = mapearArregloTipoDropdown(
                respuesta.datos,
                'nombre',
                'nombre'
              );
              this.datosGrupo.asentamientoColonia.setValue(
                respuesta.datos[0].nombre
              );
              this.datosGrupo.estado.setValue(
                respuesta.datos[0].municipio.entidadFederativa.nombre
              );
              this.datosGrupo.municipio.setValue(
                respuesta.datos[0].municipio.nombre
              );
              this.datosGrupo.pais.setValue(119);
            }
          } else {
            console.log(respuesta);

            this.limpiaInputsCpEmpresa();
            this.mostrarMensaje(Number(respuesta.mensaje));
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
          );
        },
      });
  }

  limpiaInputsCpEmpresa(): void {
    this.coloniasEmpresa = [];
    this.datosGrupo.asentamientoColonia.setValue(null);
    this.datosGrupo.estado.setValue(null);
    this.datosGrupo.municipio.setValue(null);
  }

  detalleConvenio() {
    let idPlan = this.idConvenioPf + '';
    this.consultaConveniosService
      .detalleConvenio(idPlan)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.beneficiarios = respuesta.datos.beneficiarios || [];
            console.log('los beneficarios', this.beneficiarios);
          } else {
            this.beneficiarios = [];
            this.mostrarMensaje(Number(respuesta.mensaje));
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
  }

  seleccionaPaquete(idPaquete: string): void {
    this.idPaquete = idPaquete;
  }

  clickSeleccionaPromotor(proviene: string): void {
    this.formPersona.controls['promotor'].clearValidators();
    this.formEmpresa.controls['promotor'].clearValidators();
    this.formPersona.controls['promotor'].updateValueAndValidity();
    this.formEmpresa.controls['promotor'].updateValueAndValidity();
    if (proviene == 'persona') {
      this.seleccionarPromotor = !this.formPersona.value.gestionadoPorPromotor;
      if (!this.seleccionarPromotor) this.formPersona.controls['promotor'].setValidators(Validators.required);
      this.formPersona.controls['promotor'].setValue(null);
    } else {
      if (this.formEmpresa.disabled) return;
      this.seleccionarPromotorEmpresa = !this.formEmpresa.value.gestionadoPorPromotor;
      if (!this.seleccionarPromotorEmpresa) this.formEmpresa.controls['promotor'].setValidators(Validators.required);
      this.formEmpresa.controls['promotor'].setValue(null);
    }
  }

  abrirModalRegistroNuevoBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    this.refBeneficiario = this.dialogService.open(ModalRegistrarBeneficiarioComponent, {
      header: 'Registrar beneficiario',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        idConvenio: this.idConvenioPf,
        parentesco: this.parentesco,
        idVelatorio: this.idVelatorio,
        velatorio: this.velatorio,
        idContratante: this.idContratante,
      },
    });
    this.refBeneficiario.onClose.subscribe((respuesta: any) => {
      if (respuesta == 'exito') {
        this.alertaService.mostrar(
          TipoAlerta.Exito,
          'Beneficiario actualizado correctamente'
        );
        this.detalleConvenio();
      }
    });
  }

  abrirModalEditarBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalEditarBeneficiarioComponent, {
      header: 'Editar beneficiario',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        item: this.itemBeneficiarios,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta === 'exito') {
        this.detalleConvenio();
      }
    });
  }

  abrirModalDesactivarBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalDesactivarBeneficiarioComponent, {
      header: 'Desactivar beneficiario',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        item: this.itemBeneficiarios,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta === 'exito') {
        this.detalleConvenio();
      }
    });
  }

  abrirPanel(event: MouseEvent, itemBeneficiarios: Beneficiarios): void {
    this.overlayPanel.toggle(event);
    this.itemBeneficiarios = itemBeneficiarios;
  }

  abrirPanelGrupo(event: MouseEvent): void {
    this.overlayPanelGrupo.toggle(event);
  }


  buscarConvenioEmpresa(idConvenio: number): void {
    this.banderaCheckPersona = false;
    this.mostrarBontonGaurdarPersona = false;
    this.personasGrupo = [];
    this.tipoContratacion = "grupo"
    this.clickContratacion('grupo')
    this.consultaConveniosService
      .consultarConvenioEmpresa(idConvenio)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            const datosEmpresa = respuesta.datos.datosEmpresaResponse;
            this.personasGrupo = respuesta.datos.personasEmpresa || [];
            this.totalElementos = this.personasGrupo.length;
            this.coloniasEmpresa = [{label: datosEmpresa.colonia, value: datosEmpresa.colonia}]
            this.datosGrupo.nombre.setValue(datosEmpresa.nombre);
            this.datosGrupo.razonSocial.setValue(datosEmpresa.razonSocial);
            this.datosGrupo.rfc.setValue(datosEmpresa.rfc);
            this.datosGrupo.pais.setValue(datosEmpresa.idPais);
            this.datosGrupo.codigoPostal.setValue(datosEmpresa.cp);
            this.datosGrupo.asentamientoColonia.setValue(datosEmpresa.colonia);
            this.datosGrupo.municipio.setValue(datosEmpresa.municipio);
            this.datosGrupo.estado.setValue(datosEmpresa.estado);
            this.datosGrupo.calle.setValue(datosEmpresa.calle);
            this.datosGrupo.numeroInterior.setValue(datosEmpresa.numInterior);
            this.datosGrupo.numeroExterior.setValue(datosEmpresa.numExterior);
            this.datosGrupo.telefono.setValue(datosEmpresa.telefono);
            this.datosGrupo.correoElectronico.setValue(datosEmpresa.correo);
            this.formEmpresa.controls.gestionadoPorPromotor.setValue(datosEmpresa.idPromotor ? 1 : 0);
            this.formEmpresa.controls.promotor.setValue(datosEmpresa.idPromotor);
            this.formEmpresa.disable()
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.mostrarMensaje(0);
        },
      });
  }

  validarCorreoElectronico(posicion: number): void {
    switch (posicion) {
      case 1:
        if (this.domicilio.correoElectronico?.errors?.pattern) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
        }
        break;
      case 2:
        if (this.datosGrupo.correoElectronico?.errors?.pattern) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
        }
        break;
      default:
        break;
    }
  }

  agregarPersonaGrupo() {
    this.router.navigate(['externo-privado/contratar-convenio-de-prevision-funeraria/registro-contratacion-convenio-de-prevision-funeraria/registro-de-persona-del-grupo'],
      {
        queryParams: {
          idVelatorio: this.idVelatorio,
          velatorio: this.velatorio,
          idConvenio: this.validarIdConvenio(),
          delegacion: this.delegacion,
          folioConvenio: this.validarFolioConvenioEmpresa()
        }
      }
    );
  }

  guardarConvenio(): void {
    this.confirmacionModalCerrar = true;
    this.mostrarMensajeGuardado = false;
  }

  validarFolioConvenioEmpresa(): string {
    if (this.rutaActiva.snapshot.queryParams.folioConvenio) {
      return this.rutaActiva.snapshot.queryParams.folioConvenio
    } else {
      return this.folioConvenio
    }
  }

  validarIdConvenio(): any {
    if (this.rutaActiva.snapshot.queryParams.idConvenio) {
      return this.rutaActiva.snapshot.queryParams.idConvenio
    } else {
      return this.idConvenioPf
    }
  }


  validarRfc(): void {
    if (this.datosGrupo.rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
  }

  validaBotonRealizarPago(): boolean {
    if (this.banderaCheckGrupo == false && this.confirmacionModalCerrar) return false
    return true
  }

  validarBotonGuardado(): void {
    this.confirmacionGuardado = false;
    this.tipoContratacion.includes('grupo') ? this.guardarEmpresa() : this.guardarPersona()
  }

  ngOnDestroy(): void {
    if (this.refBeneficiario) {
      this.refBeneficiario.destroy();
    }
  }
}
