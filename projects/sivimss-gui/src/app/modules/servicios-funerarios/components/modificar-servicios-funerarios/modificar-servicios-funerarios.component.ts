import {Component, OnInit, ViewChild} from '@angular/core';
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SERVICIO_BREADCRUMB_CLEAR} from "../../constants/breadcrumb";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {ServiciosFunerariosService} from "../../services/servicios-funerarios.service";
import {CatalogoPaquetes} from "../../models/catalogos.interface";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {mapearArregloTipoDropdown, obtenerVelatorioUsuarioLogueado} from "../../../../utils/funciones";
import {finalize} from "rxjs";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {
  SolicitudBeneficiarioModificar,
  SolicitudContratanteModificacion,
  SolicitudModificacionSFPA,
  SolicitudPlanModificacion,
  SolicitudSubstituto
} from "../../models/servicios-funerarios.interface";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import * as moment from "moment/moment";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {
  ResponseBeneficiarioServicios, ResponseContratanteServicios,
  ResponsePlanServicios, ResponseSustitutoServicios
} from "../../models/response-detalle-servicios.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";

@Component({
  selector: 'app-modificar-servicios-funerarios',
  templateUrl: './modificar-servicios-funerarios.component.html',
  styleUrls: ['./modificar-servicios-funerarios.component.scss'],
  providers: [DescargaArchivosService]
})
export class ModificarServiciosFunerariosComponent implements OnInit {

  @ViewChild('dd') dd: any;

  readonly POSICION_ESTADOS: number = 0;
  readonly POSICION_PAISES: number = 1;
  readonly POSICION_NUMERO_PAGOS: number = 2;
  readonly POSICION_PAQUETE: number = 3;
  readonly POSICION_PROMOTOR: number = 4;

  indice: number = 0;
  menuStep: MenuItem[] = MENU_STEPPER;

  sexo: TipoDropdown[] = [{value: 1, label: 'Mujer'}, {value: 2, label: 'Hombre'}, {value: 3, label: 'Otro'}];
  nacionalidad: TipoDropdown[] = [{value: 1, label: 'Mexicana'}, {value: 2, label: 'Extranjera'}];
  estados: TipoDropdown[] = [];
  paises: TipoDropdown[] = [];
  tipoPaquete: TipoDropdown[] = [];
  numeroPago: TipoDropdown[] = [];
  colonias: TipoDropdown[][] = [[], [], [], []];
  paqueteBackUp!: CatalogoPaquetes[];
  catPromotores: TipoDropdown[] = [];

  promotorForm!: FormGroup;
  datosTitularForm!: FormGroup;
  datosTitularSubstitutoForm!: FormGroup;
  datosBeneficiario1Form!: FormGroup;
  datosBeneficiario2Form!: FormGroup;

  confirmarGuardado: boolean = false;
  confirmarAceptarPaquete: boolean = false;
  confirmacionDatosExistentes: boolean = false;
  cambioNumeroPagos: boolean = false;
  idNumeroPagoOriginal!: number;
  infoPaqueteSeleccionado!: any;
  mensajeDatosExistentes: string = "";
  idPlanSfpa!: number;

  folioConvenio: string = "";
  nombreVelatorio: string = "";
  fecIngresa: string = "";

  datosPlan!: ResponsePlanServicios;
  datosContratante!: ResponseContratanteServicios;
  datosSustituto!: ResponseSustitutoServicios | null;
  datosBeneficiario1!: ResponseBeneficiarioServicios | null;
  datosBeneficiario2!: ResponseSustitutoServicios | null;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private descargaArchivosService: DescargaArchivosService,
    private formBuilder: FormBuilder,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.estados = respuesta[this.POSICION_ESTADOS];
    this.paises = respuesta[this.POSICION_PAISES];
    const tipoPaquetes = respuesta[this.POSICION_PAQUETE].datos;
    const numeroPagos = respuesta[this.POSICION_NUMERO_PAGOS].datos
    this.numeroPago = mapearArregloTipoDropdown(numeroPagos, 'DES_TIPO_PAGO_MENSUAL', 'ID_TIPO_PAGO_MENSUAL');
    const promotores = respuesta[this.POSICION_PROMOTOR].datos;
    this.tipoPaquete = mapearArregloTipoDropdown(tipoPaquetes, 'nomPaquete', 'idPaquete');
    this.catPromotores = mapearArregloTipoDropdown(promotores, 'NOMBRE', 'ID_PROMOTOR');
    this.paqueteBackUp = respuesta[this.POSICION_PAQUETE].datos;
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.idPlanSfpa = Number(this.route.snapshot.queryParams.idPlanSfpa);
    this.consultarFormulario();
  }

  consultarFormulario(): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarPlanSFPA(this.idPlanSfpa).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const {datos} = respuesta;
        this.datosPlan = datos.plan;
        this.datosContratante = datos.contratante;
        this.datosSustituto = datos.titularSubstituto;
        this.datosBeneficiario1 = datos.beneficiario1;
        this.datosBeneficiario2 = datos.beneficiario2;
        const plan: ResponsePlanServicios = datos.plan;
        this.folioConvenio = plan.folioPlan;
        this.nombreVelatorio = plan.velatorio;
        this.fecIngresa = plan.fechaIngreso;
        const objetoTitular = datos.contratante;
        const objetoSubstituto = datos.titularSubstituto ? datos.titularSubstituto : objetoTitular;
        this.inicializarFormPromotor(plan.indPromotor, plan.idPromotor);
        const idPago: number = this.numeroPago.find(pago => pago.label === plan.noPagos)?.value as number;
        this.inicializarFormDatosTitular(plan.idPaquete, idPago, objetoTitular, plan.pago);
        this.inicializarFormDatosTitularSubstituto(plan.indTitularSubstituto, objetoSubstituto);
        this.inicializarFormDatosBeneficiario1(datos.beneficiario1);
        this.inicializarFormDatosBeneficiario2(datos.beneficiario2);
        this.consultarCodigoPostal(2);
        this.consultarCodigoPostal(3);
        if (respuesta.datos.numPago > 0) {
          this.fdt.tipoPaquete.disable();
          this.fdt.numeroPago.disable();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  inicializarFormPromotor(indPromotor: boolean, idPromotor: number): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{value: indPromotor, disabled: false}, [Validators.required]],
      promotor: [{value: idPromotor, disabled: false}, [Validators.required]],
    });
    this.handleGestionPromotor();
  }

  inicializarFormDatosTitular(idPaquete: number, idTipoPagoMensual: number, titular: ResponseContratanteServicios, pago: number): void {
    let fecha: Date | null = null;
    if (titular.fechaNac) {
      const [anio, mes, dia] = titular.fechaNac.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }

    this.datosTitularForm = this.formBuilder.group({
      curp: [{value: titular.curp, disabled: true}, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: titular.rfc, disabled: true}, [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{value: titular.matricula, disabled: false},],
      nss: [{value: titular.nss, disabled: true}, [Validators.required]],
      nombre: [{value: titular.nomPersona, disabled: true}, [Validators.required]],
      primerApellido: [{value: titular.primerApellido, disabled: true}, [Validators.required]],
      segundoApellido: [{value: titular.segundoApellido, disabled: true}, [Validators.required]],
      sexo: [{value: titular.idSexo ? +titular.idSexo : null, disabled: true}, [Validators.required]],
      otroSexo: [{value: titular.otroSexo, disabled: true}],
      fechaNacimiento: [{value: fecha, disabled: true}, [Validators.required]],
      nacionalidad: [{value: titular.idNacionalidad, disabled: true}, [Validators.required]],
      lugarNacimiento: [{value: titular?.idEstado ? +titular?.idEstado : null, disabled: true},
        [Validators.required]],
      paisNacimiento: [{value: titular?.idPais ? +titular?.idPais : null, disabled: true}],
      telefono: [{value: titular.telefono, disabled: false}, [Validators.required]],
      telefonoFijo: [{value: titular.telefonoFijo, disabled: false}, [Validators.required]],
      correoElectronico: [{value: titular.correo, disabled: false},
        [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{value: titular.codigoPostal, disabled: true}, [Validators.required]],
      calle: [{value: titular.desCalle, disabled: false}, [Validators.required]],
      numeroInterior: [{value: titular.numInterior, disabled: false}],
      numeroExterior: [{value: titular.numExterior, disabled: false}, [Validators.required]],
      colonia: [{value: titular.desColonia, disabled: true}, [Validators.required]],
      municipio: [{value: titular.desMunicipio, disabled: true}, [Validators.required]],
      estado: [{value: titular.desEstado, disabled: true}, [Validators.required]],
      tipoPaquete: [{value: idPaquete, disabled: pago !== 0}, [Validators.required]],
      numeroPago: [{value: idTipoPagoMensual, disabled: pago !== 0}, [Validators.required]],
    });
    this.idNumeroPagoOriginal = idTipoPagoMensual;
  }

  inicializarFormDatosTitularSubstituto(indTitularSubstituto: boolean, titularSubstituto: ResponseSustitutoServicios): void {
    let fecha: Date | null = null;
    if (titularSubstituto.fechaNac) {
      const [anio, mes, dia] = titularSubstituto.fechaNac.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosTitularSubstitutoForm = this.formBuilder.group({
      datosIguales: [{value: false, disabled: false}, [Validators.required]],
      curp: [{value: titularSubstituto.curp, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: titularSubstituto.rfc, disabled: false}, [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{value: titularSubstituto.matricula, disabled: false}],
      nss: [{value: titularSubstituto.nss, disabled: false}, [Validators.required]],
      nombre: [{value: titularSubstituto.nomPersona, disabled: false}, [Validators.required]],
      primerApellido: [{value: titularSubstituto.primerApellido, disabled: false}, [Validators.required]],
      segundoApellido: [{value: titularSubstituto.segundoApellido, disabled: false}, [Validators.required]],
      sexo: [{value: titularSubstituto.idSexo ? +titularSubstituto.idSexo : null, disabled: false},
        [Validators.required]],
      otroSexo: [{value: titularSubstituto.otroSexo, disabled: false}],
      fechaNacimiento: [{value: fecha, disabled: false}, [Validators.required]],
      nacionalidad: [{value: titularSubstituto.idNacionalidad, disabled: false},
        [Validators.required]],
      lugarNacimiento: [{value: titularSubstituto.idEstado, disabled: false}, [Validators.required]],
      paisNacimiento: [{value: titularSubstituto.idPais, disabled: false}],
      telefono: [{value: titularSubstituto.telefono, disabled: false}, [Validators.required]],
      correoElectronico: [{value: titularSubstituto.correo, disabled: false},
        [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{value: titularSubstituto?.codigoPostal, disabled: false}, [Validators.required]],
      calle: [{value: titularSubstituto?.desCalle, disabled: false}, [Validators.required]],
      numeroInterior: [{value: titularSubstituto?.numInterior, disabled: false}],
      numeroExterior: [{value: titularSubstituto?.numExterior, disabled: false},
        [Validators.required]],
      colonia: [{value: titularSubstituto?.desColonia, disabled: true}, [Validators.required]],
      municipio: [{value: titularSubstituto?.desMunicipio, disabled: true}, [Validators.required]],
      estado: [{value: titularSubstituto?.desEstado, disabled: false}, [Validators.required]],
    });
    this.datosIguales(this.fdts.datosIguales.value);
  }

  inicializarFormDatosBeneficiario1(beneficiario: ResponseBeneficiarioServicios | null): void {
    let fecha: Date | null = null;
    if (beneficiario?.fechaNac) {
      const [anio, mes, dia] = beneficiario.fechaNac.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosBeneficiario1Form = this.formBuilder.group({
      curp: [{value: beneficiario?.curp, disabled: !!beneficiario}, [Validators.pattern(PATRON_CURP)]],
      rfc: [{value: beneficiario?.rfc, disabled: false}, [Validators.pattern(PATRON_RFC)]],
      matricula: [{value: beneficiario?.matricula, disabled: false},],
      nss: [{value: beneficiario?.nss, disabled: false}, []],
      nombre: [{value: beneficiario?.nomPersona, disabled: !!beneficiario}, []],
      primerApellido: [{value: beneficiario?.primerApellido, disabled: !!beneficiario}, []],
      segundoApellido: [{value: beneficiario?.segundoApellido, disabled: !!beneficiario}, []],
      sexo: [{value: beneficiario?.idSexo ? +beneficiario?.idSexo : null, disabled: !!beneficiario}, []],
      otroSexo: [{value: beneficiario?.otroSexo, disabled: !!beneficiario}],
      fechaNacimiento: [{value: fecha, disabled: !!beneficiario}, []],
      nacionalidad: [{value: beneficiario?.idNacionalidad, disabled: !!beneficiario}, []],
      lugarNacimiento: [{value: beneficiario?.idEstado ? +beneficiario?.idEstado : null, disabled: !!beneficiario}, []],
      paisNacimiento: [{value: beneficiario?.idPais ? +beneficiario?.idPais : null, disabled: !!beneficiario}],
      telefono: [{value: beneficiario?.telefono, disabled: false}, []],
      correoElectronico: [{value: beneficiario?.correo, disabled: false}, [Validators.pattern(PATRON_CORREO)]],
      cp: [{value: beneficiario?.codigoPostal, disabled: false}, []],
      calle: [{value: beneficiario?.desCalle, disabled: false}, []],
      numeroInterior: [{value: beneficiario?.numInterior, disabled: false}],
      numeroExterior: [{value: beneficiario?.numExterior, disabled: false}, []],
      colonia: [{value: beneficiario?.desColonia, disabled: false}, []],
      municipio: [{value: beneficiario?.desMunicipio, disabled: true}, []],
      estado: [{value: beneficiario?.desEstado, disabled: true}, []],
    });
  }

  inicializarFormDatosBeneficiario2(beneficiario: ResponseBeneficiarioServicios | null): void {
    let fecha: Date | null = null;
    if (beneficiario?.fechaNac) {
      const [anio, mes, dia] = beneficiario.fechaNac.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosBeneficiario2Form = this.formBuilder.group({
      curp: [{value: beneficiario?.curp, disabled: !!beneficiario}, [Validators.pattern(PATRON_CURP)]],
      rfc: [{value: beneficiario?.rfc, disabled: false}, [Validators.pattern(PATRON_RFC)]],
      matricula: [{value: beneficiario?.matricula, disabled: false},],
      nss: [{value: beneficiario?.nss, disabled: false}, []],
      nombre: [{value: beneficiario?.nomPersona, disabled: !!beneficiario}, []],
      primerApellido: [{value: beneficiario?.primerApellido, disabled: !!beneficiario}, []],
      segundoApellido: [{value: beneficiario?.segundoApellido, disabled: !!beneficiario}, []],
      sexo: [{value: beneficiario?.idSexo ? +beneficiario?.idSexo : null, disabled: !!beneficiario}, []],
      otroSexo: [{value: beneficiario?.otroSexo, disabled: !!beneficiario}],
      fechaNacimiento: [{value: fecha, disabled: !!beneficiario}, []],
      nacionalidad: [{value: beneficiario?.idNacionalidad, disabled: !!beneficiario}, []],
      lugarNacimiento: [{value: beneficiario?.idEstado ? +beneficiario?.idEstado : null, disabled: !!beneficiario}, []],
      paisNacimiento: [{value: beneficiario?.idPais ? +beneficiario?.idPais : null, disabled: !!beneficiario}],
      telefono: [{value: beneficiario?.telefono, disabled: false}, []],
      correoElectronico: [{value: beneficiario?.correo, disabled: false}, [Validators.pattern(PATRON_CORREO)]],
      cp: [{value: beneficiario?.codigoPostal, disabled: false}, []],
      calle: [{value: beneficiario?.desCalle, disabled: false}, []],
      numeroInterior: [{value: beneficiario?.numInterior, disabled: false}],
      numeroExterior: [{value: beneficiario?.numExterior, disabled: false}, []],
      colonia: [{value: beneficiario?.desColonia, disabled: false}, []],
      municipio: [{value: beneficiario?.desMunicipio, disabled: true}, []],
      estado: [{value: beneficiario?.desEstado, disabled: true}, []],
    });
  }

  consultarNumeroPagos(idPlanSfpa: number): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNumeroPagos(idPlanSfpa).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.numeroPagoPlanSfpa > 0) {
          this.fdt.tipoPaquete.disable();
          this.fdt.numeroPago.disable();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    })
  }

  convertirMayusculas(posicion: number): void {
    let formularios = [this.fdt.curp, this.fdt.rfc, this.fdts.curp, this.fdts.rfc, this.fdb1.curp, this.fdb1.rfc, this.fdb2.curp, this.fdb2.rfc];
    formularios[posicion].setValue(formularios[posicion].value.toUpperCase());
  }

  convertirMinusculas(posicion: number): void {
    let formularios = [this.fdt.correoElectronico, this.fdts.correoElectronico, this.fdb1.correoElectronico, this.fdb2.correoElectronico];
    formularios[posicion].setValue(formularios[posicion].value.toLowerCase());
  }

  consultarCurp(posicion: number): void {
    const formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].curp.value) {
     this.limpiarFormulario(posicion);
      return
    }
    if (formularioEnUso[posicion].curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }
    if (posicion !== 1) this.limpiarFormulario(posicion);
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarCURP(formularioEnUso[posicion].curp.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.mensaje.includes('interno')) {
          const [anio, mes, dia] = respuesta.datos[0].fechaNacimiento.split('-');
          const fecha = new Date(anio + '/' + mes + '/' + dia);
          formularioEnUso[posicion].nombre.setValue(respuesta.datos[0].nomPersona)
          formularioEnUso[posicion].nombre.disable()
          formularioEnUso[posicion].primerApellido.setValue(respuesta.datos[0].nomPersonaPaterno)
          formularioEnUso[posicion].primerApellido.disable()
          formularioEnUso[posicion].segundoApellido.setValue(respuesta.datos[0].nomPersonaMaterno)
          formularioEnUso[posicion].segundoApellido.disable()
          formularioEnUso[posicion].sexo.setValue(respuesta.datos[0].numSexo)
          formularioEnUso[posicion].sexo.disable()
          formularioEnUso[posicion].otroSexo.setValue(respuesta.datos[0]?.desOtroSexo)
          formularioEnUso[posicion].otroSexo.disable()
          formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
          formularioEnUso[posicion].fechaNacimiento.disable()
          formularioEnUso[posicion].telefono.setValue(respuesta.datos[0].desTelefono)
          formularioEnUso[posicion].correoElectronico.setValue(respuesta.datos[0].desCorreo)
          if (+respuesta.datos[0].idPais == 119) {
            formularioEnUso[posicion].nacionalidad.setValue(1);
            formularioEnUso[posicion].nacionalidad.disable();
            formularioEnUso[posicion].lugarNacimiento.setValue(respuesta.datos[0].idEstado)
            formularioEnUso[posicion].lugarNacimiento.disable()
          } else {
            formularioEnUso[posicion].nacionalidad.setValue(2);
            formularioEnUso[posicion].nacionalidad.disable();
            formularioEnUso[posicion].paisNacimiento.setValue(respuesta.datos[0].idPais)
            formularioEnUso[posicion].paisNacimiento.disable()
          }
          respuesta.datos[0].rfc ? formularioEnUso[posicion].rfc.setValue(respuesta.datos[0].rfc) :
            formularioEnUso[posicion].rfc.setValue(formularioEnUso[posicion].rfc.value);
          respuesta.datos[0].nss ? formularioEnUso[posicion].nss.setValue(respuesta.datos[0].nss) :
            formularioEnUso[posicion].nss.setValue(formularioEnUso[posicion].nss.value);
          this.consultarCodigoPostal(posicion);
          this.cambiarNacionalidad(posicion);
          this.cambiarNacionalidad2(posicion);
          return;
        }

        if (respuesta.datos.message.includes("LA CURP NO SE ENCUENTRA EN LA BASE DE DATOS")) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
          return
        }
        const [dia, mes, anio] = respuesta.datos.fechNac.split('/');
        const fecha = new Date(anio + '/' + mes + '/' + dia);
        formularioEnUso[posicion].nombre.setValue(respuesta.datos.nombre);
        formularioEnUso[posicion].nombre.disable();
        formularioEnUso[posicion].primerApellido.setValue(respuesta.datos.apellido1);
        formularioEnUso[posicion].primerApellido.disable();
        formularioEnUso[posicion].segundoApellido.setValue(respuesta.datos.apellido2);
        formularioEnUso[posicion].segundoApellido.disable();
        formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
        formularioEnUso[posicion].fechaNacimiento.disable();
        if (respuesta.datos.sexo.includes('HOMBRE')) {
          formularioEnUso[posicion].sexo.setValue(2);
          formularioEnUso[posicion].sexo.disable();
        }
        if (respuesta.datos.sexo.includes('MUJER')) {
          formularioEnUso[posicion].sexo.setValue(1);
          formularioEnUso[posicion].sexo.disable();
        }
        if (
          respuesta.datos.nacionalidad.includes('MEXICO') ||
          respuesta.datos.nacionalidad.includes('MEX')
        ) {
          formularioEnUso[posicion].nacionalidad.setValue(1);
          formularioEnUso[posicion].nacionalidad.disable();
        } else {
          formularioEnUso[posicion].nacionalidad.setValue(2);
          formularioEnUso[posicion].nacionalidad.disable();
        }
        this.consultarLugarNacimiento(respuesta.datos.desEntidadNac, posicion);
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
  }

  consultarLugarNacimiento(entidad: string, posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    const entidadEditada = this.accentsTidy(entidad);
    if (entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')) {
      formularioEnUso[posicion].lugarNacimiento.setValue(11);
      formularioEnUso[posicion].lugarNacimiento.disable();
      return
    }
    if (entidadEditada.toUpperCase().includes('DISTRITO FEDERAL') || entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')) {
      formularioEnUso[posicion].lugarNacimiento.disable();
      return
    }
    this.estados.forEach((element: any) => {
      const entidadIteracion = this.accentsTidy(element.label);
      if (entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())) {
        formularioEnUso[posicion].lugarNacimiento.setValue(element.value);
        formularioEnUso[posicion].lugarNacimiento.disable();
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


  recargarPagina(): void {
    window.location.reload()
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
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarMatriculaSiap(formularioEnUso[posicion].matricula.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
          formularioEnUso[posicion].matricula.setErrors({'incorrect': true});
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(error.error.mensaje));
      }
    });
  }

  consultarNSS(posicion: number): void {
    const formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].nss.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNSS(formularioEnUso[posicion].nss.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(
            TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje) || "El Número de Seguridad Social no existe.");
          formularioEnUso[posicion].nss.setErrors({'incorrect': true});
        } else {
          formularioEnUso[posicion].nss.setErrors(null);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    });
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
        formularios[0].reset()
        formularios[1].setValidators(Validators.required);
      } else {
        formularios[1].reset()
        formularios[1].patchValue(null);
        formularios[1].clearValidators();
        formularios[1].updateValueAndValidity();
      }
    } else if (this.fdts.nacionalidad.value == 1) {
      formularios[2].reset()
      formularios[3].setValidators(Validators.required);
    } else {
      formularios[3].reset()
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
    const formularios = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularios[posicion].cp.value) {
      return;
    }
    this.cargadorService.activar();
    this.serviciosFunerariosService.consutaCP(formularios[posicion].cp.value)
      .pipe(finalize(() => this.cargadorService.desactivar()))
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

  datosIguales(esIgual: boolean): void {
    esIgual ? this.fdts.datosIguales.setValue(true) : this.fdts.datosIguales.setValue(false);
    if (esIgual) {
      this.datosTitularSubstitutoForm.enable();
      return
    }
    this.datosTitularSubstitutoForm.disable();
  }

  limpiarFormulario(posicion: number): void {
    const formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    formularioEnUso[posicion].nombre.patchValue(null);
    formularioEnUso[posicion].nombre.enable();
    formularioEnUso[posicion].primerApellido.patchValue(null);
    formularioEnUso[posicion].primerApellido.enable();
    formularioEnUso[posicion].segundoApellido.patchValue(null);
    formularioEnUso[posicion].segundoApellido.enable();
    formularioEnUso[posicion].sexo.patchValue(null);
    formularioEnUso[posicion].sexo.enable();
    formularioEnUso[posicion].otroSexo.patchValue(null);
    formularioEnUso[posicion].otroSexo.enable();
    formularioEnUso[posicion].fechaNacimiento.patchValue(null);
    formularioEnUso[posicion].fechaNacimiento.enable();
    formularioEnUso[posicion].nacionalidad.patchValue(null);
    formularioEnUso[posicion].nacionalidad.enable();
    formularioEnUso[posicion].lugarNacimiento.patchValue(null);
    formularioEnUso[posicion].lugarNacimiento.enable();
    formularioEnUso[posicion].paisNacimiento.patchValue(null);
    formularioEnUso[posicion].paisNacimiento.enable();
  }

  mostrarInfoPaqueteSeleccionado(): void {
    const objetoPaquete = this.paqueteBackUp.filter((paquete: any) => {
      return paquete.idPaquete == +this.fdt.tipoPaquete.value
    });
    this.infoPaqueteSeleccionado = objetoPaquete[0].descPaquete;
    this.confirmarAceptarPaquete = true;
  }

  validarNumeroPago(): void {
    this.cambioNumeroPagos = this.idNumeroPagoOriginal != this.fdt.numeroPago.value;
  }

  validarBotonGuardar(): boolean {
    if (!this.datosTitularForm) return false;
    return this.datosTitularForm.invalid || this.datosTitularSubstitutoForm.invalid || this.promotorForm.invalid;
  }


  aceptar(): void {
    if (this.indice == this.menuStep.length) {
      this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA modificado correctamente');
      void this.router.navigate(["servicios-funerarios"]);
      return;
    }
    this.indice++;
  }

  guardar(): void {
    const configuracionArchivo: OpcionesArchivos = {};
    const objetoGuardar: SolicitudModificacionSFPA = this.generarObjetoPlanSFPA();
    this.confirmarGuardado = false;
    this.cargadorService.activar();
    this.serviciosFunerariosService.actualizarPlanSFPA(objetoGuardar).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.alertaService.mostrar(TipoAlerta.Exito, this.mensajesSistemaService.obtenerMensajeSistemaPorId(18));
          if (this.cambioNumeroPagos) {
            const file = new Blob(
              [this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
              {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
            const url = window.URL.createObjectURL(file);
            window.open(url)
          }
          void this.router.navigate(['../servicios-funerarios']);
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
        }
      }
    )
  }

  generarObjetoPlanSFPA(): SolicitudModificacionSFPA {
    return {
      plan: this.generarPlan(),
      contratante: this.generarContratante(),
      titularSubstituto: this.generarSustituto(),
      beneficiario1: this.generarBeneficiario1(),
      beneficiario2: this.generarBeneficiario2()
    }
  }

  generarPlan(): SolicitudPlanModificacion {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    const numeroPago = this.fdt.numeroPago.value;
    const numPago: string = this.numeroPago.find((e: TipoDropdown) => e.value === numeroPago)?.label ?? '';
    return {
      idPaquete: this.fdt.tipoPaquete.value,
      idPlanSfpa: this.idPlanSfpa,
      idPromotor: this.fp.promotor.value,
      idTipoContratacion: 1,
      idTipoPagoMensual: this.fdt.numeroPago.value,
      idVelatorio: velatorio,
      indModificarTitularSubstituto: this.fdts.datosIguales.value ? 0 : 1,
      indPromotor: this.fp.gestionadoPorPromotor.value ? 1 : 0,
      indTitularSubstituto: 0,
      monPrecio: this.consultarMonPrecio().toString(),
      pagoMensual: numPago,
      cambioParcialidad: numPago === this.datosPlan.noPagos ? 0 : 1
    }
  }

  generarSustituto(): SolicitudSubstituto | null {
    if (!this.fdts.datosIguales.value) return null;
    const sustitutoMod = this.datosTitularSubstitutoForm.getRawValue();
    if (sustitutoMod.curp === this.datosContratante.curp) return null;
    let fecNacimiento = sustitutoMod.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: sustitutoMod.cp,
      correo: sustitutoMod.correoElectronico,
      curp: sustitutoMod.curp,
      desCalle: sustitutoMod.calle,
      desColonia: sustitutoMod.colonia,
      desEstado: sustitutoMod.estado,
      desMunicipio: sustitutoMod.municipio,
      fecNacimiento,
      idDomicilio: this.datosSustituto?.idDomicilio ?? null,
      idEstado: sustitutoMod.lugarNacimiento,
      idPais: sustitutoMod.paisNacimiento,
      idPersona: this.datosSustituto?.idPersona ?? null,
      idSexo: sustitutoMod.sexo,
      ine: null,
      matricula: sustitutoMod.matricula,
      nomPersona: sustitutoMod.nombre,
      nss: sustitutoMod.nss,
      numExterior: sustitutoMod.numeroExterior,
      numInterior: sustitutoMod.numeroInterior,
      otroSexo: sustitutoMod.otroSexo,
      persona: "titular substituto",
      primerApellido: sustitutoMod.primerApellido,
      rfc: sustitutoMod.rfc,
      segundoApellido: sustitutoMod.segundoApellido,
      telefono: sustitutoMod.telefono,
      telefonoFijo: null,
    }
  }

  generarContratante(): SolicitudContratanteModificacion {
    const contratanteMod = this.datosTitularForm.getRawValue();
    let fecNacimiento = contratanteMod.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: contratanteMod.cp,
      correo: contratanteMod.correoElectronico,
      curp: contratanteMod.curp,
      desCalle: contratanteMod.calle,
      desColonia: contratanteMod.colonia,
      desEstado: contratanteMod.estado,
      desMunicipio: contratanteMod.municipio,
      fecNacimiento,
      idContratante: this.datosContratante.idContratante,
      idDomicilio: this.datosContratante.idDomicilio,
      idEstado: contratanteMod.lugarNacimiento,
      idPais: contratanteMod.paisNacimiento,
      idPersona: this.datosContratante.idPersona,
      idSexo: contratanteMod.sexo,
      ine: null,
      matricula: contratanteMod.matricula,
      nomPersona: contratanteMod.nombre,
      nss: contratanteMod.nss,
      numExterior: contratanteMod.numeroExterior,
      numInterior: contratanteMod.numeroInterior,
      otroSexo: contratanteMod.otroSexo,
      persona: "titular",
      primerApellido: contratanteMod.primerApellido,
      rfc: contratanteMod.rfc,
      segundoApellido: contratanteMod.segundoApellido,
      telefono: contratanteMod.telefono,
      telefonoFijo: contratanteMod.telefonoFijo,
      idTitular: this.datosContratante.idContratante
    }
  }

  generarBeneficiario1(): SolicitudBeneficiarioModificar | null {
    const beneficiario1Mod = this.datosBeneficiario1Form.getRawValue();
    if (!beneficiario1Mod.curp) return null;
    let fecNacimiento = beneficiario1Mod.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: beneficiario1Mod.cp,
      correo: beneficiario1Mod.correoElectronico,
      curp: beneficiario1Mod.curp,
      desCalle: beneficiario1Mod.calle,
      desColonia: beneficiario1Mod.colonia,
      desEstado: beneficiario1Mod.estado,
      desMunicipio: beneficiario1Mod.municipio,
      fecNacimiento,
      idDomicilio: this.datosBeneficiario1?.idDomicilio ?? null,
      idEstado: beneficiario1Mod.lugarNacimiento,
      idPais: beneficiario1Mod.paisNacimiento,
      idPersona: this.datosBeneficiario1?.idPersona ?? null,
      idSexo: beneficiario1Mod.sexo,
      ine: null,
      matricula: beneficiario1Mod.matricula,
      nomPersona: beneficiario1Mod.nombre,
      nss: beneficiario1Mod.nss,
      numExterior: beneficiario1Mod.numeroExterior,
      numInterior: beneficiario1Mod.numeroInterior,
      otroSexo: beneficiario1Mod.otroSexo,
      persona: 'beneficiario 1',
      primerApellido: beneficiario1Mod.primerApellido,
      rfc: beneficiario1Mod.rfc,
      segundoApellido: beneficiario1Mod.segundoApellido,
      telefono: beneficiario1Mod.telefono,
      telefonoFijo: '',
      idTitularBeneficiaro: this.datosBeneficiario1?.idTitularBeneficiario ?? null
    }
  }

  generarBeneficiario2(): SolicitudBeneficiarioModificar | null {
    const beneficiario2Mod = this.datosBeneficiario2Form.getRawValue();
    if (!beneficiario2Mod.curp) return null;
    let fecNacimiento = beneficiario2Mod.fechaNacimiento
    if (fecNacimiento) fecNacimiento = moment(fecNacimiento).format('yyyy-MM-DD');
    return {
      codigoPostal: beneficiario2Mod.cp,
      correo: beneficiario2Mod.correoElectronico,
      curp: beneficiario2Mod.curp,
      desCalle: beneficiario2Mod.calle,
      desColonia: beneficiario2Mod.colonia,
      desEstado: beneficiario2Mod.estado,
      desMunicipio: beneficiario2Mod.municipio,
      fecNacimiento,
      idDomicilio: this.datosBeneficiario2?.idDomicilio ?? null,
      idEstado: beneficiario2Mod.lugarNacimiento,
      idPais: beneficiario2Mod.paisNacimiento,
      idPersona: this.datosBeneficiario2?.idPersona ?? null,
      idSexo: beneficiario2Mod.sexo,
      ine: null,
      matricula: beneficiario2Mod.matricula,
      nomPersona: beneficiario2Mod.nombre,
      nss: beneficiario2Mod.nss,
      numExterior: beneficiario2Mod.numeroExterior,
      numInterior: beneficiario2Mod.numeroInterior,
      otroSexo: beneficiario2Mod.otroSexo,
      persona: 'beneficiario 2',
      primerApellido: beneficiario2Mod.primerApellido,
      rfc: beneficiario2Mod.rfc,
      segundoApellido: beneficiario2Mod.segundoApellido,
      telefono: beneficiario2Mod.telefono,
      telefonoFijo: '',
      idTitularBeneficiaro: this.datosBeneficiario2?.idTitularBeneficiario ?? null
    }
  }

  consultarMonPrecio(): number {
    let paquete: any = this.paqueteBackUp.find((paquete: CatalogoPaquetes) => {
      return Number(this.fdt.tipoPaquete.value) == paquete.idPaquete;
    })
    return paquete.monPrecio;
  }

  handleGestionPromotor() {
    if (this.fp.gestionadoPorPromotor.value) {
      this.fp.promotor.enable();
      this.fp.promotor.setValidators(Validators.required);
      this.promotorForm.markAllAsTouched();
    } else {
      this.fp.promotor.setValue(null);
      this.fp.promotor.disable();
      this.fp.promotor.clearValidators();
    }
    this.fp.promotor.updateValueAndValidity();
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

}
