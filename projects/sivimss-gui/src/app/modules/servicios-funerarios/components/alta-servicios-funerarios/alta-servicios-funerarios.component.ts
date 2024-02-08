import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { MenuItem } from "primeng/api";
import * as moment from "moment";

import { ServiciosFunerariosService } from "../../services/servicios-funerarios.service";
import { MENU_STEPPER } from "../../constants/menu-steppers";
import { SERVICIO_BREADCRUMB_CLEAR } from "../../constants/breadcrumb";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { PATRON_CORREO, PATRON_CURP, PATRON_RFC } from "../../../../utils/constantes";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { finalize } from "rxjs";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { CatalogoPaquetes } from "../../models/catalogos.interface";
import { AgregarPlanSFPA, NSS } from "../../models/servicios-funerarios.interface";
import { DescargaArchivosService } from "../../../../services/descarga-archivos.service";
import { OpcionesArchivos } from "../../../../models/opciones-archivos.interface";
import { CURP } from 'projects/sivimss-gui/src/app/utils/regex';


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

  sexo: TipoDropdown[] = [{ value: 1, label: 'Mujer' }, { value: 2, label: 'Hombre' }, { value: 3, label: 'Otro' }];
  nacionalidad: TipoDropdown[] = [{ value: 1, label: 'Mexicana' }, { value: 2, label: 'Extranjera' }];
  estados: TipoDropdown[] = [];
  paises: TipoDropdown[] = [];
  tipoPaquete: TipoDropdown[] = [];
  numeroPago: TipoDropdown[] = [];
  paqueteBackUp!: CatalogoPaquetes[];
  colonias: TipoDropdown[] = [];
  coloniasContratante: TipoDropdown[] = [];
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
    this.catPromotores = mapearArregloTipoDropdown(respuesta[this.POSICION_PROMOTOR].datos,
      'NOMBRE', 'ID_PROMOTOR');
    this.paqueteBackUp = respuesta[this.POSICION_PAQUETE].datos;
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.inicializarFormPromotor();
    this.inicializarFormDatosTitular();
    this.inicializarFormDatosTitularSubstituto();
    this.inicializarFormDatosBeneficiario1();
    this.inicializarFormDatosBeneficiario2();
  }


  inicializarFormPromotor(): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{ value: false, disabled: false }, [Validators.nullValidator]],
      promotor: [{ value: null, disabled: false }, [Validators.nullValidator]],
    });

    this.handleGestionPromotor();
  }

  inicializarFormDatosTitular(): void {
    this.datosTitularForm = this.formBuilder.group({
      curp: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: null, disabled: false }],
      nss: [{ value: null, disabled: false }, [Validators.required]],
      nombre: [{ value: null, disabled: false }, [Validators.required]],
      primerApellido: [{ value: null, disabled: false }, [Validators.required]],
      segundoApellido: [{ value: null, disabled: false }, [Validators.required]],
      sexo: [{ value: null, disabled: false }, [Validators.required]],
      otroSexo: [{ value: null, disabled: false }],
      fechaNacimiento: [{ value: null, disabled: false }, [Validators.required]],
      nacionalidad: [{ value: null, disabled: false }],
      lugarNacimiento: [{ value: null, disabled: false }, [Validators.required]],
      paisNacimiento: [{ value: null, disabled: false }],
      telefono: [{ value: null, disabled: false }, [Validators.required]],
      telefonoFijo: [{ value: null, disabled: false }, [Validators.required]],
      correoElectronico: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: null, disabled: false }, [Validators.required]],
      calle: [{ value: null, disabled: false }, [Validators.required]],
      numeroInterior: [{ value: null, disabled: false }],
      numeroExterior: [{ value: null, disabled: false }, [Validators.required]],
      colonia: [{ value: null, disabled: false }, [Validators.required]],
      municipio: [{ value: null, disabled: true }, [Validators.required]],
      estado: [{ value: null, disabled: true }, [Validators.required]],
      tipoPaquete: [{ value: null, disabled: false }, [Validators.required]],
      numeroPago: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  inicializarFormDatosTitularSubstituto(): void {
    this.datosTitularSubstitutoForm = this.formBuilder.group({
      datosIguales: [{ value: null, disabled: false }, [Validators.required]],
      curp: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: null, disabled: false }],
      nss: [{ value: null, disabled: false }, [Validators.required]],
      nombre: [{ value: null, disabled: false }, [Validators.required]],
      primerApellido: [{ value: null, disabled: false }, [Validators.required]],
      segundoApellido: [{ value: null, disabled: false }, [Validators.required]],
      sexo: [{ value: null, disabled: false }, [Validators.required]],
      otroSexo: [{ value: null, disabled: false }],
      fechaNacimiento: [{ value: null, disabled: false }, [Validators.required]],
      nacionalidad: [{ value: null, disabled: false }],
      lugarNacimiento: [{ value: null, disabled: false }, [Validators.required]],
      paisNacimiento: [{ value: null, disabled: false }],
      telefono: [{ value: null, disabled: false }, [Validators.required]],
      telefonoFijo: [{ value: null, disabled: false }, []],
      correoElectronico: [{ value: null, disabled: false }, [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: null, disabled: false }, [Validators.required]],
      calle: [{ value: null, disabled: false }, [Validators.required]],
      numeroInterior: [{ value: null, disabled: false }],
      numeroExterior: [{ value: null, disabled: false }, [Validators.required]],
      colonia: [{ value: null, disabled: false }, [Validators.required]],
      municipio: [{ value: null, disabled: true }, [Validators.required]],
      estado: [{ value: null, disabled: true }, [Validators.required]],
    });
  }

  inicializarFormDatosBeneficiario1(): void {
    this.datosBeneficiario1Form = this.formBuilder.group({
      curp: [{ value: null, disabled: false }, [Validators.maxLength(18), Validators.pattern(CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: null, disabled: false }],
      nss: [{ value: null, disabled: false }, []],
      nombre: [{ value: null, disabled: false }, []],
      primerApellido: [{ value: null, disabled: false }, []],
      segundoApellido: [{ value: null, disabled: false }, []],
      sexo: [{ value: null, disabled: false }, []],
      otroSexo: [{ value: null, disabled: false }],
      fechaNacimiento: [{ value: null, disabled: false }, []],
      nacionalidad: [{ value: null, disabled: false }],
      lugarNacimiento: [{ value: null, disabled: false }, []],
      paisNacimiento: [{ value: null, disabled: false }],
      telefono: [{ value: null, disabled: false }, []],
      telefonoFijo: [{ value: null, disabled: false }, []],
      correoElectronico: [{ value: null, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: null, disabled: false }, []],
      calle: [{ value: null, disabled: false }, []],
      numeroInterior: [{ value: null, disabled: false }],
      numeroExterior: [{ value: null, disabled: false }, []],
      colonia: [{ value: null, disabled: false }, []],
      municipio: [{ value: null, disabled: true }, []],
      estado: [{ value: null, disabled: true }, []],
    });
  }

  inicializarFormDatosBeneficiario2(): void {
    this.datosBeneficiario2Form = this.formBuilder.group({
      curp: [{ value: null, disabled: false }, [Validators.maxLength(18), Validators.pattern(CURP)]],
      rfc: [{ value: null, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: null, disabled: false }],
      nss: [{ value: null, disabled: false }, []],
      nombre: [{ value: null, disabled: false }, []],
      primerApellido: [{ value: null, disabled: false }, []],
      segundoApellido: [{ value: null, disabled: false }, []],
      sexo: [{ value: null, disabled: false }, []],
      otroSexo: [{ value: null, disabled: false }],
      fechaNacimiento: [{ value: null, disabled: false }, []],
      nacionalidad: [{ value: null, disabled: false }],
      lugarNacimiento: [{ value: null, disabled: false }, []],
      paisNacimiento: [{ value: null, disabled: false }],
      telefono: [{ value: null, disabled: false }, []],
      telefonoFijo: [{ value: null, disabled: false }, []],
      correoElectronico: [{ value: null, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: null, disabled: false }, []],
      calle: [{ value: null, disabled: false }, []],
      numeroInterior: [{ value: null, disabled: false }],
      numeroExterior: [{ value: null, disabled: false }, []],
      colonia: [{ value: null, disabled: false }, []],
      municipio: [{ value: null, disabled: true }, []],
      estado: [{ value: null, disabled: true }, []],
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

  consultarCurp(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].curp.value) return;
    if (formularioEnUso[posicion].curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }

    if (posicion === 0 || posicion === 1) {
      this.limpiarFormulario(posicion);
      this.validarUsuarioTitular(formularioEnUso[posicion].curp.value, "", "", posicion);
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
          this.consultarLugarNacimiento(respuesta.datos.desEntidadNac, posicion);
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
        }
      })
    }
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
    this.estados.forEach((element: any) => {
      const entidadIteracion = this.accentsTidy(element.label);
      if (entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())) {
        formularioEnUso[posicion].lugarNacimiento.setValue(element.value);
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
    let formularioEnUso = [this.fdt, this.fdts];
    if (!formularioEnUso[posicion].rfc.value) return;
    if (formularioEnUso[posicion].rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
    }
    return
  }

  handleGestionPromotor() {
    if (this.fp.gestionadoPorPromotor.value) {
      this.fp.promotor.enable();
    } else {
      this.fp.promotor.setValue(null);
      this.fp.promotor.disable();
    }
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
    let formularios = [this.fdt.correoElectronico, this.fdts.correoElectronico, this.fdb1.correoElectronico, this.fdb2.correoElectronico];
    if (!formularios[posicion].value) return;
    if (formularios[posicion]?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  consultarMatricula(posicion: number): void {
    let formularioEnUso = [this.fdt, this.fdts];
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
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].nss.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNSS(formularioEnUso[posicion].nss.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<NSS>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(
            TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje) || "El Número de Seguridad Social no existe.");
        } else {
          let fecha: Date | null = null;
          if (respuesta.datos.fechaNacimiento) {
            fecha = new Date(respuesta.datos.fechaNacimiento);
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

  consultarCodigoPostal(posicion: number): void {
    let formularios = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularios[posicion].cp.value) {
      return;
    }
    this.cargadorService.activar();
    this.serviciosFunerariosService.consutaCP(formularios[posicion].cp.value)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta) {
            if (posicion == 0) {
              this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre')
            } else {
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
      this.datosTitularSubstitutoForm.enable();
      this.fdts.municipio.disable();
      this.fdts.estado.disable()
      this.cajaValidacionDatosExistentes[2] = false;
      this.cajaValidacionDatosExistentes[3] = false;
      this.datosTitularSubstitutoForm.reset();
      this.fdts.datosIguales.setValue(false);
      return
    }
    this.coloniasContratante = [{ label: this.fdt.colonia.value, value: this.fdt.colonia.value }]
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
    let formularioEnUso = [this.fdt, this.fdts]
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

  mostrarInfoPaqueteSeleccionado(): void {
    let objetoPaquete = this.paqueteBackUp.filter((paquete: any) => {
      return paquete.idPaquete == +this.fdt.tipoPaquete.value
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
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
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

    const numPago = this.numeroPago.find((e: TipoDropdown) => e.value === this.fdt.numeroPago.value)?.label ?? '';

    let objetoTitular: AgregarPlanSFPA = {
      idTipoContratacion: 1,
      idPaquete: this.fdt.tipoPaquete.value,
      idTipoPagoMensual: this.fdt.numeroPago.value,
      numPagoMensual: +numPago,
      indTitularSubstituto: this.fdts.datosIguales.value ? 1 : 0, //Cuando te vas a contratante SI 1 no 0
      indModificarTitularSubstituto: 0, //Cuando es alta se manda en 0 acualizar es 1
      monPrecio: this.consultarMonPrecio(),
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

  consultarMonPrecio(): number {
    let paquete: any = this.paqueteBackUp.find((paquete: CatalogoPaquetes) => {
      return Number(this.fdt.tipoPaquete.value) == paquete.idPaquete;
    })
    return paquete?.monPrecio ?? null;
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

  validarBotonGuardar(): boolean {
    if (this.datosTitularForm.invalid || this.datosTitularSubstitutoForm.invalid ||
      this.cajaValidacionDatosExistentes.includes(true)) {
      return true;
    }
    return false;
  }
}
