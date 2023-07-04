import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalAgregarAtaudComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-ataud/modal-agregar-ataud.component';
import { ModalAgregarPanteonComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-panteon/modal-agregar-panteon.component';
import { ModalSeleccionarBeneficiarioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
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
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
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
@Component({
  selector: 'app-informacion-servicio',
  templateUrl: './informacion-servicio.component.html',
  styleUrls: ['./informacion-servicio.component.scss'],
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
  idVelatorio: number = 1;
  capillas: any[] = [];
  salas: any[] = [];
  promotores: any[] = [];
  idPanteon: number = 1;
  validaDomicilio: boolean = false;
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,

    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
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
    this.gestionarEtapasService.datosEtapaInformacionServicio$
      .asObservable()
      .subscribe((datosEtapaInformacionServicio) =>
        this.inicializarForm(datosEtapaInformacionServicio)
      );
    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datodPrevios) => this.llenarAlta(datodPrevios));

    this.gestionarEtapasService.datosEtapaCaracteristicas$
      .asObservable()
      .subscribe((datosEtapaCaracteristicas) =>
        this.datosEtapaCaracteristicas(datosEtapaCaracteristicas)
      );
    this.buscarCapillas();
    this.buscarSalas();
    this.buscarPromotor();
  }

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
  }

  datosEtapaCaracteristicas(datosEtapaCaracteristicas: any): void {
    let datosPresupuesto = datosEtapaCaracteristicas.datosPresupuesto;
    console.log(datosPresupuesto);
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
    datosPresupuesto.forEach((datos: any) => {
      if (datos.concepto == 'Velación en capilla') {
        this.lugarVelacion.capilla.enable();
        this.lugarVelacion.fecha.enable();
        this.lugarVelacion.hora.enable();
      }

      if (datos.concepto == 'Velación en domicilio') {
        this.validaDomicilio = true;
        this.lugarVelacion.calle.enable();
        this.lugarVelacion.exterior.enable();
        this.lugarVelacion.interior.enable();
        this.lugarVelacion.exterior.enable();
        this.lugarVelacion.cp.enable();
        this.lugarVelacion.colonia.enable();
        this.lugarVelacion.municipio.enable();
        this.lugarVelacion.estado.enable();
      }

      if (
        datos.concepto.toUpperCase().includes('CREMACIÓN') ||
        datos.concepto.toUpperCase().includes('CREMACION')
      ) {
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

  changePromotor(validacion: string): void {
    if (validacion == 'si') this.cortejo.promotor.enable();
    else {
      this.cortejo.promotor.disable();
      this.cortejo.promotor.setValue(null);
    }
  }
  buscarCapillas(): void {
    this.loaderService.activar();
    const parametros = { idVelatorio: this.idVelatorio };
    this.gestionarOrdenServicioService
      .buscarCapillas(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
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
          console.log(respuesta);
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
          console.log(respuesta);
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

  abrirModalAgregarPanteon(): void {
    const ref = this.dialogService.open(ModalAgregarPanteonComponent, {
      header: 'Agregar panteón',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dummy: '', //Pasa info a ModalAgregarPanteonComponent
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        //Obtener info cuando se cierre el modal en ModalAgregarPanteonComponent
      }
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
    console.log(
      'la fecha es' + moment(this.recoger.fecha.value).format('yyyy-MM-DD')
    );
    console.log('la hora es' + moment(this.recoger.hora.value).format('HH:mm'));
  }

  llenarDatos(): void {
    let datos = {
      fechaCortejo: this.cortejo.fecha.value ?? null,
      fechaCremacion: this.lugarCremacion.fecha.value ?? null,
      fechaRecoger: this.recoger.fecha.value ?? null,
      horaRecoger: this.recoger.hora.value ?? null,
      horaCortejo: this.cortejo.hora.value ?? null,
      horaCremacion: this.lugarCremacion.hora.value ?? null,
      idPanteon: this.idPanteon,
      idPromotor: this.cortejo.promotor.value ?? null,
      idSala: this.lugarCremacion.sala.value,
      cp: this.lugarVelacion.cp.value ?? null,
      fechaInstalacion: this.instalacionServicio.fecha.value ?? null,
      fechaVelacion: this.lugarVelacion.fecha.value ?? null,
      horaInstalacion: this.instalacionServicio.hora.value ?? null,
      horaVelacion: this.lugarVelacion.hora.value ?? null,
      idCapilla: this.lugarVelacion.capilla.value ?? null,
      calle: this.lugarVelacion.capilla.value ?? null,
      interior: this.lugarVelacion.interior.value ?? null,
      exterior: this.lugarVelacion.exterior.value ?? null,
      colonia: this.lugarVelacion.colonia.value ?? null,
      municipio: this.lugarVelacion.municipio.value ?? null,
      estado: this.lugarVelacion.estado.value ?? null,
      gestionadoPorPromotor: this.cortejo.gestionadoPorPromotor.value ?? null,
      promotor: this.cortejo.promotor.value ?? null,
    };

    this.informacionServicio.fechaCortejo =
      moment(this.cortejo.fecha.value).format('yyyy-MM-DD') ?? null;
    this.informacionServicio.fechaCremacion =
      moment(this.lugarCremacion.fecha.value).format('yyyy-MM-DD') ?? null;
    this.informacionServicio.fechaRecoger =
      moment(this.recoger.fecha.value).format('yyyy-MM-DD') ?? null;
    this.informacionServicio.horaCortejo =
      moment(this.cortejo.hora.value).format('HH:mm') ?? null;
    this.informacionServicio.horaCremacion =
      moment(this.lugarCremacion.hora.value).format('HH:mm') ?? null;
    this.informacionServicio.idPanteon = this.idPanteon;
    this.informacionServicio.idPromotor = this.cortejo.promotor.value ?? null;
    this.informacionServicio.idSala = this.lugarCremacion.sala.value ?? null;
    //información servicio velación
    this.informacionServicioVelacion.cp = this.lugarVelacion.cp.value ?? null;
    this.informacionServicioVelacion.fechaInstalacion =
      moment(this.instalacionServicio.fecha.value).format('yyyy-MM-DD') ?? null;
    this.informacionServicioVelacion.fechaVelacion =
      moment(this.lugarVelacion.fecha.value).format('yyyy-MM-DD') ?? null;
    this.informacionServicioVelacion.horaInstalacion =
      moment(this.instalacionServicio.hora.value).format('HH:mm') ?? null;
    this.informacionServicioVelacion.horaVelacion =
      moment(this.lugarVelacion.hora.value).format('HH:mm') ?? null;
    this.informacionServicioVelacion.idCapilla =
      this.lugarVelacion.capilla.value ?? null;

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
}
