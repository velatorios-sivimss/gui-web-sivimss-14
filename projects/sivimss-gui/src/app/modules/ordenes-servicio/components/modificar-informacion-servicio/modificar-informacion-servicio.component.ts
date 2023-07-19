import {
  AfterContentInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  AfterContentChecked,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core';
import { ModalAgregarPanteonComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-panteon/modal-agregar-panteon.component';

import { DescargaArchivosService } from '../../../../services/descarga-archivos.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
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

import { Router } from '@angular/router';
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
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {GenerarOrdenServicioService} from "../../services/generar-orden-servicio.service";

@Component({
  selector: 'app-modificar-informacion-servicio',
  templateUrl: './modificar-informacion-servicio.component.html',
  styleUrls: ['./modificar-informacion-servicio.component.scss'],
  providers: [DescargaArchivosService]

})
export class ModificarInformacionServicioComponent
  implements OnInit, AfterContentChecked
{
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
  idVelatorio!: number;
  capillas: any[] = [];
  salas: any[] = [];
  promotores: any[] = [];
  idPanteon: number | null = null;
  validaDomicilio: boolean = false;
  tipoOrden: number = 0;
  fechaActual = new Date();
  estatusUrl:number = 0;
  constructor(
    private route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,
    private rutaActiva: ActivatedRoute,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private generarOrdenServicioService: GenerarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasActualizacionService,
    private breadcrumbService: BreadcrumbService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,

    private descargaArchivosService: DescargaArchivosService,
    private renderer: Renderer2
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
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.idVelatorio = +usuario.idVelatorio;

    this.estatusUrl = this.rutaActiva.snapshot.queryParams.idEstatus;




    this.gestionarEtapasService.datosEtapaInformacionServicio$
      .asObservable()
      .subscribe((datosEtapaInformacionServicio) =>
        this.llenarFormulario(datosEtapaInformacionServicio)
    );

    this.gestionarEtapasService.datosEtapaCaracteristicas$
      .asObservable()
      .subscribe((datosEtapaCaracteristicas) =>
        this.datosEtapaCaracteristicas(datosEtapaCaracteristicas)
      );

    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datodPrevios) => this.llenarAlta(datodPrevios));



    this.buscarCapillas();
    this.buscarSalas();
    this.buscarPromotor();
  }

  llenarFormulario(datos: any): void {
    this.idPanteon = datos.idPanteon;
    const fechaActual = moment().format('YYYY-MM-DD');
    const [anio,mes,dia] = fechaActual.split('-')
    // let horaVelacion:string;
    // if(typeof datos.horaVelacion){
    //   datos.horaVelacion.inclu
    // }

    if(typeof datos.horaVelacion == "string"){
      const [horas,minutos] = datos.horaVelacion.split(':')
      datos.horaVelacion = new Date(+anio,+mes,+dia,+horas,+minutos)
    }




    this.form = this.formBuilder.group({
      lugarVelacion: this.formBuilder.group({
        capilla: [
          { value: datos.idCapilla, disabled: false },
          [Validators.required],
        ],
        fecha: [
          { value: datos.fechaVelacion, disabled: false },
          [Validators.required],
        ],
        hora: [
          { value: datos.horaVelacion, disabled: false },
          [Validators.required],
        ],
        calle: [{ value: datos.calle, disabled: false }, [Validators.required]],
        exterior: [
          { value: datos.exterior, disabled: false },
          [Validators.required],
        ],
        interior: [
          { value: datos.interior, disabled: false },
          [Validators.required],
        ],
        cp: [{ value: datos.cp, disabled: false }, [Validators.required]],
        colonia: [
          { value: datos.colonia, disabled: false },
          [Validators.required],
        ],
        municipio: [
          { value: datos.municipio, disabled: false },
          [Validators.required],
        ],
        estado: [
          { value: datos.estado, disabled: false },
          [Validators.required],
        ],
      }),
      lugarCremacion: this.formBuilder.group({
        sala: [{ value: datos.idSala, disabled: false }, [Validators.required]],
        fecha: [
          { value: datos.fechaCremacion, disabled: false },
          [Validators.required],
        ],
        hora: [
          { value: datos.horaCremacion, disabled: false },
          [Validators.required],
        ],
      }),
      inhumacion: this.formBuilder.group({
        agregarPanteon: [
          { value: null, disabled: false },
          [Validators.required],
        ],
      }),
      recoger: this.formBuilder.group({
        fecha: [
          { value: datos.fechaRecoger, disabled: false },
          [Validators.required],
        ],
        hora: [
          { value: datos.horaRecoger, disabled: false },
          [Validators.required],
        ],
      }),
      instalacionServicio: this.formBuilder.group({
        fecha: [
          { value: datos.fechaInstalacion, disabled: false },
          [Validators.required],
        ],
        hora: [
          { value: datos.horaInstalacion, disabled: false },
          [Validators.required],
        ],
      }),
      cortejo: this.formBuilder.group({
        fecha: [
          { value: datos.fechaCortejo, disabled: false },
          [Validators.required],
        ],
        hora: [
          { value: datos.horaCortejo, disabled: false },
          [Validators.required],
        ],
        gestionadoPorPromotor: [
          { value: datos.gestionadoPorPromotor, disabled: false },
          [Validators.required],
        ],
        promotor: [
          { value: datos.promotor, disabled: false },
          [Validators.required],
        ],
      }),
    });
  }

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
    this.tipoOrden = Number(this.altaODS.finado.idTipoOrden);
    if (Number(this.altaODS.finado.idTipoOrden) == 3) this.desabilitarTodo();
    if(Number(this.altaODS.finado.idTipoOrden) < 3){
      this.cortejo.gestionadoPorPromotor.disable();
    }else{
      this.cortejo.gestionadoPorPromotor.enable();
    }
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      lugarVelacion: this.formBuilder.group({
        capilla: [{ value: null, disabled: false }, [Validators.required]],
        fecha: [{ value: null, disabled: false }, [Validators.required]],
        hora: [{ value: null, disabled: false }, [Validators.required]],
        calle: [{ value: null, disabled: false }, [Validators.required]],
        exterior: [{ value: null, disabled: false }, [Validators.required]],
        interior: [{ value: null, disabled: false }],
        cp: [{ value: null, disabled: false }, [Validators.required]],
        colonia: [{ value: null, disabled: false }, [Validators.required]],
        municipio: [{ value: null, disabled: false }, [Validators.required]],
        estado: [{ value: null, disabled: false }, [Validators.required]],
      }),
      lugarCremacion: this.formBuilder.group({
        sala: [{ value: null, disabled: false }, [Validators.required]],
        fecha: [{ value: null, disabled: false }, [Validators.required]],
        hora: [{ value: null, disabled: false }, [Validators.required]],
      }),
      inhumacion: this.formBuilder.group({
        agregarPanteon: [
          { value: null, disabled: false },
        ],
      }),
      recoger: this.formBuilder.group({
        fecha: [{ value: null, disabled: false }, [Validators.required]],
        hora: [{ value: null, disabled: false }, [Validators.required]],
      }),
      instalacionServicio: this.formBuilder.group({
        fecha: [{ value: null, disabled: false }, [Validators.required]],
        hora: [{ value: null, disabled: false }, [Validators.required]],
      }),
      cortejo: this.formBuilder.group({
        fecha: [{ value: null, disabled: false }, [Validators.required]],
        hora: [{ value: null, disabled: false }, [Validators.required]],
        gestionadoPorPromotor: [
          { value: null, disabled: false },
          [Validators.required],
        ],
        promotor: [{ value: null, disabled: false }, [Validators.required]],
      }),
    });
  }

  datosEtapaCaracteristicas(datosEtapaCaracteristicas: any): void {
    let datosPresupuesto = datosEtapaCaracteristicas.datosPresupuesto;
    this.desabilitarTodo();
    datosPresupuesto.forEach((datos: any) => {
      if (datos.concepto.trim() == 'Velación en capilla') {
        this.lugarVelacion.capilla.enable();
        this.lugarVelacion.fecha.enable();
        this.lugarVelacion.hora.enable();
      }

      if (datos.concepto.trim() == 'Velación en domicilio') {
        this.validaDomicilio = true;
        this.lugarVelacion.calle.enable();
        this.lugarVelacion.exterior.enable();
        this.lugarVelacion.interior.enable();
        this.lugarVelacion.exterior.enable();
        this.lugarVelacion.cp.enable();
        this.lugarVelacion.colonia.enable();
        this.lugarVelacion.municipio.disable();
        this.lugarVelacion.estado.disable();
      }

      if (
        datos.concepto.toUpperCase().trim().includes('CREMACIÓN') ||
        datos.concepto.toUpperCase().trim().includes('CREMACION')
      ) {
        this.lugarCremacion.sala.enable();
        this.lugarCremacion.fecha.enable();
        this.lugarCremacion.hora.enable();
      }
    });
  }

  buscarCapillas(): void {
    this.loaderService.activar();
    const parametros = { idVelatorio: this.idVelatorio };
    this.gestionarOrdenServicioService
      .buscarCapillas(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.capillas = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }
          this.capillas = mapearArregloTipoDropdown(
            datos,
            'nombreCapilla',
            'idCapilla'
          );
        },
        (error: HttpErrorResponse) => {
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

  buscarSalas(): void {
    this.loaderService.activar();
    const parametros = { idVelatorio: this.idVelatorio };
    this.gestionarOrdenServicioService
      .buscarCapillas(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.salas = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }
          this.salas = mapearArregloTipoDropdown(
            datos,
            'nombreCapilla',
            'idCapilla'
          );
        },
        (error: HttpErrorResponse) => {
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

  buscarPromotor(): void {
    this.loaderService.activar();

    this.gestionarOrdenServicioService
      .buscarPromotor()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.promotores = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }
          this.promotores = mapearArregloTipoDropdown(
            datos,
            'nombrePromotor',
            'idPromotor'
          );
        },
        (error: HttpErrorResponse) => {
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

  desabilitarTodo(): void {
    this.lugarVelacion.capilla.disable();
    this.lugarVelacion.fecha.disable();
    this.lugarVelacion.hora.disable();
    this.lugarVelacion.calle.disable();
    this.lugarVelacion.exterior.disable();
    this.lugarVelacion.interior.disable();
    this.lugarVelacion.exterior.disable();
    this.lugarVelacion.cp.disable();
    this.lugarVelacion.colonia.disable();
    this.lugarVelacion.municipio.disable();
    this.lugarVelacion.estado.disable();
    this.lugarCremacion.sala.disable();
    this.lugarCremacion.fecha.disable();
    this.lugarCremacion.hora.disable();
    this.cortejo.promotor.disable();
    // this.inhumacion.agregarPanteon.disable();
    // this.cortejo.gestionadoPorPromotor.disable();
    this.cortejo.fecha.disable();
    this.cortejo.hora.disable();
    this.instalacionServicio.hora.disable();
    this.instalacionServicio.fecha.disable();
    this.recoger.hora.disable();
    this.recoger.fecha.disable();
  }

  get lugarVelacion() {
    return (this.form.controls['lugarVelacion'] as FormGroup).controls;
  }

  get lugarCremacion() {
    return (this.form.controls['lugarCremacion'] as FormGroup).controls;
  }

  get recoger() {
    return (this.form.controls['recoger'] as FormGroup).controls;
  }

  get instalacionServicio() {
    return (this.form.controls['instalacionServicio'] as FormGroup).controls;
  }

  get inhumacion() {
    return (this.form.controls['inhumacion'] as FormGroup).controls;
  }

  get cortejo() {
    return (this.form.controls['cortejo'] as FormGroup).controls;
  }

  changePromotor(validacion: string): void {
    if (validacion == 'si' && Number(this.tipoOrden) < 3)
      this.cortejo.promotor.enable();
    else {
      this.cortejo.promotor.disable();
      this.cortejo.promotor.setValue(null);
    }
  }

  abrirModalAgregarPanteon(): void {
    const ref = this.dialogService.open(ModalAgregarPanteonComponent, {
      header: 'Agregar panteón',
      style: { maxWidth: '876px', width: '100%' },
    });
    ref.onClose.subscribe((val: number) => {
      if (val) {
        this.idPanteon = val;
        this.inhumacion.agregarPanteon.disable();
        return;
      }
      this.inhumacion.agregarPanteon.setValue(false);
    });
  }

  consultaCP(): void {
    this.loaderService.activar();
    if (!this.lugarVelacion.cp.value) {
      return;
    }
    this.gestionarOrdenServicioService
      .consutaCP(this.lugarVelacion.cp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta) {
            this.lugarVelacion.colonia.setValue(respuesta.datos[0].nombre);
            this.lugarVelacion.municipio.setValue(
              respuesta.datos[0].localidad.municipio.nombre
            );
            this.lugarVelacion.estado.setValue(
              respuesta.datos[0].localidad.municipio.entidadFederativa.nombre
            );
            return;
          }
          this.lugarVelacion.colonia.patchValue(null);
          this.lugarVelacion.municipio.patchValue(null);
          this.lugarVelacion.estado.patchValue(null);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  preorden(): void {
    this.altaODS.idEstatus = 1;
    this.llenarDatos();
    this.altaODS.idEstatus ? this.guardarODS(0) : this.guardarODSComplementaria(0);
  }

  guardarODS(consumoTablas:number): void {
    let tipoServicio = this.gestionarOrdenServicioService.actualizarODS;
    this.loaderService.activar();
    this.gestionarOrdenServicioService.actualizarODS(this.altaODS)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.salas = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }
          this.descargarContratoServInmediatos(respuesta.datos.idOrdenServicio,consumoTablas);
          this.descargarOrdenServicio(
            respuesta.datos.idOrdenServicio,
            respuesta.datos.idEstatus
          );
          const ExitoMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Exito,
            ExitoMsg || 'La Orden de Servicio se ha generado exitosamente.'
          );
          this.router.navigate(['ordenes-de-servicio']);
        },
        (error: HttpErrorResponse) => {
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

  guardarODSComplementaria(consumoTablas:number): void {
    let tipoServicio = this.gestionarOrdenServicioService.actualizarODS;
    if(this.altaODS.idEstatus == 1){

    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService.actualizarODS(this.altaODS)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.salas = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }
          this.descargarContratoServInmediatos(respuesta.datos.idOrdenServicio,consumoTablas);
          this.descargarOrdenServicio(
            respuesta.datos.idOrdenServicio,
            respuesta.datos.idEstatus
          );
          const ExitoMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Exito,
            ExitoMsg || 'La Orden de Servicio se ha generado exitosamente.'
          );
          this.router.navigate(['ordenes-de-servicio']);
        },
        (error: HttpErrorResponse) => {
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

  llenarDatos(): void {
    let formulario = this.form.getRawValue();
    let datos = {
      fechaCortejo: formulario.cortejo.fecha,
      fechaCremacion: formulario.lugarCremacion.fecha,
      fechaRecoger: formulario.recoger.fecha,
      horaRecoger: formulario.recoger.hora,
      horaCortejo: formulario.cortejo.hora,
      horaCremacion: formulario.lugarCremacion.hora,
      idPanteon: this.idPanteon,
      idPromotor: formulario.cortejo.promotor,
      idSala: formulario.lugarCremacion.sala,
      cp: formulario.lugarVelacion.cp,
      fechaInstalacion: formulario.instalacionServicio.fecha,
      fechaVelacion: formulario.lugarVelacion.fecha,
      horaInstalacion: formulario.instalacionServicio.hora,
      horaVelacion: formulario.lugarVelacion.hora,
      idCapilla: formulario.lugarVelacion.capilla,
      calle: formulario.lugarVelacion.calle,
      interior: formulario.lugarVelacion.interior,
      exterior: formulario.lugarVelacion.exterior,
      colonia: formulario.lugarVelacion.colonia,
      municipio: formulario.lugarVelacion.municipio,
      estado: formulario.lugarVelacion.estado,
      gestionadoPorPromotor: formulario.cortejo.gestionadoPorPromotor,
      promotor: formulario.cortejo.promotor,
    };
    this.informacionServicio.fechaCortejo =
      formulario.cortejo.fecha == null
        ? null
        : moment(formulario.cortejo.fecha).format('yyyy-MM-DD');

    this.informacionServicio.fechaCremacion =
      formulario.lugarCremacion.fecha == null
        ? null
        : moment(formulario.lugarCremacion.fecha).format('yyyy-MM-DD');

    this.informacionServicio.fechaRecoger =
      formulario.recoger.fecha == null
        ? null
        : moment(formulario.recoger.fecha).format('yyyy-MM-DD');

    this.informacionServicio.horaRecoger =
      formulario.recoger.horaRecoger == null
        ? null
        : moment(formulario.recoger.hora).format('HH:mm');

    this.informacionServicio.horaCortejo =
      formulario.cortejo.hora == null
        ? null
        : moment(formulario.cortejo.hora).format('HH:mm');

    this.informacionServicio.horaCremacion =
      formulario.lugarCremacion.hora == null
        ? null
        : moment(formulario.lugarCremacion.hora).format('HH:mm');

    this.informacionServicio.idPanteon = this.idPanteon;
    this.informacionServicio.idPromotor = formulario.cortejo.promotor;
    this.informacionServicio.idSala = formulario.lugarCremacion.sala;
    //información servicio velación
    this.cpVelacion.codigoPostal = formulario.lugarVelacion.cp;
    this.cpVelacion.desCalle = formulario.lugarVelacion.calle;
    this.cpVelacion.desColonia = formulario.lugarVelacion.colonia;
    this.cpVelacion.desEstado = formulario.lugarVelacion.estado;
    this.cpVelacion.desMunicipio = formulario.lugarVelacion.municipio;
    this.cpVelacion.numExterior = formulario.lugarVelacion.exterior;
    this.cpVelacion.numInterior = formulario.lugarVelacion.interior;
    this.informacionServicioVelacion.cp = this.cpVelacion;
    if (
      formulario.lugarVelacion.cp == '' ||
      formulario.lugarVelacion.cp == null
    ) {
      this.informacionServicioVelacion.cp = null;
    }

    this.informacionServicioVelacion.fechaInstalacion =
      formulario.instalacionServicio.fecha == null
        ? null
        : moment(formulario.instalacionServicio.fecha).format('yyyy-MM-DD');

    this.informacionServicioVelacion.fechaVelacion =
      formulario.lugarVelacion.fecha == null
        ? null
        : moment(formulario.lugarVelacion.fecha).format('yyyy-MM-DD');

    this.informacionServicioVelacion.horaInstalacion =
      formulario.instalacionServicio.hora == null
        ? null
        : moment(formulario.instalacionServicio.hora).format('HH:mm');

    this.informacionServicioVelacion.horaVelacion =
      formulario.lugarVelacion.hora == null
        ? null
        : moment(formulario.lugarVelacion.hora).format('HH:mm');

    this.informacionServicioVelacion.idCapilla =
      formulario.lugarVelacion.capilla;

    this.altaODS.informacionServicio = this.informacionServicio;

    this.informacionServicio.informacionServicioVelacion =
      this.informacionServicioVelacion;
    this.gestionarEtapasService.datosEtapaInformacionServicio$.next(datos);
    this.gestionarEtapasService.altaODS$.next(this.altaODS);
  }

  descargarContratoServInmediatos(idOrdenServicio: number,consumoTablas:number): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = { ext: 'pdf' };
    this.gestionarOrdenServicioService
      .generarArchivoServiciosInmediatos(idOrdenServicio,consumoTablas)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          let link = this.renderer.createElement('a');

          const file = new Blob(
            [
              this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(
                  configuracionArchivo
                )
              ),
            ],
            {
              type: this.descargaArchivosService.obtenerContentType(
                configuracionArchivo
              ),
            }
          );
          const url = window.URL.createObjectURL(file);
          link.setAttribute('download', 'documento');
          link.setAttribute('href', url);
          link.click();
          link.remove();
        },
        (error: HttpErrorResponse) => {
          const errorMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(error.error.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Error,
            errorMsg || 'Error en la descarga del documento.Intenta nuevamente.'
          );
        }
      );
  }

  descargarOrdenServicio(idOrdenServicio: number, idEstatus: number): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = { ext: 'pdf' };
    this.gestionarOrdenServicioService
      .generarArchivoOrdenServicio(idOrdenServicio, idEstatus)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          let link = this.renderer.createElement('a');

          const file = new Blob(
            [
              this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(
                  configuracionArchivo
                )
              ),
            ],
            {
              type: this.descargaArchivosService.obtenerContentType(
                configuracionArchivo
              ),
            }
          );
          const url = window.URL.createObjectURL(file);
          link.setAttribute('download', 'documento');
          link.setAttribute('href', url);
          link.click();
          link.remove();
        },
        (error: HttpErrorResponse) => {
          const errorMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(error.error.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Error,
            errorMsg || 'Error en la descarga del documento.Intenta nuevamente.'
          );
        }
      );
  }

  generada(): void {
    // let estatus = this.rutaActiva.snapshot.paramMap.get('idEstatus');
    // let estatus = this.rutaActiva.snapshot.queryParams.idEstatus;
    this.altaODS.idEstatus = 2;
    this.llenarDatos();
    this.altaODS.idEstatus ? this.guardarODS(1) : this.guardarODSComplementaria(2);

    // this.guardarODS(1);
  }

  regresar() {
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
    this.llenarDatos();
  }
}
