import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalSeleccionarBeneficiarioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import {
  sexo,
  tipoOrden,
  nacionalidad,
} from '../../constants/catalogos-complementarios';
import { PATRON_CURP } from '../../../../utils/constantes';
import { finalize } from 'rxjs/operators';
import { HttpRespuesta } from '../../../../models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';
import { LoaderService } from '../../../../shared/loader/services/loader.service';
import { MensajesSistemaService } from '../../../../services/mensajes-sistema.service';
import { SERVICIO_BREADCRUMB } from '../../constants/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';
import { AltaODSInterface } from '../../models/AltaODS.interface';
import { ContratanteInterface } from '../../models/Contratante.interface';
import { CodigoPostalIterface } from '../../models/CodigoPostal.interface';
import { FinadoInterface } from '../../models/Finado.interface';
import { CaracteristicasPresupuestoInterface } from '../../models/CaracteristicasPresupuesto,interface';
import { CaracteristicasPaqueteInterface } from '../../models/CaracteristicasPaquete.interface';
import { CaracteristicasDelPresupuestoInterface } from '../../models/CaracteristicasDelPresupuesto.interface';
import { DetallePaqueteInterface } from '../../models/DetallePaquete.interface';
import { ServicioDetalleTrasladotoInterface } from '../../models/ServicioDetalleTraslado.interface';
import { DetallePresupuestoInterface } from '../../models/DetallePresupuesto.interface';
import { InformacionServicioVelacionInterface } from '../../models/InformacionServicioVelacion.interface';
import { InformacionServicioInterface } from '../../models/InformacionServicio.interface';

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
  radonlyMatricula: boolean = false;
  radonlyNSS: boolean = false;
  radonlyNoContrato: boolean = true;
  radonlyEstremidad: boolean = false;
  radonlyCurp: boolean = false;
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
    //  this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
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
          { value: datosEtapaFinado.datosFinado.tipoOrden, disabled: false },
          [Validators.required],
        ],
        noContrato: [
          { value: datosEtapaFinado.datosFinado.noContrato, disabled: false },
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
          { value: datosEtapaFinado.datosFinado.esObito, disabled: false },
          [Validators.required],
        ],
        esParaExtremidad: [
          {
            value: datosEtapaFinado.datosFinado.esParaExtremidad,
            disabled: false,
          },
          [Validators.required],
        ],
        matricula: [
          { value: datosEtapaFinado.datosFinado.matricula, disabled: false },
          [Validators.required],
        ],
        matriculaCheck: [
          {
            value: datosEtapaFinado.datosFinado.matriculaCheck,
            disabled: false,
          },
        ],
        curp: [
          { value: datosEtapaFinado.datosFinado.curp, disabled: false },
          [Validators.required, Validators.pattern(PATRON_CURP)],
        ],
        nss: [
          { value: datosEtapaFinado.datosFinado.nss, disabled: false },
          [Validators.required],
        ],

        nssCheck: [
          {
            value: datosEtapaFinado.datosFinado.nssCheck,
            disabled: false,
          },
        ],
        nombre: [
          { value: datosEtapaFinado.datosFinado.nombre, disabled: false },
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
          { value: datosEtapaFinado.datosFinado.edad, disabled: false },
          [Validators.required],
        ],
        sexo: [
          { value: datosEtapaFinado.datosFinado.sexo, disabled: false },
          [Validators.required],
        ],
        otroTipoSexo: [
          { value: datosEtapaFinado.datosFinado.otroTipoSexo, disabled: false },
        ],
        nacionalidad: [
          { value: datosEtapaFinado.datosFinado.nacionalidad, disabled: false },
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
          { value: datosEtapaFinado.datosFinado.causaDeceso, disabled: false },
          [Validators.required],
        ],
        lugarDeceso: [
          { value: datosEtapaFinado.datosFinado.lugarDeceso, disabled: false },
          [Validators.required],
        ],
        horaDeceso: [
          { value: datosEtapaFinado.datosFinado.horaDeceso, disabled: false },
          [Validators.required],
        ],
        clinicaAdscripcion: [
          {
            value: datosEtapaFinado.datosFinado.clinicaAdscripcion,
            disabled: false,
          },
          [Validators.required],
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
          { value: datosEtapaFinado.datosFinado.tipoPension, disabled: false },
          [Validators.required],
        ],
      }),
      direccion: this.formBuilder.group({
        calle: [
          { value: datosEtapaFinado.direccion.calle, disabled: false },
          [Validators.required],
        ],
        noExterior: [
          { value: datosEtapaFinado.direccion.noExterior, disabled: false },
          [Validators.required],
        ],
        noInterior: [
          { value: datosEtapaFinado.direccion.noInterior, disabled: false },
          [Validators.required],
        ],
        cp: [
          { value: datosEtapaFinado.direccion.cp, disabled: false },
          [Validators.required],
        ],
        colonia: [
          { value: datosEtapaFinado.direccion.colonia, disabled: false },
          [Validators.required],
        ],
        municipio: [
          { value: datosEtapaFinado.direccion.municipio, disabled: false },
          [Validators.required],
        ],
        estado: [
          { value: datosEtapaFinado.direccion.estado, disabled: false },
          [Validators.required],
        ],
      }),
    });
  }

  consultarCURP(): void {
    if (!this.datosFinado.curp.value) {
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarCURP(this.datosFinado.curp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            if (respuesta.mensaje.includes('Externo')) {
              const [dia, mes, anio] = respuesta.datos.fechNac.split('/');
              const fecha = new Date(anio + '/' + mes + '/' + dia);
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
                respuesta.datos.desEntidadNac.includes('MEXICO') ||
                respuesta.datos.desEntidadNac.includes('MEX')
              ) {
                this.datosFinado.nacionalidad.setValue(1);
              } else {
                this.datosFinado.nacionalidad.setValue(2);
              }
            } else {
              let [anio, mes, dia] = respuesta.datos[0].fechaNac.split('-');
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
              if (+respuesta.datos[0].idPais == 119) {
                this.datosFinado.nacionalidad.setValue(1);
              } else {
                this.datosFinado.nacionalidad.setValue(2);
              }
            }
            return;
          }
          this.limpiarConsultaDatosPersonales();
          this.alertaService.mostrar(
            TipoAlerta.Precaucion,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            )
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  inicializarCalcularEdad(): void {
    this.datosFinado.fechaNacimiento.valueChanges.subscribe(() => {
      if (this.datosFinado.fechaNacimiento.value != null)
        this.datosFinado.edad.setValue(
          moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years')
        );
    });
  }

  cambiarValidacion(validacion: string): void {
    if (validacion == 'matricula') {
      this.radonlyMatricula = false;
      if (!this.datosFinado.matriculaCheck.value) {
        this.radonlyMatricula = true;
        this.datosFinado.matricula.clearValidators();
        this.datosFinado.matricula.patchValue(null);
        return;
      }
      this.datosFinado.matricula.setValidators(Validators.required);
      this.datosFinado.matricula.patchValue(this.datosFinado.matricula.value);
    } else {
      this.radonlyNSS = false;
      if (!this.datosFinado.nssCheck.value) {
        this.radonlyNSS = true;
        this.datosFinado.nss.clearValidators();
        this.datosFinado.nss.patchValue(null);
        return;
      }
      this.datosFinado.nss.setValidators(Validators.required);
      this.datosFinado.nss.patchValue(this.datosFinado.nss.value);
    }
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
    if (!this.form.valid) return;
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Completado,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: false,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'solid',
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
    let datosEtapaFinado = {
      datosFinado: {
        tipoOrden: this.form.value.datosFinado.tipoOrden,
        noContrato: this.form.value.datosFinado.noContrato,
        velatorioPrevision: this.form.value.datosFinado.velatorioPrevision,
        esObito: this.form.value.datosFinado.esObito,
        esParaExtremidad: this.form.value.datosFinado.esParaExtremidad,
        matricula: this.form.value.datosFinado.matricula,
        matriculaCheck: this.form.value.datosFinado.matriculaCheck,
        curp: this.form.value.datosFinado.curp,
        nss: this.form.value.datosFinado.nss,
        nssCheck: this.form.value.datosFinado.nssCheck,
        nombre: this.form.value.datosFinado.nombre,
        primerApellido: this.form.value.datosFinado.primerApellido,
        segundoApellido: this.form.value.datosFinado.segundoApellido,
        fechaNacimiento: this.form.value.datosFinado.fechaNacimiento,
        edad: this.form.value.datosFinado.edad,
        sexo: this.form.value.datosFinado.sexo,
        otroTipoSexo: this.form.value.datosFinado.otroTipoSexo,
        nacionalidad: this.form.value.datosFinado.nacionalidad,
        lugarNacimiento: this.form.value.datosFinado.lugarNacimiento,
        paisNacimiento: this.form.value.datosFinado.paisNacimiento,
        fechaDefuncion: this.form.value.datosFinado.fechaDefuncion,
        causaDeceso: this.form.value.datosFinado.causaDeceso,
        lugarDeceso: this.form.value.datosFinado.lugarDeceso,
        horaDeceso: this.form.value.datosFinado.horaDeceso,
        clinicaAdscripcion: this.form.value.datosFinado.clinicaAdscripcion,
        unidadProcedencia: this.form.value.datosFinado.unidadProcedencia,
        procedenciaFinado: this.form.value.datosFinado.procedenciaFinado,
        tipoPension: this.form.value.datosFinado.tipoPension,
      },
      direccion: {
        calle: this.form.value.direccion.calle,
        noExterior: this.form.value.direccion.noExterior,
        noInterior: this.form.value.direccion.noInterior,
        cp: this.form.value.direccion.cp,
        colonia: this.form.value.direccion.colonia,
        municipio: this.form.value.direccion.municipio,
        estado: this.form.value.direccion.estado,
      },
    };

    this.finado.idTipoOrden = datosEtapaFinado.datosFinado.tipoOrden;
    this.finado.extremidad = datosEtapaFinado.datosFinado.esParaExtremidad;
    this.finado.esobito = datosEtapaFinado.datosFinado.esObito;
    this.finado.rfc = null;
    this.finado.curp = datosEtapaFinado.datosFinado.curp;
    this.finado.nss = datosEtapaFinado.datosFinado.nss;
    this.finado.nomPersona = datosEtapaFinado.datosFinado.nombre;
    this.finado.primerApellido = datosEtapaFinado.datosFinado.primerApellido;
    this.finado.segundoApellido = datosEtapaFinado.datosFinado.segundoApellido;
    this.finado.sexo = datosEtapaFinado.datosFinado.sexo;
    this.finado.otroSexo = datosEtapaFinado.datosFinado.otroTipoSexo;
    this.finado.fechaNac = datosEtapaFinado.datosFinado.tipoOrden;
    this.finado.idPais = datosEtapaFinado.datosFinado.tipoOrden;
    this.finado.idEstado = datosEtapaFinado.datosFinado.tipoOrden;
    this.finado.fechaDeceso = datosEtapaFinado.datosFinado.fechaDefuncion;
    this.finado.causaDeceso = datosEtapaFinado.datosFinado.causaDeceso;
    this.finado.lugarDeceso = datosEtapaFinado.datosFinado.lugarDeceso;
    this.finado.hora = datosEtapaFinado.datosFinado.horaDeceso;
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
    this.altaODS.finado = this.finado;
    //direcccion
    this.cpFinado.desCalle = datosEtapaFinado.direccion.calle;
    this.cpFinado.numExterior = datosEtapaFinado.direccion.noExterior;
    this.cpFinado.numInterior = datosEtapaFinado.direccion.noInterior;
    this.cpFinado.codigoPostal = datosEtapaFinado.direccion.cp;
    this.cpFinado.desColonia = datosEtapaFinado.direccion.colonia;
    this.cpFinado.desMunicipio = datosEtapaFinado.direccion.municipio;
    this.cpFinado.desEstado = datosEtapaFinado.direccion.estado;
    this.finado.cp = this.cpFinado;
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
    console.log(idTipoOden);
    this.form.reset();
    if (idTipoOden == 1) {
      this.datosFinado.tipoOrden.setValue(1);
      this.radonlyMatricula = false;
      this.radonlyEstremidad = false;
      this.radonlyNSS = false;
      this.radonlyNoContrato = true;
      this.radonlyCurp = false;
      this.agregarValidaciones();
    } else if (idTipoOden == 2) {
      this.datosFinado.tipoOrden.setValue(2);
      this.radonlyMatricula = false;
      this.radonlyEstremidad = false;
      this.radonlyNSS = false;
      this.radonlyNoContrato = false;
      this.radonlyCurp = false;
      this.agregarValidaciones();
    } else {
      this.datosFinado.tipoOrden.setValue(3);
      this.radonlyMatricula = true;
      this.radonlyEstremidad = true;
      this.radonlyNSS = true;
      this.radonlyNoContrato = true;
      this.radonlyCurp = true;
      this.removerValidaciones();
    }
  }

  esEstremidad(validacion: boolean): void {
    const idTipoOrden = Number(this.form.value.datosFinado.tipoOrden);

    if (validacion && idTipoOrden > 0) {
      this.activaDesactivaTodo('activa');
    } else if (!validacion && idTipoOrden == 3) {
      this.activaDesactivaTodo('activa');
    } else if (validacion) {
      this.activaDesactivaTodo('activa');
    } else {
      this.activaDesactivaTodo('desactiva');
    }
  }

  activaDesactivaTodo(valida: string): void {
    if (valida == 'activa') {
      this.radonlyMatricula = true;
      this.radonlyEstremidad = true;
      this.radonlyNSS = true;
      this.radonlyNoContrato = true;
      this.radonlyCurp = true;
      this.removerValidaciones();
    } else {
      this.radonlyMatricula = false;
      this.radonlyEstremidad = false;
      this.radonlyNSS = false;
      this.radonlyNoContrato = false;
      this.radonlyCurp = false;
      this.agregarValidaciones();
    }
  }

  esObito(validacion: boolean): void {
    //curp nss matricula se bloquean

    if (validacion) {
      this.radonlyMatricula = true;
      this.radonlyNSS = true;
      this.radonlyCurp = true;
    } else {
      this.radonlyMatricula = false;
      this.radonlyNSS = false;
      this.radonlyCurp = false;
    }
  }

  consultarNSS(): void {
    this.loaderService.activar();
    console.log(this.datosFinado.nss.value);
    if (!this.datosFinado.nss.value) {
      return;
    }
    this.gestionarOrdenServicioService
      .consultarNSS(this.datosFinado.nss.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
          /*
          if (respuesta) {
            this.direccion.colonia.setValue(respuesta.datos[0].nombre);
            this.direccion.municipio.setValue(
              respuesta.datos[0].localidad.municipio.nombre
            );
            this.direccion.estado.setValue(
              respuesta.datos[0].localidad.municipio.entidadFederativa.nombre
            );
            return;
          }
          this.direccion.colonia.patchValue(null);
          this.direccion.municipio.patchValue(null);
          this.direccion.estado.patchValue(null);*/
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  removerValidaciones(): void {
    Object.keys(this.datosFinado).forEach((key) => {
      console.log(key);
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].clearValidators();
      form.controls[key].updateValueAndValidity();
    });

    Object.keys(this.direccion).forEach((key) => {
      console.log(key);
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].clearValidators();
      form.controls[key].updateValueAndValidity();
    });
  }

  agregarValidaciones(): void {
    Object.keys(this.datosFinado).forEach((key) => {
      console.log(key);
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });

    Object.keys(this.direccion).forEach((key) => {
      console.log(key);
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });
  }
}
