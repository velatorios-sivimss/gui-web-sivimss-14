import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {TipoDropdown} from '../../../../models/tipo-dropdown';
import {
  sexo,
  tipoOrden,
  nacionalidad,
} from '../../constants/catalogos-complementarios';
import {PATRON_CURP} from '../../../../utils/constantes';
import {finalize} from 'rxjs/operators';
import {HttpRespuesta} from '../../../../models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {GenerarOrdenServicioService} from '../../services/generar-orden-servicio.service';
import {LoaderService} from '../../../../shared/loader/services/loader.service';
import {MensajesSistemaService} from '../../../../services/mensajes-sistema.service';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {Etapa} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import {EtapaEstado} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {GestionarEtapasService} from '../../services/gestionar-etapas.service';
import {AltaODSInterface} from '../../models/AltaODS.interface';
import {ContratanteInterface} from '../../models/Contratante.interface';
import {CodigoPostalIterface} from '../../models/CodigoPostal.interface';
import {FinadoInterface} from '../../models/Finado.interface';
import {CaracteristicasPresupuestoInterface} from '../../models/CaracteristicasPresupuesto,interface';
import {CaracteristicasPaqueteInterface} from '../../models/CaracteristicasPaquete.interface';
import {CaracteristicasDelPresupuestoInterface} from '../../models/CaracteristicasDelPresupuesto.interface';
import {DetallePaqueteInterface} from '../../models/DetallePaquete.interface';
import {ServicioDetalleTrasladotoInterface} from '../../models/ServicioDetalleTraslado.interface';
import {DetallePresupuestoInterface} from '../../models/DetallePresupuesto.interface';
import {InformacionServicioVelacionInterface} from '../../models/InformacionServicioVelacion.interface';
import {InformacionServicioInterface} from '../../models/InformacionServicio.interface';
import {ModalConvenioPfComponent} from '../modal-convenio-pf/modal-convenio-pf.component';
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";

@Component({
  selector: 'app-datos-finado',
  templateUrl: './datos-finado.component.html',
  styleUrls: ['./datos-finado.component.scss'],
})
export class DatosFinadoComponent implements OnInit {
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
    this.inicializarCalcularEdad();
  }

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
  }

  inicializarForm(datosEtapaFinado: any): void {
    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [
          {value: datosEtapaFinado.datosFinado.tipoOrden, disabled: false},
          [Validators.required],
        ],
        noContrato: [
          {value: datosEtapaFinado.datosFinado.noContrato, disabled: false},
          [Validators.required],
        ],
        velatorioPrevision: [
          {
            value: datosEtapaFinado.datosFinado.velatorioPrevision,
            disabled: false,
          },
          [Validators.required],
        ],
        esObito: [
          {value: datosEtapaFinado.datosFinado.esObito, disabled: false},
        ],
        esParaExtremidad: [
          {
            value: datosEtapaFinado.datosFinado.esParaExtremidad,
            disabled: false,
          },
        ],
        matricula: [
          {value: datosEtapaFinado.datosFinado.matricula, disabled: false},
          [Validators.required],
        ],
        matriculaCheck: [
          {
            value: datosEtapaFinado.datosFinado.matriculaCheck,
            disabled: false,
          },
        ],
        curp: [
          {value: datosEtapaFinado.datosFinado.curp, disabled: false},
          [Validators.required, Validators.pattern(PATRON_CURP)],
        ],
        nss: [
          {value: datosEtapaFinado.datosFinado.nss, disabled: false},
          [Validators.required],
        ],

        nssCheck: [
          {
            value: datosEtapaFinado.datosFinado.nssCheck,
            disabled: false,
          },
        ],
        nombre: [
          {value: datosEtapaFinado.datosFinado.nombre, disabled: false},
          [Validators.required],
        ],
        primerApellido: [
          {
            value: datosEtapaFinado.datosFinado.primerApellido,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: datosEtapaFinado.datosFinado.segundoApellido,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: datosEtapaFinado.datosFinado.fechaNacimiento,
            disabled: false,
          },
          [Validators.required],
        ],
        edad: [
          {value: datosEtapaFinado.datosFinado.edad, disabled: true},
          [Validators.required],
        ],
        sexo: [
          {value: datosEtapaFinado.datosFinado.sexo, disabled: false},
          [Validators.required],
        ],
        otroTipoSexo: [
          {value: datosEtapaFinado.datosFinado.otroTipoSexo, disabled: false},
        ],
        nacionalidad: [
          {value: datosEtapaFinado.datosFinado.nacionalidad, disabled: false},
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: datosEtapaFinado.datosFinado.lugarNacimiento,
            disabled: false,
          },
          [Validators.required],
        ],
        paisNacimiento: [
          {
            value: datosEtapaFinado.datosFinado.paisNacimiento,
            disabled: false,
          },
        ],
        fechaDefuncion: [
          {
            value: datosEtapaFinado.datosFinado.fechaDefuncion,
            disabled: false,
          },
          [Validators.required],
        ],
        causaDeceso: [
          {value: datosEtapaFinado.datosFinado.causaDeceso, disabled: false},
          [Validators.required],
        ],
        lugarDeceso: [
          {value: datosEtapaFinado.datosFinado.lugarDeceso, disabled: false},
          [Validators.required],
        ],
        horaDeceso: [
          {value: datosEtapaFinado.datosFinado.horaDeceso, disabled: false},
          [Validators.required],
        ],
        clinicaAdscripcion: [
          {
            value: datosEtapaFinado.datosFinado.clinicaAdscripcion,
            disabled: false,
          }
        ],
        unidadProcedencia: [
          {
            value: datosEtapaFinado.datosFinado.unidadProcedencia,
            disabled: false,
          },
          [Validators.required],
        ],
        procedenciaFinado: [
          {
            value: datosEtapaFinado.datosFinado.procedenciaFinado,
            disabled: false,
          },
          [Validators.required],
        ],
        tipoPension: [
          {value: datosEtapaFinado.datosFinado.tipoPension, disabled: false},
        ],
      }),
      direccion: this.formBuilder.group({
        calle: [
          {value: datosEtapaFinado.direccion.calle, disabled: false},
          [Validators.required],
        ],
        noExterior: [
          {value: datosEtapaFinado.direccion.noExterior, disabled: false},
          [Validators.required],
        ],
        noInterior: [
          {value: datosEtapaFinado.direccion.noInterior, disabled: false},
        ],
        cp: [
          {value: datosEtapaFinado.direccion.cp, disabled: false},
          [Validators.required],
        ],
        colonia: [
          {value: datosEtapaFinado.direccion.colonia, disabled: false},
          [Validators.required],
        ],
        municipio: [
          {value: datosEtapaFinado.direccion.municipio, disabled: true},
          [Validators.required],
        ],
        estado: [
          {value: datosEtapaFinado.direccion.estado, disabled: false},
          [Validators.required],
        ],
      }),
    });
    this.cambiarValidacionNSS();
    this.cambiarValidacionMatricula();
    this.esExtremidad(datosEtapaFinado.datosFinado.esParaExtremidad);
    this.esObito(datosEtapaFinado.datosFinado.esObito);
  }

  consultarCURP(): void {
    if (!this.datosFinado.curp.value) {
      return;
    }
    if (this.datosFinado.curp?.errors?.pattern) {
      this.alertaService.mostrar(
        TipoAlerta.Precaucion,
        this.mensajesSistemaService.obtenerMensajeSistemaPorId(34)
      );
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarCURP(this.datosFinado.curp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            if (respuesta.mensaje.includes('Externo')) {
              if (respuesta.datos.message.includes("LA CURP NO SE ENCUENTRA EN LA BASE DE DATOS")) {
                this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
                return
              }
              const [dia, mes, anio] = respuesta.datos.fechNac.split('/');
              const fecha = new Date(anio + '/' + mes + '/' + dia);
              this.idPersona = null;
              this.datosFinado.nombre.setValue(respuesta.datos.nombre);
              this.datosFinado.primerApellido.setValue(
                respuesta.datos.apellido1
              );
              this.datosFinado.segundoApellido.setValue(
                respuesta.datos.apellido2
              );
              this.datosFinado.fechaNacimiento.setValue(fecha);
              if (respuesta.datos.sexo.includes('HOMBRE')) {
                this.datosFinado.sexo.setValue(2);
              }
              if (respuesta.datos.sexo.includes('MUJER')) {
                this.datosFinado.sexo.setValue(1);
              }
              if (
                respuesta.datos.nacionalidad.includes('MEXICO') ||
                respuesta.datos.nacionalidad.includes('MEX')
              ) {
                this.datosFinado.nacionalidad.setValue(1);
              } else {
                this.datosFinado.nacionalidad.setValue(2);
              }
              this.consultarLugarNacimiento(respuesta.datos.desEntidadNac);
            } else {
              let datos = respuesta.datos[0];
              let [anio, mes, dia] = respuesta.datos[0].fechaNac.split('-');
              this.idPersona = datos.idPersona;
              dia = dia.substr(0, 2);
              const fecha = new Date(anio + '/' + mes + '/' + dia);
              this.datosFinado.nombre.setValue(respuesta.datos[0].nombre);
              this.datosFinado.primerApellido.setValue(
                respuesta.datos[0].primerApellido
              );
              this.datosFinado.segundoApellido.setValue(
                respuesta.datos[0].segundoApellido
              );
              this.datosFinado.fechaNacimiento.setValue(fecha);
              this.datosFinado.sexo.setValue(+respuesta.datos[0].sexo);
              if (+respuesta.datos[0].idPais == 119 ||
                respuesta.datos[0].idPais == "" ||
                respuesta.datos[0].idPais === null) {
                this.datosFinado.nacionalidad.setValue(1);
              } else {
                this.datosFinado.nacionalidad.setValue(2);
              }
              this.datosFinado.lugarNacimiento.setValue(+respuesta.datos[0].idEstado);
            }

            this.cambiarTipoSexo();
            this.cambiarNacionalidad();
            return;
          }
          this.limpiarConsultaDatosPersonales();
          this.alertaService.mostrar(TipoAlerta.Precaucion, "CURP no valido.");
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  consultarLugarNacimiento(entidad: string): void {
    const entidadEditada = this.accentsTidy(entidad);
    if (entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')) {
      this.datosFinado.lugarNacimiento.setValue(11);
      return
    }
    if (entidadEditada.toUpperCase().includes('DISTRITO FEDERAL') || entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')) {
      this.datosFinado.lugarNacimiento.setValue(7);
      return
    }
    this.estado.forEach((element: any) => {
      const entidadIteracion = this.accentsTidy(element.label);
      if (entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())) {
        this.datosFinado.lugarNacimiento.setValue(element.value);
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

  inicializarCalcularEdad(): void {
    this.datosFinado.fechaNacimiento.valueChanges.subscribe(() => {
      if (this.datosFinado.fechaNacimiento.value != null)
        this.datosFinado.edad.setValue(
          moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years')
        );
    });
  }

  cambiarValidacionMatricula(): void {
    this.datosFinado.matricula.enable();
    if (!this.datosFinado.matriculaCheck.value) {
      this.datosFinado.matricula.disable();
      this.datosFinado.matricula.clearValidators();
      this.datosFinado.matricula.patchValue(null);
      return;
    }
    this.datosFinado.matricula.setValidators(Validators.required);
    this.datosFinado.matricula.patchValue(this.datosFinado.matricula.value);
  }

  cambiarValidacionNSS(): void {
    this.datosFinado.nss.enable();
    if (!this.datosFinado.nssCheck.value) {
      this.datosFinado.nss.disable();
      this.datosFinado.nss.clearValidators();
      this.datosFinado.nss.patchValue(null);
      return;
    }
    this.datosFinado.nss.setValidators(Validators.required);
    this.datosFinado.nss.patchValue(this.datosFinado.nss.value);
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
      this.finado.fechaDeceso = datosEtapaFinado.datosFinado.fechaDefuncion ? moment(
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

  changeTipoOrden(): void {
    const idTipoOden = Number(this.form.value.datosFinado.tipoOrden);
    this.form.reset();
    if (idTipoOden == 1) {
      this.habilitarTodo();
      this.datosFinado.tipoOrden.setValue(1);
      this.datosFinado.matriculaCheck.setValue(true);
      this.datosFinado.nssCheck.setValue(true);
      this.radonlyEstremidad = false;
      this.datosFinado.nombre.disable();
      this.datosFinado.primerApellido.disable();
      this.datosFinado.segundoApellido.disable();
      this.datosFinado.noContrato.disable();
      this.datosFinado.velatorioPrevision.disable();
      this.datosFinado.fechaNacimiento.disable();
      this.radonlyNoContrato = true;
      this.agregarValidaciones();
    } else if (idTipoOden == 2) {
      this.habilitarTodo();
      this.datosFinado.tipoOrden.setValue(2);
      this.radonlyEstremidad = false;
      this.radonlyNoContrato = false;
      this.datosFinado.velatorioPrevision.disable();
      this.datosFinado.nombre.disable();
      this.datosFinado.primerApellido.disable();
      this.datosFinado.segundoApellido.disable();
      this.datosFinado.fechaNacimiento.disable();
      this.datosFinado.matriculaCheck.setValue(true);
      this.datosFinado.nssCheck.setValue(true);
      this.agregarValidaciones();
    } else {
      this.desabilitarTodo();
      this.datosFinado.tipoOrden.setValue(3);
      this.datosFinado.matricula.disable();
      this.datosFinado.nss.disable();
      this.datosFinado.nssCheck.disable();
      this.datosFinado.matriculaCheck.disable();
      this.removerValidaciones();
      this.datosFinado.esParaExtremidad.disable();
      this.datosFinado.esObito.disable();
    }
    this.limpiarODS();
  }

  limpiarODS(): void {
    const datosEtapaCaracteristicas = {
      observaciones: null,
      notasServicio: null,
      paqueteSeleccionado: null,
      mostrarTIpoOtorgamiento: false,
      selecionaTipoOtorgamiento: null,
      datosPaquetes: [],
      datosPresupuesto: [],
      elementosEliminadosPaquete: [],
      elementosEliminadosPresupuesto: [],
      total: 0,
    };
    const datosEtapaInformacionServicio = {
      fechaCortejo: null,
      fechaCremacion: null,
      fechaRecoger: null,
      horaRecoger: null,
      horaCortejo: null,
      horaCremacion: null,
      idPanteon: null,
      idPromotor: null,
      idSala: null,
      cp: null,
      fechaInstalacion: null,
      fechaVelacion: null,
      horaInstalacion: null,
      horaVelacion: null,
      idCapilla: null,
      calle: null,
      interior: null,
      exterior: null,
      colonia: null,
      municipio: null,
      estado: null,
      gestionadoPorPromotor: null,
      promotor: null,
    };
    this.gestionarEtapasService.datosEtapaCaracteristicas$.next(datosEtapaCaracteristicas);
    this.gestionarEtapasService.datosEtapaInformacionServicio$.next(datosEtapaInformacionServicio);
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

  esExtremidad(validacion: boolean): void {
    const idTipoOrden = Number(this.form.value.datosFinado.tipoOrden);

    this.datosFinado.esParaExtremidad.setValue(validacion);
    if (validacion && (idTipoOrden == 1 || idTipoOrden == 2)) {
      this.datosFinado.velatorioPrevision.disable();
      this.desabilitarTodo();
      this.datosFinado.esObito.patchValue(null)
      this.datosFinado.esObito.disable();
      this.datosFinado.esParaExtremidad.enable();

      this.datosFinado.velatorioPrevision.disable();
    } else if (idTipoOrden == 3) {
      this.desabilitarTodo();
      this.datosFinado.esObito.disable();
      this.datosFinado.esParaExtremidad.disable();
    } else {
      this.habilitarTodo();
      this.datosFinado.velatorioPrevision.disable();
      if (idTipoOrden == 1) this.datosFinado.noContrato.disable();
    }
  }

  activaDesactivaTodo(valida: string): void {
    if (valida == 'activa') {
      this.datosFinado.nss.disable();
      this.datosFinado.matricula.disable();
      this.radonlyEstremidad = true;
      this.radonlyNoContrato = true;
      this.radonlyCurp = true;
      this.removerValidaciones();
    } else {
      this.datosFinado.nss.enable();
      this.radonlyEstremidad = false;
      this.datosFinado.matricula.enable();
      this.radonlyNoContrato = false;
      this.radonlyCurp = false;
      this.agregarValidaciones();
    }
  }

  esObito(validacion: boolean): void {
    //curp nss matricula se bloquean
    if (this.datosFinado.esParaExtremidad.value) return;
    this.datosFinado.esObito.setValue(validacion);
    let idTipoOden = Number(this.form.value.datosFinado.tipoOrden);
    let esEstremidad = this.form.value.datosFinado.esParaExtremidad;
    if (validacion) {
      this.datosFinado.matricula.disable();
      this.datosFinado.nss.disable();
      this.datosFinado.curp.disable();
      this.datosFinado.matricula.setValue(null);
      this.datosFinado.nss.setValue(null);
      this.datosFinado.curp.setValue(null);
    } else if (!validacion && idTipoOden != 3 && !esEstremidad) {
      this.datosFinado.matricula.enable();
      this.datosFinado.nss.enable();
      this.datosFinado.curp.enable();
    }
  }

  consultarNSS(): void {
    this.loaderService.activar();
    if (!this.datosFinado.nss.value) {
      return;
    }
    this.gestionarOrdenServicioService
      .consultarNSS(this.datosFinado.nss.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta) {
            const [dia, mes, anio] = respuesta.datos.fechaNacimiento.split('/')
            const fecha = new Date(anio + "/" + mes + "/" + dia)
            this.datosFinado.curp.setValue(respuesta.datos.curp);
            this.datosFinado.nombre.setValue(respuesta.datos?.nombre);
            this.datosFinado.primerApellido.setValue(respuesta.datos.primerApellido);
            this.datosFinado.segundoApellido.setValue(respuesta.datos.segundoApellido);
            this.datosFinado.sexo.setValue(respuesta.datos.sexo.idSexo == 1 ? 2 : 1);

            //TODO verificar más escenarios, actualmente la nacionalidad lo regresa como null
            this.datosFinado.nacionalidad.setValue(1);
            this.datosFinado.fechaNacimiento.setValue(fecha);

          }
          this.direccion.colonia.patchValue(null);
          this.direccion.municipio.patchValue(null);
          this.direccion.estado.patchValue(null);
          this.cambiarTipoSexo();
          this.cambiarNacionalidad();
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  consultarMatriculaSiap(): void {
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarMatriculaSiap(this.datosFinado.matricula.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (!respuesta.datos) {
            this.alertaService.mostrar(
              TipoAlerta.Precaucion,
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(70)
            );
            this.datosFinado.matricula.setValue(null);
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
        }
      });
  }

  removerValidaciones(): void {
    Object.keys(this.datosFinado).forEach((key) => {
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].clearValidators();
      form.controls[key].updateValueAndValidity();
    });

    Object.keys(this.direccion).forEach((key) => {
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].clearValidators();
      form.controls[key].updateValueAndValidity();
    });
  }

  desabilitarTodo(): void {
    Object.keys(this.datosFinado).forEach((key) => {
      const form = this.form.controls['datosFinado'] as FormGroup;
      if (key == 'tipoOrden') {
        form.controls[key].enable();
      } else {
        form.controls[key].disable();
      }
    });

    Object.keys(this.direccion).forEach((key) => {
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].disable();
    });
  }

  habilitarTodo(): any {
    Object.keys(this.datosFinado).forEach((key) => {
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].enable();
    });
    Object.keys(this.direccion).forEach((key) => {
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].enable();
    });
  }

  agregarValidaciones(): void {
    Object.keys(this.datosFinado).forEach((key) => {
      if (key.includes('esObito') || key.includes('esParaExtremidad') ||
      key.includes('clinicaAdscripcion') || key.includes('tipoPension')) return;
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });

    Object.keys(this.direccion).forEach((key) => {
      if (key.includes("noInterior")) return;
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });
  }

  consultaCP(): void {
    if (!this.direccion.cp.value) {
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consutaCP(this.direccion.cp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta) {
            this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre')
            this.direccion.colonia.setValue(respuesta.datos[0].nombre);
            this.direccion.municipio.setValue(
              respuesta.datos[0].municipio.nombre
            );
            this.direccion.estado.setValue(
              respuesta.datos[0].municipio.entidadFederativa.nombre
            );
            return;
          }
          this.direccion.colonia.patchValue(null);
          this.direccion.municipio.patchValue(null);
          this.direccion.estado.patchValue(null);
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
        }
      });
  }

  consultarFolioPf(event: any): void {
    if (!this.datosFinado.noContrato.value) return;
    const ref = this.dialogService.open(ModalConvenioPfComponent, {
      header: 'Número de contrato',
      style: {maxWidth: '876px', width: '100%'},
      data: {folio: this.datosFinado.noContrato.value},
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

      this.cambiarTipoSexo();
      this.cambiarNacionalidad();
    });
  }

  convertirAMayusculas(): void {
    this.datosFinado.curp.setValue(this.datosFinado.curp.value.toUpperCase());
  }

  noEspacioPrincipal(posicion: number): void {
    let formularios = [
      this.datosFinado.nombre,
      this.datosFinado.primerApellido,
      this.datosFinado.segundoApellido,
      this.datosFinado.procedenciaFinado
    ];
    if (formularios[posicion].value.charAt(0).includes(' ')) {
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  validarBotonAceptar(): boolean {

    if (this.datosFinado.tipoOrden.value == 2) {
      if (this.form.invalid || !this.validacionPersonaConvenio) {
        return true;
      }
    }
    if (this.datosFinado.tipoOrden.value == 1) {
      if (this.form.invalid) {
        return true;
      }
    }
    if (this.datosFinado.tipoOrden.value == 3) {
      if (this.form.invalid) {
        return true;
      }
    }

    if (this.form.invalid) {
      return true;
    }
    return false;
  }
}
