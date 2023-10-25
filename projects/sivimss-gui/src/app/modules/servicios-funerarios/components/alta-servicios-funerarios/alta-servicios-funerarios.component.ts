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
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {finalize} from "rxjs";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {CatalogoPaquetes} from "../../models/catalogos.interface";
import {AgregarPlanSFPA} from "../../models/servicios-funerarios.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";


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

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  datosAfiliadoForm!: FormGroup;
  datosContratanteForm!: FormGroup;

  sexo: TipoDropdown[] = [{value: 1, label: 'Mujer'}, {value: 2, label: 'Hombre'}, {value: 3, label: 'Otro'}];
  nacionalidad: TipoDropdown[] = [{value: 1, label: 'Mexicana'}, {value: 2, label: 'Extranjera'}];
  estados: TipoDropdown[] = [];
  paises: TipoDropdown[] = [];
  tipoPaquete: TipoDropdown[] = [];
  numeroPago: TipoDropdown[] = [];
  paqueteBackUp!: CatalogoPaquetes[];
  colonias:TipoDropdown[] = [];
  coloniasContratante:TipoDropdown[] = [];

  confirmarGuardado: boolean = false;
  confirmarAceptarPaquete: boolean = false;
  confirmacionDatosExistentes: boolean = false;
  existeDatoRegistrado: boolean = false;
  infoPaqueteSeleccionado!: any;
  mensajeDatosExistentes: string = "";
  idPlanSfpaExistente!: number;

  /*Variable tipo lista para validar si ya se encuentra CURP/RFC en BD
  * [0] = fda.curp.value
  * [1] = fda.rfc.value
  * [2] = fdc.curp.value
  * [3] = fdc.rfc.value
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
    this.inicializarFormDatosAfiliado();
    this.inicializarFormDatosContratante();
  }

  inicializarFormDatosAfiliado(): void {
    this.datosAfiliadoForm = this.formBuilder.group({
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

  inicializarFormDatosContratante(): void {
    this.datosContratanteForm = this.formBuilder.group({
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
      lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],
      paisNacimiento: [{value: null, disabled: false}],
      telefono: [{value: null, disabled: false}, [Validators.required]],
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
    this.validarUsuarioAfiliado(formularioEnUso[posicion].curp.value, "", "", posicion);
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
          if (+respuesta.datos[0].idPais == 119 || !+respuesta.datos[0].idPais) {
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
          this.cambiarNacionalidad(posicion);
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
        this.alertaService.mostrar(TipoAlerta.Error,
          this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
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
    // this.validarUsuarioAfiliado("", formularioEnUso[posicion].rfc.value, "", posicion);
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
    //       this.consultarCodigoPostal(posicion);
    //       this.cambiarNacionalidad(posicion);
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

  validarUsuarioAfiliado(curp: string, rfc: string, nss: string, posicion: number): void {
    let formularioEnUso = [this.fda, this.fdc];
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

    this.serviciosFunerariosService.validarAfiliado(curp, rfc, nss).pipe(
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
    if (!esIgual) {
      this.datosContratanteForm.enable();
      this.fdc.municipio.disable();
      this.fdc.estado.disable()
      this.cajaValidacionDatosExistentes[2] = false;
      this.cajaValidacionDatosExistentes[3] = false;
      this.datosContratanteForm.reset();
      this.fdc.datosIguales.setValue(false);
      return
    }
    this.coloniasContratante = [{label:this.fda.colonia.value, value: this.fda.colonia.value}]
    this.cajaValidacionDatosExistentes[2] = this.cajaValidacionDatosExistentes[0];
    this.cajaValidacionDatosExistentes[3] = this.cajaValidacionDatosExistentes[1];
    this.datosContratanteForm.disable();
    this.fdc.curp.setValue(this.fda.curp.value);
    this.fdc.rfc.setValue(this.fda.rfc.value);
    this.fdc.matricula.setValue(this.fda.matricula.value);
    this.fdc.nss.setValue(this.fda.nss.value);
    this.fdc.nombre.setValue(this.fda.nombre.value);
    this.fdc.primerApellido.setValue(this.fda.primerApellido.value);
    this.fdc.segundoApellido.setValue(this.fda.segundoApellido.value);
    this.fdc.sexo.setValue(this.fda.sexo.value);
    this.fdc.otroSexo.setValue(this.fda.otroSexo.value);
    this.fdc.fechaNacimiento.setValue(this.fda.fechaNacimiento.value);
    this.fdc.nacionalidad.setValue(this.fda.nacionalidad.value);
    this.fdc.lugarNacimiento.setValue(this.fda.lugarNacimiento.value);
    this.fdc.paisNacimiento.setValue(this.fda.paisNacimiento.value);
    this.fdc.telefono.setValue(this.fda.telefono.value);
    this.fdc.correoElectronico.setValue(this.fda.correoElectronico.value);
    this.fdc.cp.setValue(this.fda.cp.value);
    this.fdc.calle.setValue(this.fda.calle.value);
    this.fdc.numeroInterior.setValue(this.fda.numeroInterior.value);
    this.fdc.numeroExterior.setValue(this.fda.numeroExterior.value);
    this.fdc.colonia.setValue(this.fda.colonia.value);
    this.fdc.municipio.setValue(this.fda.municipio.value);
    this.fdc.estado.setValue(this.fda.estado.value);
    this.cambiarNacionalidad(1);
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

  guardar(): void {
    const configuracionArchivo: OpcionesArchivos = {};
    let objetoGuardar: AgregarPlanSFPA = this.generarObjetoPlanSFPA();
    this.confirmarGuardado = false;
    this.cargadorService.activar();
    this.serviciosFunerariosService.insertarPlanSFPA(objetoGuardar).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.alertaService.mostrar(TipoAlerta.Exito, this.mensajesSistemaService.obtenerMensajeSistemaPorId(30) +
            " del convenio con folio " + respuesta.mensaje);
          const file = new Blob(
            [this.descargaArchivosService.base64_2Blob(
              respuesta.datos,
              this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
            {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
          const url = window.URL.createObjectURL(file);
          window.open(url)
          this.router.navigate(['../servicios-funerarios']);
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(5));
        }
      }
    )
  }

  generarObjetoPlanSFPA(): AgregarPlanSFPA {

    let objetoContratante = {
      persona: 'contratante', //Si es la misma persona no mandar este objeto
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
      idTipoContratacion: 1,
      idPaquete: this.fda.tipoPaquete.value,
      idTipoPagoMensual: this.fda.numeroPago.value,
      indTitularSubstituto: this.fdc.datosIguales.value ? 1 : 0, //Cuando te vas a contratante SI 1 no 0
      indModificarTitularSubstituto: 0, //Cuando es alta se manda en 0 acualizar es 1
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

  redireccionarModificar(): void {
    void this.router.navigate(['./servicios-funerarios/modificar-pago'],
      {
        queryParams: {
          idPlanSfpa: this.idPlanSfpaExistente
        }
      });
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

  validarBotonGuardar(): boolean {
    if (this.datosAfiliadoForm.invalid || this.datosContratanteForm.invalid ||
      this.cajaValidacionDatosExistentes.includes(true)) {
      return true;
    }
    return false;
  }
}
