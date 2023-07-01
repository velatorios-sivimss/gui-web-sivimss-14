import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalGenerarTarjetaIdentificacionComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-generar-tarjeta-identificacion/modal-generar-tarjeta-identificacion.component';
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

  form!: FormGroup;
  tipoOrden: TipoDropdown[] = tipoOrden;

  tipoSexo: TipoDropdown[] = sexo;
  nacionalidad: TipoDropdown[] = nacionalidad;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  unidadesMedicas!: TipoDropdown[];

  altaODS: AltaODSInterface = {} as AltaODSInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoInterface = {} as FinadoInterface;
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface = {} as CaracteristicasPresupuestoInterface;
  caracteristicasPaquete: CaracteristicasPaqueteInterface = {} as CaracteristicasPaqueteInterface;
  detallePaquete: Array<DetallePaqueteInterface> = [] as Array<DetallePaqueteInterface>;
  servicioDetalleTraslado: ServicioDetalleTrasladotoInterface = {} as ServicioDetalleTrasladotoInterface;
  paquete: DetallePaqueteInterface = {} as DetallePaqueteInterface;
  cpFinado: CodigoPostalIterface = {} as CodigoPostalIterface;
  caracteristicasDelPresupuesto: CaracteristicasDelPresupuestoInterface = {} as CaracteristicasDelPresupuestoInterface;
  detallePresupuesto: Array<DetallePresupuestoInterface> = [] as Array<DetallePresupuestoInterface>;
  presupuesto: DetallePresupuestoInterface = {} as DetallePresupuestoInterface;
  servicioDetalleTrasladoPresupuesto: ServicioDetalleTrasladotoInterface = {} as ServicioDetalleTrasladotoInterface;
  informacionServicio: InformacionServicioInterface = {} as InformacionServicioInterface;
  informacionServicioVelacion: InformacionServicioVelacionInterface = {} as InformacionServicioVelacionInterface;
  cpVelacion: CodigoPostalIterface = {} as CodigoPostalIterface;

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
    this.caracteristicasPresupuesto.caracteristicasPaquete = this.caracteristicasPaquete;
    this.caracteristicasPaquete.detallePaquete = this.detallePaquete;
    this.paquete.servicioDetalleTraslado = this.servicioDetalleTraslado;
    this.caracteristicasPresupuesto.caracteristicasDelPresupuesto = this.caracteristicasDelPresupuesto;
    this.caracteristicasDelPresupuesto.detallePresupuesto = this.detallePresupuesto;
    this.presupuesto.servicioDetalleTraslado = this.servicioDetalleTrasladoPresupuesto;
    this.altaODS.informacionServicio = this.informacionServicio;
    this.informacionServicio.informacionServicioVelacion = this.informacionServicioVelacion;
    this.informacionServicioVelacion.cp = this.cpVelacion;

  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.pais =
      respuesta[this.POSICION_PAIS]!.map((pais: any) => ({
        label: pais.label,
        value: pais.value,
      })) || [];
    this.estado =
      respuesta[this.POSICION_ESTADO]!.map((estado: any) => ({
        label: estado.label,
        value: estado.value,
      })) || [];
    // this.unidadesMedicas = respuesta[this.POSICION_UNIDADES_MEDICAS]!.map((unidad: any) => (
    //   {label: unidad.label, value: unidad.value} )) || [];
    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((altaODS) => this.llenarAlta(altaODS));

    this.gestionarEtapasService.datosEtapaFinado$
      .asObservable()
      .subscribe((datosEtapaFinado) => this.inicializarForm(datosEtapaFinado));
    this.inicializarCalcularEdad();
  }

  llenarAlta(altaODS: any): void {
    console.log(altaODS);
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
          { value: datosEtapaFinado.datosFinado.calle, disabled: false },
          [Validators.required],
        ],
        noExterior: [
          { value: datosEtapaFinado.datosFinado.noExterior, disabled: false },
          [Validators.required],
        ],
        noInterior: [
          { value: datosEtapaFinado.datosFinado.noInterior, disabled: false },
          [Validators.required],
        ],
        cp: [
          { value: datosEtapaFinado.datosFinado.cp, disabled: false },
          [Validators.required],
        ],
        colonia: [
          { value: datosEtapaFinado.datosFinado.colonia, disabled: false },
          [Validators.required],
        ],
        municipio: [
          { value: datosEtapaFinado.datosFinado.municipio, disabled: false },
          [Validators.required],
        ],
        estado: [
          { value: datosEtapaFinado.datosFinado.estado, disabled: false },
          [Validators.required],
        ],
      }),
    });
  }

  abrirModalSeleccionBeneficiarios(): void {
    const ref = this.dialogService.open(ModalSeleccionarBeneficiarioComponent, {
      header: 'Seleccionar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dummy: '', //Pasa info a ModalSeleccionarBeneficiarioComponent
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        //Obtener info cuando se cierre el modal en ModalSeleccionarBeneficiarioComponent
      }
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
      // let hoy = moment();
      // let fechaComparar = moment(this.datosFinado.fechaNacimiento.value);
      // let fechaDiferencia = hoy.diff(fechaComparar,"years");
      // console.log(fechaDiferencia);
      this.datosFinado.edad.setValue(
        moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years')
      );
    });
  }

  cambiarValidacion(): void {
    if (!this.datosFinado.matriculaCheck.value) {
      this.datosFinado.matricula.clearValidators();
      this.datosFinado.matricula.patchValue(this.datosFinado.matricula.value);
      return;
    }
    this.datosFinado.matricula.setValidators(Validators.required);
    this.datosFinado.matricula.patchValue(this.datosFinado.matricula.value);
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

  regresar() {
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
    console.log('INFO A GUARDAR STEP 2: ', this.form.value);
  }

  continuar() {
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
        direccion: {
          calle: this.form.value.direccion.calle,
          noExterior: this.form.value.direccion.noExterior,
          noInterior: this.form.value.direccion.noInterior,
          cp: this.form.value.direccion.cp,
          colonia: this.form.value.direccion.colonia,
          municipio: this.form.value.direccion.municipio,
          estado: this.form.value.direccion.estado,
        },
      },
    };

    this.gestionarEtapasService.datosEtapaFinado$.next(datosEtapaFinado);
    console.log('INFO A GUARDAR STEP 2: ', this.form.value);
    console.log('datos a guardar ', this.altaODS);
  }

  datosAlta(datosEtapaFinado: any): void {
    this.finado.idTipoOrden = datosEtapaFinado.datosFinado.tipoOrden;
    this.gestionarEtapasService.altaODS$.next(this.altaODS);
  }

  get datosFinado() {
    return (this.form.controls['datosFinado'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }
}
