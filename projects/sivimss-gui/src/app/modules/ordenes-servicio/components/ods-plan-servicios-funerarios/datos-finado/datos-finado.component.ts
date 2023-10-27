import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';

import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {TipoDropdown} from '../../../../../models/tipo-dropdown';
import {
  sexo,
  nacionalidad, tipoOrdenSF,
} from '../../../constants/catalogos-complementarios';
import {PATRON_CURP} from '../../../../../utils/constantes';
import {finalize} from 'rxjs/operators';
import {HttpRespuesta} from '../../../../../models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {GenerarOrdenServicioService} from '../../../services/generar-orden-servicio.service';
import {LoaderService} from '../../../../../shared/loader/services/loader.service';
import {MensajesSistemaService} from '../../../../../services/mensajes-sistema.service';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {Etapa} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import {EtapaEstado} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {GestionarEtapasServiceSF} from "../../../services/gestionar-etapas.service-sf";
import {ContratanteInterface} from '../../../models/Contratante.interface';
import {CodigoPostalIterface} from '../../../models/CodigoPostal.interface';
import {FinadoSFInterface} from '../../../models/Finado.interface';
import {CaracteristicasPresupuestoInterface} from '../../../models/CaracteristicasPresupuesto,interface';
import {CaracteristicasPaqueteInterface} from '../../../models/CaracteristicasPaquete.interface';
import {CaracteristicasDelPresupuestoInterface} from '../../../models/CaracteristicasDelPresupuesto.interface';
import {DetallePaqueteInterface} from '../../../models/DetallePaquete.interface';
import {ServicioDetalleTrasladotoInterface} from '../../../models/ServicioDetalleTraslado.interface';
import {DetallePresupuestoInterface} from '../../../models/DetallePresupuesto.interface';
import {InformacionServicioVelacionInterface} from '../../../models/InformacionServicioVelacion.interface';
import {InformacionServicioInterface} from '../../../models/InformacionServicio.interface';
import {AltaODSSFInterface} from "../../../models/AltaODSSF.interface";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";

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
  tipoOrden: TipoDropdown[] = tipoOrdenSF;

  tipoSexo: TipoDropdown[] = sexo;
  nacionalidad: TipoDropdown[] = nacionalidad;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  unidadesMedicas!: TipoDropdown[];
  tipoPension!: TipoDropdown[];

  idContratoPrevision: number | null = null;
  idVelatorioContratoPrevision: number | null = null;

  altaODS: AltaODSSFInterface = {} as AltaODSSFInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoSFInterface = {} as FinadoSFInterface;
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface = {} as CaracteristicasPresupuestoInterface;
  caracteristicasPaquete: CaracteristicasPaqueteInterface = {} as CaracteristicasPaqueteInterface;
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
  idDomicilio: number | null = null;
  folioInvalido: boolean = true;
  colonias: TipoDropdown[] = [];

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarEtapasService: GestionarEtapasServiceSF
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
    this.datosFinado.tipoOrden.setValue(4);
    if (this.datosFinado.unidadProcedencia.value) this.changeUnidad();
    if (this.datosFinado.procedenciaFinado.value) this.changeProcedenciaFinado();
    this.desabilitarTodo();
  }

  llenarAlta(datodPrevios: AltaODSSFInterface): void {
    this.altaODS = datodPrevios;
  }

  inicializarForm(datosEtapaFinado: any): void {
    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [{value: datosEtapaFinado.datosFinado.tipoOrden, disabled: false}, [Validators.required]],
        noContrato: [{value: datosEtapaFinado.datosFinado.noContrato, disabled: false}, [Validators.required]],
        velatorioPrevision: [{
          value: datosEtapaFinado.datosFinado.velatorioPrevision,
          disabled: false
        }, [Validators.required]],
        matricula: [{value: datosEtapaFinado.datosFinado.matricula, disabled: false}, [Validators.required]],
        curp: [{
          value: datosEtapaFinado.datosFinado.curp,
          disabled: false
        }, [Validators.required, Validators.pattern(PATRON_CURP)]],
        nss: [{value: datosEtapaFinado.datosFinado.nss, disabled: false}, [Validators.required]],
        nombre: [{value: datosEtapaFinado.datosFinado.nombre, disabled: false}, [Validators.required]],
        primerApellido: [{value: datosEtapaFinado.datosFinado.primerApellido, disabled: false,}, [Validators.required]],
        segundoApellido: [{
          value: datosEtapaFinado.datosFinado.segundoApellido,
          disabled: false,
        }, [Validators.required]],
        fechaNacimiento: [{
          value: datosEtapaFinado.datosFinado.fechaNacimiento,
          disabled: false,
        }, [Validators.required]],
        edad: [{value: datosEtapaFinado.datosFinado.edad, disabled: true}, [Validators.required]],
        sexo: [{value: datosEtapaFinado.datosFinado.sexo, disabled: false}, [Validators.required]],
        otroTipoSexo: [{value: datosEtapaFinado.datosFinado.otroTipoSexo, disabled: false}],
        nacionalidad: [{value: datosEtapaFinado.datosFinado.nacionalidad, disabled: false}, [Validators.required]],
        lugarNacimiento: [{
          value: datosEtapaFinado.datosFinado.lugarNacimiento,
          disabled: false,
        }, [Validators.required]],
        paisNacimiento: [{value: datosEtapaFinado.datosFinado.paisNacimiento, disabled: false,},],
        fechaDefuncion: [{value: datosEtapaFinado.datosFinado.fechaDefuncion, disabled: false}, [Validators.required]],
        causaDeceso: [{value: datosEtapaFinado.datosFinado.causaDeceso, disabled: false}, [Validators.required]],
        lugarDeceso: [{value: datosEtapaFinado.datosFinado.lugarDeceso, disabled: false}, [Validators.required]],
        horaDeceso: [{value: datosEtapaFinado.datosFinado.horaDeceso, disabled: false}, [Validators.required]],
        clinicaAdscripcion: [{value: datosEtapaFinado.datosFinado.clinicaAdscripcion, disabled: false,}],
        unidadProcedencia: [{
          value: datosEtapaFinado.datosFinado.unidadProcedencia,
          disabled: false,
        }, [Validators.required]],
        procedenciaFinado: [{
          value: datosEtapaFinado.datosFinado.procedenciaFinado,
          disabled: false,
        }, [Validators.required]],
        tipoPension: [{value: datosEtapaFinado.datosFinado.tipoPension, disabled: false}]
      }),
      direccion: this.formBuilder.group({
        calle: [{value: datosEtapaFinado.direccion.calle, disabled: false}, [Validators.required]],
        noExterior: [{value: datosEtapaFinado.direccion.noExterior, disabled: false}, [Validators.required]],
        noInterior: [{value: datosEtapaFinado.direccion.noInterior, disabled: false},],
        cp: [{value: datosEtapaFinado.direccion.cp, disabled: false}, [Validators.required]],
        colonia: [{value: datosEtapaFinado.direccion.colonia, disabled: false}, [Validators.required]],
        municipio: [{value: datosEtapaFinado.direccion.municipio, disabled: true}, [Validators.required]],
        estado: [{value: datosEtapaFinado.direccion.estado, disabled: false}, [Validators.required]],
      }),
    });
    datosEtapaFinado.datosFinado.folioValido;
    datosEtapaFinado.datosFinado.folioValido ? this.folioInvalido = false : this.folioInvalido = true
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
    /**
     * Datos con los que se guardará formulario para su previa visualización
     */
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
        sexo: formulario.datosFinado.sexo,
        otroTipoSexo: formulario.datosFinado.otroTipoSexo,
        nacionalidad: formulario.datosFinado.nacionalidad,
        lugarNacimiento: formulario.datosFinado?.lugarNacimiento ?? null,
        paisNacimiento: formulario.datosFinado?.paisNacimiento ?? null,
        fechaDefuncion: formulario.datosFinado.fechaDefuncion,
        causaDeceso: formulario.datosFinado.causaDeceso,
        lugarDeceso: formulario.datosFinado.lugarDeceso,
        horaDeceso: formulario.datosFinado.horaDeceso,
        clinicaAdscripcion: formulario.datosFinado.clinicaAdscripcion,
        unidadProcedencia: formulario.datosFinado?.unidadProcedencia ?? null,
        procedenciaFinado: formulario.datosFinado?.procedenciaFinado ?? null,
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

    /**
     * Se arma objeto a guardar para inserción
     */
    //Dirección
    this.cpFinado.idDomicilio = this.idDomicilio;
    this.cpFinado.desCalle = datosEtapaFinado.direccion.calle;
    this.cpFinado.numExterior = datosEtapaFinado.direccion.noExterior;
    this.cpFinado.numInterior = datosEtapaFinado.direccion.noInterior;
    this.cpFinado.codigoPostal = datosEtapaFinado.direccion.cp;
    this.cpFinado.desColonia = datosEtapaFinado.direccion.colonia;
    this.cpFinado.desMunicipio = datosEtapaFinado.direccion.municipio;
    this.cpFinado.desEstado = datosEtapaFinado.direccion.estado;
    this.finado.cp = this.cpFinado
    //Datos finado general
    this.finado.idTipoOrden = datosEtapaFinado.datosFinado.tipoOrden;
    this.finado.curp = datosEtapaFinado.datosFinado.curp;
    this.finado.nss = datosEtapaFinado.datosFinado.nss;
    this.finado.nomPersona = datosEtapaFinado.datosFinado.nombre;
    this.finado.primerApellido = datosEtapaFinado.datosFinado.primerApellido;
    this.finado.segundoApellido = datosEtapaFinado.datosFinado.segundoApellido;
    this.finado.sexo = datosEtapaFinado.datosFinado.sexo;
    this.finado.otroSexo = datosEtapaFinado.datosFinado.otroTipoSexo;
    this.finado.fechaNac = moment(datosEtapaFinado.datosFinado.tipoOrden).format('yyyy-MM-DD');
    this.finado.idPais = datosEtapaFinado.datosFinado.paisNacimiento;
    this.finado.idEstado = datosEtapaFinado.datosFinado.lugarNacimiento;
    this.finado.fechaDeceso = moment(datosEtapaFinado.datosFinado.fechaDefuncion).format('yyyy-MM-DD');
    this.finado.causaDeceso = datosEtapaFinado.datosFinado.causaDeceso;
    this.finado.lugarDeceso = datosEtapaFinado.datosFinado.lugarDeceso;
    this.finado.hora = moment(datosEtapaFinado.datosFinado.horaDeceso).format('HH:mm')
    this.finado.idClinicaAdscripcion = datosEtapaFinado.datosFinado.clinicaAdscripcion;
    this.finado.idUnidadProcedencia = datosEtapaFinado.datosFinado.unidadProcedencia;
    this.finado.procedenciaFinado = datosEtapaFinado.datosFinado.procedenciaFinado;
    this.finado.idTipoPension = datosEtapaFinado.datosFinado.tipoPension;
    this.finado.idContratoPrevision = this.idContratoPrevision;
    this.finado.idVelatorioContratoPrevision = this.idVelatorioContratoPrevision;
    this.finado.idPersona = this.idPersona;

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

  consultarFolioPf(event: any): void {
    if (!this.datosFinado.noContrato.value) return;
    this.loaderService.activar()
    this.gestionarOrdenServicioService.consultarFolioSF(this.datosFinado.noContrato.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.folioInvalido = false
        if (respuesta.datos != null) {
          const listaColonias: any = [{nombre: respuesta.datos.contratante.cp.desColonia}]
          const [anio, mes, dia] = respuesta.datos.contratante.fechaNac.split('-');
          const fecha = new Date(anio + '/' + mes + '/' + dia);
          this.colonias = mapearArregloTipoDropdown(listaColonias, 'nombre', 'nombre')
          this.idContratoPrevision = respuesta.datos.idConvenioPa
          this.idPersona = respuesta.datos.contratante.idPersona;
          this.idDomicilio = respuesta.datos.contratante.cp.idDomicilio
          this.idVelatorioContratoPrevision = respuesta.datos.idVelatorio;

          this.direccion.calle.setValue(respuesta.datos.contratante.cp.desCalle);
          this.direccion.noExterior.setValue(respuesta.datos.contratante.cp.numExterior);
          this.direccion.noInterior.setValue(respuesta.datos.contratante.cp.numInterior);
          this.direccion.cp.setValue(respuesta.datos.contratante.cp.codigoPostal);
          this.direccion.colonia.setValue(respuesta.datos.contratante.cp.desColonia);
          this.direccion.municipio.setValue(respuesta.datos.contratante.cp.desMunicipio);
          this.direccion.estado.setValue(respuesta.datos.contratante.cp.desEstado);

          this.datosFinado.curp.setValue(respuesta.datos.contratante.curp);
          this.datosFinado.nss.setValue(respuesta.datos.contratante.nss);
          this.datosFinado.nombre.setValue(respuesta.datos.contratante.nomPersona);
          this.datosFinado.primerApellido.setValue(respuesta.datos.contratante.primerApellido);
          this.datosFinado.segundoApellido.setValue(respuesta.datos.contratante.segundoApellido);
          this.datosFinado.sexo.setValue(+respuesta.datos.contratante.sexo);
          this.datosFinado.otroTipoSexo.setValue(respuesta.datos.contratante.otroSexo);
          this.datosFinado.fechaNacimiento.setValue(fecha);
          this.datosFinado.nacionalidad.setValue(+respuesta.datos.contratante.nacionalidad);
          this.datosFinado.lugarNacimiento.setValue(+respuesta.datos.contratante.idEstado);
          this.datosFinado.paisNacimiento.setValue(respuesta.datos.contratante.idPais ? +respuesta.datos.contratante.idPais : null);
          this.datosFinado.velatorioPrevision.setValue(respuesta.datos.nombreVelatorio);
          this.datosFinado.matricula.setValue(respuesta.datos.contratante.matricula);
          this.datosFinado.edad.setValue(moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years'));
          this.cambiarTipoSexo();
          this.cambiarNacionalidad();
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


  validarBotonAceptar(): boolean {
    return this.form.invalid || this.folioInvalido
  }
}
