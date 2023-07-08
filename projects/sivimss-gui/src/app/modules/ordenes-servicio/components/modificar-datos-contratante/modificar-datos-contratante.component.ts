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
import { nacionalidad, sexo } from '../../constants/catalogos-complementarios';
import { ConfirmacionServicio } from '../../../renovacion-extemporanea/models/convenios-prevision.interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { Subscription, finalize } from 'rxjs';

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

@Component({
  selector: 'app-modificar-datos-contratante',
  templateUrl: './modificar-datos-contratante.component.html',
  styleUrls: ['./modificar-datos-contratante.component.scss'],
})
export class ModificarDatosContratanteComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  readonly POSICION_PAIS = 0;
  readonly POSICION_ESTADO = 1;
  readonly POSICION_PARENTESCO = 2;

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

  ocultarFolioEstatus: boolean = true;
  form!: FormGroup;
  datosDetalle: any = [];
  tipoSexo: TipoDropdown[] = sexo;
  muestraOtroSexo: boolean = false;
  nacionalidad: TipoDropdown[] = nacionalidad;
  radonlyMatricula: boolean = false;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  parentesco!: TipoDropdown[];
  fechaActual = new Date();

  idPersona: number | null = null;
  idContratante: number | null = null;
  idDomicilio: number | null = null;
  idODS: number | null = null;
  datosConsulta: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,
    private rutaActiva: ActivatedRoute,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasActualizacionService,
    private breadcrumbService: BreadcrumbService,
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
    this.inicializarForm();
  }
  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
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
    this.parentesco =
      respuesta[this.POSICION_PARENTESCO]!.map((parentesco: any) => ({
        label: parentesco.label,
        value: parentesco.value,
      })) || [];

    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);

    let estatus = this.rutaActiva.snapshot.paramMap.get('idEstatus');
    if (Number(estatus) == 1) this.ocultarFolioEstatus = true;
    else this.ocultarFolioEstatus = false;

    this.gestionarEtapasService.datosContratante$
      .asObservable()
      .subscribe((datosContratante) =>
        this.llenarFormmulario(
          datosContratante,
          Number(this.rutaActiva.snapshot.paramMap.get('idEstatus')),
          Number(this.rutaActiva.snapshot.paramMap.get('idODS'))
        )
      );
    this.gestionarEtapasService.datosConsultaODS$
      .asObservable()
      .subscribe((datosConsultaODS) => (this.datosConsulta = datosConsultaODS));
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        matriculaCheck: [
          {
            value: null,
            disabled: false,
          },
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.pattern(PATRON_RFC)],
        ],
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CURP)],
        ],
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        otroTipoSexo: [
          {
            value: null,
            disabled: false,
          },
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
        ],
        telefono: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CORREO)],
        ],
        parentesco: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      direccion: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        noExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        noInterior: [
          {
            value: null,
            disabled: false,
          },
          [],
        ],
        cp: [{ value: null, disabled: false }, [Validators.required]],
        colonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
      }),
    });
  }

  llenarParametro() {}

  llenarFormmulario(datos: any, idODS: number, tipoODS: number): void {
    if (Object.entries(datos).length === 0) {
      return;
    }

    let nacionalidad = 1;
    if (
      datos.contratante.idEstado == null ||
      datos.contratante.idEstado == ''
    ) {
      nacionalidad = 2;
    }
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [
          {
            value: datos.contratante.matricula,
            disabled: false,
          },
          [Validators.required],
        ],
        matriculaCheck: [
          {
            value:
              datos.contratante.matricula == null ||
              datos.contratante.matricula == ''
                ? false
                : true,
            disabled: false,
          },
        ],
        rfc: [
          {
            value: datos.contratante.rfc,
            disabled: false,
          },
          [Validators.pattern(PATRON_RFC)],
        ],
        curp: [
          {
            value: datos.contratante.curp,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CURP)],
        ],
        nombre: [
          {
            value: datos.contratante.nomPersona,
            disabled: true,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: datos.contratante.primerApellido,
            disabled: true,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: datos.contratante.segundoApellido,
            disabled: true,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: datos.contratante.fechaNac,
            disabled: true,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: Number(datos.contratante.sexo),
            disabled: false,
          },
          [Validators.required],
        ],
        otroTipoSexo: [
          {
            value: datos.contratante.otroSexo,
            disabled: false,
          },
        ],
        nacionalidad: [
          {
            value: nacionalidad,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: Number(datos.contratante.idEstado),
            disabled: false,
          },
          [],
        ],
        paisNacimiento: [
          {
            value: Number(datos.contratante.idPais),
            disabled: false,
          },
        ],
        telefono: [
          {
            value: datos.contratante.telefono,
            disabled: false,
          },
          [Validators.required],
        ],
        correoElectronico: [
          {
            value: datos.contratante.correo,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CORREO)],
        ],
        parentesco: [
          {
            value: Number(datos.idParentesco),
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      direccion: this.formBuilder.group({
        calle: [
          {
            value: datos.contratante.cp.desCalle,
            disabled: false,
          },
          [Validators.required],
        ],
        noExterior: [
          {
            value: datos.contratante.cp.numExterior,
            disabled: false,
          },
          [Validators.required],
        ],
        noInterior: [
          {
            value: datos.contratante.cp.numInterior,
            disabled: false,
          },
          [],
        ],
        cp: [
          { value: datos.contratante.cp.codigoPostal, disabled: false },
          [Validators.required],
        ],
        colonia: [
          {
            value: datos.contratante.cp.desColonia,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: datos.contratante.cp.desMunicipio,
            disabled: true,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: datos.contratante.cp.desEstado,
            disabled: true,
          },
          [Validators.required],
        ],
      }),
    });

    if (tipoODS == 1) {
      this.idODS = idODS;
      this.altaODS.idOrdenServicio = idODS;
    }
    this.idContratante = Number(datos.contratante.idContratante);
    this.idPersona = datos.contratante.idPersona;

    this.cambiarValidacion();
    this.cambiarTipoSexo();
    this.cambiarNacionalidad();
  }

  async cambiarValidacion() {
    this.radonlyMatricula = false;
    if (!this.datosContratante.matriculaCheck.value) {
      this.radonlyMatricula = true;
      this.datosContratante.matricula.clearValidators();
      this.datosContratante.matricula.patchValue(null);
      return;
    }

    this.datosContratante.matricula.setValidators(Validators.required);
    this.datosContratante.matricula.patchValue(
      this.datosContratante.matricula.value
    );
  }

  consultarMatriculaSiap(): void {
    this.loaderService.activar();

    this.gestionarOrdenServicioService
      .consultarMatriculaSiap(this.datosContratante.matricula.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (!respuesta.datos) {
            this.alertaService.mostrar(
              TipoAlerta.Precaucion,
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(70)
            );
            this.datosContratante.matricula.setValue(null);
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  consultarCURP(): void {
    if (!this.datosContratante.curp.value) {
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarCURP(this.datosContratante.curp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos) {
            if (respuesta.mensaje.includes('Externo')) {
              this.idPersona = null;
              this.idContratante = null;
              const [dia, mes, anio] = respuesta.datos.fechNac.split('/');
              const fecha = new Date(anio + '/' + mes + '/' + dia);
              this.datosContratante.nombre.setValue(respuesta.datos.nombre);
              this.datosContratante.primerApellido.setValue(
                respuesta.datos.apellido1
              );
              this.datosContratante.segundoApellido.setValue(
                respuesta.datos.apellido2
              );
              this.datosContratante.fechaNacimiento.setValue(fecha);
              if (respuesta.datos.sexo.includes('HOMBRE')) {
                this.datosContratante.sexo.setValue(2);
              }
              if (respuesta.datos.sexo.includes('MUJER')) {
                this.datosContratante.sexo.setValue(1);
              }
              if (
                respuesta.datos.desEntidadNac.includes('MEXICO') ||
                respuesta.datos.desEntidadNac.includes('MEX')
              ) {
                this.datosContratante.nacionalidad.setValue(1);
              } else {
                this.datosContratante.nacionalidad.setValue(2);
              }
            } else {
              let datos = respuesta.datos[0];
              this.idPersona = datos.idPersona;
              this.idContratante = datos.idContratante;
              let [anio, mes, dia] = datos.fechaNac.split('-');
              dia = dia.substr(0, 2);
              const fecha = new Date(anio + '/' + mes + '/' + dia);
              this.datosContratante.nombre.setValue(datos.nombre);
              this.datosContratante.primerApellido.setValue(
                respuesta.primerApellido
              );
              this.datosContratante.segundoApellido.setValue(
                datos.segundoApellido
              );
              this.datosContratante.fechaNacimiento.setValue(fecha);

              this.datosContratante.sexo.setValue(+respuesta.datos[0].sexo);
              if (datos.idPais == 119) {
                this.datosContratante.nacionalidad.setValue(1);
              } else {
                this.datosContratante.nacionalidad.setValue(2);
              }

              this.datosContratante.rfc.setValue(datos.rfc);

              this.datosContratante.paisNacimiento.setValue(
                Number(datos.idPais)
              );
              this.datosContratante.lugarNacimiento.setValue(
                Number(datos.idEstado)
              );

              this.datosContratante.telefono.setValue(datos.telefono);
              this.datosContratante.correoElectronico.setValue(datos.correo);

              this.direccion.colonia.setValue(datos.colonia);
              this.direccion.municipio.setValue(datos.municipio);
              this.direccion.estado.setValue(datos.estado);
              this.direccion.cp.setValue(datos.cp);
              this.direccion.colonia.setValue(datos.colonia);
              this.direccion.calle.setValue(datos.calle);

              this.direccion.noInterior.setValue(datos.numExterior);
              this.direccion.noExterior.setValue(datos.numInterior);
              this.idDomicilio = datos.idDomicilio;
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

  limpiarConsultaDatosPersonales(): void {
    this.datosContratante.nombre.patchValue(null);
    this.datosContratante.primerApellido.patchValue(null);
    this.datosContratante.segundoApellido.patchValue(null);
    this.datosContratante.fechaNacimiento.patchValue(null);
    this.datosContratante.sexo.reset();
    this.datosContratante.nacionalidad.reset();
  }

  consultarRFC(): void {
    if (!this.datosContratante.rfc.value) {
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarRFC(this.datosContratante.rfc.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta.datos.length > 0) {
            let datos = respuesta.datos[0];
            this.idPersona = datos.idPersona;
            this.idContratante = datos.idContratante;
            let [anio, mes, dia] = datos.fechaNac.split('-');
            dia = dia.substr(0, 2);
            const fecha = new Date(anio + '/' + mes + '/' + dia);
            this.datosContratante.nombre.setValue(datos.nombre);
            this.datosContratante.primerApellido.setValue(datos.primerApellido);

            this.datosContratante.segundoApellido.setValue(
              datos.segundoApellido
            );
            this.datosContratante.fechaNacimiento.setValue(fecha);

            this.datosContratante.sexo.setValue(+respuesta.datos[0].sexo);
            if (datos.idPais == 119) {
              this.datosContratante.nacionalidad.setValue(1);
            } else {
              this.datosContratante.nacionalidad.setValue(2);
            }

            this.datosContratante.rfc.setValue(datos.rfc);

            this.datosContratante.paisNacimiento.setValue(Number(datos.idPais));
            this.datosContratante.lugarNacimiento.setValue(
              Number(datos.idEstado)
            );

            this.datosContratante.telefono.setValue(datos.telefono);
            this.datosContratante.correoElectronico.setValue(datos.correo);
            this.datosContratante.curp.setValue(datos.curp);
            this.direccion.colonia.setValue(datos.colonia);
            this.direccion.municipio.setValue(datos.municipio);
            this.direccion.estado.setValue(datos.estado);
            this.direccion.cp.setValue(datos.cp);
            this.direccion.colonia.setValue(datos.colonia);
            this.direccion.calle.setValue(datos.calle);

            this.direccion.noInterior.setValue(datos.numExterior);
            this.direccion.noExterior.setValue(datos.numInterior);
            this.idDomicilio = datos.idDomicilio;

            return;
          }
          this.limpiarConsultaDatosPersonales();
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

  noEspaciosAlPrincipio(posicion: number) {
    const formName = [
      this.datosContratante.nombre,
      this.datosContratante.primerApellido,
      this.datosContratante.segundoApellido,
    ];
    formName[posicion].setValue(formName[posicion].value.trimStart());
  }

  async cambiarTipoSexo() {
    if (this.datosContratante.sexo.value == 3) {
      this.datosContratante.otroTipoSexo.enable();
      this.datosContratante.otroTipoSexo.setValidators(Validators.required);
      return;
    }
    this.datosContratante.otroTipoSexo.disable();
    this.datosContratante.otroTipoSexo.clearValidators();
    this.datosContratante.otroTipoSexo.setValue(null);
  }

  cambiarNacionalidad(): void {
    if (this.datosContratante.nacionalidad.value == 1) {
      this.datosContratante.paisNacimiento.disable();
      this.datosContratante.paisNacimiento.clearValidators();
      this.datosContratante.paisNacimiento.reset();
      this.datosContratante.lugarNacimiento.enable();
      this.datosContratante.lugarNacimiento.setValidators(Validators.required);
      return;
    }
    this.datosContratante.lugarNacimiento.disable();
    this.datosContratante.lugarNacimiento.clearValidators();
    this.datosContratante.lugarNacimiento.reset();
    this.datosContratante.paisNacimiento.enable();
    this.datosContratante.paisNacimiento.setValidators(Validators.required);
  }

  continuar() {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Activo,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
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
    this.seleccionarEtapa.emit(1);
    this.datosAlta();
  }

  datosAlta(): void {
    let formulario = this.form.getRawValue();
    console.log('formulario', formulario);
    let datosEtapaContratante = {
      idOrdenServicio: this.idODS,
      idParentesco: formulario.datosContratante.parentesco,
      contratante: {
        idPersona: this.idPersona,
        idContratante: this.idContratante,
        rfc: formulario.datosContratante.rfc,
        curp: formulario.datosContratante.curp,
        nss: null,
        nomPersona: formulario.datosContratante.nombre,
        primerApellido: formulario.datosContratante.primerApellido,
        segundoApellido: formulario.datosContratante.segundoApellido,
        sexo: formulario.datosContratante.sexo,
        otroSexo: formulario.datosContratante.otroTipoSexo,
        fechaNac: formulario.datosContratante.fechaNacimiento,
        nacionalidad: formulario.datosContratante.nacionalidad,
        idPais: formulario.datosContratante.paisNacimiento,
        idEstado: formulario.datosContratante.lugarNacimiento,
        telefono: formulario.datosContratante.telefono,
        correo: formulario.datosContratante.correoElectronico,
        matricula: formulario.datosContratante.matricula,
        cp: {
          idDomicilio: this.idDomicilio,
          desCalle: formulario.direccion.calle,
          numExterior: formulario.direccion.noExterior,
          numInterior: formulario.direccion.noInterior,
          codigoPostal: formulario.direccion.cp,
          desColonia: formulario.direccion.colonia,
          desMunicipio: formulario.direccion.municipio,
          desEstado: formulario.direccion.estado,
          desCiudad: null,
        },
      },
    };

    this.altaODS.idEstatus = null;
    this.altaODS.idOperador = null;

    let datos = datosEtapaContratante;
    this.altaODS.idParentesco = datos.idParentesco;
    this.contratante.matricula = datos.contratante.matricula;
    this.contratante.idPersona = this.idPersona;
    this.contratante.idContratante = this.idContratante;
    this.contratante.rfc = datos.contratante.rfc;
    this.contratante.curp = datos.contratante.curp;
    this.contratante.nomPersona = datos.contratante.nomPersona;
    this.contratante.primerApellido = datos.contratante.primerApellido;
    this.contratante.segundoApellido = datos.contratante.segundoApellido;
    this.contratante.sexo = datos.contratante.sexo;
    this.contratante.otroSexo = datos.contratante.primerApellido;
    this.contratante.fechaNac = moment(datos.contratante.fechaNac).format(
      'yyyy-MM-DD'
    );
    this.contratante.idPais = datos.contratante.idPais;
    this.contratante.idEstado = datos.contratante.idEstado;
    this.contratante.telefono = datos.contratante.telefono;
    this.contratante.correo = datos.contratante.correo;

    //datos cp
    this.cp.desCalle = datos.contratante.cp.desCalle;
    this.cp.idDomicilio = this.idDomicilio;
    this.cp.numExterior = datos.contratante.cp.numExterior;
    this.cp.numInterior = datos.contratante.cp.numInterior;
    this.cp.codigoPostal = datos.contratante.cp.codigoPostal;
    this.cp.desColonia = datos.contratante.cp.desColonia;
    this.cp.desMunicipio = datos.contratante.cp.desMunicipio;
    this.cp.desEstado = datos.contratante.cp.desEstado;

    this.altaODS.contratante = this.contratante;
    this.altaODS.idVelatorio = null;
    this.altaODS.idOperador = null;
    this.contratante.cp = this.cp;
    console.log('paso a 2', datosEtapaContratante);

    this.gestionarEtapasService.datosContratante$.next(datosEtapaContratante);

    this.gestionarEtapasService.altaODS$.next(this.altaODS);
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }
  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }
}
