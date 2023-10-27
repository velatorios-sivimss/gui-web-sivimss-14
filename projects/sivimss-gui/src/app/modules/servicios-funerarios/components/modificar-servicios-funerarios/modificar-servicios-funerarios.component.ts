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
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {finalize} from "rxjs";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AgregarPlanSFPA, Persona} from "../../models/servicios-funerarios.interface";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import * as moment from "moment/moment";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";

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

  indice: number = 0;
  menuStep: MenuItem[] = MENU_STEPPER;

  sexo: TipoDropdown[] = [{value: 1, label: 'Mujer'}, {value: 2, label: 'Hombre'}, {value: 3, label: 'Otro'}];
  nacionalidad: TipoDropdown[] = [{value: 1, label: 'Mexicana'}, {value: 2, label: 'Extranjera'}];
  estados: TipoDropdown[] = [];
  paises: TipoDropdown[] = [];
  tipoPaquete: TipoDropdown[] = [];
  numeroPago: TipoDropdown[] = [];
  colonias:TipoDropdown[] = [];
  coloniasContratante:TipoDropdown[] = [];
  paqueteBackUp!: CatalogoPaquetes[];

  datosAfiliadoForm!: FormGroup;
  datosContratanteForm!: FormGroup;

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
    let respuesta = this.route.snapshot.data['respuesta'];
    this.estados = respuesta[this.POSICION_ESTADOS];
    this.paises = respuesta[this.POSICION_PAISES];
    this.numeroPago = mapearArregloTipoDropdown(
      respuesta[this.POSICION_NUMERO_PAGOS].datos, 'DES_TIPO_PAGO_MENSUAL', 'ID_TIPO_PAGO_MENSUAL');
    this.tipoPaquete = mapearArregloTipoDropdown(respuesta[this.POSICION_PAQUETE].datos,
      'nomPaquete', 'idPaquete');
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
        this.folioConvenio = respuesta.datos.numFolioPlanSFPA;
        this.nombreVelatorio = respuesta.datos.desIdVelatorio;
        this.fecIngresa = respuesta.datos.fecIngreso;
        this.inicializarFormDatosAfiliado(respuesta.datos);
        this.inicializarFormDatosContratante(respuesta.datos ? respuesta.datos : null);
        if (respuesta.datos.numPago > 0) {
          this.fda.tipoPaquete.disable();
          this.fda.numeroPago.disable();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  inicializarFormDatosAfiliado(afiliado: any): void {
    const [anio, mes, dia] = afiliado.titularesBeneficiarios[0].fecNacimiento.split('-');
    const fecha = new Date(anio + '/' + mes + '/' + dia);
    this.datosAfiliadoForm = this.formBuilder.group({
      curp: [{value: afiliado.titularesBeneficiarios[0].curp, disabled: true},
        [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: afiliado.titularesBeneficiarios[0].rfc, disabled: true},
        [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{value: afiliado.titularesBeneficiarios[0].matricula, disabled: false},],
      nss: [{value: afiliado.titularesBeneficiarios[0].nss, disabled: true},
        [Validators.required]],
      nombre: [{value: afiliado.titularesBeneficiarios[0].nomPersona, disabled: true},
        [Validators.required]],
      primerApellido: [{value: afiliado.titularesBeneficiarios[0].primerApellido, disabled: true},
        [Validators.required]],
      segundoApellido: [{value: afiliado.titularesBeneficiarios[0].segundoApellido, disabled: true},
        [Validators.required]],
      sexo: [{value: +afiliado.titularesBeneficiarios[0].sexo, disabled: true},
        [Validators.required]],
      otroSexo: [{value: afiliado.titularesBeneficiarios[0].otroSexo, disabled: true}],
      fechaNacimiento: [{value: fecha, disabled: true},
        [Validators.required]],
      nacionalidad: [{value: +afiliado?.titularesBeneficiarios[0].idPais == 119 ? 1 : 2, disabled: true},
        [Validators.required]],
      lugarNacimiento: [{value: +afiliado?.titularesBeneficiarios[0].idEstado ?? null, disabled: true},
        [Validators.required]],
      paisNacimiento: [{value: +afiliado?.titularesBeneficiarios[0].idPais ?? null, disabled: true}],
      telefono: [{value: afiliado.titularesBeneficiarios[0].telefono, disabled: false},
        [Validators.required]],
      correoElectronico: [{value: afiliado.titularesBeneficiarios[0].correo, disabled: false},
        [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{value: afiliado.titularesBeneficiarios[0].cp.codigoPostal, disabled: true},
        [Validators.required]],
      calle: [{value: afiliado.titularesBeneficiarios[0].cp.desCalle, disabled: false},
        [Validators.required]],
      numeroInterior: [{value: afiliado.titularesBeneficiarios[0].cp.numInterior, disabled: false}],
      numeroExterior: [{value: afiliado.titularesBeneficiarios[0].cp.numExterior, disabled: false},
        [Validators.required]],
      colonia: [{value: afiliado.titularesBeneficiarios[0].cp.desColonia, disabled: true},
        [Validators.required]],
      municipio: [{value: afiliado.titularesBeneficiarios[0].cp.desMunicipio, disabled: true},
        [Validators.required]],
      estado: [{value: afiliado.titularesBeneficiarios[0].cp.desEstado, disabled: true},
        [Validators.required]],
      tipoPaquete: [{value: +afiliado.idPaquete, disabled: false},
        [Validators.required]],
      numeroPago: [{value: +afiliado.idTipoPagoMensual, disabled: false},
        [Validators.required]],
    });
    this.idNumeroPagoOriginal = +afiliado.idTipoPagoMensual
    if (this.fda.sexo.value == 3) {
      this.fda.otroSexo.setValidators(Validators.required);
      this.fda.otroSexo.updateValueAndValidity();
    }
  }

  inicializarFormDatosContratante(contratante: any): void {
    const [anio, mes, dia] = contratante.titularesBeneficiarios[0].fecNacimiento.split('-');
    let fecha = new Date(anio + '/' + mes + '/' + dia);
    let objetoContratante: Persona = {
      persona: null,
      rfc: contratante.titularesBeneficiarios[0].rfc,
      curp: contratante.titularesBeneficiarios[0].curp,
      matricula: contratante.titularesBeneficiarios[0].matricula,
      nss: contratante.titularesBeneficiarios[0].nss,
      nomPersona: contratante.titularesBeneficiarios[0].nomPersona,
      primerApellido: contratante.titularesBeneficiarios[0].primerApellido,
      segundoApellido: contratante.titularesBeneficiarios[0].segundoApellido,
      sexo: +contratante.titularesBeneficiarios[0].sexo,
      otroSexo: contratante.titularesBeneficiarios[0].otroSexo,
      fecNacimiento: fecha,
      idPais: contratante.titularesBeneficiarios[0].idPais,
      idEstado: contratante.titularesBeneficiarios[0].idEstado,
      telefono: contratante.titularesBeneficiarios[0].telefono,
      telefonoFijo: contratante?.titularesBeneficiarios[0].telefono,
      correo: contratante.titularesBeneficiarios[0].correo,
      tipoPersona: contratante.titularesBeneficiarios[0].tipoPersona,
      ine: contratante.titularesBeneficiarios[0].ine,
      cp: {
        desCalle: contratante.titularesBeneficiarios[0].cp.desCalle,
        numExterior: contratante.titularesBeneficiarios[0].cp.numExterior,
        numInterior: contratante.titularesBeneficiarios[0].cp.numInterior,
        codigoPostal: contratante.titularesBeneficiarios[0].cp.codigoPostal,
        desColonia: contratante.titularesBeneficiarios[0].cp.desColonia,
        desMunicipio: contratante.titularesBeneficiarios[0].cp.desMunicipio,
        desEstado: contratante.titularesBeneficiarios[0].cp.desEstado,
      }
    };

    if (contratante.titularesBeneficiarios.length > 1) {
      const [anio, mes, dia] = contratante.titularesBeneficiarios[1].fecNacimiento.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);

      objetoContratante = {
        persona: null,
        rfc: contratante.titularesBeneficiarios[1].rfc,
        curp: contratante.titularesBeneficiarios[1].curp,
        matricula: contratante.titularesBeneficiarios[1].matricula,
        nss: contratante.titularesBeneficiarios[1].nss,
        nomPersona: contratante.titularesBeneficiarios[1].nomPersona,
        primerApellido: contratante.titularesBeneficiarios[1].primerApellido,
        segundoApellido: contratante.titularesBeneficiarios[1].segundoApellido,
        sexo: +contratante.titularesBeneficiarios[1].sexo,
        otroSexo: contratante.titularesBeneficiarios[1].otroSexo,
        fecNacimiento: fecha,
        idPais: contratante.titularesBeneficiarios[1].idPais,
        idEstado: contratante.titularesBeneficiarios[1].idEstado,
        telefono: contratante.titularesBeneficiarios[1].telefono,
        telefonoFijo: contratante?.titularesBeneficiarios[1].telefono,
        correo: contratante.titularesBeneficiarios[1].correo,
        tipoPersona: contratante.titularesBeneficiarios[1].tipoPersona,
        ine: contratante.titularesBeneficiarios[1].ine,
        cp: {
          desCalle: contratante.titularesBeneficiarios[1].cp.desCalle,
          numExterior: contratante.titularesBeneficiarios[1].cp.numExterior,
          numInterior: contratante.titularesBeneficiarios[1].cp.numInterior,
          codigoPostal: contratante.titularesBeneficiarios[1].cp.codigoPostal,
          desColonia: contratante.titularesBeneficiarios[1].cp.desColonia,
          desMunicipio: contratante.titularesBeneficiarios[1].cp.desMunicipio,
          desEstado: contratante.titularesBeneficiarios[1].cp.desEstado,
        }
      };
    }

    this.datosContratanteForm = this.formBuilder.group({
      datosIguales: [{value: false, disabled: false}, [Validators.required]],
      curp: [{value: objetoContratante.curp, disabled: false},
        [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{value: objetoContratante.rfc, disabled: false},
        [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{value: objetoContratante.matricula, disabled: false}],
      nss: [{value: objetoContratante.nss, disabled: false},
        [Validators.required]],
      nombre: [{value: objetoContratante.nomPersona, disabled: false},
        [Validators.required]],
      primerApellido: [{value: objetoContratante.primerApellido, disabled: false},
        [Validators.required]],
      segundoApellido: [{value: objetoContratante.segundoApellido, disabled: false},
        [Validators.required]],
      sexo: [{value: objetoContratante.sexo, disabled: false},
        [Validators.required]],
      otroSexo: [{value: objetoContratante.otroSexo, disabled: false}],
      fechaNacimiento: [{value: objetoContratante.fecNacimiento, disabled: false}, [Validators.required]],
      nacionalidad: [{
        value: objetoContratante.idPais ? objetoContratante.idPais == 119 ? 1 : 2 : null,
        disabled: false
      },
        [Validators.required]],
      lugarNacimiento: [{value: objetoContratante.idEstado, disabled: false},
        [Validators.required]],
      paisNacimiento: [{value: objetoContratante.idPais, disabled: false}],
      telefono: [{value: objetoContratante.telefono, disabled: false},
        [Validators.required]],
      correoElectronico: [{value: objetoContratante.correo, disabled: false},
        [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{value: objetoContratante.cp?.codigoPostal, disabled: false},
        [Validators.required]],
      calle: [{value: objetoContratante.cp?.desCalle, disabled: false},
        [Validators.required]],
      numeroInterior: [{value: objetoContratante.cp?.numInterior, disabled: false}],
      numeroExterior: [{value: objetoContratante.cp?.numExterior, disabled: false},
        [Validators.required]],
      colonia: [{value: objetoContratante.cp?.desColonia, disabled: true},
        [Validators.required]],
      municipio: [{value: objetoContratante.cp?.desMunicipio, disabled: true},
        [Validators.required]],
      estado: [{value: objetoContratante.cp?.desEstado, disabled: false},
        [Validators.required]],
    });
    this.datosContratanteForm.disable();
    if (this.fdc.sexo.value == 3) {
      this.fdc.otroSexo.setValidators(Validators.required);
      this.fdc.otroSexo.updateValueAndValidity();
    }
  }

  consultarNumeroPagos(idPlanSfpa: number): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNumeroPagos(idPlanSfpa).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.numeroPagoPlanSfpa > 0) {
          this.fda.tipoPaquete.disable();
          this.fda.numeroPago.disable();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    })
  }

  convertirMayusculas(posicion: number): void {
    let formularios = [this.fda.curp, this.fda.rfc, this.fdc.curp, this.fdc.rfc];
    formularios[posicion].setValue(formularios[posicion].value.toUpperCase());
  }

  convertirMinusculas(posicion: number): void {
    let formularios = [this.fda.correoElectronico, this.fdc.correoElectronico];
    formularios[posicion].setValue(formularios[posicion].value.toLowerCase());
  }

  consultarCurp(posicion: number): void {
    let formularioEnUso = [this.fda, this.fdc];
    if (!formularioEnUso[posicion].curp.value) return;
    if (formularioEnUso[posicion].curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }
    this.limpiarFormulario(posicion);
    this.validarUsuarioAfiliado(formularioEnUso[posicion].curp.value, "", "");
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarCURP(formularioEnUso[posicion].curp.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.mensaje.includes('interno')) {
          const [anio, mes, dia] = respuesta.datos[0].fechaNacimiento.split('-');
          const fecha = new Date(anio + '/' + mes + '/' + dia);
          formularioEnUso[posicion].nombre.setValue(respuesta.datos[0].nomPersona)
          formularioEnUso[posicion].primerApellido.setValue(respuesta.datos[0].nomPersonaPaterno)
          formularioEnUso[posicion].segundoApellido.setValue(respuesta.datos[0].nomPersonaMaterno)
          formularioEnUso[posicion].sexo.setValue(respuesta.datos[0].numSexo)
          formularioEnUso[posicion].otroSexo.setValue(respuesta.datos[0]?.desOtroSexo)
          formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
          formularioEnUso[posicion].telefono.setValue(respuesta.datos[0].desTelefono)
          formularioEnUso[posicion].correoElectronico.setValue(respuesta.datos[0].desCorreo)
          formularioEnUso[posicion].cp.setValue(respuesta.datos[0].DesCodigoPostal)
          formularioEnUso[posicion].calle.setValue(respuesta.datos[0].desCalle)
          formularioEnUso[posicion].numeroInterior.setValue(respuesta.datos[0].numInterior)
          formularioEnUso[posicion].numeroExterior.setValue(respuesta.datos[0].numExterior)
          formularioEnUso[posicion].colonia.setValue(respuesta.datos[0].desColonia)
          if (+respuesta.datos[0].idPais == 119) {
            formularioEnUso[posicion].nacionalidad.setValue(1);
            formularioEnUso[posicion].lugarNacimiento.setValue(respuesta.datos[0].idEstado)
          } else {
            formularioEnUso[posicion].nacionalidad.setValue(2);
            formularioEnUso[posicion].paisNacimiento.setValue(respuesta.datos[0].idPais)
          }
          respuesta.datos[0].rfc ? formularioEnUso[posicion].rfc.setValue(respuesta.datos[0].rfc) :
            formularioEnUso[posicion].rfc.setValue(formularioEnUso[posicion].rfc.value);
          respuesta.datos[0].nss ? formularioEnUso[posicion].nss.setValue(respuesta.datos[0].nss) :
            formularioEnUso[posicion].nss.setValue(formularioEnUso[posicion].nss.value);
          this.consultarCodigoPostal(posicion);
          return;
        }

        if (respuesta.datos.message.includes("LA CURP NO SE ENCUENTRA EN LA BASE DE DATOS")) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
          return
        }
        const [dia, mes, anio] = respuesta.datos.fechNac.split('/');
        const fecha = new Date(anio + '/' + mes + '/' + dia);
        formularioEnUso[posicion].nombre.setValue(respuesta.datos.nombre);
        formularioEnUso[posicion].primerApellido.setValue(
          respuesta.datos.apellido1
        );
        formularioEnUso[posicion].segundoApellido.setValue(
          respuesta.datos.apellido2
        );
        formularioEnUso[posicion].fechaNacimiento.setValue(fecha);
        if (respuesta.datos.sexo.includes('HOMBRE')) {
          formularioEnUso[posicion].sexo.setValue(2);
        }
        if (respuesta.datos.sexo.includes('MUJER')) {
          formularioEnUso[posicion].sexo.setValue(1);
        }
        if (
          respuesta.datos.nacionalidad.includes('MEXICO') ||
          respuesta.datos.nacionalidad.includes('MEX')
        ) {
          formularioEnUso[posicion].nacionalidad.setValue(1);
        } else {
          formularioEnUso[posicion].nacionalidad.setValue(2);
        }
        this.consultarLugarNacimiento(respuesta.datos.desEntidadNac,posicion);
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
  }

  consultarLugarNacimiento(entidad:string, posicion:number): void {
    let formularioEnUso = [this.fda, this.fdc];
    const entidadEditada = this.accentsTidy(entidad);
    if(entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')){
      formularioEnUso[posicion].lugarNacimiento.setValue(11);
      return
    }
    if(entidadEditada.toUpperCase().includes('DISTRITO FEDERAL')|| entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')){
      formularioEnUso[posicion].lugarNacimiento.setValue(7);
      return
    }
    this.estados.forEach((element:any) => {
      const entidadIteracion =  this.accentsTidy(element.label);
      if(entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())){
        formularioEnUso[posicion].lugarNacimiento.setValue(element.value);
      }
    })
  }

  accentsTidy(s: string): string {
    let r=s.toLowerCase();
    r = r.replace(new RegExp(/[àáâãäå]/g),"a");
    r = r.replace(new RegExp(/æ/g),"ae");
    r = r.replace(new RegExp(/ç/g),"c");
    r = r.replace(new RegExp(/[èéêë]/g),"e");
    r = r.replace(new RegExp(/[ìíîï]/g),"i");
    r = r.replace(new RegExp(/ñ/g),"n");
    r = r.replace(new RegExp(/[òóôõö]/g),"o");
    r = r.replace(new RegExp(/œ/g),"oe");
    r = r.replace(new RegExp(/[ùúûü]/g),"u");
    r = r.replace(new RegExp(/[ýÿ]/g),"y");
    return r;
  };

  consultarRfc(posicion: number): void {
    let formularioEnUso = [this.fda, this.fdc];
    if (!formularioEnUso[posicion].rfc.value) return;
    if (formularioEnUso[posicion].rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
    return
    // this.cargadorService.activar();
    // this.limpiarFormulario(posicion);
    // this.validarUsuarioAfiliado("", formularioEnUso[posicion].rfc.value, "");
    // this.serviciosFunerariosService.consultarRFC(formularioEnUso[posicion].rfc.value).pipe(
    //   finalize(() => this.cargadorService.desactivar())
    // ).subscribe({
    //   next: (respuesta: HttpRespuesta<any>) => {
    //     if (respuesta.mensaje.includes('interno')) {
    //       const [anio, mes, dia] = respuesta.datos[0].fechaNacimiento.split('-');
    //       const fecha = new Date(anio + '/' + mes + '/' + dia);
    //       formularioEnUso[posicion].nombre.setValue(respuesta.datos[0].nomPersona)
    //       formularioEnUso[posicion].primerApellido.setValue(respuesta.datos[0].nomPersonaPaterno)
    //       formularioEnUso[posicion].segundoApellido.setValue(respuesta.datos[0].nomPersonaMaterno)
    //       formularioEnUso[posicion].sexo.setValue(respuesta.datos[0].numSexo)
    //       formularioEnUso[posicion].otroSexo.setValue(respuesta.datos[0]?.desOtroSexo)
    //       formularioEnUso[posicion].fechaNacimiento.setValue(fecha)
    //       formularioEnUso[posicion].telefono.setValue(respuesta.datos[0].desTelefono)
    //       formularioEnUso[posicion].correoElectronico.setValue(respuesta.datos[0].desCorreo)
    //       formularioEnUso[posicion].cp.setValue(respuesta.datos[0].DesCodigoPostal)
    //       formularioEnUso[posicion].calle.setValue(respuesta.datos[0].desCalle)
    //       formularioEnUso[posicion].numeroInterior.setValue(respuesta.datos[0].numInterior)
    //       formularioEnUso[posicion].numeroExterior.setValue(respuesta.datos[0].numExterior)
    //       formularioEnUso[posicion].colonia.setValue(respuesta.datos[0].desColonia)
    //       if (+respuesta.datos[0].idPais == 119) {
    //         formularioEnUso[posicion].nacionalidad.setValue(1);
    //         formularioEnUso[posicion].lugarNacimiento.setValue(respuesta.datos[0].idEstado)
    //       } else {
    //         formularioEnUso[posicion].nacionalidad.setValue(2);
    //         formularioEnUso[posicion].paisNacimiento.setValue(respuesta.datos[0].idPais)
    //       }
    //       formularioEnUso[posicion].rfc.setValue(respuesta.datos[0].rfc);
    //       formularioEnUso[posicion].nss.setValue(respuesta.datos[0].nss);
    //       this.consultarCodigoPostal(posicion);
    //       return;
    //     }
    //     const [anio, mes, dia] = respuesta.datos.identificacion[0].fNacimiento.split('-');
    //     const fecha = new Date(anio + '/' + mes + '/' + dia);
    //     formularioEnUso[posicion].nombre.setValue(respuesta.datos.identificacion[0].nombre)
    //     formularioEnUso[posicion].primerApellido.setValue(respuesta.datos.identificacion[0].apPaterno)
    //     formularioEnUso[posicion].segundoApellido.setValue(respuesta.datos.identificacion[0].apMaterno)
    //     formularioEnUso[posicion].fechaNacimiento.setValue(fecha)
    //     formularioEnUso[posicion].correoElectronico.setValue(respuesta.datos.ubicacion.email)
    //     if (respuesta.datos.identificacion[0].nacionalidad.includes('ESTADOS UNIDOS MEXICANOS')) {
    //       formularioEnUso[posicion].nacionalidad.setValue(1);
    //     } else {
    //       formularioEnUso[posicion].nacionalidad.setValue(2);
    //     }
    //     this.consultarLugarNacimiento(respuesta.datos.ubicacion[0].dEntFed,posicion);
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
    //   }
    // })
  }

  validarUsuarioAfiliado(curp: string, rfc: string, nss: string): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.validarAfiliado(curp, rfc, nss).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.confirmacionDatosExistentes = true;
          this.mensajeDatosExistentes = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje)
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    });
  }

  recargarPagina(): void {
    window.location.reload()
  }

  consultarCorreo(posicion: number): void {
    let formularios = [this.fda.correoElectronico, this.fdc.correoElectronico];
    if (!formularios[posicion].value) return;
    if (formularios[posicion]?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  consultarMatricula(posicion: number): void {
    let formularioEnUso = [this.fda, this.fdc];
    if (!formularioEnUso[posicion].matricula.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarMatriculaSiap(formularioEnUso[posicion].matricula.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(error.error.mensaje));
      }
    });
  }

  consultarNSS(posicion: number): void {
    let formularios = [this.fda, this.fdc];
    if (!formularios[posicion].nss.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNSS(formularios[posicion].nss.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos === null){
          this.alertaService.mostrar(
            TipoAlerta.Precaucion,
            "El Número de Seguridad Social no existe." || this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje));
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    });
  }

  sinEspacioDoble(posicion: number): void {
    let formularios = [this.fda.nombre, this.fda.primerApellido, this.fda.segundoApellido,
      this.fdc.nombre, this.fdc.primerApellido, this.fdc.segundoApellido]
    if (formularios[posicion].value.charAt(0).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  cambiarSexo(posicion: number): void {
    let formularios = [this.fda.sexo, this.fdc.sexo];
    let formulariosOtroSexo = [this.fda.otroSexo, this.fdc.otroSexo];

    if (formularios[posicion].value == 3) {
      formulariosOtroSexo[posicion].setValidators(Validators.required);
    } else {
      formulariosOtroSexo[posicion].patchValue(null);
      formulariosOtroSexo[posicion].clearValidators();
    }
    formulariosOtroSexo[posicion].updateValueAndValidity();
  }

  cambiarNacionalidad(posicion: number): void {
    let formularios = [this.fda.paisNacimiento, this.fda.lugarNacimiento,
      this.fdc.paisNacimiento, this.fdc.lugarNacimiento];
    if (posicion === 0) {

      if (this.fda.nacionalidad.value == 1) {
        formularios[0].reset()
        formularios[1].setValidators(Validators.required);
      } else {
        formularios[1].reset()
        formularios[1].patchValue(null);
        formularios[1].clearValidators();
        formularios[1].updateValueAndValidity();
      }
    } else if (this.fdc.nacionalidad.value == 1) {
      formularios[2].reset()
      formularios[3].setValidators(Validators.required);
    } else {
      formularios[3].reset()
      formularios[3].patchValue(null);
      formularios[3].clearValidators();
      formularios[3].updateValueAndValidity();
    }
  }

  consultarCodigoPostal(posicion: number): void {
    let formularios = [this.fda, this.fdc];
    if (!formularios[posicion].cp.value) {
      return;
    }
    this.cargadorService.activar();
    this.serviciosFunerariosService.consutaCP(formularios[posicion].cp.value)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta) {
            if(posicion == 0){
              this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre')
            }else{
              this.coloniasContratante = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre')
            }
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
    esIgual ? this.fdc.datosIguales.setValue(true) : this.fdc.datosIguales.setValue(false);

    if (esIgual) {
      this.fdc.curp.enable()
      this.fdc.rfc.enable()
      this.fdc.matricula.enable()
      return
    }
    this.fdc.curp.disable()
    this.fdc.rfc.disable()
    this.fdc.matricula.disable()
    this.fdc.nss.disable()
    this.fdc.nombre.disable()
    this.fdc.primerApellido.disable()
    this.fdc.segundoApellido.disable()
    this.fdc.sexo.disable()
    this.fdc.otroSexo.disable()
    this.fdc.fechaNacimiento.disable()
    this.fdc.nacionalidad.disable()
    this.fdc.lugarNacimiento.disable()
    this.fdc.paisNacimiento.disable()
    this.fdc.telefono.disable()
    this.fdc.correoElectronico.disable()
    this.fdc.cp.disable()
    this.fdc.calle.disable()
    this.fdc.numeroInterior.disable()
    this.fdc.numeroExterior.disable()
    this.fdc.colonia.disable()
    this.fdc.municipio.disable()
    this.fdc.estado.disable()


  }

  limpiarFormulario(posicion: number): void {
    let formularioEnUso = [this.fda, this.fdc]
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
  }

  mostrarInfoPaqueteSeleccionado(): void {
    let objetoPaquete = this.paqueteBackUp.filter((paquete: any) => {
      return paquete.idPaquete == +this.fda.tipoPaquete.value
    });
    this.infoPaqueteSeleccionado = objetoPaquete[0].descPaquete;
    this.confirmarAceptarPaquete = true;
  }

  validarNumeroPago(): void {
    this.cambioNumeroPagos = false;
    if (this.idNumeroPagoOriginal != this.fda.numeroPago.value) {
      this.cambioNumeroPagos = true;
    }
  }

  validarBotonGuardar(): boolean {
    if (this.datosAfiliadoForm) {
      if (this.datosAfiliadoForm.invalid || this.datosContratanteForm.invalid) {
        return true;
      }
    }
    return false;
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
    let objetoGuardar: AgregarPlanSFPA = this.generarObjetoPlanSFPA();
    this.confirmarGuardado = false;
    this.cargadorService.activar();
    this.serviciosFunerariosService.insertarPlanSFPA(objetoGuardar).pipe(
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

  generarObjetoPlanSFPA(): AgregarPlanSFPA {

    let objetoContratante = {
      persona: 'contratante',
      rfc: this.fdc.rfc.value,
      curp: this.fdc.curp.value,
      matricula: this.fdc.matricula?.value ?? "",
      nss: this.fdc.nss.value,
      nomPersona: this.fdc.nombre.value,
      primerApellido: this.fdc.primerApellido.value,
      segundoApellido: this.fdc.segundoApellido.value,
      sexo: this.fdc.sexo.value,
      otroSexo: this.fdc.otroSexo?.value ?? "",
      fecNacimiento: moment(this.fdc.fechaNacimiento.value).format('yyyy-MM-DD'),
      idPais: this.fdc.paisNacimiento?.value ?? 119,
      idEstado: this.fdc.lugarNacimiento?.value ?? null,
      telefono: this.fdc.telefono.value,
      telefonoFijo: this.fdc.telefono.value,
      correo: this.fdc.correoElectronico.value,
      tipoPersona: "",
      ine: null,
      cp: {
        desCalle: this.fdc.calle.value,
        numExterior: this.fdc.numeroExterior.value,
        numInterior: this.fdc.numeroInterior?.value ?? "",
        codigoPostal: this.fdc.cp.value,
        desColonia: this.fdc.colonia.value,
        desMunicipio: this.fdc.municipio.value,
        desEstado: this.fdc.estado.value,
      }
    }

    let objetoPrincipal = {
      idPlanSfpa: this.idPlanSfpa,
      idTipoContratacion: 1,
      idPaquete: this.fda.tipoPaquete.value,
      idTipoPagoMensual: this.fda.numeroPago.value,
      indTipoPagoMensual: this.cambioNumeroPagos,
      indTitularSubstituto: this.fdc.datosIguales.value ? 1 : 0,
      indModificarTitularSubstituto: 1,
      monPrecio: this.consultarMonPrecio(),
      titularesBeneficiarios: [
        {
          persona: 'afiliado',
          rfc: this.fda.rfc.value,
          curp: this.fda.curp.value,
          matricula: this.fda.matricula?.value ?? "",
          nss: this.fda.nss.value,
          nomPersona: this.fda.nombre.value,
          primerApellido: this.fda.primerApellido.value,
          segundoApellido: this.fda.segundoApellido.value,
          sexo: this.fda.sexo.value,
          otroSexo: this.fda.otroSexo?.value ?? "",
          fecNacimiento: moment(this.fda.fechaNacimiento.value).format('yyyy-MM-DD'),
          idPais: this.fda.paisNacimiento?.value ?? 119,
          idEstado: this.fda.lugarNacimiento?.value ?? null,
          telefono: this.fda.telefono.value,
          telefonoFijo: this.fda.telefono.value,
          correo: this.fda.correoElectronico.value,
          tipoPersona: "",
          ine: null,
          cp: {
            desCalle: this.fda.calle.value,
            numExterior: this.fda.numeroExterior.value,
            numInterior: this.fda.numeroInterior?.value ?? "",
            codigoPostal: this.fda.cp.value,
            desColonia: this.fda.colonia.value,
            desMunicipio: this.fda.municipio.value,
            desEstado: this.fda.estado.value,
          }
        }
      ]
    }
    if (objetoPrincipal.indTitularSubstituto == 0) {
      objetoPrincipal.titularesBeneficiarios.push(objetoContratante)
    }
    return objetoPrincipal;
  }

  consultarMonPrecio(): number {
    let paquete: any = this.paqueteBackUp.find((paquete: CatalogoPaquetes) => {
      return Number(this.fda.tipoPaquete.value) == paquete.idPaquete;
    })
    return paquete.monPrecio;
  }

  regresar(): void {
    this.confirmarGuardado = false;
    this.indice--;
  }

  cancelar(): void {
    void this.router.navigate(["servicios-funerarios"]);
  }

  get fda() {
    return this.datosAfiliadoForm.controls;
  }

  get fdc() {
    return this.datosContratanteForm.controls;
  }

}
