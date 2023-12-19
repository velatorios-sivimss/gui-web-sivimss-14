import {Component, EventEmitter, OnInit, Output, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DialogService} from 'primeng/dynamicdialog';
import {
  ModalAgregarPanteonComponent
} from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-panteon/modal-agregar-panteon.component';
import {EtapaEstado} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import {Etapa} from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import {GestionarEtapasService} from '../../services/gestionar-etapas.service';
import {AltaODSInterface} from '../../models/AltaODS.interface';
import {ContratanteInterface} from '../../models/Contratante.interface';
import {CodigoPostalIterface} from '../../models/CodigoPostal.interface';
import {FinadoInterface} from '../../models/Finado.interface';
import {CaracteristicasPresupuestoInterface} from '../../models/CaracteristicasPresupuesto,interface';
import {CaracteristicasPaqueteInterface} from '../../models/CaracteristicasPaquete.interface';
import {DetallePaqueteInterface} from '../../models/DetallePaquete.interface';
import {ServicioDetalleTrasladotoInterface} from '../../models/ServicioDetalleTraslado.interface';
import {CaracteristicasDelPresupuestoInterface} from '../../models/CaracteristicasDelPresupuesto.interface';
import {DetallePresupuestoInterface} from '../../models/DetallePresupuesto.interface';
import {InformacionServicioInterface} from '../../models/InformacionServicio.interface';
import {InformacionServicioVelacionInterface} from '../../models/InformacionServicioVelacion.interface';
import {GenerarOrdenServicioService} from '../../services/generar-orden-servicio.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {HttpErrorResponse} from '@angular/common/http';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {finalize} from 'rxjs';
import * as moment from 'moment';
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {Router} from "@angular/router";
import {ConsultarOrdenServicioService} from "../../services/consultar-orden-servicio.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

@Component({
  selector: 'app-informacion-servicio',
  templateUrl: './informacion-servicio.component.html',
  styleUrls: ['./informacion-servicio.component.scss'],
  providers: [DescargaArchivosService]
})
export class InformacionServicioComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();
  form!: FormGroup;

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
  idVelatorio!: number;
  capillas: any[] = [];
  salas: any[] = [];
  promotores: any[] = [];
  idPanteon: number | null = null;
  validaDomicilio: boolean = false;
  tipoOrden: number = 0;
  fechaActual = new Date();
  servicioExtremidad: boolean = false;
  confirmarGuardado: boolean = false;
  confirmarPreOrden: boolean = false;
  confirmarGuardarPanteon: boolean = false;
  colonias:TipoDropdown[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasService,
    private router: Router,
    private consultarOrdenServicioService: ConsultarOrdenServicioService,
    private renderer: Renderer2,
    private descargaArchivosService: DescargaArchivosService,
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
    this.gestionarEtapasService.datosEtapaInformacionServicio$
      .asObservable()
      .subscribe((datosEtapaInformacionServicio) =>
        this.inicializarForm(datosEtapaInformacionServicio)
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

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
    this.servicioExtremidad = datodPrevios.finado.extremidad
    this.tipoOrden = Number(this.altaODS.finado.idTipoOrden);
    if (Number(this.altaODS.finado.idTipoOrden) == 3) this.desabilitarTodo();
    if (this.altaODS.finado.extremidad) this.desabilitarTodo();
    if (Number(this.altaODS.finado.idTipoOrden) == 1 && !this.altaODS.finado.extremidad){
      this.cortejo.gestionadoPorPromotor.enable()
    }
  }

  datosEtapaCaracteristicas(datosEtapaCaracteristicas: any): void {
    let datosPresupuesto = datosEtapaCaracteristicas.datosPresupuesto;
    this.desabilitarTodo();
    this.recoger.fecha.enable();
    this.recoger.hora.enable();
    this.cortejo.fecha.enable();
    this.cortejo.hora.enable();
    datosPresupuesto.forEach((datos: any) => {
      if (+datos.idTipoServicio == 1) {
        this.lugarVelacion.capilla.enable();
        this.lugarVelacion.fecha.enable();
        this.lugarVelacion.hora.enable();
      }

      if (+datos.idTipoServicio == 2) {
        this.validaDomicilio = true;
        this.lugarVelacion.calle.enable();
        this.lugarVelacion.exterior.enable();
        this.lugarVelacion.interior.enable();
        this.lugarVelacion.exterior.enable();
        this.lugarVelacion.cp.enable();
        this.lugarVelacion.colonia.enable();
        this.lugarVelacion.municipio.disable();
        this.lugarVelacion.estado.disable();
        this.instalacionServicio.fecha.enable();
        this.instalacionServicio.hora.enable();
      }

      if (+datos.idTipoServicio == 3) {
        this.lugarCremacion.sala.enable();
        this.lugarCremacion.fecha.enable();
        this.lugarCremacion.hora.enable();
      }
    });
  }

  inicializarForm(datos: any): void {
    this.idPanteon = datos.idPanteon;
    this.form = this.formBuilder.group({
      lugarVelacion: this.formBuilder.group({
        capilla: [
          {value: datos.idCapilla, disabled: false},
          [Validators.required],
        ],
        fecha: [
          {value: datos.fechaVelacion, disabled: false},
          [Validators.required],
        ],
        hora: [
          {value: datos.horaVelacion, disabled: false},
          [Validators.required],
        ],
        calle: [{value: datos.calle, disabled: false}, [Validators.required]],
        exterior: [
          {value: datos.exterior, disabled: false},
          [Validators.required],
        ],
        interior: [
          {value: datos.interior, disabled: false},
        ],
        cp: [{value: datos.cp, disabled: false}, [Validators.required]],
        colonia: [
          {value: datos.colonia, disabled: false},
          [Validators.required],
        ],
        municipio: [
          {value: datos.municipio, disabled: false},
          [Validators.required],
        ],
        estado: [
          {value: datos.estado, disabled: false},
          [Validators.required],
        ],
      }),
      lugarCremacion: this.formBuilder.group({
        sala: [{value: datos.idSala, disabled: false}, [Validators.required]],
        fecha: [
          {value: datos.fechaCremacion, disabled: false},
          [Validators.required],
        ],
        hora: [
          {value: datos.horaCremacion, disabled: false},
          [Validators.required],
        ],
      }),
      inhumacion: this.formBuilder.group({
        agregarPanteon: [
          {value: null, disabled: false},

        ],
      }),
      recoger: this.formBuilder.group({
        fecha: [
          {value: datos.fechaRecoger, disabled: false},
          [Validators.required],
        ],
        hora: [
          {value: datos.horaRecoger, disabled: false},
          [Validators.required],
        ],
      }),
      instalacionServicio: this.formBuilder.group({
        fecha: [
          {value: datos.fechaInstalacion, disabled: false},
          [Validators.required],
        ],
        hora: [
          {value: datos.horaInstalacion, disabled: false},
          [Validators.required],
        ],
      }),
      cortejo: this.formBuilder.group({
        fecha: [
          {value: datos.fechaCortejo, disabled: false},
          [Validators.required],
        ],
        hora: [
          {value: datos.horaCortejo, disabled: false},
          [Validators.required],
        ],
        gestionadoPorPromotor: [
          {value: datos.gestionadoPorPromotor ? datos.gestionadoPorPromotor : false, disabled: false},
          [Validators.required],
        ],
        promotor: [
          {value: datos.promotor, disabled: false},
          [Validators.required],
        ],
      }),
    });
  }

  changePromotor(validacion: string): void {
    if (validacion == 'si')
      this.cortejo.promotor.enable();
    else {
      this.cortejo.promotor.disable();
      this.cortejo.promotor.setValue(null);
    }
  }

  buscarCapillas(): void {
    this.loaderService.activar();
    const parametros = {idVelatorio: this.idVelatorio};
    this.gestionarOrdenServicioService
      .buscarCapillas(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
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
        error: (error: HttpErrorResponse): void => {
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
      });
  }

  buscarSalas(): void {
    this.loaderService.activar();
    const parametros = {idVelatorio: this.idVelatorio};
    this.gestionarOrdenServicioService
      .buscarSalas(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
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
            'nombreSala',
            'idSala'
          );
        },
        error: (error: HttpErrorResponse): void => {
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
      });
  }

  buscarPromotor(): void {
    this.loaderService.activar();

    this.gestionarOrdenServicioService
      .buscarPromotor()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
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
        error: (error: HttpErrorResponse) => {
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
      });
  }

  abrirModalAgregarPanteon(): void {
    const ref = this.dialogService.open(ModalAgregarPanteonComponent, {
      header: 'Agregar panteón',
      style: {maxWidth: '876px', width: '100%'},
    });
    ref.onClose.subscribe((val: number) => {
      if (val) {
        this.idPanteon = val
        this.inhumacion.agregarPanteon.disable();
        this.confirmarGuardarPanteon = true
        return
      }
      this.inhumacion.agregarPanteon.setValue(false);
    });
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
      formulario.recoger.hora == null
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

  guardarODS(): void {
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .generarODS(this.altaODS)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error) {
            this.salas = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'Error al guardar la información. Intenta nuevamente.'
            );

            return;
          }
          this.descargarContratoServInmediatos(respuesta.datos.idOrdenServicio);
          this.descargarOrdenServicio(respuesta.datos.idOrdenServicio, respuesta.datos.idEstatus);
          const ExitoMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            );
          if (this.altaODS.idEstatus == 2) {
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              ExitoMsg || 'La Orden de Servicio se ha generado exitosamente.'
            );
          } else {
            this.alertaService.mostrar(
              TipoAlerta.Exito, this.mensajesSistemaService.obtenerMensajeSistemaPorId(49) ||
              'Se ha guardado exitosamente la pre-orden. El contratante debe acudir al Velatorio correspondiente para' +
              ' concluir con la contratación del servicio.'
            );
          }
          this.router.navigate(["ordenes-de-servicio"]);
        },
        error: (error: HttpErrorResponse) => {
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
            this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
            this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
          }
        }
      });
  }

  descargarContratoServInmediatos(idOrdenServicio: number): void {
    this.loaderService.activar()
    let tipoOrden;
    tipoOrden = this.altaODS.idEstatus === 1 ? 0 : 1;
    const configuracionArchivo: OpcionesArchivos = {ext: 'pdf'};
    this.gestionarOrdenServicioService.generarArchivoServiciosInmediatos(idOrdenServicio, tipoOrden).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download', 'documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    })
  }

  descargarOrdenServicio(idOrdenServicio: number, idEstatus: number): void {
    this.loaderService.activar()
    const configuracionArchivo: OpcionesArchivos = {ext: 'pdf'};
    this.gestionarOrdenServicioService.generarArchivoOrdenServicio(
      idOrdenServicio, idEstatus
    ).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download', 'documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    })
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
    this.cortejo.gestionadoPorPromotor.disable();
    this.cortejo.fecha.disable();
    this.cortejo.hora.disable();
    this.instalacionServicio.hora.disable();
    this.instalacionServicio.fecha.disable();
    this.recoger.hora.disable();
    this.recoger.fecha.disable();
  }

  preorden(): void {
    this.altaODS.idEstatus = 1;
    this.llenarDatos();
    this.guardarODS();
  }

  generada(): void {
    this.altaODS.idEstatus = 2;
    this.llenarDatos();
    this.guardarODS();
  }

  consultaCP(): void {
    if (!this.lugarVelacion.cp.value) {
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consutaCP(this.lugarVelacion.cp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta && +respuesta.mensaje != 185) {
            this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre')
            this.lugarVelacion.colonia.setValue(respuesta.datos[0].nombre);
            this.lugarVelacion.municipio.setValue(
              respuesta.datos[0].municipio.nombre
            );
            this.lugarVelacion.estado.setValue(
              respuesta.datos[0].municipio.entidadFederativa.nombre
            );
            return;
          }
          this.alertaService.mostrar(TipoAlerta.Precaucion,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(185));
          this.colonias = [];
          this.lugarVelacion.colonia.patchValue(null);
          this.lugarVelacion.municipio.patchValue(null);
          this.lugarVelacion.estado.patchValue(null);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }
}
