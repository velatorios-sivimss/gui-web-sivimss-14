import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalSeleccionarBeneficiarioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { TipoDropdown } from '../../../../../models/tipo-dropdown';
import {
  sexo,
  tipoOrden,
  nacionalidad,
} from '../../../constants/catalogos-complementarios';
import { PATRON_CURP } from '../../../../../utils/constantes';
import { finalize } from 'rxjs/operators';
import { HttpRespuesta } from '../../../../../models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GenerarOrdenServicioService } from '../../../services/generar-orden-servicio.service';
import { LoaderService } from '../../../../../shared/loader/services/loader.service';
import { MensajesSistemaService } from '../../../../../services/mensajes-sistema.service';
import { SERVICIO_BREADCRUMB } from '../../../constants/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { GestionarEtapasService } from '../../../services/gestionar-etapas.service';
import { AltaODSInterface } from '../../../models/AltaODS.interface';
import { ContratanteInterface } from '../../../models/Contratante.interface';
import { CodigoPostalIterface } from '../../../models/CodigoPostal.interface';
import { FinadoInterface } from '../../../models/Finado.interface';
import { CaracteristicasPresupuestoInterface } from '../../../models/CaracteristicasPresupuesto,interface';
import { CaracteristicasPaqueteInterface } from '../../../models/CaracteristicasPaquete.interface';
import { CaracteristicasDelPresupuestoInterface } from '../../../models/CaracteristicasDelPresupuesto.interface';
import { DetallePaqueteInterface } from '../../../models/DetallePaquete.interface';
import { ServicioDetalleTrasladotoInterface } from '../../../models/ServicioDetalleTraslado.interface';
import { DetallePresupuestoInterface } from '../../../models/DetallePresupuesto.interface';
import { InformacionServicioVelacionInterface } from '../../../models/InformacionServicioVelacion.interface';
import { InformacionServicioInterface } from '../../../models/InformacionServicio.interface';
import { ModalConvenioPfComponent } from '../../modal-convenio-pf/modal-convenio-pf.component';
import { Persona } from '../../../models/Persona.interface';

@Component({
  selector: 'app-datos-finado-sf',
  templateUrl: './datos-finado.component.html',
  styleUrls: ['./datos-finado.component.scss'],
})
export class DatosFinadoSFComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  readonly POSICION_PAIS = 0;
  readonly POSICION_ESTADO = 1;
  readonly POSICION_UNIDADES_MEDICAS = 3;
  readonly POSICION_PENSION = 4;
  form!: FormGroup;
  tipoOrden: TipoDropdown[] = tipoOrden;

  tipoSexo: TipoDropdown[] = sexo;
  nacionalidad: TipoDropdown[] = nacionalidad;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  unidadesMedicas!: TipoDropdown[];
  tipoPension!: TipoDropdown[];

  idContratoPrevision: number | null = null;
  idVelatorioContratoPrevision: number | null = null;

  altaODS: AltaODSInterface = {} as AltaODSInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoInterface = {} as FinadoInterface;
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface =
    {} as CaracteristicasPresupuestoInterface;
  caracteristicasPaquete: CaracteristicasPaqueteInterface =
    {} as CaracteristicasPaqueteInterface;
  detallePaquete: Array<DetallePaqueteInterface> =
    [] as Array<DetallePaqueteInterface>;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface =
    {} as ServicioDetalleTrasladotoInterface;
  paquete: DetallePaqueteInterface = {} as DetallePaqueteInterface;
  cpFinado: CodigoPostalIterface = {} as CodigoPostalIterface;
  caracteristicasDelPresupuesto: CaracteristicasDelPresupuestoInterface =
    {} as CaracteristicasDelPresupuestoInterface;
  detallePresupuesto: Array<DetallePresupuestoInterface> =
    [] as Array<DetallePresupuestoInterface>;
  presupuesto: DetallePresupuestoInterface = {} as DetallePresupuestoInterface;
  servicioDetalleTrasladoPresupuesto: ServicioDetalleTrasladotoInterface =
    {} as ServicioDetalleTrasladotoInterface;
  informacionServicio: InformacionServicioInterface =
    {} as InformacionServicioInterface;
  informacionServicioVelacion: InformacionServicioVelacionInterface =
    {} as InformacionServicioVelacionInterface;
  cpVelacion: CodigoPostalIterface = {} as CodigoPostalIterface;
  radonlyNoContrato: boolean = true;
  radonlyEstremidad: boolean = false;
  radonlyCurp: boolean = false;
  idContratante: number | null = null;
  fechaActual = new Date();
  validacionPersonaConvenio: boolean = false;

  idPersona: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarEtapasService: GestionarEtapasService
  ) {
    this.altaODS.contratante = this.contratante;
    this.contratante.cp = this.cp;
    this.altaODS.finado = this.finado;
    this.finado.cp = this.cpFinado;
    this.altaODS.caracteristicasPresupuesto = this.caracteristicasPresupuesto;
    this.caracteristicasPresupuesto.caracteristicasPaquete =
      this.caracteristicasPaquete;
    this.caracteristicasPaquete.detallePaquete = this.detallePaquete;
    this.paquete.servicioDetalleTraslado = this.servicioDetalleTraslado;
    this.caracteristicasPresupuesto.caracteristicasDelPresupuesto =
      this.caracteristicasDelPresupuesto;
    this.caracteristicasDelPresupuesto.detallePresupuesto =
      this.detallePresupuesto;
    this.presupuesto.servicioDetalleTraslado =
      this.servicioDetalleTrasladoPresupuesto;
    this.altaODS.informacionServicio = this.informacionServicio;
    this.informacionServicio.informacionServicioVelacion =
      this.informacionServicioVelacion;
    this.informacionServicioVelacion.cp = this.cpVelacion;
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.pais = respuesta[this.POSICION_PAIS]!;
    this.estado = respuesta[this.POSICION_ESTADO];
    this.unidadesMedicas = respuesta[this.POSICION_UNIDADES_MEDICAS];
    this.tipoPension = respuesta[this.POSICION_PENSION];

    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datodPrevios) => this.llenarAlta(datodPrevios));

    this.gestionarEtapasService.datosEtapaFinado$
      .asObservable()
      .subscribe((datosEtapaFinado) => this.inicializarForm(datosEtapaFinado));
    // this.inicializarCalcularEdad();
    this.datosFinado.tipoOrden.setValue(4);
    // this.changeTipoOrden();
    this.desabilitarTodo();
  }

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
  }

  inicializarForm(datosEtapaFinado: any): void {
    this.form = this.formBuilder.group({
     datosFinado: this.formBuilder.group({
                 tipoOrden: [{value: datosEtapaFinado.datosFinado.tipoOrden,         disabled: false },[Validators.required]],
                noContrato: [{value: datosEtapaFinado.datosFinado.noContrato,        disabled: false },[Validators.required]],
        velatorioPrevision: [{value: datosEtapaFinado.datosFinado.velatorioPrevision,disabled: false},[Validators.required]],
                 matricula: [{value: datosEtapaFinado.datosFinado.matricula,         disabled: false },[Validators.required]],
                      curp: [{value: datosEtapaFinado.datosFinado.curp,              disabled: false },[Validators.required, Validators.pattern(PATRON_CURP)]],
                       nss: [{value: datosEtapaFinado.datosFinado.nss,               disabled: false },[Validators.required]],
                    nombre: [{value: datosEtapaFinado.datosFinado.nombre,            disabled: false },[Validators.required]],
            primerApellido: [{value: datosEtapaFinado.datosFinado.primerApellido,    disabled: false,},[Validators.required]],
           segundoApellido: [{value: datosEtapaFinado.datosFinado.segundoApellido,   disabled: false,},[Validators.required]],
           fechaNacimiento: [{value: datosEtapaFinado.datosFinado.fechaNacimiento,   disabled: false,},[Validators.required]],
                      edad: [{value: datosEtapaFinado.datosFinado.edad,              disabled: true },[Validators.required]],
                      sexo: [{value: datosEtapaFinado.datosFinado.sexo,              disabled: false },[Validators.required]],
              otroTipoSexo: [{value: datosEtapaFinado.datosFinado.otroTipoSexo,      disabled: false }],
              nacionalidad: [{value: datosEtapaFinado.datosFinado.nacionalidad,      disabled: false },[Validators.required]],
           lugarNacimiento: [{value: datosEtapaFinado.datosFinado.lugarNacimiento,   disabled: false,},[Validators.required]],
            paisNacimiento: [{value: datosEtapaFinado.datosFinado.paisNacimiento,    disabled: false,},],
            fechaDefuncion: [{value: datosEtapaFinado.datosFinado.fechaDefuncion,    disabled: false},[Validators.required]],
               causaDeceso: [{value: datosEtapaFinado.datosFinado.causaDeceso,       disabled: false },[Validators.required]],
               lugarDeceso: [{value: datosEtapaFinado.datosFinado.lugarDeceso,       disabled: false },[Validators.required]],
                horaDeceso: [{value: datosEtapaFinado.datosFinado.horaDeceso,        disabled: false },[Validators.required]],
        clinicaAdscripcion: [{value: datosEtapaFinado.datosFinado.clinicaAdscripcion,disabled: false,},[Validators.required]],
         unidadProcedencia: [{value: datosEtapaFinado.datosFinado.unidadProcedencia, disabled: false,},[Validators.required]],
         procedenciaFinado: [{value: datosEtapaFinado.datosFinado.procedenciaFinado, disabled: false,},[Validators.required]],
               tipoPension: [{value: datosEtapaFinado.datosFinado.tipoPension,       disabled: false },[Validators.required]]
      }),
      direccion: this.formBuilder.group({
             calle: [{ value: datosEtapaFinado.direccion.calle,      disabled: false },[Validators.required]],
        noExterior: [{ value: datosEtapaFinado.direccion.noExterior, disabled: false },[Validators.required]],
        noInterior: [{ value: datosEtapaFinado.direccion.noInterior, disabled: false },],
                cp: [{ value: datosEtapaFinado.direccion.cp,         disabled: false },[Validators.required]],
           colonia: [{ value: datosEtapaFinado.direccion.colonia,    disabled: false },[Validators.required]],
         municipio: [{ value: datosEtapaFinado.direccion.municipio,  disabled: true  },[Validators.required]],
            estado: [{ value: datosEtapaFinado.direccion.estado,     disabled: false },[Validators.required]],
      }),
    });
  }

  limpiarConsultaDatosPersonales(): void {
    this.datosFinado.nombre.patchValue(null);
    this.datosFinado.primerApellido.patchValue(null);
    this.datosFinado.segundoApellido.patchValue(null);
    this.datosFinado.fechaNacimiento.patchValue(null);
    this.datosFinado.sexo.reset();
    this.datosFinado.nacionalidad.reset();
  }

  regresar(): void {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Activo,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Inactivo,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Inactivo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 3,
        estado: EtapaEstado.Inactivo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'solid',
        },
      },
    ];
    window.scrollTo(0, 0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit(0);
    this.datosAlta();
  }

  continuar(): void {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Completado,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Activo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'solid',
        },
      },
      {
        idEtapa: 3,
        estado: EtapaEstado.Inactivo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'solid',
        },
      },
    ];
    window.scrollTo(0, 0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit(2);
    this.datosAlta();
  }

  datosAlta(): void {
    let formulario = this.form.getRawValue();
    let datosEtapaFinado = {
      datosFinado: {
        tipoOrden: formulario.datosFinado.tipoOrden,
        noContrato: formulario.datosFinado.noContrato,
        velatorioPrevision: formulario.datosFinado.velatorioPrevision,
        esObito: formulario.datosFinado.esObito,
        esParaExtremidad: formulario.datosFinado.esParaExtremidad,
        matricula: formulario.datosFinado.matricula,
        matriculaCheck: formulario.datosFinado.matriculaCheck,
        curp: formulario.datosFinado.curp,
        nss: formulario.datosFinado.nss,
        nssCheck: formulario.datosFinado.nssCheck,
        nombre: formulario.datosFinado.nombre,
        primerApellido: formulario.datosFinado.primerApellido,
        segundoApellido: formulario.datosFinado.segundoApellido,
        fechaNacimiento: formulario.datosFinado.fechaNacimiento,
        edad: formulario.datosFinado.edad,
        sexo: formulario.datosFinado.sexo,
        otroTipoSexo: formulario.datosFinado.otroTipoSexo,
        nacionalidad: formulario.datosFinado.nacionalidad,
        lugarNacimiento: formulario.datosFinado.lugarNacimiento,
        paisNacimiento: formulario.datosFinado.paisNacimiento,
        fechaDefuncion: formulario.datosFinado.fechaDefuncion,
        causaDeceso: formulario.datosFinado.causaDeceso,
        lugarDeceso: formulario.datosFinado.lugarDeceso,
        horaDeceso: formulario.datosFinado.horaDeceso,
        clinicaAdscripcion: formulario.datosFinado.clinicaAdscripcion,
        unidadProcedencia: formulario.datosFinado.unidadProcedencia,
        procedenciaFinado: formulario.datosFinado.procedenciaFinado,
        tipoPension: formulario.datosFinado.tipoPension,
      },
      direccion: {
        calle: formulario.direccion.calle,
        noExterior: formulario.direccion.noExterior,
        noInterior: formulario.direccion.noInterior,
        cp: formulario.direccion.cp,
        colonia: formulario.direccion.colonia,
        municipio: formulario.direccion.municipio,
        estado: formulario.direccion.estado,
      },
    };

    //direcccion
    this.finado.cp = null;
    this.finado.idTipoOrden = datosEtapaFinado.datosFinado.tipoOrden;
    this.finado.extremidad = datosEtapaFinado.datosFinado.esParaExtremidad;
    this.finado.esobito = datosEtapaFinado.datosFinado.esObito;
    this.finado.rfc = null;
    this.finado.curp = null;
    this.finado.nss = null;
    this.finado.nomPersona = null;
    this.finado.primerApellido = null;
    this.finado.segundoApellido = null;
    this.finado.sexo = null;
    this.finado.otroSexo = null;
    this.finado.fechaNac = null;
    this.finado.idPais = null;
    this.finado.idEstado = null;
    this.finado.fechaDeceso = null;
    this.finado.causaDeceso = null;
    this.finado.lugarDeceso = null;
    this.finado.hora = null;
    this.finado.idClinicaAdscripcion = null;
    this.finado.idUnidadProcedencia = null;
    this.finado.procedenciaFinado = null;
    this.finado.idTipoPension = null;
    this.finado.idContratoPrevision = this.idContratoPrevision;
    this.finado.idVelatorioContratoPrevision = this.idVelatorioContratoPrevision ? this.idVelatorioContratoPrevision : null;
    this.finado.cp = null;
    this.finado.idPersona = this.idPersona;
    this.altaODS.idContratantePf = this.idContratante;
    if (!datosEtapaFinado.datosFinado.esParaExtremidad) {
      this.finado.rfc = null;
      this.finado.curp = datosEtapaFinado.datosFinado.curp;
      this.finado.nss = datosEtapaFinado.datosFinado.nss;
      this.finado.nomPersona = datosEtapaFinado.datosFinado.nombre;
      this.finado.primerApellido = datosEtapaFinado.datosFinado.primerApellido;
      this.finado.segundoApellido =
        datosEtapaFinado.datosFinado.segundoApellido;
      this.finado.sexo = datosEtapaFinado.datosFinado.sexo;
      this.finado.otroSexo = datosEtapaFinado.datosFinado.otroTipoSexo;
      this.finado.fechaNac = moment(
        datosEtapaFinado.datosFinado.tipoOrden
      ).format('yyyy-MM-DD');
      this.finado.idPais = datosEtapaFinado.datosFinado.tipoOrden;
      this.finado.idEstado = datosEtapaFinado.datosFinado.tipoOrden;
      this.finado.fechaDeceso = datosEtapaFinado.datosFinado.fechaDefuncion ?  moment(
        datosEtapaFinado.datosFinado.fechaDefuncion
      ).format('yyyy-MM-DD') : null;
      this.finado.causaDeceso = datosEtapaFinado.datosFinado.causaDeceso;
      this.finado.lugarDeceso = datosEtapaFinado.datosFinado.lugarDeceso;
      this.finado.hora = datosEtapaFinado.datosFinado.horaDeceso ? moment(datosEtapaFinado.datosFinado.horaDeceso).format(
        'HH:mm') : null;
      this.finado.idClinicaAdscripcion =
        datosEtapaFinado.datosFinado.clinicaAdscripcion;
      this.finado.idUnidadProcedencia =
        datosEtapaFinado.datosFinado.unidadProcedencia;
      this.finado.procedenciaFinado =
        datosEtapaFinado.datosFinado.procedenciaFinado;
      this.finado.idTipoPension = datosEtapaFinado.datosFinado.tipoPension;
      this.finado.idContratoPrevision = this.idContratoPrevision;
      this.finado.idVelatorioContratoPrevision =
        this.idVelatorioContratoPrevision;
      this.cpFinado.desCalle = datosEtapaFinado.direccion.calle;
      this.cpFinado.numExterior = datosEtapaFinado.direccion.noExterior;
      this.cpFinado.numInterior = datosEtapaFinado.direccion.noInterior;
      this.cpFinado.codigoPostal = datosEtapaFinado.direccion.cp;
      this.cpFinado.desColonia = datosEtapaFinado.direccion.colonia;
      this.cpFinado.desMunicipio = datosEtapaFinado.direccion.municipio;
      this.cpFinado.desEstado = datosEtapaFinado.direccion.estado;
      this.cpFinado.idDomicilio = null;
      this.finado.cp = this.cpFinado;
      this.finado.idPersona = this.idPersona;
    }

    this.altaODS.finado = this.finado;
    this.gestionarEtapasService.datosEtapaFinado$.next(datosEtapaFinado);
    this.gestionarEtapasService.altaODS$.next(this.altaODS);
  }

  get datosFinado() {
    return (this.form.controls['datosFinado'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

  // changeTipoOrden(): void {
  //   this.desabilitarTodo()
  // }


  changeUnidad(): void {
    this.datosFinado.procedenciaFinado.setValue(null);
    this.datosFinado.procedenciaFinado.clearValidators();
    this.datosFinado.procedenciaFinado.updateValueAndValidity();
    this.datosFinado.unidadProcedencia.setValidators(Validators.required);
  }

  changeProcedenciaFinado(): void {
    this.datosFinado.unidadProcedencia.reset();
    this.datosFinado.unidadProcedencia.clearValidators();
    this.datosFinado.unidadProcedencia.updateValueAndValidity();
    this.datosFinado.procedenciaFinado.setValidators(Validators.required);
  }


  desabilitarTodo(): void {
    const formFinado = this.form.controls['datosFinado'] as FormGroup;
    const formFinadoExentos = ['noContrato','fechaDefuncion','causaDeceso','lugarDeceso','horaDeceso',
    'clinicaAdscripcion','unidadProcedencia','procedenciaFinado','tipoPension']
    const formDireccion = this.form.controls['direccion'] as FormGroup;
    Object.keys(this.datosFinado).forEach((key) => {
      if(formFinadoExentos.includes(key)) {
        return
      } else{
        formFinado.controls[key].disable();
      }
    });

    Object.keys(this.direccion).forEach((key) => {
      formDireccion.controls[key].disable();
    });
  }

  agregarValidaciones(): void {
    Object.keys(this.datosFinado).forEach((key) => {
      if (key.includes('esObito') || key.includes('esParaExtremidad')) return;
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });

    Object.keys(this.direccion).forEach((key) => {
      if (key.includes("noInterior"))return;
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });
  }


  consultarFolioPf(event: any): void {
    if(!this.datosFinado.noContrato.value)return;
    const ref = this.dialogService.open(ModalConvenioPfComponent, {
      header: 'Número de contrato',
      style: { maxWidth: '876px', width: '100%' },
      data: { folio: this.datosFinado.noContrato.value },
    });
    ref.onClose.subscribe((persona: any) => {
      let [anio, mes, dia]: any = persona.finado.fechaNac?.split('-');
      this.validacionPersonaConvenio = true;
      dia = dia.substr(0, 2);
      const fecha = new Date(anio + '/' + mes + '/' + dia);
      this.datosFinado.matricula.setValue(persona.finado.matricula);
      this.datosFinado.curp.setValue(persona.finado.curp);
      this.datosFinado.nss.setValue(persona.finado.nss);
      this.datosFinado.nombre.setValue(persona.finado.nomPersona);
      this.datosFinado.primerApellido.setValue(persona.finado.primerApellido);
      this.datosFinado.segundoApellido.setValue(persona.finado.segundoApellido);
      this.datosFinado.fechaNacimiento.setValue(fecha);
      this.datosFinado.sexo.setValue(persona.finado?.sexo);
      this.datosFinado.velatorioPrevision.setValue(persona.nombreVelatorio);
      if (Number(persona.finado.idPais) == 119) {
        this.datosFinado.nacionalidad.setValue(1);
        this.datosFinado.lugarNacimiento.setValue(Number(persona.finado.idEstado));
      } else {
        this.datosFinado.nacionalidad.setValue(2);
        this.datosFinado.paisNacimiento.setValue(Number(persona.finado.idPais));
      }
      this.datosFinado.sexo.setValue(Number(persona.finado.sexo));
      this.datosFinado.otroTipoSexo.setValue(persona.finado.otroSexo);
      this.idVelatorioContratoPrevision = +persona.idVelacion;
      this.idContratoPrevision = +persona.idContrato
      this.idPersona = +persona.finado.idPersona
      this.idContratante = +persona.idContratantePf

      // this.cambiarTipoSexo();
      // this.cambiarNacionalidad();
    });
  }

  noEspacioPrincipal(posicion:number): void {
    let formularios = [
      this.datosFinado.nombre,
      this.datosFinado.primerApellido,
      this.datosFinado.segundoApellido,
      this.datosFinado.procedenciaFinado
    ];
    if(formularios[posicion].value.charAt(0).includes(' ')){
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  validarBotonAceptar(): boolean {
    return this.form.invalid
    // return his.form.invalid ? true : false;
    // if(this.form.invalid){
    //   return true;
    // }
    // return false;
  }
}
