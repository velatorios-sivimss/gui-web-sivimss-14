import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';
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

import { nacionalidad, sexo } from '../../constants/catalogos-complementarios';
import { ConfirmacionServicio } from '../../../renovacion-extemporanea/models/convenios-prevision.interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpErrorResponse } from '@angular/common/http';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';

import * as moment from 'moment';
import { UsuarioEnSesion } from '../../../../models/usuario-en-sesion.interface';
import {
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from '../../../../utils/constantes';
import { ActivatedRoute } from '@angular/router';
import { ActualizarOrdenServicioService } from '../../services/actualizar-orden-servicio.service';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';

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
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,
    private rutaActiva: ActivatedRoute,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
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
    let estatus = this.rutaActiva.snapshot.paramMap.get('idEstatus');
    if (Number(estatus) == 1) this.ocultarFolioEstatus = true;
    else this.ocultarFolioEstatus = false;

    this.buscarDetalle(
      Number(this.rutaActiva.snapshot.paramMap.get('idODS')),
      Number(this.rutaActiva.snapshot.paramMap.get('idEstatus'))
    );
    this.gestionarEtapasService.detalleODS$
      .asObservable()
      .subscribe((detalleODS) =>
        this.inicializarForm(
          detalleODS,
          Number(this.rutaActiva.snapshot.paramMap.get('idEstatus')),
          Number(this.rutaActiva.snapshot.paramMap.get('idODS'))
        )
      );
  }

  buscarDetalle(idODS: number, estatus: number) {
    this.loaderService.activar();

    const parametros = { idOrdenServicio: idODS };
    console.log('entro', parametros);
    this.gestionarOrdenServicioService
      .consultarDetalleODS(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log('que trajo', respuesta);
          this.gestionarEtapasService.detalleODS$.next(respuesta.datos);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        }
      );
  }

  inicializarForm(datos: any, idODS: number, tipoODS: number) {
    console.log('llego despues', datos);

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
            value: datos.contratante.matriculaCheck,
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
            value: datos.contratante.nombre,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: datos.contratante.primerApellido,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: datos.contratante.segundoApellido,
            disabled: false,
          },
          [Validators.required],
        ],
        fechaNacimiento: [
          {
            value: datos.contratante.fechaNacimiento,
            disabled: true,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: datos.contratante.sexo,
            disabled: false,
          },
          [Validators.required],
        ],
        otroTipoSexo: [
          {
            value: datos.contratante.otroTipoSexo,
            disabled: false,
          },
        ],
        nacionalidad: [
          {
            value: datos.contratante.nacionalidad,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: datos.contratante.lugarNacimiento,
            disabled: false,
          },
          [],
        ],
        paisNacimiento: [
          {
            value: datos.contratante.paisNacimiento,
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
            value: datos.contratante.correoElectronico,
            disabled: false,
          },
          [Validators.required, Validators.pattern(PATRON_CORREO)],
        ],
        parentesco: [
          {
            value: datos.contratante.parentesco,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      direccion: this.formBuilder.group({
        calle: [
          {
            value: datos.cp.calle,
            disabled: false,
          },
          [Validators.required],
        ],
        noExterior: [
          {
            value: datos.cp.noExterior,
            disabled: false,
          },
          [Validators.required],
        ],
        noInterior: [
          {
            value: datos.cp.noInterior,
            disabled: false,
          },
          [],
        ],
        cp: [{ value: datos.cp.cp, disabled: false }, [Validators.required]],
        colonia: [
          {
            value: datos.cp.colonia,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: datos.cp.municipio,
            disabled: true,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: datos.cp.estado,
            disabled: true,
          },
          [Validators.required],
        ],
      }),
    });
    // this.cambiarValidacion();
    //this.idContratante = datosEtapaContratante.datosContratante.idContratante;
    //this.idPersona = datosEtapaContratante.datosContratante.idPersona;
  }

  cambiarValidacion(): void {
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
            console.log('curp', respuesta);
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
              console.log(datos);
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
          console.log(respuesta);
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

  cambiarTipoSexo(): void {
    if (this.datosContratante.sexo.value == 3) {
      this.datosContratante.otroTipoSexo.enabled;
      this.datosContratante.otroTipoSexo.setValidators(Validators.required);
      return;
    }
    this.datosContratante.otroTipoSexo.disabled;
    this.datosContratante.otroTipoSexo.clearValidators();
    this.datosContratante.otroTipoSexo.setValue(null);
  }

  cambiarNacionalidad(): void {
    if (this.datosContratante.nacionalidad.value == 1) {
      this.datosContratante.paisNacimiento.disabled;
      this.datosContratante.paisNacimiento.clearValidators();
      this.datosContratante.paisNacimiento.reset();
      this.datosContratante.lugarNacimiento.enabled;
      this.datosContratante.lugarNacimiento.setValidators(Validators.required);
      return;
    }
    this.datosContratante.lugarNacimiento.disabled;
    this.datosContratante.lugarNacimiento.clearValidators();
    this.datosContratante.lugarNacimiento.reset();
    this.datosContratante.paisNacimiento.enabled;
    this.datosContratante.paisNacimiento.setValidators(Validators.required);
  }

  continuar() {}
  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }
  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }
}
