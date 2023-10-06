import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {
  PATRON_CORREO,
  PATRON_CURP,
  PATRON_RFC,
} from '../../../../../utils/constantes';
import {TipoDropdown} from '../../../../../models/tipo-dropdown';
import {nacionalidad, sexo} from '../../../constants/catalogos-complementarios';
import {ActivatedRoute} from '@angular/router';
import {SERVICIO_BREADCRUMB} from '../../../constants/breadcrumb';
import {LoaderService} from '../../../../../shared/loader/services/loader.service';
import {finalize} from 'rxjs/operators';
import {HttpRespuesta} from '../../../../../models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {GenerarOrdenServicioService} from '../../../services/generar-orden-servicio.service';
import {MensajesSistemaService} from '../../../../../services/mensajes-sistema.service';
import {ConfirmacionServicio} from '../../../../renovacion-extemporanea/models/convenios-prevision.interface';
import {Etapa} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import {EtapaEstado} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {InformacionServicioInterface} from '../../../models/InformacionServicio.interface';
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

import * as moment from 'moment';
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {AltaODSSFInterface} from "../../../models/AltaODSSF.interface";
import {GestionarEtapasServiceSF} from "../../../services/gestionar-etapas.service-sf";

@Component({
  selector: 'app-datos-contratante-sf',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.scss'],
})
export class DatosContratanteSFComponent implements OnInit {
  @Output()
  confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  readonly POSICION_PAIS = 0;
  readonly POSICION_ESTADO = 1;
  readonly POSICION_PARENTESCO = 2;

  form!: FormGroup;

  tipoSexo: TipoDropdown[] = sexo;
  muestraOtroSexo: boolean = false;
  nacionalidad: TipoDropdown[] = nacionalidad;
  radonlyMatricula: boolean = false;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  parentesco!: TipoDropdown[];

  altaODS: AltaODSSFInterface = {} as AltaODSSFInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoSFInterface = {} as FinadoSFInterface;
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

  idPersona: number | null = null;
  idContratante: number | null = null;
  idDomicilio: number | null = null;
  fechaActual = new Date();
  colonias: TipoDropdown[] = [];

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarEtapasService: GestionarEtapasServiceSF
  ) {
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
    this.gestionarEtapasService.datosEtapaContratante$
      .subscribe((datosEtapaContratante) =>
        this.inicializarForm(datosEtapaContratante)
      );
    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datosPrevios) => this.llenarAlta(datosPrevios));
  }

  llenarAlta(datosPrevios: AltaODSSFInterface): void {
    this.altaODS = datosPrevios;
    this.datosContratante.nombre.disable();
    this.datosContratante.primerApellido.disable();
    this.datosContratante.segundoApellido.disable();
    this.direccion.municipio.disable();
    this.direccion.estado.disable();
  }

  inicializarForm(datosEtapaContratante: any): void {
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [{value: datosEtapaContratante.datosContratante.matricula, disabled: false}, [Validators.required]],
        matriculaCheck: [{value: datosEtapaContratante.datosContratante.matriculaCheck, disabled: false}],
        rfc: [{value: datosEtapaContratante.datosContratante.rfc, disabled: false}, [Validators.pattern(PATRON_RFC)]],
        curp: [{
          value: datosEtapaContratante.datosContratante.curp,
          disabled: false
        }, [Validators.required, Validators.pattern(PATRON_CURP)]],
        nombre: [{value: datosEtapaContratante.datosContratante.nombre, disabled: false}, [Validators.required]],
        primerApellido: [{
          value: datosEtapaContratante.datosContratante.primerApellido,
          disabled: false
        }, [Validators.required]],
        segundoApellido: [{
          value: datosEtapaContratante.datosContratante.segundoApellido,
          disabled: false,
        }, [Validators.required]],
        fechaNacimiento: [{
          value: datosEtapaContratante.datosContratante.fechaNacimiento,
          disabled: true
        }, [Validators.required]],
        sexo: [{value: datosEtapaContratante.datosContratante.sexo, disabled: false}, [Validators.required],],
        otroTipoSexo: [{value: datosEtapaContratante.datosContratante.otroTipoSexo, disabled: false}],
        nacionalidad: [{value: datosEtapaContratante.datosContratante.nacionalidad, disabled: false}],
        lugarNacimiento: [{value: datosEtapaContratante.datosContratante.lugarNacimiento, disabled: false}],
        paisNacimiento: [{value: datosEtapaContratante.datosContratante.paisNacimiento, disabled: false}],
        telefono: [{value: datosEtapaContratante.datosContratante.telefono, disabled: false}, [Validators.required]],
        correoElectronico: [{
          value: datosEtapaContratante.datosContratante.correoElectronico,
          disabled: false
        }, [Validators.required, Validators.pattern(PATRON_CORREO)]],
        parentesco: [{value: datosEtapaContratante.datosContratante.parentesco, disabled: false}],
      }),
      direccion: this.formBuilder.group({
        calle: [{value: datosEtapaContratante.direccion.calle, disabled: false}, [Validators.required]],
        noExterior: [{value: datosEtapaContratante.direccion.noExterior, disabled: false}, [Validators.required]],
        noInterior: [{value: datosEtapaContratante.direccion.noInterior, disabled: false}],
        cp: [{value: datosEtapaContratante.direccion.cp, disabled: false}, [Validators.required]],
        colonia: [{value: datosEtapaContratante.direccion.colonia, disabled: false}, [Validators.required]],
        municipio: [{value: datosEtapaContratante.direccion.municipio, disabled: true}, [Validators.required]],
        estado: [{value: datosEtapaContratante.direccion.estado, disabled: true}, [Validators.required]],
      })
    });
    this.cambiarValidacion();
    this.idContratante = datosEtapaContratante.datosContratante.idContratante;
    this.idPersona = datosEtapaContratante.datosContratante.idPersona;
  }

  noEspaciosAlPrincipio(posicion: number) {
    const formName = [
      this.datosContratante.nombre,
      this.datosContratante.primerApellido,
      this.datosContratante.segundoApellido,
    ];
    formName[posicion].setValue(formName[posicion].value.trimStart());
  }

  limpiarFormularioConsultaRfcCurp(origen: string): void {
    // if(origen.includes('curp'))this.datosContratante.rfc.patchValue(null);
    // if(origen.includes('rfc'))this.datosContratante.curp.patchValue(null)
    this.datosContratante.nombre.patchValue(null)
    this.datosContratante.primerApellido.patchValue(null)
    this.datosContratante.segundoApellido.patchValue(null)
    this.datosContratante.fechaNacimiento.patchValue(null)
    this.datosContratante.sexo.patchValue(null)
    this.datosContratante.otroTipoSexo.patchValue(null)
    this.datosContratante.nacionalidad.patchValue(null)
    this.datosContratante.lugarNacimiento.patchValue(null)
    this.datosContratante.paisNacimiento.patchValue(null)
    this.datosContratante.telefono.patchValue(null)
    this.datosContratante.correoElectronico.patchValue(null)
    this.datosContratante.parentesco.patchValue(null)
    this.direccion.calle.patchValue(null)
    this.direccion.noExterior.patchValue(null)
    this.direccion.noInterior.patchValue(null)
    this.direccion.cp.patchValue(null)
    this.direccion.colonia.patchValue(null)
    this.direccion.municipio.patchValue(null)
    this.direccion.estado.patchValue(null)
  }

  consultarCURP(): void {
    if (!this.datosContratante.curp.value) {
      return;
    }
    // this.limpiarFormularioConsultaRfcCurp("curp")
    if (this.datosContratante.curp?.errors?.pattern) {
      this.alertaService.mostrar(
        TipoAlerta.Precaucion,
        this.mensajesSistemaService.obtenerMensajeSistemaPorId(34)
      );
      return;
    }

    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarCURP(this.datosContratante.curp.value)
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
              this.idContratante = null;
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
                respuesta.datos.nacionalidad.includes('MEXICO') ||
                respuesta.datos.nacionalidad.includes('MEX')
              ) {
                this.datosContratante.nacionalidad.setValue(1);
              } else {
                this.datosContratante.nacionalidad.setValue(2);
              }
              this.consultarLugarNacimiento(respuesta.datos.desEntidadNac);
            } else {
              let datos = respuesta.datos[0];
              let [anio, mes, dia] = datos.fechaNac.split('-');
              this.idPersona = datos.idPersona;
              this.idContratante = datos.idContratante;
              dia = dia.substr(0, 2);

              const fecha = new Date(anio + '/' + mes + '/' + dia);

              this.datosContratante.nombre.setValue(datos.nombre);
              this.datosContratante.primerApellido.setValue(
                datos.primerApellido
              );
              this.datosContratante.segundoApellido.setValue(
                datos.segundoApellido
              );
              this.datosContratante.fechaNacimiento.setValue(fecha);

              this.datosContratante.sexo.setValue(+respuesta.datos[0].sexo);
              if (datos.idPais == 119 || datos.idPais == "" || datos.idPais === null) {
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
              datos.telefono.includes('null') ? this.datosContratante.telefono.patchValue(null) : this.datosContratante.telefono.setValue(datos.telefono);
              datos.correo.includes('null') ? this.datosContratante.correoElectronico.patchValue(null) : this.datosContratante.correoElectronico.setValue(datos.correo);
              this.colonias = [{label: datos.colonia, value: datos.colonia}]
              this.direccion.colonia.setValue(datos.colonia);
              this.direccion.municipio.setValue(datos.municipio);
              this.direccion.estado.setValue(datos.estado);
              this.direccion.cp.setValue(datos.cp);
              this.direccion.colonia.setValue(datos.colonia);
              this.direccion.calle.setValue(datos.calle);
              this.direccion.noInterior.setValue(datos.numInterior);
              this.direccion.noExterior.setValue(datos.numExterior);
              this.idDomicilio = datos.idDomicilio;
            }
            return;
          }
          // this.limpiarConsultaDatosPersonales();
          this.alertaService.mostrar(
            TipoAlerta.Precaucion,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            )
          );
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  consultarLugarNacimiento(entidad: string): void {
    const entidadEditada = this.accentsTidy(entidad);
    if (entidadEditada.toUpperCase().includes('MEXICO') || entidadEditada.toUpperCase().includes('EDO')) {
      this.datosContratante.lugarNacimiento.setValue(11);
      return
    }
    if (entidadEditada.toUpperCase().includes('DISTRITO FEDERAL') || entidadEditada.toUpperCase().includes('CIUDAD DE MEXICO')) {
      this.datosContratante.lugarNacimiento.setValue(7);
      return
    }
    this.estado.forEach((element: any) => {
      const entidadIteracion = this.accentsTidy(element.label);
      if (entidadIteracion.toUpperCase().includes(entidadEditada.toUpperCase())) {
        this.datosContratante.lugarNacimiento.setValue(element.value);
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

  consultarRFC(): void {
    if (!this.datosContratante.rfc.value) {
      return;
    }
    // this.limpiarFormularioConsultaRfcCurp("rfc")
    if (this.datosContratante.rfc?.errors?.pattern) {
      this.alertaService.mostrar(
        TipoAlerta.Precaucion,
        this.mensajesSistemaService.obtenerMensajeSistemaPorId(33)
      );
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consultarRFC(this.datosContratante.rfc.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
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

            if (datos.idPais == 119 || datos.idPais == "" || datos.idPais === null) {
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
            this.colonias = [{label:datos.colonia,value: datos.colonia}]
            this.direccion.colonia.setValue(datos.colonia);
            this.direccion.calle.setValue(datos.calle);
            this.direccion.noInterior.setValue(datos.numInterior);
            this.direccion.noExterior.setValue(datos.numExterior);
            this.idDomicilio = datos.idDomicilio;
          }
          // this.limpiarConsultaDatosPersonales();
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
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
        next: (respuesta: HttpRespuesta<any>) => {
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
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
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

  cambiarTipoSexo(): void {
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
    // this.datosContratante.paisNacimiento.setValidators(Validators.required);
  }

  limpiarConsultaDatosPersonales(): void {
    this.datosContratante.nombre.patchValue(null);
    this.datosContratante.primerApellido.patchValue(null);
    this.datosContratante.segundoApellido.patchValue(null);
    this.datosContratante.fechaNacimiento.patchValue(null);
    this.datosContratante.sexo.reset();
    this.datosContratante.nacionalidad.reset();
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
    let datosEtapaContratante = {
      datosContratante: {
        idPersona: this.idPersona,
        idContratante: this.idContratante,
        matricula: formulario.datosContratante.matricula,
        matriculaCheck: formulario.datosContratante.matriculaCheck,
        rfc: formulario.datosContratante.rfc,
        curp: formulario.datosContratante.curp,
        nombre: formulario.datosContratante.nombre,
        primerApellido: formulario.datosContratante.primerApellido,
        segundoApellido: formulario.datosContratante.segundoApellido,
        fechaNacimiento: formulario.datosContratante.fechaNacimiento,
        sexo: formulario.datosContratante.sexo,
        otroTipoSexo: formulario.datosContratante.otroTipoSexo,
        nacionalidad: formulario.datosContratante.nacionalidad,
        lugarNacimiento: formulario.datosContratante.lugarNacimiento,
        paisNacimiento: formulario.datosContratante.paisNacimiento,
        telefono: formulario.datosContratante.telefono,
        correoElectronico: formulario.datosContratante.correoElectronico,
        parentesco: formulario.datosContratante.parentesco,
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

    this.altaODS.idEstatus = null;
    this.altaODS.idOperador = null;
    this.altaODS.idParentesco =
      datosEtapaContratante.datosContratante.parentesco;
    this.contratante.matricula =
      datosEtapaContratante.datosContratante.matricula ?? null;
    this.contratante.idPersona = this.idPersona;
    this.contratante.idContratante = this.idContratante;
    this.contratante.rfc = datosEtapaContratante.datosContratante.rfc;
    this.contratante.curp = datosEtapaContratante.datosContratante.curp;
    this.contratante.nomPersona = datosEtapaContratante.datosContratante.nombre;
    this.contratante.primerApellido =
      datosEtapaContratante.datosContratante.primerApellido;
    this.contratante.segundoApellido =
      datosEtapaContratante.datosContratante.segundoApellido;
    this.contratante.sexo = datosEtapaContratante.datosContratante.sexo;
    this.contratante.otroSexo =
      datosEtapaContratante.datosContratante.otroTipoSexo;
    this.contratante.fechaNac = moment(
      datosEtapaContratante.datosContratante.fechaNacimiento
    ).format('yyyy-MM-DD');
    this.contratante.idPais =
      datosEtapaContratante.datosContratante.paisNacimiento == 0 ? null : datosEtapaContratante.datosContratante.paisNacimiento;
    this.contratante.idEstado =
      datosEtapaContratante.datosContratante.lugarNacimiento;
    this.contratante.telefono = datosEtapaContratante.datosContratante.telefono;
    this.contratante.correo =
      datosEtapaContratante.datosContratante.correoElectronico;

    //datos cp
    this.cp.desCalle = datosEtapaContratante.direccion.calle;
    this.cp.idDomicilio = this.idDomicilio;
    this.cp.numExterior = datosEtapaContratante.direccion.noExterior;
    this.cp.numInterior = datosEtapaContratante.direccion.noInterior;
    this.cp.codigoPostal = datosEtapaContratante.direccion.cp;
    this.cp.desColonia = datosEtapaContratante.direccion.colonia;
    this.cp.desMunicipio = datosEtapaContratante.direccion.municipio ?? null;
    this.cp.desEstado = datosEtapaContratante.direccion.estado ?? null;

    this.altaODS.contratante = this.contratante;
    this.altaODS.idVelatorio = null;
    this.altaODS.idOperador = null;
    this.contratante.cp = this.cp;

    this.gestionarEtapasService.datosEtapaContratante$.next(
      datosEtapaContratante
    );

    this.gestionarEtapasService.altaODS$.next(this.altaODS);
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

  consultarMatriculaSiap(): void {
    this.loaderService.activar();

    this.gestionarOrdenServicioService
      .consultarMatriculaSiap(this.datosContratante.matricula.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (!respuesta.datos) {
            this.alertaService.mostrar(
              TipoAlerta.Precaucion,
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(70)
            );
            this.datosContratante.matricula.setValue(null);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  convertirAMayusculas(posicionFormulario: number): void {
    const formularios = [this.datosContratante.curp, this.datosContratante.rfc];
    formularios[posicionFormulario].setValue(
      formularios[posicionFormulario].value.toUpperCase()
    );
  }

  convertirAMinusculas(): void {
    this.datosContratante.correoElectronico.setValue(
      this.datosContratante.correoElectronico.value.toLowerCase()
    );
  }

  validarCorreoElectronico(): void {
    if (this.datosContratante.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(
        TipoAlerta.Precaucion,
        this.mensajesSistemaService.obtenerMensajeSistemaPorId(50)
      );
    }
  }
}
