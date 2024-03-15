import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";

import {MenuItem} from "primeng/api";
import * as moment from "moment";

import {ServiciosFunerariosService} from "../../services/servicios-funerarios.service";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {SERVICIO_BREADCRUMB_CLEAR} from "../../constants/breadcrumb";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {mapearArregloTipoDropdown, obtenerVelatorioUsuarioLogueado} from "../../../../utils/funciones";
import {finalize} from "rxjs";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {CatalogoPaquetes} from "../../models/catalogos.interface";
import {
  AgregarPlanSFPA,
  SolicitudBeneficiario,
  SolicitudContratante, SolicitudCreacionSFPA,
  SolicitudPlan, SolicitudSubstituto
} from "../../models/servicios-funerarios.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {CURP} from 'projects/sivimss-gui/src/app/utils/regex';
import {UsuarioContratante} from "../../../contratantes/models/usuario-contratante.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";


@Component({
  selector: 'app-alta-servicios-funerarios',
  templateUrl: './alta-servicios-funerarios.component.html',
  styleUrls: ['./alta-servicios-funerarios.component.scss'],
  providers: [DescargaArchivosService]
})
export class AltaServiciosFunerariosComponent implements OnInit {

  @ViewChild('dd') dd: any;

  readonly POSICION_ESTADOS: number = 0;
  readonly POSICION_PAISES: number = 1;
  readonly POSICION_NUMERO_PAGOS: number = 2;
  readonly POSICION_PAQUETE: number = 3;
  readonly POSICION_PROMOTOR: number = 4;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  promotorForm!: FormGroup;
  datosTitularForm!: FormGroup;
  datosTitularSubstitutoForm!: FormGroup;
  datosBeneficiario1Form!: FormGroup;
  datosBeneficiario2Form!: FormGroup;

  tipoContratacion: TipoDropdown[] = [{value: 1, label: 'Por persona'}];
  sexo: TipoDropdown[] = [{value: 1, label: 'Mujer'}, {value: 2, label: 'Hombre'}, {value: 3, label: 'Otro'}];
  nacionalidad: TipoDropdown[] = [{value: 1, label: 'Mexicana'}, {value: 2, label: 'Extranjera'}];
  estados: TipoDropdown[] = [];
  paises: TipoDropdown[] = [];
  tipoPaquete: TipoDropdown[] = [];
  numeroPago: TipoDropdown[] = [];
  paqueteBackUp!: CatalogoPaquetes[];
  colonias: TipoDropdown[][] = [[], [], [], []];
  catPromotores: TipoDropdown[] = [];
  confirmarGuardado: boolean = false;
  confirmarAceptarPaquete: boolean = false;
  confirmacionDatosExistentes: boolean = false;
  existeDatoRegistrado: boolean = false;
  infoPaqueteSeleccionado!: any;
  mensajeDatosExistentes: string = "";
  idPlanSfpaExistente!: number;

  /*Variable tipo lista para validar si ya se encuentra CURP/RFC en BD
  * [0] = fdt.curp.value
  * [1] = fdt.rfc.value
  * [2] = fdts.curp.value
  * [3] = fdts.rfc.value
  * */
  cajaValidacionDatosExistentes: any[] = [false, false, false, false]

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private descargaArchivosService: DescargaArchivosService,
    private formBuilder: FormBuilder,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.estados = respuesta[this.POSICION_ESTADOS];
    this.paises = respuesta[this.POSICION_PAISES];
    const numeroPagos = respuesta[this.POSICION_NUMERO_PAGOS].datos
    this.numeroPago = mapearArregloTipoDropdown(numeroPagos, 'DES_TIPO_PAGO_MENSUAL', 'ID_TIPO_PAGO_MENSUAL');
    const tipoPaquetes = respuesta[this.POSICION_PAQUETE].datos
    this.tipoPaquete = mapearArregloTipoDropdown(tipoPaquetes, 'nomPaquete', 'idPaquete');
    const catPromotores = respuesta[this.POSICION_PROMOTOR].datos;
    this.catPromotores = mapearArregloTipoDropdown(catPromotores, 'NOMBRE', 'ID_PROMOTOR');
    this.paqueteBackUp = respuesta[this.POSICION_PAQUETE].datos;
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.inicializarFormPromotor();
    this.inicializarFormDatosTitular();
    this.inicializarFormDatosTitularSubstituto();
    this.datosBeneficiario1Form = this.crearDatosBeneficiarios();
    this.datosBeneficiario2Form = this.crearDatosBeneficiarios();
  }


  inicializarFormPromotor(): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{value: false, disabled: false}, [Validators.required]],
      promotor: [{value: null, disabled: false}, [Validators.required]],
    });

    this.handleGestionPromotor();
  }

  inicializarFormDatosTitular(): void {
    this.datosTitularForm = this.formBuilder.group({
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
      lugarNacimiento: [{value: null, disabled: false}, []],
      paisNacimiento: [{value: null, disabled: false}],
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
      tipoPaquete: [{value: null, disabled: false}, [Validators.required]],
      numeroPago: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  inicializarFormDatosTitularSubstituto(): void {
    this.datosTitularSubstitutoForm = this.formBuilder.group({
      datosIguales: [{value: null, disabled: false}, [Validators.required]],
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
      lugarNacimiento: [{value: null, disabled: false}, []],
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

  crearDatosBeneficiarios(): FormGroup {
    return this.formBuilder.group({
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

  limpiarCURP(posicion: number): void {
    this.formularios[posicion].nombre.setValue(null);
    this.formularios[posicion].nombre.enable();
    this.formularios[posicion].primerApellido.setValue(null);
    this.formularios[posicion].primerApellido.enable();
    this.formularios[posicion].segundoApellido.setValue(null);
    this.formularios[posicion].segundoApellido.enable();
    this.formularios[posicion].sexo.setValue(null);
    this.formularios[posicion].sexo.enable();
    this.formularios[posicion].otroSexo.setValue(null);
    this.formularios[posicion].otroSexo.enable();
    this.formularios[posicion].fechaNacimiento.setValue(null);
    this.formularios[posicion].fechaNacimiento.enable();
    this.formularios[posicion].nacionalidad.setValue(null);
    this.formularios[posicion].nacionalidad.enable();
    this.formularios[posicion].lugarNacimiento.setValue(null);
    this.formularios[posicion].lugarNacimiento.enable();
    this.formularios[posicion].paisNacimiento.setValue(null);
    this.formularios[posicion].paisNacimiento.enable();
  }

  consultarCurp(posicion: number): void {
    if (!this.formularios[posicion].curp.value) {
      this.limpiarCURP(posicion);
      return;
    }
    if (this.formularios[posicion].curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }
    this.limpiarFormulario(posicion);
    this.validarUsuarioTitular(this.formularios[posicion].curp.value, "", "", posicion);
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarCURP(this.formularios[posicion].curp.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejoRespuestaValidaCURP(respuesta, posicion),
      error: (): void => this.manejoRespuestaErrorCURP()
    });
  }

  manejoRespuestaValidaCURP(respuesta: HttpRespuesta<any>, posicion: number): void {
    if (respuesta.mensaje.includes('interno')) {
      this.manejoRespuestaValidaCURPInterno(respuesta, posicion);
      return;
    }
    if (respuesta.datos?.message?.includes("LA CURP NO SE ENCUENTRA EN LA BASE DE DATOS")) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return
    }
    const {nombre, apellido1, apellido2, sexo, fechNac, nacionalidad, desEntidadNac} = respuesta.datos;
    const [dia, mes, anio] = fechNac.split('/');
    const fecha: Date = new Date(anio + '/' + mes + '/' + dia);
    this.formularios[posicion].nombre.setValue(nombre);
    this.formularios[posicion].nombre.disable();
    this.formularios[posicion].primerApellido.setValue(apellido1);
    this.formularios[posicion].primerApellido.disable();
    this.formularios[posicion].segundoApellido.setValue(apellido2);
    this.formularios[posicion].segundoApellido.disable();
    this.formularios[posicion].fechaNacimiento.setValue(fecha);
    this.formularios[posicion].fechaNacimiento.disable();
    if (sexo.includes('HOMBRE')) {
      this.formularios[posicion].sexo.setValue(2);
      this.formularios[posicion].sexo.disable();
    }
    if (sexo.includes('MUJER')) {
      this.formularios[posicion].sexo.setValue(1);
      this.formularios[posicion].sexo.disable();
    }
    if (nacionalidad.includes('MEXICO') || nacionalidad.includes('MEX')) {
      this.formularios[posicion].nacionalidad.setValue(1);
      this.formularios[posicion].nacionalidad.disable();
    } else {
      this.formularios[posicion].nacionalidad.setValue(2);
      this.formularios[posicion].nacionalidad.disable();
    }
    this.consultarLugarNacimiento(desEntidadNac, posicion);
  }

  manejoRespuestaValidaCURPInterno(respuesta: HttpRespuesta<any>, posicion: number): void {
    const [informacion] = respuesta.datos;
    const [anio, mes, dia] = informacion.fechaNacimiento.split('-');
    const fecha: Date = new Date(anio + '/' + mes + '/' + dia);
    this.formularios[posicion].nombre.setValue(informacion.nomPersona);
    this.formularios[posicion].nombre.disable();
    this.formularios[posicion].primerApellido.setValue(informacion.nomPersonaPaterno);
    this.formularios[posicion].primerApellido.disable();
    this.formularios[posicion].segundoApellido.setValue(informacion.nomPersonaMaterno);
    this.formularios[posicion].segundoApellido.disable();
    this.formularios[posicion].sexo.setValue(informacion.numSexo);
    this.formularios[posicion].sexo.disable();
    this.formularios[posicion].otroSexo.setValue(informacion?.desOtroSexo);
    this.formularios[posicion].otroSexo.disable();
    this.formularios[posicion].fechaNacimiento.setValue(fecha);
    this.formularios[posicion].fechaNacimiento.disable();
    this.formularios[posicion].telefono.setValue(informacion.desTelefono)
    this.formularios[posicion].correoElectronico.setValue(informacion.desCorreo)
    this.formularios[posicion].cp.setValue(informacion.DesCodigoPostal)
    this.formularios[posicion].calle.setValue(informacion.desCalle)
    this.formularios[posicion].numeroInterior.setValue(informacion.numInterior)
    this.formularios[posicion].numeroExterior.setValue(informacion.numExterior)
    this.formularios[posicion].colonia.setValue(informacion.desColonia)
    if (+informacion.idPais == 119 || !+informacion.idPais) {
      this.formularios[posicion].nacionalidad.setValue(1);
      this.formularios[posicion].nacionalidad.disable();
      this.formularios[posicion].lugarNacimiento.setValue(informacion.idEstado)
      this.formularios[posicion].lugarNacimiento.disable()
    } else {
      this.formularios[posicion].nacionalidad.setValue(2);
      this.formularios[posicion].nacionalidad.disable();
      this.formularios[posicion].paisNacimiento.setValue(informacion.idPais)
      this.formularios[posicion].paisNacimiento.disable()
    }
    informacion.rfc ? this.formularios[posicion].rfc.setValue(informacion.rfc) :
      this.formularios[posicion].rfc.setValue(this.formularios[posicion].rfc.value);
    informacion.nss ? this.formularios[posicion].nss.setValue(informacion.nss) :
      this.formularios[posicion].nss.setValue(this.formularios[posicion].nss.value);
    this.consultarCodigoPostal(posicion);
    this.cambiarNacionalidad(posicion);
    this.cambiarNacionalidad2(posicion);
  }

  manejoRespuestaErrorCURP(): void {
    const ERROR: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(52)
    this.alertaService.mostrar(TipoAlerta.Error, ERROR);
  }

  validarRfc(posicion: number): void {
    if (!this.formularios[posicion].rfc.value) return;
    if (this.formularios[posicion].rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
  }

  consultarRfc(posicion: number): void {
    if (!this.formularios[posicion].rfc.value) return;
    if (this.formularios[posicion].rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
      return;
    }
    this.validarUsuarioTitular("", this.formularios[posicion].rfc.value, "", posicion);
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarRFC(this.formularios[posicion].rfc.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => this.manejarSolicitudValidaRFC(respuesta),
      error: (error: HttpErrorResponse) => this.manejarSolicitudErrorRFC()
    });
  }

  manejarSolicitudValidaRFC(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos.message) return;
    if (respuesta.datos.message.includes("LA CURP NO SE ENCUENTRA EN LA BASE DE DATOS")) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
    }
  }

  manejarSolicitudErrorRFC(): void {
    this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
  }

  consultarLugarNacimiento(entidad: string, posicion: number): void {
    const entidadEditada: string = this.accentsTidy(entidad);
    if (entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')) {
      this.formularios[posicion].lugarNacimiento.setValue(11);
      this.formularios[posicion].lugarNacimiento.disable();
      return
    }
    if (entidadEditada.toUpperCase().includes('DISTRITO FEDERAL') || entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')) {
      this.formularios[posicion].lugarNacimiento.setValue(7);
      this.formularios[posicion].lugarNacimiento.disable();
      return
    }
    this.estados.forEach((element: any) => {
      const entidadIteracion: string = this.accentsTidy(element.label);
      if (entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())) {
        this.formularios[posicion].lugarNacimiento.setValue(element.value);
        this.formularios[posicion].lugarNacimiento.disable();
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

  handleGestionPromotor() {
    if (this.fp.gestionadoPorPromotor.value) {
      this.fp.promotor.enable();
      this.fp.promotor.setValidators(Validators.required);
    } else {
      this.fp.promotor.setValue(null);
      this.fp.promotor.disable();
      this.fp.promotor.clearValidators();
    }
    this.fp.promotor.updateValueAndValidity();
  }

  validarUsuarioTitular(curp: string, rfc: string, nss: string, posicion: number): void {
    this.cargadorService.activar();
    this.existeDatoRegistrado = false;

    if (posicion == 0) {
      if (curp === "") {
        this.cajaValidacionDatosExistentes[1] = false;
      } else if (rfc === "") {
        this.cajaValidacionDatosExistentes[0] = false;
      }
    } else if (curp === "") {
      this.cajaValidacionDatosExistentes[3] = false;
    } else if (rfc === "") {
      this.cajaValidacionDatosExistentes[2] = false;
    }

    this.serviciosFunerariosService.validarTitular(curp, rfc, nss).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.idPlanSfpaExistente = respuesta.datos[0].ID_PLAN_SFPA;
          if (posicion == 0) {
            if (curp === "") {
              this.cajaValidacionDatosExistentes[1] = true;
            } else if (rfc === "") {
              this.cajaValidacionDatosExistentes[0] = true;
            }
          } else if (curp === "") {
            this.cajaValidacionDatosExistentes[3] = true;
          } else if (rfc === "") {
            this.cajaValidacionDatosExistentes[2] = true;
          }
          this.existeDatoRegistrado = true;
          this.confirmacionDatosExistentes = true;
          this.mensajeDatosExistentes = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    });
  }

  consultarCorreo(posicion: number): void {
    const formularios = [this.fdt.correoElectronico, this.fdts.correoElectronico, this.fdb1.correoElectronico, this.fdb2.correoElectronico];
    if (!formularios[posicion].value) return;
    if (formularios[posicion]?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  consultarMatricula(posicion: number): void {
    if (!this.formularios[posicion].matricula.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarMatriculaSiap(this.formularios[posicion].matricula.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaValidaMatricula(respuesta),
      error: (error: HttpErrorResponse): void => this.procesarRespuestaErrorMatricula(error)
    });
  }

  procesarRespuestaValidaMatricula(respuesta: HttpRespuesta<any>): void {
    if (respuesta.datos) return;
    this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
  }

  procesarRespuestaErrorMatricula(error: HttpErrorResponse): void {
    const ERROR: string = 'La matrícula es incorrecta';
    const ERROR_SISTEMA: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(error.error.mensaje)
    this.alertaService.mostrar(TipoAlerta.Error, ERROR_SISTEMA || ERROR);
  }

  consultarNSS(posicion: number): void {
    if (!this.formularios[posicion].nss.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNSS(this.formularios[posicion].nss.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => this.procesarRespuestaValidaNSS(respuesta, posicion),
      error: (error: HttpErrorResponse) => this.procesarRespuestaErrorNSS()
    });
  }

  procesarRespuestaValidaNSS(respuesta: HttpRespuesta<any>, posicion: number): void {
    if (respuesta.datos) return;
    const ERROR: string = "El Número de Seguridad Social no existe.";
    const ERROR_SISTEMA: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
    this.alertaService.mostrar(TipoAlerta.Precaucion, ERROR_SISTEMA || ERROR);
    this.formularios[posicion].nss.setErrors({'incorrect': true});
    this.formularios[posicion].nss.setValue(null);
  }

  procesarRespuestaErrorNSS(): void {
    this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
  }

  sinEspacioDoble(posicion: number): void {
    const formularios = [
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
    const formulariosOtroSexo = [this.fdt.otroSexo, this.fdts.otroSexo, this.fdb1.otroSexo, this.fdb2.otroSexo];
    formulariosOtroSexo[posicion].patchValue(null);
  }

  cambiarNacionalidad(posicion: number): void {
    const formularios = [this.fdt.paisNacimiento, this.fdt.lugarNacimiento, this.fdts.paisNacimiento, this.fdts.lugarNacimiento];
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
    const formularios = [this.fdb1.paisNacimiento, this.fdb1.lugarNacimiento, this.fdb2.paisNacimiento, this.fdb2.lugarNacimiento];
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

  consultarCodigoPostal(posicion: number): void {
    if (!this.formularios[posicion].cp.value) {
      this.limpiarCodigoPostal(posicion);
      return;
    }
    this.cargadorService.activar();
    this.serviciosFunerariosService.consutaCP(this.formularios[posicion].cp.value)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.manejarRespuestaValidaCP(respuesta, posicion),
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  limpiarCodigoPostal(posicion: number): void {
    this.formularios[posicion].colonia.patchValue(null);
    this.formularios[posicion].municipio.patchValue(null);
    this.formularios[posicion].estado.patchValue(null);
  }

  manejarRespuestaValidaCP(respuesta: HttpRespuesta<any>, posicion: number): void {
    if (respuesta) {
      this.colonias[posicion] = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
      this.formularios[posicion].colonia.setValue(respuesta.datos[0].nombre);
      this.formularios[posicion].municipio.setValue(
        respuesta.datos[0].municipio.nombre
      );
      this.formularios[posicion].estado.setValue(
        respuesta.datos[0].municipio.entidadFederativa.nombre
      );
      return;
    }
    this.formularios[posicion].colonia.patchValue(null);
    this.formularios[posicion].municipio.patchValue(null);
    this.formularios[posicion].estado.patchValue(null);
  }

  datosIguales(esIgual: boolean): void {
    if (!esIgual) {
      this.colonias[1] = [];
      this.datosTitularSubstitutoForm.enable();
      this.fdts.municipio.disable();
      this.fdts.estado.disable()
      this.cajaValidacionDatosExistentes[2] = false;
      this.cajaValidacionDatosExistentes[3] = false;
      this.datosTitularSubstitutoForm.reset();
      this.fdts.datosIguales.setValue(false);
      return
    }
    this.colonias[1] = this.colonias[0];
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
    this.formularios[posicion].nombre.patchValue(null);
    this.formularios[posicion].primerApellido.patchValue(null);
    this.formularios[posicion].segundoApellido.patchValue(null);
    this.formularios[posicion].sexo.patchValue(null);
    this.formularios[posicion].otroSexo.patchValue(null);
    this.formularios[posicion].fechaNacimiento.patchValue(null);
    this.formularios[posicion].nacionalidad.patchValue(null);
    this.formularios[posicion].lugarNacimiento.patchValue(null);
    this.formularios[posicion].paisNacimiento.patchValue(null);
    this.formularios[posicion].telefono.patchValue(null);
    this.formularios[posicion].correoElectronico.patchValue(null);
    this.formularios[posicion].cp.patchValue(null);
    this.formularios[posicion].calle.patchValue(null);
    this.formularios[posicion].numeroInterior.patchValue(null);
    this.formularios[posicion].numeroExterior.patchValue(null);
    this.formularios[posicion].colonia.patchValue(null);
    this.formularios[posicion].municipio.patchValue(null);
    this.formularios[posicion].estado.patchValue(null);

    if (posicion === 0) {
      this.formularios[posicion].telefonoFijo.patchValue(null);
    }
  }

  mostrarInfoPaqueteSeleccionado(): void {
    const objetoPaquete = this.paqueteBackUp.filter((paquete: any) => {
      return paquete.idPaquete == +this.fdt.tipoPaquete.value
    });
    this.infoPaqueteSeleccionado = objetoPaquete[0].descPaquete;
    this.confirmarAceptarPaquete = true;
  }

  guardar(): void {
    const objetoGuardar: SolicitudCreacionSFPA = this.generarObjetoPlanSFPA();
    this.confirmarGuardado = false;
    this.cargadorService.activar();
    this.serviciosFunerariosService.insertarPlanSFPA(objetoGuardar).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.manejarRespuestaGuardar(respuesta),
        error: (error: HttpErrorResponse) => this.manejarErrorGuardar()
      }
    );
  }

  manejarRespuestaGuardar(respuesta: HttpRespuesta<any>): void {
    const configuracionArchivo: OpcionesArchivos = {};
    const MSG_EXITO: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(30) + " del convenio con folio " + respuesta.mensaje;
    this.alertaService.mostrar(TipoAlerta.Exito, MSG_EXITO);
    const file = new Blob([this.descargaArchivosService.base64_2Blob(respuesta.datos,
        this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
      {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
    const url = window.URL.createObjectURL(file);
    window.open(url)
    void this.router.navigate(['../servicios-funerarios']);
  }

  manejarErrorGuardar(): void {
    this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(5));

  }

  generarObjetoPlanSFPA(): SolicitudCreacionSFPA {
    return {
      plan: this.generarPlan(),
      contratante: this.generarContratante(),
      titularSubstituto: this.generarSustituto(),
      beneficiario1: this.generarBeneficiario1(),
      beneficiario2: this.generarBeneficiario2()
    }
  }

  generarPlan(): SolicitudPlan {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    const numeroPago = this.fdt.numeroPago.value;
    const numPago: string = this.numeroPago.find((e: TipoDropdown) => e.value === numeroPago)?.label ?? '';
    return {
      idEstatusPlan: 0,
      idPaquete: this.fdt.tipoPaquete.value,
      idPlanSfpa: null,
      idPromotor: this.fp.promotor.value,
      idTipoContratacion: 1,
      idTipoPagoMensual: this.fdt.numeroPago.value,
      idVelatorio: velatorio,
      indModificarTitularSubstituto: 0,
      indPromotor: this.fp.gestionadoPorPromotor.value ? 1 : 0,
      indTitularSubstituto: this.fdts.datosIguales.value ? 1 : 0,
      monPrecio: this.consultarMonPrecio().toString(),
      pagoMensual: numPago
    }
  }

  generarSustituto(): SolicitudSubstituto | null {
    if (this.fdts.datosIguales.value) return null;
    const sustituto = this.datosTitularSubstitutoForm.getRawValue();
    let fecNacimiento = sustituto.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: sustituto.cp,
      correo: sustituto.correoElectronico,
      curp: sustituto.curp,
      desCalle: sustituto.calle,
      desColonia: sustituto.colonia,
      desEstado: sustituto.estado,
      desMunicipio: sustituto.municipio,
      fecNacimiento,
      idDomicilio: null,
      idEstado: sustituto.lugarNacimiento,
      idPais: sustituto.paisNacimiento,
      idPersona: null,
      idSexo: sustituto.sexo,
      ine: null,
      matricula: sustituto.matricula,
      nomPersona: sustituto.nombre,
      nss: sustituto.nss,
      numExterior: sustituto.numeroExterior,
      numInterior: sustituto.numeroInterior,
      otroSexo: sustituto.otroSexo,
      persona: "titular substituto",
      primerApellido: sustituto.primerApellido,
      rfc: sustituto.rfc,
      segundoApellido: sustituto.segundoApellido,
      telefono: sustituto.telefono,
      telefonoFijo: null,
    }
  }

  generarContratante(): SolicitudContratante {
    const contratante = this.datosTitularForm.getRawValue();
    let fecNacimiento = contratante.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: contratante.cp,
      correo: contratante.correoElectronico,
      curp: contratante.curp,
      desCalle: contratante.calle,
      desColonia: contratante.colonia,
      desEstado: contratante.estado,
      desMunicipio: contratante.municipio,
      fecNacimiento,
      idContratante: null,
      idDomicilio: null,
      idEstado: contratante.lugarNacimiento,
      idPais: contratante.paisNacimiento,
      idPersona: null,
      idSexo: contratante.sexo,
      ine: null,
      matricula: contratante.matricula,
      nomPersona: contratante.nombre,
      nss: contratante.nss,
      numExterior: contratante.numeroExterior,
      numInterior: contratante.numeroInterior,
      otroSexo: contratante.otroSexo,
      persona: "titular",
      primerApellido: contratante.primerApellido,
      rfc: contratante.rfc,
      segundoApellido: contratante.segundoApellido,
      telefono: contratante.telefono,
      telefonoFijo: contratante.telefonoFijo,
    }
  }

  generarBeneficiario1(): SolicitudBeneficiario | null {
    const beneficiario1 = this.datosBeneficiario1Form.getRawValue();
    if (!beneficiario1.curp) return null;
    let fecNacimiento = beneficiario1.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: beneficiario1.cp,
      correo: beneficiario1.correoElectronico,
      curp: beneficiario1.curp,
      desCalle: beneficiario1.calle,
      desColonia: beneficiario1.colonia,
      desEstado: beneficiario1.estado,
      desMunicipio: beneficiario1.municipio,
      fecNacimiento,
      idDomicilio: null,
      idEstado: beneficiario1.lugarNacimiento,
      idPais: beneficiario1.paisNacimiento,
      idPersona: null,
      idSexo: beneficiario1.sexo,
      ine: null,
      matricula: beneficiario1.matricula,
      nomPersona: beneficiario1.nombre,
      nss: beneficiario1.nss,
      numExterior: beneficiario1.numeroExterior,
      numInterior: beneficiario1.numeroInterior,
      otroSexo: beneficiario1.otroSexo,
      persona: 'beneficiario 1',
      primerApellido: beneficiario1.primerApellido,
      rfc: beneficiario1.rfc,
      segundoApellido: beneficiario1.segundoApellido,
      telefono: beneficiario1.telefono,
      telefonoFijo: '',
    }
  }

  generarBeneficiario2(): SolicitudBeneficiario | null {
    const beneficiario2 = this.datosBeneficiario2Form.getRawValue();
    if (!beneficiario2.curp) return null;
    let fecNacimiento = beneficiario2.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: beneficiario2.cp,
      correo: beneficiario2.correoElectronico,
      curp: beneficiario2.curp,
      desCalle: beneficiario2.calle,
      desColonia: beneficiario2.colonia,
      desEstado: beneficiario2.estado,
      desMunicipio: beneficiario2.municipio,
      fecNacimiento,
      idDomicilio: null,
      idEstado: beneficiario2.lugarNacimiento,
      idPais: beneficiario2.paisNacimiento,
      idPersona: null,
      idSexo: beneficiario2.sexo,
      ine: null,
      matricula: beneficiario2.matricula,
      nomPersona: beneficiario2.nombre,
      nss: beneficiario2.nss,
      numExterior: beneficiario2.numeroExterior,
      numInterior: beneficiario2.numeroInterior,
      otroSexo: beneficiario2.otroSexo,
      persona: 'beneficiario 2',
      primerApellido: beneficiario2.primerApellido,
      rfc: beneficiario2.rfc,
      segundoApellido: beneficiario2.segundoApellido,
      telefono: beneficiario2.telefono,
      telefonoFijo: '',
    }
  }

  consultarMonPrecio(): number {
    const paquete: any = this.paqueteBackUp.find((paquete: CatalogoPaquetes) => {
      return Number(this.fdt.tipoPaquete.value) == paquete.idPaquete;
    })
    return paquete?.monPrecio ?? null;
  }

  redireccionarModificar(): void {
    void this.router.navigate(['./servicios-funerarios/modificar-pago'],
      {queryParams: {idPlanSfpa: this.idPlanSfpaExistente}});
  }

  regresar(): void {
    this.confirmarGuardado = false;
    this.indice--;
  }

  cancelar(): void {
    void this.router.navigate(["servicios-funerarios"]);
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

  get formularios() {
    return [this.fdt, this.fdts, this.fdb1, this.fdb2];
  }

  validarBotonGuardar(): boolean {
    return this.datosTitularForm.invalid || this.datosTitularSubstitutoForm.invalid || this.promotorForm.invalid ||
      this.cajaValidacionDatosExistentes.includes(true);
  }
}
