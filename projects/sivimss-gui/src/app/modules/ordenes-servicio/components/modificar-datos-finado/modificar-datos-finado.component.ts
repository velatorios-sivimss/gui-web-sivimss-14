import {
  AfterContentInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterContentChecked,
  ChangeDetectorRef,
} from '@angular/core';

import { SERVICIO_BREADCRUMB } from '../../constants/breadcrumb';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { AltaODSInterface } from '../../models/AltaODS.interface';
import { ContratanteInterface } from '../../models/Contratante.interface';
import { CodigoPostalIterface } from '../../models/CodigoPostal.interface';
import { FinadoInterface } from '../../models/Finado.interface';
import { CaracteristicasPresupuestoInterface } from '../../models/CaracteristicasPresupuesto,interface';
import { CaracteristicasPaqueteInterface } from '../../models/CaracteristicasPaquete.interface';
import { DetallePaqueteInterface } from '../../models/DetallePaquete.interface';
import { ServicioDetalleTrasladotoInterface } from '../../models/ServicioDetalleTraslado.interface';
import { CaracteristicasDelPresupuestoInterface } from '../../models/CaracteristicasDelPresupuesto.interface';
import { DetallePresupuestoInterface } from '../../models/DetallePresupuesto.interface';
import { InformacionServicioInterface } from '../../models/InformacionServicio.interface';
import { InformacionServicioVelacionInterface } from '../../models/InformacionServicioVelacion.interface';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {
  nacionalidad,
  sexo,
  tipoOrden,
} from '../../constants/catalogos-complementarios';
import { ConfirmacionServicio } from '../../../renovacion-extemporanea/models/convenios-prevision.interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { Subscription, finalize } from 'rxjs';
import { Persona } from '../../models/Persona.interface';
import * as moment from 'moment';
import {
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from '../../../../utils/constantes';
import { ActivatedRoute } from '@angular/router';
import { ActualizarOrdenServicioService } from '../../services/actualizar-orden-servicio.service';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { GestionarEtapasActualizacionService } from '../../services/gestionar-etapas-actualizacion.service';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { ModalConvenioPfComponent } from '../modal-convenio-pf/modal-convenio-pf.component';

@Component({
  selector: 'app-modificar-datos-finado',
  templateUrl: './modificar-datos-finado.component.html',
  styleUrls: ['./modificar-datos-finado.component.scss'],
})
export class ModificarDatosFinadoComponent
  implements OnInit, AfterContentChecked
{
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
  ocultarFolioEstatus: boolean = false;

  idDomicilio: number | null = null;

  idPersona: number | null = null;
  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasActualizacionService,
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
    // let estatus = this.rutaActiva.snapshot.paramMap.get('idEstatus');
    let estatus = this.rutaActiva.snapshot.queryParams.idEstatus;
    if (Number(estatus) == 1) this.ocultarFolioEstatus = true;
    else this.ocultarFolioEstatus = false;
    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datodPrevios) => this.llenarAlta(datodPrevios));

    this.gestionarEtapasService.datosEtapaFinado$
      .asObservable()
      .subscribe((datosEtapaFinado) => this.inicializarForm(datosEtapaFinado));
    this.cambiarValidacionMatricula();
    this.inicializarCalcularEdad();
    this.cambiarValidacionNSS();
  }

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  inicializarForm(datosEtapaFinado: any): void {
    let nacionalidad = 1;
    if (
      datosEtapaFinado.datosFinado.idEstado == null ||
      datosEtapaFinado.datosFinado.idEstado == ''
    ) {
      nacionalidad = 2;
    }
    this.idPersona = datosEtapaFinado.datosFinado.idPersona;
    this.idDomicilio = datosEtapaFinado.direccion.idDomicilio;
    // this.idPersona = datosEtapaFinado.datosFinado.
    let esObito: boolean;
    let extremidad: boolean;
    if(typeof  datosEtapaFinado.datosFinado.esObito == "string"){
      datosEtapaFinado.datosFinado.esObito.includes("true") ? esObito = true : esObito = false;
    }else{
      esObito = datosEtapaFinado.datosFinado.esObito;
    }

    if(typeof  datosEtapaFinado.datosFinado.esParaExtremidad == "string"){
      datosEtapaFinado.datosFinado.esParaExtremidad.includes("true")? extremidad = true : extremidad = false;
    }else{
      extremidad = datosEtapaFinado.datosFinado.esParaExtremidad;
    }


    let [dia, mes, anio] =
      datosEtapaFinado.datosFinado.fechaNacimiento.split('/');
    let edad = moment().diff(moment(anio + '-' + mes + '-' + dia), 'years');
    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [
          { value: datosEtapaFinado.datosFinado.tipoOrden, disabled: false },
          [Validators.required],
        ],
        noContrato: [
          { value: datosEtapaFinado.datosFinado.noContrato, disabled: true },
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
          { value: esObito, disabled: false },
        ],
        esParaExtremidad: [
          {
            value: extremidad,
            disabled: false,
          },
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
          { value: datosEtapaFinado.datosFinado.nombre, disabled: true },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: datosEtapaFinado.datosFinado.primerApellido,
            disabled: true,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: datosEtapaFinado.datosFinado.segundoApellido,
            disabled: true,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: datosEtapaFinado.datosFinado.fechaNacimiento,
            disabled: true,
          },
          [Validators.required],
        ],
        edad: [{ value: edad, disabled: true }, [Validators.required]],
        sexo: [
          { value: datosEtapaFinado.datosFinado.sexo, disabled: false },
          [Validators.required],
        ],
        otroTipoSexo: [
          { value: datosEtapaFinado.datosFinado.otroTipoSexo, disabled: false },
        ],
        nacionalidad: [
          { value: nacionalidad, disabled: false },
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
          [],
        ],
        unidadProcedencia: [
          {
            value: datosEtapaFinado.datosFinado.unidadProcedencia,
            disabled: false,
          },
          [],
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
          { value: datosEtapaFinado.direccion.municipio, disabled: true },
          [Validators.required],
        ],
        estado: [
          { value: datosEtapaFinado.direccion.estado, disabled: false },
          [Validators.required],
        ],
      }),
    });
    if (
      datosEtapaFinado.datosFinado.matricula == null ||
      datosEtapaFinado.datosFinado.matricula == ''
    ) {
      this.datosFinado.matricula.disable();
      this.datosFinado.matriculaCheck.setValue(false);
    } else {
      this.datosFinado.matricula.disable();
      this.datosFinado.matriculaCheck.setValue(true);
    }

    if (
      datosEtapaFinado.datosFinado.nss == null ||
      datosEtapaFinado.datosFinado.nss == ''
    ) {
      this.datosFinado.nss.disable();
      this.datosFinado.nssCheck.setValue(false);
    } else {
      this.datosFinado.nss.enable();
      this.datosFinado.nssCheck.setValue(true);
    }

    if (datosEtapaFinado.datosFinado.esObito != null)
      this.esObito(esObito);
    if (datosEtapaFinado.datosFinado.esParaExtremidad != null)
      this.esExtremidad(extremidad);
    if (datosEtapaFinado.datosFinado.noContrato == null) {
      this.datosFinado.noContrato.disable();
      this.datosFinado.velatorioPrevision.disable();
    } else {
      this.datosFinado.noContrato.enable();
      this.datosFinado.velatorioPrevision.enable();
    }
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
                respuesta.datos.nacionalidad.includes('MEXICO') ||
                respuesta.datos.nacionalidad.includes('MEX')
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

            this.cambiarTipoSexo();
            this.cambiarNacionalidad();
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

  consultaCP(): void {
    this.loaderService.activar();
    if (!this.direccion.cp.value) {
      return;
    }
    this.gestionarOrdenServicioService
      .consutaCP(this.direccion.cp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
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
          this.direccion.estado.patchValue(null);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  async inicializarCalcularEdad() {
    this.datosFinado.fechaNacimiento.valueChanges.subscribe(() => {
      if (this.datosFinado.fechaNacimiento.value != null)
        this.datosFinado.edad.setValue(
          moment().diff(moment(this.datosFinado.fechaNacimiento.value), 'years')
        );
    });
  }

  changeUnidad(): void {
    this.datosFinado.clinicaAdscripcion.setValue(null);
    this.datosFinado.clinicaAdscripcion.clearValidators();
    this.datosFinado.clinicaAdscripcion.updateValueAndValidity();
  }

  changeClinica(): void {
    this.datosFinado.unidadProcedencia.setValue(null);
    this.datosFinado.unidadProcedencia.clearValidators();
    this.datosFinado.unidadProcedencia.updateValueAndValidity();
  }

  convertirAMayusculas(): void {
    this.datosFinado.curp.setValue(this.datosFinado.curp.value.toUpperCase());
  }

  consultarMatriculaSiap(): void {
    this.loaderService.activar();

    this.gestionarOrdenServicioService
      .consultarMatriculaSiap(this.datosFinado.matricula.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (!respuesta.datos) {
            this.alertaService.mostrar(
              TipoAlerta.Precaucion,
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(70)
            );
            this.datosFinado.matricula.setValue(null);
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  consultarFolioPf(event: any): void {
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
      this.datosFinado.sexo.setValue(persona?.finado.sexo);
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

  async cambiarValidacionMatricula() {
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

  async cambiarValidacionNSS() {
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

  async changeTipoOrden() {
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
    }
  }

  async esExtremidad(validacion: boolean) {
    const idTipoOrden = Number(this.form.value.datosFinado.tipoOrden);

    if (validacion && (idTipoOrden == 1 || idTipoOrden == 2)) {
      this.datosFinado.velatorioPrevision.disable();
      this.desabilitarTodo();
      this.datosFinado.esObito.disable();

      this.datosFinado.velatorioPrevision.disable();
    } else if ((validacion || !validacion) && idTipoOrden == 3) {
      this.desabilitarTodo();
      this.datosFinado.esObito.disable();
    } else {
      this.habilitarTodo();
      this.datosFinado.velatorioPrevision.disable();
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

  async esObito(validacion: boolean) {
    //curp nss matricula se bloquean
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

  async habilitarTodo() {
    await Object.keys(this.datosFinado).forEach((key) => {
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].enable();
    });

    await Object.keys(this.direccion).forEach((key) => {
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].enable();
    });
  }

  async removerValidaciones() {
    await Object.keys(this.datosFinado).forEach((key) => {
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].clearValidators();
      form.controls[key].updateValueAndValidity();
    });

    await Object.keys(this.direccion).forEach((key) => {
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].clearValidators();
      form.controls[key].updateValueAndValidity();
    });
  }

  async agregarValidaciones() {
    await Object.keys(this.datosFinado).forEach((key) => {
      if (key.includes('esObito') || key.includes('esParaExtremidad')) return;
      const form = this.form.controls['datosFinado'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });

    await Object.keys(this.direccion).forEach((key) => {
      const form = this.form.controls['direccion'] as FormGroup;
      form.controls[key].setValidators([Validators.required]);
      form.controls[key].updateValueAndValidity();
    });
  }

  get datosFinado() {
    return (this.form.controls['datosFinado'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

  continuar(): void {
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
    this.finado.idVelatorioContratoPrevision = null;
    // this.finado.cp = null;
    // this.finado.idPersona = null;
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
      this.finado.fechaDeceso = moment(
        datosEtapaFinado.datosFinado.fechaDefuncion
      ).format('yyyy-MM-DD');
      this.finado.causaDeceso = datosEtapaFinado.datosFinado.causaDeceso;
      this.finado.lugarDeceso = datosEtapaFinado.datosFinado.lugarDeceso;
      this.finado.hora = moment(datosEtapaFinado.datosFinado.horaDeceso).format(
        'HH:mm'
      );
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
      this.cpFinado.idDomicilio = this.idDomicilio;
      this.finado.cp = this.cpFinado;
      this.finado.idPersona = this.idPersona;
    }

    this.altaODS.finado = this.finado;
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
    this.seleccionarEtapa.emit(0);
    this.datosAlta();
  }

  validarFormulario(): void{
    this.form;
  }
}
