import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterContentChecked,
  ChangeDetectorRef, ViewChild,
} from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {AltaODSInterface} from '../../../models/AltaODS.interface';
import {ContratanteInterface} from '../../../models/Contratante.interface';
import {CodigoPostalIterface} from '../../../models/CodigoPostal.interface';
import {FinadoInterface} from '../../../models/Finado.interface';
import {CaracteristicasPresupuestoInterface} from '../../../models/CaracteristicasPresupuesto,interface';
import {CaracteristicasPaqueteInterface} from '../../../models/CaracteristicasPaquete.interface';
import {DetallePaqueteInterface} from '../../../models/DetallePaquete.interface';
import {ServicioDetalleTrasladotoInterface} from '../../../models/ServicioDetalleTraslado.interface';
import {CaracteristicasDelPresupuestoInterface} from '../../../models/CaracteristicasDelPresupuesto.interface';
import {DetallePresupuestoInterface} from '../../../models/DetallePresupuesto.interface';
import {InformacionServicioInterface} from '../../../models/InformacionServicio.interface';
import {InformacionServicioVelacionInterface} from '../../../models/InformacionServicioVelacion.interface';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {EtapaEstado} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {
  nacionalidad,
  sexo,
  tipoOrdenSF,
} from '../../../constants/catalogos-complementarios';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {finalize} from 'rxjs';
import * as moment from 'moment';
import {
  PATRON_CURP,
} from '../../../../../utils/constantes';
import {ActivatedRoute} from '@angular/router';
import {ActualizarOrdenServicioService} from '../../../services/actualizar-orden-servicio.service';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {Etapa} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import {GestionarEtapasActualizacionSFService} from "../../../services/gestionar-etapas-actualizacion-sf.service";
import {GenerarOrdenServicioService} from "../../../services/generar-orden-servicio.service";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {DropDownDetalleInterface} from "../../../models/drop-down-detalle.interface";
import {ModalConvenioSfpaComponent} from "../modal-convenio-sfpa/modal-convenio-sfpa.component";
import {Contratante} from "../../../models/contrato-sfpa.interface";

@Component({
  selector: 'app-modificar-datos-finado-sf',
  templateUrl: './modificar-datos-finado.component.html',
  styleUrls: ['./modificar-datos-finado.component.scss'],
})
export class ModificarDatosFinadoSFComponent
  implements OnInit, AfterContentChecked {
  @Output()
  seleccionarEtapa: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('clinicaSeleccionada') clinicaSeleccionada: any;
  @ViewChild('unidadSeleccionada') unidadSeleccionada: any;
  @ViewChild('pensionSeleccionada') pensionSeleccionada: any;
  @ViewChild('lugarNacimientoSelect') lugarNacimientoSelect: any;
  @ViewChild('paisNacimientoSelect') paisNacimientoSelect: any;
  readonly POSICION_PAIS = 0;
  readonly POSICION_ESTADO = 1;
  readonly POSICION_UNIDADES_MEDICAS = 3;
  readonly POSICION_PENSION = 4;
  form!: FormGroup;
  tipoOrden: TipoDropdown[] = tipoOrdenSF;

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
  ocultarFolioEstatus: boolean = false;

  idDomicilio: number | null = null;

  idPersona: number | null = null;
  idFinado: number | null = null;
  folioInvalido: boolean = true;
  colonias: TipoDropdown[] = [];

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasActualizacionSFService,
    private gestionarOrdenServicioSFService: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private rutaActiva: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
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
    this.pais = respuesta[this.POSICION_PAIS];
    this.estado = respuesta[this.POSICION_ESTADO];
    this.unidadesMedicas = respuesta[this.POSICION_UNIDADES_MEDICAS];
    this.tipoPension = respuesta[this.POSICION_PENSION];
    this.folioInvalido = false;
    let estatus = this.rutaActiva.snapshot.queryParams.idEstatus;
    if (Number(estatus) == 1) this.ocultarFolioEstatus = true;
    else this.ocultarFolioEstatus = false;
    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datodPrevios) => this.llenarAlta(datodPrevios));

    this.gestionarEtapasService.datosEtapaFinado$
      .asObservable()
      .subscribe((datosEtapaFinado) => this.inicializarForm(datosEtapaFinado));
    this.desabilitarTodo();
    this.inicializarCalcularEdad();
  }


  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
    this.idContratoPrevision = this.altaODS.finado.idContratoPrevision
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  inicializarForm(datosEtapaFinado: any): void {
    if(datosEtapaFinado.datosFinado.folioConvenioPa)datosEtapaFinado.datosFinado.noContrato = datosEtapaFinado.datosFinado.folioConvenioPa
    this.idContratoPrevision = datosEtapaFinado.datosFinado.idContratoPrevision;
    const fechaActual = moment().format('YYYY-MM-DD');
    const [anio, mes, dia] = fechaActual.split('-')
    let nacionalidad = 1;
    if (datosEtapaFinado.hasOwnProperty('direccion')) {
      let coloniasLista: any = [{'nombre': datosEtapaFinado.direccion.colonia}]
      this.colonias = mapearArregloTipoDropdown(coloniasLista, 'nombre', 'nombre')
    }
    if (
      datosEtapaFinado.datosFinado.idEstado == null ||
      datosEtapaFinado.datosFinado.idEstado == ''
    ) {
      nacionalidad = 2;
    }
    this.idPersona = datosEtapaFinado.datosFinado.idPersona == 0 ? null : datosEtapaFinado.datosFinado.idPersona;
    this.idFinado = datosEtapaFinado.datosFinado.idFinado == 0 ? null : datosEtapaFinado.datosFinado.idFinado;
    this.idDomicilio = datosEtapaFinado.direccion.idDomicilio;
    // this.idPersona = datosEtapaFinado.datosFinado.
    let esObito: boolean;
    let extremidad: boolean;
    let horaDeceso: any;
    let fechaDeceso: any;

    if (typeof datosEtapaFinado.datosFinado.horaDeceso == "string") {
      const [horas, minutos] = datosEtapaFinado.datosFinado.horaDeceso.split(':')
      datosEtapaFinado.datosFinado.horaDeceso = new Date(+anio, +mes, +dia, +horas, +minutos)
    }
    if (typeof datosEtapaFinado.datosFinado.fechaDefuncion == "string") {
      const [dia, mes, anio] = datosEtapaFinado.datosFinado.fechaDefuncion.split('/');
      datosEtapaFinado.datosFinado.fechaDefuncion = new Date(anio + '/' + mes + '/' + dia);
    }

    let edad;
    let fechaNacimiento;
    if (datosEtapaFinado.datosFinado.fechaNacimiento) {
      if(typeof datosEtapaFinado.datosFinado.fechaNacimiento == 'string'){
      let [dia, mes, anio] =
        datosEtapaFinado.datosFinado.fechaNacimiento.split('/');
        fechaNacimiento = new Date(anio + '-' + mes + '-' + dia)
      }else{
        fechaNacimiento =datosEtapaFinado.datosFinado.fechaNacimiento
      }
      let a = moment(anio + '-' + mes + '-' + dia);
      edad = moment().diff(a, 'years');
    }
    this.idContratoPrevision = datosEtapaFinado.datosFinado.idContratoPrevision
    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [{value: datosEtapaFinado.datosFinado.tipoOrden, disabled: false},
          [Validators.required]],
        noContrato: [{value: datosEtapaFinado.datosFinado.folioConvenioPa ? datosEtapaFinado.datosFinado.folioConvenioPa : datosEtapaFinado.datosFinado.noContrato , disabled: false},
           [Validators.required]],
        velatorioPrevision: [{value: datosEtapaFinado.datosFinado.velatorioPrevision, disabled: false},
          [Validators.required]],
        matricula: [{value: datosEtapaFinado.datosFinado.matricula, disabled: false},
          [Validators.required]],
        curp: [{value: datosEtapaFinado.datosFinado.curp, disabled: false},
          [Validators.required, Validators.pattern(PATRON_CURP)]],
        nss: [{value: datosEtapaFinado.datosFinado.nss, disabled: false},
          [Validators.required]],
        nombre: [{value: datosEtapaFinado.datosFinado.nombre, disabled: false},
          [Validators.required]],
        primerApellido: [{value: datosEtapaFinado.datosFinado.primerApellido, disabled: false,},
          [Validators.required]],
        segundoApellido: [{value: datosEtapaFinado.datosFinado.segundoApellido, disabled: false},
          [Validators.required]],
        fechaNacimiento: [{value: fechaNacimiento, disabled: false},
          [Validators.required]],
        edad: [{value: edad, disabled: true},
          [Validators.required]],
        sexo: [{value: datosEtapaFinado.datosFinado.sexo, disabled: false},
          [Validators.required]],
        otroTipoSexo: [{value: datosEtapaFinado.datosFinado.otroTipoSexo, disabled: false}],
        nacionalidad: [{value: datosEtapaFinado.datosFinado.nacionalidad, disabled: false},
          [Validators.required]],
        lugarNacimiento: [{value: datosEtapaFinado.datosFinado.lugarNacimiento, disabled: false},
          [Validators.required]],
        paisNacimiento: [{value: datosEtapaFinado.datosFinado.paisNacimiento, disabled: false}],
        fechaDefuncion: [{value: datosEtapaFinado.datosFinado.fechaDefuncion, disabled: false},
          [Validators.required]],
        causaDeceso: [{value: datosEtapaFinado.datosFinado.causaDeceso, disabled: false},
          [Validators.required]],
        lugarDeceso: [{value: datosEtapaFinado.datosFinado.lugarDeceso, disabled: false},
          [Validators.required]],
        horaDeceso: [{value: datosEtapaFinado.datosFinado.horaDeceso, disabled: false},
          [Validators.required]],
        clinicaAdscripcion: [{value: datosEtapaFinado.datosFinado.clinicaAdscripcion, disabled: false}],
        unidadProcedencia: [{value: +datosEtapaFinado.datosFinado.unidadProcedencia, disabled: false}],
        procedenciaFinado: [{value: datosEtapaFinado.datosFinado.procedenciaFinado, disabled: false},
          [Validators.required],],
        tipoPension: [{value: datosEtapaFinado.datosFinado.tipoPension, disabled: false}],
      }),
      direccion: this.formBuilder.group({
        calle: [{value: datosEtapaFinado.direccion.calle, disabled: false},
          [Validators.required]],
        noExterior: [{value: datosEtapaFinado.direccion.noExterior, disabled: false},
          [Validators.required]],
        noInterior: [{value: datosEtapaFinado.direccion.noInterior, disabled: false}],
        cp: [{value: datosEtapaFinado.direccion.cp, disabled: false},
          [Validators.required]],
        colonia: [{value: datosEtapaFinado.direccion.colonia, disabled: false},
          [Validators.required]],
        municipio: [{value: datosEtapaFinado.direccion.municipio, disabled: true},
          [Validators.required]],
        estado: [{value: datosEtapaFinado.direccion.estado, disabled: false},
          [Validators.required]],
      }),
    });
    this.colonias = [{label:datosEtapaFinado.direccion.colonia,value:datosEtapaFinado.direccion.colonia}]
    setTimeout(() => {
      if (datosEtapaFinado.datosFinado.procedenciaFinado) {
        this.changeProcedenciaFinado();
      } else if (datosEtapaFinado.datosFinado.unidadProcedencia) {
        this.changeUnidad();
      }
    }, 2000)
  }


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

  changeClinica(): void {
    this.datosFinado.unidadProcedencia.setValue(null);
    this.datosFinado.unidadProcedencia.clearValidators();
    this.datosFinado.unidadProcedencia.updateValueAndValidity();
  }


  consultarFolioPf(event: any): void {
    if (!this.datosFinado.noContrato.value) return;
    this.loaderService.activar()
    this.gestionarOrdenServicioSFService.consultarFolioSF(this.datosFinado.noContrato.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.folioInvalido = false
        if (respuesta.datos != null) {

          const ref = this.dialogService.open(ModalConvenioSfpaComponent, {
            header: 'Número de contrato',
            style: {maxWidth: '876px', width: '100%'},
            data: {contratantes: respuesta.datos},
          });

          ref.onClose.subscribe((idContrato: number) => {
            if(idContrato){
              this.llenarDatosFinado(
                respuesta.datos.contratante.filter((contratante:Contratante) => {
                  return contratante.idPersona == idContrato
                })
              );
              this.idContratoPrevision = respuesta.datos.idConvenioPa
              this.idVelatorioContratoPrevision = respuesta.datos.idVelatorio;
              this.datosFinado.velatorioPrevision.setValue(respuesta.datos.nombreVelatorio);
            }
          });
          return
        }
        this.folioInvalido = true
        this.alertaService.mostrar(TipoAlerta.Info, this.mensajesSistemaService.obtenerMensajeSistemaPorId(
          +respuesta.mensaje
        ));

      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(
          +error.error.mensaje
        ));
      }
    })
  }

  llenarDatosFinado(contratanteSeleccionado:Contratante[]): void {
    const contratante = contratanteSeleccionado[0]
    const [anio, mes, dia] = contratante.fechaNac.split('-');
    const fecha = new Date(anio + '/' + mes + '/' + dia);
    this.colonias = [{label: contratante.cp.desColonia, value: contratante.cp.desColonia}];
    this.idPersona = contratante.idPersona;
    this.idDomicilio = contratante.cp.idDomicilio;
    this.direccion.calle.setValue(contratante.cp.desCalle);
    this.direccion.noExterior.setValue(contratante.cp.numExterior);
    this.direccion.noInterior.setValue(contratante.cp.numInterior);
    this.direccion.cp.setValue(contratante.cp.codigoPostal);
    this.direccion.colonia.setValue(contratante.cp.desColonia);
    this.direccion.municipio.setValue(contratante.cp.desMunicipio);
    this.direccion.estado.setValue(contratante.cp.desEstado);

    this.datosFinado.curp.setValue(contratante.curp);
    this.datosFinado.nss.setValue(contratante.nss);
    this.datosFinado.nombre.setValue(contratante.nomPersona);
    this.datosFinado.primerApellido.setValue(contratante.primerApellido);
    this.datosFinado.segundoApellido.setValue(contratante.segundoApellido);
    this.datosFinado.sexo.setValue(+contratante.sexo);
    this.datosFinado.otroTipoSexo.setValue(contratante.otroSexo);
    this.datosFinado.fechaNacimiento.setValue(fecha);
    this.datosFinado.nacionalidad.setValue(+contratante.idEstado ? 1 : 2);
    this.datosFinado.lugarNacimiento.setValue(+contratante.idEstado);
    this.datosFinado.paisNacimiento.setValue(+contratante.idPais);
    this.datosFinado.matricula.setValue(contratante.matricula);
    this.datosFinado.edad.setValue(moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years'));
    this.cambiarTipoSexo();
    this.cambiarNacionalidad();
  }

  cambiarTipoSexo(): void {
    if (this.datosFinado.sexo.value == 3) {
      this.datosFinado.otroTipoSexo.enabled;
      this.datosFinado.otroTipoSexo.setValidators(Validators.required);
      return;
    }
    this.datosFinado.otroTipoSexo.disabled;
    this.datosFinado.otroTipoSexo.clearValidators();
    this.datosFinado.otroTipoSexo.setValue(null);
  }

  cambiarNacionalidad(): void {
    if (this.datosFinado.nacionalidad.value == 1) {
      this.datosFinado.paisNacimiento.disabled;
      this.datosFinado.paisNacimiento.clearValidators();
      this.datosFinado.paisNacimiento.reset();
      this.datosFinado.lugarNacimiento.enabled;
      this.datosFinado.lugarNacimiento.setValidators(Validators.required);
      return;
    }
    this.datosFinado.lugarNacimiento.disabled;
    this.datosFinado.lugarNacimiento.clearValidators();
    this.datosFinado.lugarNacimiento.reset();
    this.datosFinado.paisNacimiento.enabled;
    this.datosFinado.paisNacimiento.setValidators(Validators.required);
  }

  limpiarConsultaDatosPersonales(): void {
    this.datosFinado.nombre.patchValue(null);
    this.datosFinado.primerApellido.patchValue(null);
    this.datosFinado.segundoApellido.patchValue(null);
    this.datosFinado.fechaNacimiento.patchValue(null);
    this.datosFinado.sexo.reset();
    this.datosFinado.nacionalidad.reset();
  }

  desabilitarTodo(): void {

    const formFinado = this.form.controls['datosFinado'] as FormGroup;
    const formFinadoExentos = ['noContrato', 'fechaDefuncion', 'causaDeceso', 'lugarDeceso', 'horaDeceso',
      'clinicaAdscripcion', 'unidadProcedencia', 'procedenciaFinado', 'tipoPension']
    const formDireccion = this.form.controls['direccion'] as FormGroup;

    Object.keys(this.datosFinado).forEach((key) => {
      if (formFinadoExentos.includes(key)) {
        return
      } else {
        formFinado.controls[key].disable();
      }
    });

    Object.keys(this.direccion).forEach((key) => {
      formDireccion.controls[key].disable();
    });
  }

  // async habilitarTodo() {
  //   await Object.keys(this.datosFinado).forEach((key) => {
  //     const form = this.form.controls['datosFinado'] as FormGroup;
  //     // if(key.includes('noContrato'))return;
  //     form.controls[key].enable();
  //   });
  //
  //   await Object.keys(this.direccion).forEach((key) => {
  //     const form = this.form.controls['direccion'] as FormGroup;
  //     form.controls[key].enable();
  //   });
  // }

  // async removerValidaciones() {
  //   await Object.keys(this.datosFinado).forEach((key) => {
  //     const form = this.form.controls['datosFinado'] as FormGroup;
  //     form.controls[key].clearValidators();
  //     form.controls[key].updateValueAndValidity();
  //   });
  //
  //   await Object.keys(this.direccion).forEach((key) => {
  //     const form = this.form.controls['direccion'] as FormGroup;
  //     form.controls[key].clearValidators();
  //     form.controls[key].updateValueAndValidity();
  //   });
  // }

  // async agregarValidaciones() {
  //   await Object.keys(this.datosFinado).forEach((key) => {
  //     if (key.includes('esObito') || key.includes('esParaExtremidad')) return;
  //     const form = this.form.controls['datosFinado'] as FormGroup;
  //     form.controls[key].setValidators([Validators.required]);
  //     form.controls[key].updateValueAndValidity();
  //   });
  //
  //   await Object.keys(this.direccion).forEach((key) => {
  //     if (key.includes("noInterior"))return;
  //     const form = this.form.controls['direccion'] as FormGroup;
  //     form.controls[key].setValidators([Validators.required]);
  //     form.controls[key].updateValueAndValidity();
  //   });
  // }

  get datosFinado() {
    return (this.form.controls['datosFinado'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

  // noEspacioPrincipal(posicion:number): void {
  //   let formularios = [
  //     this.datosFinado.nombre,
  //     this.datosFinado.primerApellido,
  //     this.datosFinado.segundoApellido,
  //     this.datosFinado.procedenciaFinado
  //   ];
  //   if(formularios[posicion].value.charAt(0).includes(' ')){
  //     formularios[posicion].setValue(formularios[posicion].value.trimStart());
  //   }
  // }

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
    this.seleccionarEtapa.emit({idEtapaSeleccionada:2, detalle_orden_servicio: true});
    this.datosAlta();
  }

  datosAlta(): void {
    let formulario = this.form.getRawValue();
    let datosEtapaFinado = {
      datosFinado: {
        folioValido: !this.folioInvalido,
        tipoOrden: formulario.datosFinado.tipoOrden,
        noContrato: formulario.datosFinado.noContrato,
        velatorioPrevision: formulario.datosFinado.velatorioPrevision,
        matricula: formulario.datosFinado.matricula,
        curp: formulario.datosFinado.curp,
        nss: formulario.datosFinado.nss,
        nombre: formulario.datosFinado.nombre,
        primerApellido: formulario.datosFinado.primerApellido,
        segundoApellido: formulario.datosFinado.segundoApellido,
        fechaNacimiento: formulario.datosFinado.fechaNacimiento,
        edad: formulario.datosFinado.edad,
        sexo: formulario.datosFinado.sexo == 0 ? null : formulario.datosFinado.sexo,
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

    this.cpFinado.idDomicilio = this.idDomicilio;
    this.cpFinado.desCalle = datosEtapaFinado.direccion.calle;
    this.cpFinado.numExterior = datosEtapaFinado.direccion.noExterior;
    this.cpFinado.numInterior = datosEtapaFinado.direccion.noInterior;
    this.cpFinado.codigoPostal = datosEtapaFinado.direccion.cp;
    this.cpFinado.desColonia = datosEtapaFinado.direccion.colonia;
    this.cpFinado.desMunicipio = datosEtapaFinado.direccion.municipio;
    this.cpFinado.desEstado = datosEtapaFinado.direccion.estado;
    this.finado.cp = this.cpFinado;

    this.finado.idTipoOrden = 4;

    this.altaODS.idContratantePf = this.idContratante;
    this.finado.matricula = datosEtapaFinado.datosFinado.matricula;
    this.finado.curp = datosEtapaFinado.datosFinado.curp;
    this.finado.nss = datosEtapaFinado.datosFinado.nss;
    this.finado.nomPersona = datosEtapaFinado.datosFinado.nombre;
    this.finado.primerApellido = datosEtapaFinado.datosFinado.primerApellido;
    this.finado.segundoApellido = datosEtapaFinado.datosFinado.segundoApellido;
    this.finado.sexo = datosEtapaFinado.datosFinado.sexo;
    this.finado.otroSexo = datosEtapaFinado.datosFinado.otroTipoSexo;
    this.finado.fechaNac = moment(datosEtapaFinado.datosFinado.fechaNacimiento).format('yyyy-MM-DD');
    this.finado.idPais = datosEtapaFinado.datosFinado.paisNacimiento;
    this.finado.idEstado = datosEtapaFinado.datosFinado.lugarNacimiento;
    this.finado.fechaDeceso = moment(datosEtapaFinado.datosFinado.fechaDefuncion).format('yyyy-MM-DD');
    this.finado.causaDeceso = datosEtapaFinado.datosFinado.causaDeceso;
    this.finado.lugarDeceso = datosEtapaFinado.datosFinado.lugarDeceso;
    this.finado.hora = moment(datosEtapaFinado.datosFinado.horaDeceso).format('HH:mm');
    this.finado.idClinicaAdscripcion = datosEtapaFinado.datosFinado.clinicaAdscripcion;
    this.finado.idUnidadProcedencia = datosEtapaFinado.datosFinado.unidadProcedencia;
    this.finado.procedenciaFinado = datosEtapaFinado.datosFinado.procedenciaFinado;
    this.finado.idTipoPension = datosEtapaFinado.datosFinado.tipoPension;
    this.finado.idContratoPrevision = this.idContratoPrevision;
    this.finado.idVelatorioContratoPrevision = this.idVelatorioContratoPrevision;
    this.finado.idPersona = this.idPersona ?? null;
    this.finado.idFinado = this.idFinado;
    this.finado.rfc = null;


    this.altaODS.finado = this.finado;
    this.llenarDescripcionDropDown();
    this.gestionarEtapasService.datosEtapaFinado$.next(datosEtapaFinado);
    this.gestionarEtapasService.altaODS$.next(this.altaODS);
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
    this.seleccionarEtapa.emit({idEtapaSeleccionada:0, detalle_orden_servicio: true});
    this.datosAlta();
  }

  validarBotonAceptar(): boolean {
    return this.form.invalid || this.folioInvalido
  }


  inicializarCalcularEdad() {
    if (this.datosFinado.fechaNacimiento.value != null)
      this.datosFinado.edad.setValue(moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years'));
  }

  llenarDescripcionDropDown(): void {
    let obj: DropDownDetalleInterface = JSON.parse(localStorage.getItem("drop_down") as string)
    obj.finado.clinicaAdscripcion = this.clinicaSeleccionada?.selectedOption?.label ?? null;
    obj.finado.tipoPension = this.pensionSeleccionada?.selectedOption?.label ?? null;
    obj.finado.unidadProcedencia = this.unidadSeleccionada?.selectedOption?.label ?? null;
    obj.finado.lugarNacimiento = this.lugarNacimientoSelect?.selectedOption?.label ?? null;
    obj.finado.paisNacimiento = this.paisNacimientoSelect?.selectedOption?.label ?? null;
    obj.finado.numeroContrato = this.datosFinado.noContrato.value
    obj.finado.matricula = this.datosFinado.matricula.value
    localStorage.setItem("drop_down",JSON.stringify(obj));
  }

}
