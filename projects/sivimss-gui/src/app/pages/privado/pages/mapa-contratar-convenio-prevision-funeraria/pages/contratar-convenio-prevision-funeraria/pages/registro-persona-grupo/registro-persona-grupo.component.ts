import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ModalRegistrarBeneficiarioComponent } from '../../components/modal-registrar-beneficiario/modal-registrar-beneficiario.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalEditarBeneficiarioComponent } from '../../components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import {
  DIEZ_ELEMENTOS_POR_PAGINA,
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from 'projects/sivimss-gui/src/app/utils/constantes';
import { ModalDesactivarBeneficiarioComponent } from '../../components/modal-desactivar-beneficiario/modal-desactivar-beneficiario.component';
import { BusquedaConveniosPFServic } from '../../../../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute,Router } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {
  CATALOGO_ENFERMEDAD_PREEXISTENTE,
  CATALOGO_SEXO,
} from 'projects/sivimss-gui/src/app/modules/convenios-prevision-funeraria/constants/catalogos-funcion';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { Beneficiarios } from '../../../../../consulta-convenio-prevision-funeraria/models/Beneficiarios.interface';
import {MensajesSistemaService} from "../../../../../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-registro-persona-grupo',
  templateUrl: './registro-persona-grupo.component.html',
  styleUrls: ['./registro-persona-grupo.component.scss'],
})
export class RegistroPersonaGrupoComponent implements OnInit {
  formPersona!: FormGroup;
  paquetes: any[] = [];
  paises: any[] = [];
  beneficiarios: Beneficiarios[] = [];
  personasGrupo: any[] = [];
  colonias: any[] = [];
  coloniasEmpresa: any[] = [];
  estado: any[] = [];
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
  muestraOtraEnfermedad: boolean = false;
  mostrarBontonGaurdarPersona: boolean = true;
  mostrarBotonAgregarBeneficiario: boolean = false;
  deshabilitarTipo: boolean = false;
  seleccionarPromotorEmpresa: boolean = false;
  validaSexo: boolean = false;
  readonlyInputs: boolean = false;

  velatorio: string = '';
  folioConvenio: string = '';
  nombreCompleto: string = '';
  delegacion: string = '';
  fecha: number = this.fechaActual.setDate(this.fechaActual.getDate() + 1);
  inputSeleccionado: string = '';

  nombreIne: string | null = null;
  validaCurp: boolean = false;
  nombreCurp: string | null = null;
  validaRfc: boolean = false;
  nombreRfc: string | null = null;
  archivoIne: string | null = null;
  archivoCurp: string | null = null;
  archivoRfc: string | null = null;
  seleccionarPromotor: boolean = true;
  idPaquete: string | null = null;
  idConvenioPf: number | null = null;
  idDomicilio: number | null = null;
  idVelatorio: number | null = null;
  idContratante: number | null = null;
  idConvenioPF: number = 0;
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;

  queryParams: any = {};
  mensajeGenerico: string = '';
  mostrarMensajeGenerico: boolean = false;
  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.formPersona = this.crearFormPersona();
    setTimeout(() => {
      this.buscarPaises();
    }, 800);

    setTimeout(() => {
      this.buscarPaquete();
    }, 1200);
    setTimeout(() => {
      this.buscarParentesco();
    }, 1400);
    setTimeout(() => {
      this.buscarEstado();
    }, 1600);

    this.idVelatorio = this.rutaActiva.snapshot.queryParams.idVelatorio;
    this.velatorio = this.rutaActiva.snapshot.queryParams.velatorio;
    this.idConvenioPF = this.rutaActiva.snapshot.queryParams.idConvenio;
    this.queryParams = {
      idVelatorio: this.rutaActiva.snapshot.queryParams.idVelatorio,
      velatorio: this.rutaActiva.snapshot.queryParams.velatorio,
      idConvenio: this.rutaActiva.snapshot.queryParams.idConvenio,
      delegacion: this.rutaActiva.snapshot.queryParams.delegacion,
      folioConvenio: this.rutaActiva.snapshot.queryParams.folioConvenio
    };
    this.delegacion = this.rutaActiva.snapshot.queryParams.delegacion;
    this.folioConvenio = this.rutaActiva.snapshot.queryParams.folioConvenio;
  }

  crearFormPersona(): FormGroup {
    return this.formBuilder.group({
      datosPersonales: this.formBuilder.group({
        matricula: [
          {
            value: null,
            disabled: false,
          }
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [
            Validators.pattern(PATRON_RFC),
            Validators.maxLength(13),
          ],
        ],
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CURP)],
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
            disabled: false,
          },
          [Validators.required],
        ],
        otroSexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
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

          if (respuesta.mensaje === 'Exito')
            this.paises = respuesta.datos || [];
          else this.mostrarMensaje(Number(respuesta.mensaje));
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

  buscarEstado(): void {
    this.consultaConveniosService
      .estado()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }
          if (respuesta.mensaje === 'Exito') this.estado = respuesta.datos;
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

  get datosPersonales() {
    return (this.formPersona.controls['datosPersonales'] as FormGroup).controls;
  }

  get domicilio() {
    return (this.formPersona.controls['domicilio'] as FormGroup).controls;
  }

  get archivos() {
    return (this.formPersona.controls['archivos'] as FormGroup).controls;
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

  cambioTipoSexo(): void {
    if (this.datosPersonales.sexo.value == 3) {
      this.validaSexo = true;
      this.datosPersonales.otroSexo.setValidators(Validators.required);
    } else {
      this.datosPersonales.otroSexo.patchValue(null);
      this.datosPersonales.otroSexo.clearValidators();
      this.validaSexo = false;
    }
    this.datosPersonales.otroSexo.updateValueAndValidity();
  }

  addAttachment(fileInput: any): void {
    const extensionesPermitidas = ['pdf','gif','jpeg','jpg'];
    const maxSize = 5000000;
    const fileReaded = fileInput.target.files[0];
    const tipoArchivo = fileReaded.type.split('/');
    if(!extensionesPermitidas.includes(tipoArchivo[1])){
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
    this.mostrarMensajeGenerico= true;
  }

  validarRFC(): void {
    if (!this.datosPersonales.rfc) return;
    this.datosPersonales.rfc.clearValidators();
    this.datosPersonales.rfc.updateValueAndValidity();
    if (this.datosPersonales.rfc.value.includes('XAXX010101000')) return;
    if (!this.datosPersonales.rfc.value.match(PATRON_RFC)) {
      this.mostrarMensaje(33);
      this.datosPersonales.rfc.setValidators(Validators.pattern(PATRON_RFC));
      this.datosPersonales.rfc.updateValueAndValidity();
    }
  }

  validarCorreo(): void {
    if(this.domicilio.correoElectronico?.errors?.pattern){
      this.alertaService.mostrar(TipoAlerta.Precaucion,this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  consultarCURP() {
    if (!this.datosPersonales.curp.value) return;

    if (this.datosPersonales.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP no válido.');
      return;
    }
    if (this.datosPersonales.curp.value.includes('XEXX010101HNEXXXA4')) return;

    if (this.datosPersonales.curp.value.includes('XEXX010101MNEXXXA8')) return;

    if (this.datosPersonales.curp.value?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no válido.');
      return;
    }
    if (!this.datosPersonales.curp.value) return;
    this.buscarCurpRFC(this.datosPersonales.curp.value, '');
  }

  consultarMatriculaSIAP(): void {
    if (!this.datosPersonales.matricula.value) return;
    this.loaderService.activar();
    this.consultaConveniosService.consultarMatriculaSIAP(this.datosPersonales.matricula.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos === null){
          const mensajeErr: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
          this.alertaService.mostrar(TipoAlerta.Info, mensajeErr);
        }
      },
      error: (erro: HttpErrorResponse) => {
        this.mostrarMensaje(0);
      }
    });
  }

  convertirAMayusculas(posicionFormulario: number): void {
    const formularios = [this.datosPersonales.curp, this.datosPersonales.rfc];
    formularios[posicionFormulario].setValue(
      formularios[posicionFormulario].value.toUpperCase()
    );
  }

  buscarCurpRFC(curp: string, rfc: string): void {
    let parametros = {
      curp: curp,
      rfc: rfc,
    };

    this.consultaConveniosService
      .buscarCurpRFC(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje == 'Exito') {
            if (curp != '') {
              let valores = respuesta.datos[0];

              this.datosPersonales.idPersona.setValue(valores.idPersona);
              this.datosPersonales.nombre.setValue(valores.nomPersona);
              this.datosPersonales.primerApellido.setValue(
                valores.primerApellido
              );
              this.datosPersonales.segundoApellido.setValue(
                valores.segundoApellido
              );
              this.datosPersonales.fechaNacimiento.setValue(
                valores.fechaNacimiento
              );

              this.nombreCompleto =
                valores.nomPersona +
                ' ' +
                valores.primerApellido +
                ' ' +
                valores.segundoApellido;
              this.datosPersonales.lugarNacimiento.setValue(valores.idEstado)
              this.datosPersonales.sexo.setValue(+valores.sexo)
              if(typeof valores.sexo == 'string'){
                if(+valores.sexo == 1)this.datosPersonales.sexo.setValue(2)
                if(+valores.sexo == 2)this.datosPersonales.sexo.setValue(1)
              }
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          this.mostrarMensaje(0);
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

    this.loaderService.activar();
    let idPersona = this.datosPersonales.idPersona.value ?? 0;
    let parametros = {
      idPaquete: this.idPaquete,
      idEnfermedad: this.domicilio.enfermedadPrexistente.value,
      otraEnfermedad: this.domicilio.otro.value,
      idPersona: idPersona,
      cveMatricula: this.datosPersonales.matricula.value,
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
      rfc: this.datosPersonales.rfc.value,
      curp: this.datosPersonales.curp.value,
      nombre: this.datosPersonales.nombre.value,
      primerApellido: this.datosPersonales.primerApellido.value,
      segundoApellido: this.datosPersonales.segundoApellido.value,
      fechaNacimiento: this.datosPersonales.lugarNacimiento.value, //'1991-04-27'
      idPais: this.datosPersonales.lugarNacimiento.value,
      telefono: this.domicilio.telefono.value,
      correo: this.domicilio.correoElectronico.value,
      idConvenioPF: this.idConvenioPF,
      idSexo: this.datosPersonales.sexo.value,
      otroSexo:this.datosPersonales.otroSexo.value,
    };

    this.consultaConveniosService
      .agregarPersona(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.mostrarMensaje(Number(respuesta.mensaje));
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.readonlyInputs = true;
            let datos = respuesta.datos;

            this.mostrarBontonGaurdarPersona = false;
            this.idConvenioPf = datos.idConvenioPF;
            this.idDomicilio = datos.idDomicilio;
            // this.folioConvenio = datos.folio;
            this.idContratante = datos.idContratante;
            this.mostrarBotonAgregarBeneficiario = true;
            this.deshabilitarTipo = true;
          } else {
            this.mostrarMensaje(5);
          }
        },
        error: (error: HttpErrorResponse) => {
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
      case 803:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'La persona ya fue registrada anteriormente. Ingrese un curp diferente'
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
    if (this.domicilio.codigoPostal.value.length < 5) return;

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

  abrirModalRegistroNuevoBeneficiario(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalRegistrarBeneficiarioComponent, {
      header: 'Registrar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        idConvenio: this.idConvenioPf,
        parentesco: this.parentesco,
        idVelatorio: this.idVelatorio,
        velatorio: this.velatorio,
        idContratante: this.idContratante,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
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
      style: { maxWidth: '876px', width: '100%' },
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
      style: { maxWidth: '876px', width: '100%' },
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

  regresarPantalla(): void {
    this.router.navigate(['externo-privado/contratar-convenio-de-prevision-funeraria/registro-contratacion-convenio-de-prevision-funeraria'],
      {queryParams:{
          idVelatorio: this.idVelatorio,
          velatorio: this.velatorio,
          idConvenio: this.idConvenioPf,
          delegacion: this.delegacion,
          folioConvenio: this.folioConvenio
        }
      }
    );
  }
}
