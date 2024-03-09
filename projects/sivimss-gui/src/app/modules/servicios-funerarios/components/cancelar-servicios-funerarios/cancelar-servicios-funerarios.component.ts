import { Component, OnInit } from '@angular/core';
import { SERVICIO_BREADCRUMB_CANCELAR, SERVICIO_BREADCRUMB_CLEAR } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { ServiciosFunerariosService } from '../../services/servicios-funerarios.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Persona } from "../../models/servicios-funerarios.interface";

@Component({
  selector: 'app-cancelar-servicios-funerarios',
  templateUrl: './cancelar-servicios-funerarios.component.html',
  styleUrls: ['./cancelar-servicios-funerarios.component.scss']
})
export class CancelarServiciosFunerariosComponent implements OnInit {

  idPlanSfpa!: number;
  folioConvenio: string = "";
  nombreVelatorio: string = "";
  fecIngresa: string = "";

  promotorForm!: FormGroup;
  datosTitularForm!: FormGroup;
  datosTitularSubstitutoForm!: FormGroup;
  datosBeneficiario1Form!: FormGroup;
  datosBeneficiario2Form!: FormGroup;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
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

        this.inicializarFormPromotor();
        this.inicializarFormDatosTitular(respuesta.datos);
        this.inicializarFormDatosTitularSubstituto(respuesta.datos ? respuesta.datos : null);
        this.inicializarFormDatosBeneficiario1(respuesta.datos ? respuesta.datos : null);
        this.inicializarFormDatosBeneficiario2(respuesta.datos ? respuesta.datos : null);
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  inicializarFormPromotor(): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{ value: null, disabled: false }, []],
      promotor: [{ value: null, disabled: false }, []],
    });
  }

  inicializarFormDatosTitular(titular: any): void {
    const [datosTitular] = titular.titularesBeneficiarios;
    const [anio, mes, dia] = datosTitular.fecNacimiento.split('-');
    const fecha: string = anio + '/' + mes + '/' + dia;
    this.datosTitularForm = this.formBuilder.group({
      curp: [{ value: datosTitular.curp, disabled: true }, []],
      rfc: [{ value: datosTitular.rfc, disabled: true }, []],
      matricula: [{ value: datosTitular.matricula, disabled: false },],
      nss: [{ value: datosTitular.nss, disabled: true }, []],
      nombre: [{ value: datosTitular.nomPersona, disabled: true }, []],
      primerApellido: [{ value: datosTitular.primerApellido, disabled: true }, []],
      segundoApellido: [{ value: datosTitular.segundoApellido, disabled: true }, []],
      sexo: [{ value: +datosTitular.sexo, disabled: true }, []],
      otroSexo: [{ value: datosTitular.otroSexo, disabled: true }],
      fechaNacimiento: [{ value: fecha, disabled: true }, []],
      nacionalidad: [{ value: +datosTitular.idPais == 119 ? 1 : 2, disabled: true }, []],
      lugarNacimiento: [{ value: +datosTitular.idEstado ?? null, disabled: true }, []],
      paisNacimiento: [{ value: +datosTitular.idPais ?? null, disabled: true }],
      telefono: [{ value: datosTitular.telefono, disabled: false }, []],
      telefonoFijo: [{ value: datosTitular.telefonoFijo, disabled: false }, []],
      correoElectronico: [{ value: datosTitular.correo, disabled: false }, []],
      cp: [{ value: datosTitular.cp.codigoPostal, disabled: true }, []],
      calle: [{ value: datosTitular.cp.desCalle, disabled: false }, []],
      numeroInterior: [{ value: datosTitular.cp.numInterior, disabled: false }],
      numeroExterior: [{ value: datosTitular.cp.numExterior, disabled: false }, []],
      colonia: [{ value: datosTitular.cp.desColonia, disabled: true }, []],
      municipio: [{ value: datosTitular.cp.desMunicipio, disabled: true }, []],
      estado: [{ value: datosTitular.cp.desEstado, disabled: true }, []],
      tipoPaquete: [{ value: +titular.idPaquete, disabled: false }, []],
      numeroPago: [{ value: +titular.idTipoPagoMensual, disabled: false }, []],
    });
  }

  inicializarFormDatosTitularSubstituto(titularSubstituto: any): void {
    const [datosSustituto] = titularSubstituto.titularesBeneficiarios;
    const [anio, mes, dia] = datosSustituto.fecNacimiento.split('-');
    let fecha: string = anio + '/' + mes + '/' + dia;
    let objetoContratante: Persona = {
      persona: null,
      rfc: datosSustituto.rfc,
      curp: datosSustituto.curp,
      matricula: datosSustituto.matricula,
      nss: datosSustituto.nss,
      nomPersona: datosSustituto.nomPersona,
      primerApellido: datosSustituto.primerApellido,
      segundoApellido: datosSustituto.segundoApellido,
      sexo: +datosSustituto.sexo,
      otroSexo: datosSustituto.otroSexo,
      fecNacimiento: fecha,
      idPais: datosSustituto.idPais,
      idEstado: datosSustituto.idEstado,
      telefono: datosSustituto.telefono,
      telefonoFijo: datosSustituto.telefonoFijo,
      correo: datosSustituto.correo,
      tipoPersona: datosSustituto.tipoPersona,
      ine: datosSustituto.ine,
      cp: {
        desCalle: datosSustituto.cp.desCalle,
        numExterior: datosSustituto.cp.numExterior,
        numInterior: datosSustituto.cp.numInterior,
        codigoPostal: datosSustituto.cp.codigoPostal,
        desColonia: datosSustituto.cp.desColonia,
        desMunicipio: datosSustituto.cp.desMunicipio,
        desEstado: datosSustituto.cp.desEstado,
      }
    };

    if (titularSubstituto.titularesBeneficiarios.length > 1) {
      const [anio, mes, dia] = titularSubstituto.titularesBeneficiarios[1].fecNacimiento.split('-');
      fecha = anio + '/' + mes + '/' + dia;

      objetoContratante = {
        persona: null,
        rfc: titularSubstituto.titularesBeneficiarios[1].rfc,
        curp: titularSubstituto.titularesBeneficiarios[1].curp,
        matricula: titularSubstituto.titularesBeneficiarios[1].matricula,
        nss: titularSubstituto.titularesBeneficiarios[1].nss,
        nomPersona: titularSubstituto.titularesBeneficiarios[1].nomPersona,
        primerApellido: titularSubstituto.titularesBeneficiarios[1].primerApellido,
        segundoApellido: titularSubstituto.titularesBeneficiarios[1].segundoApellido,
        sexo: +titularSubstituto.titularesBeneficiarios[1].sexo,
        otroSexo: titularSubstituto.titularesBeneficiarios[1].otroSexo,
        fecNacimiento: fecha,
        idPais: titularSubstituto.titularesBeneficiarios[1].idPais,
        idEstado: titularSubstituto.titularesBeneficiarios[1].idEstado,
        telefono: titularSubstituto.titularesBeneficiarios[1].telefono,
        telefonoFijo: titularSubstituto?.titularesBeneficiarios[1].telefono,
        correo: titularSubstituto.titularesBeneficiarios[1].correo,
        tipoPersona: titularSubstituto.titularesBeneficiarios[1].tipoPersona,
        ine: titularSubstituto.titularesBeneficiarios[1].ine,
        cp: {
          desCalle: titularSubstituto.titularesBeneficiarios[1].cp.desCalle,
          numExterior: titularSubstituto.titularesBeneficiarios[1].cp.numExterior,
          numInterior: titularSubstituto.titularesBeneficiarios[1].cp.numInterior,
          codigoPostal: titularSubstituto.titularesBeneficiarios[1].cp.codigoPostal,
          desColonia: titularSubstituto.titularesBeneficiarios[1].cp.desColonia,
          desMunicipio: titularSubstituto.titularesBeneficiarios[1].cp.desMunicipio,
          desEstado: titularSubstituto.titularesBeneficiarios[1].cp.desEstado,
        }
      };
    }

    this.datosTitularSubstitutoForm = this.formBuilder.group({
      datosIguales: [{ value: false, disabled: false }, []],
      curp: [{ value: objetoContratante.curp, disabled: false }, []],
      rfc: [{ value: objetoContratante.rfc, disabled: false }, []],
      matricula: [{ value: objetoContratante.matricula, disabled: false }],
      nss: [{ value: objetoContratante.nss, disabled: false }, []],
      nombre: [{ value: objetoContratante.nomPersona, disabled: false }, []],
      primerApellido: [{ value: objetoContratante.primerApellido, disabled: false }, []],
      segundoApellido: [{ value: objetoContratante.segundoApellido, disabled: false }, []],
      sexo: [{ value: objetoContratante.sexo, disabled: false }, []],
      otroSexo: [{ value: objetoContratante.otroSexo, disabled: false }],
      fechaNacimiento: [{ value: objetoContratante.fecNacimiento, disabled: false }, []],
      nacionalidad: [{
        value: objetoContratante.idPais ? objetoContratante.idPais == 119 ? 1 : 2 : null,
        disabled: false
      }, []],
      lugarNacimiento: [{ value: objetoContratante.idEstado, disabled: false }, []],
      paisNacimiento: [{ value: objetoContratante.idPais, disabled: false }],
      telefono: [{ value: objetoContratante.telefono, disabled: false }, []],
      telefonoFijo: [{ value: objetoContratante.telefonoFijo, disabled: false }, []],
      correoElectronico: [{ value: objetoContratante.correo, disabled: false }, []],
      cp: [{ value: objetoContratante.cp?.codigoPostal, disabled: false }, []],
      calle: [{ value: objetoContratante.cp?.desCalle, disabled: false }, []],
      numeroInterior: [{ value: objetoContratante.cp?.numInterior, disabled: false }],
      numeroExterior: [{ value: objetoContratante.cp?.numExterior, disabled: false }, []],
      colonia: [{ value: objetoContratante.cp?.desColonia, disabled: true }, []],
      municipio: [{ value: objetoContratante.cp?.desMunicipio, disabled: true }, []],
      estado: [{ value: objetoContratante.cp?.desEstado, disabled: false }, []],
    });
  }

  inicializarFormDatosBeneficiario1(beneficiario: any): void {
    this.datosBeneficiario1Form = this.formBuilder.group({
      curp: [{ value: beneficiario.titularesBeneficiarios[2]?.curp, disabled: true }, []],
      rfc: [{ value: beneficiario.titularesBeneficiarios[2]?.rfc, disabled: true }, []],
      matricula: [{ value: beneficiario.titularesBeneficiarios[2]?.matricula, disabled: false },],
      nss: [{ value: beneficiario.titularesBeneficiarios[2]?.nss, disabled: true }, []],
      nombre: [{ value: beneficiario.titularesBeneficiarios[2]?.nomPersona, disabled: true }, []],
      primerApellido: [{ value: beneficiario.titularesBeneficiarios[2]?.primerApellido, disabled: true }, []],
      segundoApellido: [{ value: beneficiario.titularesBeneficiarios[2]?.segundoApellido, disabled: true }, []],
      sexo: [{ value: +beneficiario.titularesBeneficiarios[2]?.sexo, disabled: true }, []],
      otroSexo: [{ value: beneficiario.titularesBeneficiarios[2]?.otroSexo, disabled: true }],
      fechaNacimiento: [{ value: beneficiario.titularesBeneficiarios[2]?.fecNacimiento, disabled: true }, []],
      nacionalidad: [{ value: +beneficiario?.titularesBeneficiarios[2]?.idPais == 119 ? 1 : 2, disabled: true }, []],
      lugarNacimiento: [{ value: +beneficiario?.titularesBeneficiarios[2]?.idEstado ?? null, disabled: true }, []],
      paisNacimiento: [{ value: +beneficiario?.titularesBeneficiarios[2]?.idPais ?? null, disabled: true }],
      telefono: [{ value: beneficiario.titularesBeneficiarios[2]?.telefono, disabled: false }, []],
      correoElectronico: [{ value: beneficiario.titularesBeneficiarios[2]?.correo, disabled: false }, []],
      cp: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.codigoPostal, disabled: true }, []],
      calle: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.desCalle, disabled: false }, []],
      numeroInterior: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.numInterior, disabled: false }],
      numeroExterior: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.numExterior, disabled: false }, []],
      colonia: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.desColonia, disabled: true }, []],
      municipio: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.desMunicipio, disabled: true }, []],
      estado: [{ value: beneficiario.titularesBeneficiarios[2]?.cp.desEstado, disabled: true }, []],
      tipoPaquete: [{ value: +beneficiario.idPaquete, disabled: false }, []],
      numeroPago: [{ value: +beneficiario.idTipoPagoMensual, disabled: false }, []],
    });
  }

  inicializarFormDatosBeneficiario2(beneficiario: any): void {
    let fecha: Date | null = null;
    if (beneficiario.titularesBeneficiarios[3]?.fecNacimiento) {
      const [anio, mes, dia] = beneficiario.titularesBeneficiarios[3]?.fecNacimiento.split('-');
      fecha = new Date(anio + '/' + mes + '/' + dia);
    }
    this.datosBeneficiario2Form = this.formBuilder.group({
      curp: [{ value: beneficiario.titularesBeneficiarios[3]?.curp, disabled: true }, []],
      rfc: [{ value: beneficiario.titularesBeneficiarios[3]?.rfc, disabled: true }, []],
      matricula: [{ value: beneficiario.titularesBeneficiarios[3]?.matricula, disabled: false },],
      nss: [{ value: beneficiario.titularesBeneficiarios[3]?.nss, disabled: true }, []],
      nombre: [{ value: beneficiario.titularesBeneficiarios[3]?.nomPersona, disabled: true }, []],
      primerApellido: [{ value: beneficiario.titularesBeneficiarios[3]?.primerApellido, disabled: true }, []],
      segundoApellido: [{ value: beneficiario.titularesBeneficiarios[3]?.segundoApellido, disabled: true }, []],
      sexo: [{ value: +beneficiario.titularesBeneficiarios[3]?.sexo, disabled: true }, []],
      otroSexo: [{ value: beneficiario.titularesBeneficiarios[3]?.otroSexo, disabled: true }],
      fechaNacimiento: [{ value: fecha, disabled: true }, []],
      nacionalidad: [{ value: +beneficiario?.titularesBeneficiarios[3]?.idPais == 119 ? 1 : 2, disabled: true }, []],
      lugarNacimiento: [{ value: +beneficiario?.titularesBeneficiarios[3]?.idEstado ?? null, disabled: true }, []],
      paisNacimiento: [{ value: +beneficiario?.titularesBeneficiarios[3]?.idPais ?? null, disabled: true }],
      telefono: [{ value: beneficiario.titularesBeneficiarios[3]?.telefono, disabled: false }, []],
      correoElectronico: [{ value: beneficiario.titularesBeneficiarios[3]?.correo, disabled: false }, []],
      cp: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.codigoPostal, disabled: true }, []],
      calle: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.desCalle, disabled: false }, []],
      numeroInterior: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.numInterior, disabled: false }],
      numeroExterior: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.numExterior, disabled: false }, []],
      colonia: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.desColonia, disabled: true }, []],
      municipio: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.desMunicipio, disabled: true }, []],
      estado: [{ value: beneficiario.titularesBeneficiarios[3]?.cp.desEstado, disabled: true }, []],
      tipoPaquete: [{ value: +beneficiario.idPaquete, disabled: false }, []],
      numeroPago: [{ value: +beneficiario.idTipoPagoMensual, disabled: false }, []],
    });
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CANCELAR);
  }

  aceptar(): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService
      .cancelarPlanSfpa(+this.idPlanSfpa)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA cancelado correctamente');
          this.router.navigate(["servicios-funerarios"]);
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(
            TipoAlerta.Error,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              +error.error.mensaje
            )
          );
        },
      });
  }

  cancelar(): void {
    this.router.navigate(["servicios-funerarios"]);
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
