import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SERVICIO_BREADCRUMB_CLEAR } from "../../constants/breadcrumb";
import { MenuItem } from "primeng/api";
import { MENU_STEPPER } from "../../constants/menu-steppers";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { ServiciosFunerariosService } from "../../services/servicios-funerarios.service";
import { CatalogoPaquetes } from "../../models/catalogos.interface";
import { PATRON_CORREO, PATRON_CURP, PATRON_RFC } from "../../../../utils/constantes";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { finalize } from "rxjs";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { AgregarPlanSFPA, Persona } from "../../models/servicios-funerarios.interface";
import { OpcionesArchivos } from "../../../../models/opciones-archivos.interface";
import * as moment from "moment/moment";
import { DescargaArchivosService } from "../../../../services/descarga-archivos.service";

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

  sexo: TipoDropdown[] = [{ value: 1, label: 'Mujer' }, { value: 2, label: 'Hombre' }, { value: 3, label: 'Otro' }];
  nacionalidad: TipoDropdown[] = [{ value: 1, label: 'Mexicana' }, { value: 2, label: 'Extranjera' }];
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
    this.idPlanSfpa = Number(this.route.snapshot.queryParams.idPlanSfpa);
    this.consultarFormulario();
  }

  consultarFormulario(): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarPlanSFPA(this.idPlanSfpa).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const { datos } = respuesta;
        this.idPlanSfpa = datos.idPlanSfpa;
        this.folioConvenio = datos.numFolioPlanSFPA;
        this.nombreVelatorio = respuesta.datos.desIdVelatorio;
        this.fecIngresa = respuesta.datos.fecIngreso;
        let objetoTitular = datos.titularesBeneficiarios[0];

        let objetoSubstituto =
          datos.indTitularSubstituto === 1
            ? objetoTitular
            : datos.titularesBeneficiarios[1];

        let objetoBeneficiario1 =
          datos.indTitularSubstituto === 1
            ? datos.titularesBeneficiarios[1]
            : datos.titularesBeneficiarios[2];

        let objetoBeneficiario2 =
          datos.indTitularSubstituto === 1
            ? datos.titularesBeneficiarios[2]
            : datos.titularesBeneficiarios[3];

        this.inicializarFormPromotor(datos.indPromotor, datos.idPromotor);
        this.inicializarFormDatosTitular(datos.idPaquete, datos.idTipoPagoMensual, objetoTitular);
        this.inicializarFormDatosTitularSubstituto(datos.indTitularSubstituto, objetoSubstituto);
        this.inicializarFormDatosBeneficiario1(objetoBeneficiario1);
        this.inicializarFormDatosBeneficiario2(objetoBeneficiario2);

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

  inicializarFormPromotor(indPromotor: number, idPromotor: number): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{ value: indPromotor === 1, disabled: false }, [Validators.required]],
      promotor: [{ value: idPromotor, disabled: false }, [Validators.required]],
    });

    this.handleGestionPromotor();
  }

  inicializarFormDatosTitular(idPaquete: number, idTipoPagoMensual: number, titular: Persona): void {
    let fecha: Date | null = null;
    if (titular.fecNacimiento) {
      const [anio, mes, dia] = titular.fecNacimiento.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }

    this.datosTitularForm = this.formBuilder.group({
      curp: [{ value: titular.curp, disabled: true },
      [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: titular.rfc, disabled: true },
      [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: titular.matricula, disabled: false },],
      nss: [{ value: titular.nss, disabled: true },
      [Validators.required]],
      nombre: [{ value: titular.nomPersona, disabled: true },
      [Validators.required]],
      primerApellido: [{ value: titular.primerApellido, disabled: true },
      [Validators.required]],
      segundoApellido: [{ value: titular.segundoApellido, disabled: true },
      [Validators.required]],
      sexo: [{ value: titular.sexo ? +titular.sexo : null, disabled: true },
      [Validators.required]],
      otroSexo: [{ value: titular.otroSexo, disabled: true }],
      fechaNacimiento: [{ value: fecha, disabled: true },
      [Validators.required]],
      nacionalidad: [{ value: titular.idPais ? +titular?.idPais == 119 ? 1 : 2 : null, disabled: true },
      [Validators.required]],
      lugarNacimiento: [{ value: titular?.idEstado ? +titular?.idEstado : null, disabled: true },
      [Validators.required]],
      paisNacimiento: [{ value: titular?.idPais ? +titular?.idPais : null, disabled: true }],
      telefono: [{ value: titular.telefono, disabled: false },
      [Validators.required]],
      telefonoFijo: [{ value: titular.telefonoFijo, disabled: false },
      [Validators.required]],
      correoElectronico: [{ value: titular.correo, disabled: false },
      [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: titular.cp?.codigoPostal, disabled: true },
      [Validators.required]],
      calle: [{ value: titular.cp?.desCalle, disabled: false },
      [Validators.required]],
      numeroInterior: [{ value: titular.cp?.numInterior, disabled: false }],
      numeroExterior: [{ value: titular.cp?.numExterior, disabled: false },
      [Validators.required]],
      colonia: [{ value: titular.cp?.desColonia, disabled: true },
      [Validators.required]],
      municipio: [{ value: titular.cp?.desMunicipio, disabled: true },
      [Validators.required]],
      estado: [{ value: titular.cp?.desEstado, disabled: true },
      [Validators.required]],
      tipoPaquete: [{ value: idPaquete, disabled: false },
      [Validators.required]],
      numeroPago: [{ value: idTipoPagoMensual, disabled: false },
      [Validators.required]],
    });
    this.idNumeroPagoOriginal = idTipoPagoMensual;
  }

  inicializarFormDatosTitularSubstituto(indTitularSubstituto: number, titularSubstituto: Persona): void {
    let fecha: Date | null = null;
    if (titularSubstituto.fecNacimiento) {
      const [anio, mes, dia] = titularSubstituto.fecNacimiento.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosTitularSubstitutoForm = this.formBuilder.group({
      datosIguales: [{ value: indTitularSubstituto === 1, disabled: false }, [Validators.required]],
      curp: [{ value: titularSubstituto.curp, disabled: false },
      [Validators.required, Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: titularSubstituto.rfc, disabled: false },
      [Validators.required, Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: titularSubstituto.matricula, disabled: false }],
      nss: [{ value: titularSubstituto.nss, disabled: false },
      [Validators.required]],
      nombre: [{ value: titularSubstituto.nomPersona, disabled: false },
      [Validators.required]],
      primerApellido: [{ value: titularSubstituto.primerApellido, disabled: false },
      [Validators.required]],
      segundoApellido: [{ value: titularSubstituto.segundoApellido, disabled: false },
      [Validators.required]],
      sexo: [{ value: titularSubstituto.sexo ? +titularSubstituto.sexo : null, disabled: false },
      [Validators.required]],
      otroSexo: [{ value: titularSubstituto.otroSexo, disabled: false }],
      fechaNacimiento: [{ value: fecha, disabled: false }, [Validators.required]],
      nacionalidad: [{
        value: titularSubstituto.idPais ? titularSubstituto.idPais == 119 ? 1 : 2 : null,
        disabled: false
      },
      [Validators.required]],
      lugarNacimiento: [{ value: titularSubstituto.idEstado, disabled: false },
      [Validators.required]],
      paisNacimiento: [{ value: titularSubstituto.idPais, disabled: false }],
      telefono: [{ value: titularSubstituto.telefono, disabled: false },
      [Validators.required]],
      correoElectronico: [{ value: titularSubstituto.correo, disabled: false },
      [Validators.required, Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: titularSubstituto.cp?.codigoPostal, disabled: false },
      [Validators.required]],
      calle: [{ value: titularSubstituto.cp?.desCalle, disabled: false },
      [Validators.required]],
      numeroInterior: [{ value: titularSubstituto.cp?.numInterior, disabled: false }],
      numeroExterior: [{ value: titularSubstituto.cp?.numExterior, disabled: false },
      [Validators.required]],
      colonia: [{ value: titularSubstituto.cp?.desColonia, disabled: true },
      [Validators.required]],
      municipio: [{ value: titularSubstituto.cp?.desMunicipio, disabled: true },
      [Validators.required]],
      estado: [{ value: titularSubstituto.cp?.desEstado, disabled: false },
      [Validators.required]],
    });
    this.datosTitularSubstitutoForm.disable();
    this.datosIguales(this.fdts.datosIguales.value);
  }

  inicializarFormDatosBeneficiario1(beneficiario: Persona): void {
    let fecha: Date | null = null;
    if (beneficiario?.fecNacimiento && beneficiario?.fecNacimiento !== undefined) {
      const [anio, mes, dia] = beneficiario.fecNacimiento.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosBeneficiario1Form = this.formBuilder.group({
      curp: [{ value: beneficiario?.curp, disabled: false }, [Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: beneficiario?.rfc, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: beneficiario?.matricula, disabled: false },],
      nss: [{ value: beneficiario?.nss, disabled: false }, []],
      nombre: [{ value: beneficiario?.nomPersona, disabled: false }, []],
      primerApellido: [{ value: beneficiario?.primerApellido, disabled: false }, []],
      segundoApellido: [{ value: beneficiario?.segundoApellido, disabled: false }, []],
      sexo: [{ value: beneficiario?.sexo ? +beneficiario?.sexo : null, disabled: false }, []],
      otroSexo: [{ value: beneficiario?.otroSexo, disabled: false }],
      fechaNacimiento: [{ value: fecha, disabled: false }, []],
      nacionalidad: [{ value: beneficiario?.idPais == 119 ? 1 : 2, disabled: false }, []],
      lugarNacimiento: [{ value: beneficiario?.idEstado ? +beneficiario?.idEstado : null, disabled: false }, []],
      paisNacimiento: [{ value: beneficiario?.idPais ? +beneficiario?.idPais : null, disabled: false }],
      telefono: [{ value: beneficiario?.telefono, disabled: false }, []],
      correoElectronico: [{ value: beneficiario?.correo, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: beneficiario?.cp?.codigoPostal, disabled: false }, []],
      calle: [{ value: beneficiario?.cp?.desCalle, disabled: false }, []],
      numeroInterior: [{ value: beneficiario?.cp?.numInterior, disabled: false }],
      numeroExterior: [{ value: beneficiario?.cp?.numExterior, disabled: false }, []],
      colonia: [{ value: beneficiario?.cp?.desColonia, disabled: false }, []],
      municipio: [{ value: beneficiario?.cp?.desMunicipio, disabled: false }, []],
      estado: [{ value: beneficiario?.cp?.desEstado, disabled: false }, []],
    });
  }

  inicializarFormDatosBeneficiario2(beneficiario: Persona): void {
    let fecha: Date | null = null;
    if (beneficiario?.fecNacimiento && beneficiario?.fecNacimiento !== undefined) {
      const [anio, mes, dia] = beneficiario.fecNacimiento.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosBeneficiario2Form = this.formBuilder.group({
      curp: [{ value: beneficiario?.curp, disabled: false }, [Validators.pattern(PATRON_CURP)]],
      rfc: [{ value: beneficiario?.rfc, disabled: false }, [Validators.pattern(PATRON_RFC)]],
      matricula: [{ value: beneficiario?.matricula, disabled: false },],
      nss: [{ value: beneficiario?.nss, disabled: false }, []],
      nombre: [{ value: beneficiario?.nomPersona, disabled: false }, []],
      primerApellido: [{ value: beneficiario?.primerApellido, disabled: false }, []],
      segundoApellido: [{ value: beneficiario?.segundoApellido, disabled: false }, []],
      sexo: [{ value: beneficiario?.sexo ? +beneficiario?.sexo : null, disabled: false }, []],
      otroSexo: [{ value: beneficiario?.otroSexo, disabled: false }],
      fechaNacimiento: [{ value: fecha, disabled: false }, []],
      nacionalidad: [{ value: beneficiario?.idPais == 119 ? 1 : 2, disabled: false }, []],
      lugarNacimiento: [{ value: beneficiario?.idEstado ? +beneficiario?.idEstado : null, disabled: false }, []],
      paisNacimiento: [{ value: beneficiario?.idPais ? +beneficiario?.idPais : null, disabled: false }],
      telefono: [{ value: beneficiario?.telefono, disabled: false }, []],
      correoElectronico: [{ value: beneficiario?.correo, disabled: false }, [Validators.pattern(PATRON_CORREO)]],
      cp: [{ value: beneficiario?.cp?.codigoPostal, disabled: false }, []],
      calle: [{ value: beneficiario?.cp?.desCalle, disabled: false }, []],
      numeroInterior: [{ value: beneficiario?.cp?.numInterior, disabled: false }],
      numeroExterior: [{ value: beneficiario?.cp?.numExterior, disabled: false }, []],
      colonia: [{ value: beneficiario?.cp?.desColonia, disabled: false }, []],
      municipio: [{ value: beneficiario?.cp?.desMunicipio, disabled: false }, []],
      estado: [{ value: beneficiario?.cp?.desEstado, disabled: false }, []],
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
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].curp.value) return;
    if (formularioEnUso[posicion].curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      return;
    }
    if (posicion !== 1) this.limpiarFormulario(posicion);
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
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
      }
    })
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

  validarUsuarioAfiliado(curp: string, rfc: string, nss: string): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.validarTitular(curp, rfc, nss).pipe(
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
    let formularioEnUso = [this.fdt, this.fdts, this.fdb1, this.fdb2];
    if (!formularioEnUso[posicion].nss.value) return;
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarNSS(formularioEnUso[posicion].nss.value).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(
            TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje) || "El Número de Seguridad Social no existe.");
        } else {
          let fecha: Date | null = null;
          if (respuesta.datos.fechaNacimiento && respuesta.datos.fechaNacimiento !== undefined) {
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
      this.fdts.curp.enable()
      this.fdts.rfc.enable()
      this.fdts.matricula.enable()
      return
    }
    this.fdts.curp.disable()
    this.fdts.rfc.disable()
    this.fdts.matricula.disable()
    this.fdts.nss.disable()
    this.fdts.nombre.disable()
    this.fdts.primerApellido.disable()
    this.fdts.segundoApellido.disable()
    this.fdts.sexo.disable()
    this.fdts.otroSexo.disable()
    this.fdts.fechaNacimiento.disable()
    this.fdts.nacionalidad.disable()
    this.fdts.lugarNacimiento.disable()
    this.fdts.paisNacimiento.disable()
    this.fdts.telefono.disable()
    this.fdts.correoElectronico.disable()
    this.fdts.cp.disable()
    this.fdts.calle.disable()
    this.fdts.numeroInterior.disable()
    this.fdts.numeroExterior.disable()
    this.fdts.colonia.disable()
    this.fdts.municipio.disable()
    this.fdts.estado.disable()


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
  }

  mostrarInfoPaqueteSeleccionado(): void {
    let objetoPaquete = this.paqueteBackUp.filter((paquete: any) => {
      return paquete.idPaquete == +this.fdt.tipoPaquete.value
    });
    this.infoPaqueteSeleccionado = objetoPaquete[0].descPaquete;
    this.confirmarAceptarPaquete = true;
  }

  validarNumeroPago(): void {
    this.cambioNumeroPagos = false;
    if (this.idNumeroPagoOriginal != this.fdt.numeroPago.value) {
      this.cambioNumeroPagos = true;
    }
  }

  validarBotonGuardar(): boolean {
    if (this.datosTitularForm.invalid || this.datosTitularSubstitutoForm.invalid || this.promotorForm.invalid) {
      return true;
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
            { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
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
      telefonoFijo: this.fdts.telefono.value,
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
      idPlanSfpa: this.idPlanSfpa,
      numFolioPlanSFPA: this.folioConvenio,
      idTipoContratacion: 1,
      idPaquete: this.fdt.tipoPaquete.value,
      idTipoPagoMensual: this.fdt.numeroPago.value,
      numPagoMensual: +numPago,
      indTipoPagoMensual: this.cambioNumeroPagos,
      indTitularSubstituto: this.fdts.datosIguales.value ? 1 : 0,
      indModificarTitularSubstituto: 1,
      monPrecio: this.consultarMonPrecio(),
      indPromotor: this.fp.gestionadoPorPromotor.value ? 1 : 0,
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
          fecNacimiento: moment(this.fdt.fechaNacimiento.value).format('yyyy-MM-DD'),
          idPais: this.fdt.paisNacimiento?.value ?? 119,
          idEstado: this.fdt.lugarNacimiento?.value ?? null,
          telefono: this.fdt.telefono.value,
          telefonoFijo: this.fdt.telefono.value,
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
