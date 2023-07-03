import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ModalAgregarAlPaqueteComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-al-paquete/modal-agregar-al-paquete.component';
import { ModalAgregarAlPresupuestoComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-al-presupuesto/modal-agregar-al-presupuesto.component';
import { ModalAgregarServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-servicio/modal-agregar-servicio.component';
import { ModalVerKilometrajeComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-kilometraje/modal-ver-kilometraje.component';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
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
import { ContenidoPaqueteInterface } from '../../models/ContenidoPaquete,interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';

import { finalize } from 'rxjs/operators';

import { LoaderService } from '../../../../shared/loader/services/loader.service';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';

import { HttpRespuesta } from '../../../../models/http-respuesta.interface';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-caracteristicas-presupuesto',
  templateUrl: './caracteristicas-presupuesto.component.html',
  styleUrls: ['./caracteristicas-presupuesto.component.scss'],
})
export class CaracteristicasPresupuestoComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  paqueteSeleccionado: any;
  form!: FormGroup;

  mostrarModalAgregarAtaud: boolean = false;
  formAgregarAtaud!: FormGroup;

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

  paquetes: any[] = [];
  datosPaquetes: ContenidoPaqueteInterface[] = [];
  mostrarKilometrajes: boolean = false;
  mostrarTraslado: boolean = false;
  mostrarProveedor: boolean = false;
  mostrarAtaudes: boolean = false;
  tipoAsignacion: any[] = [];
  idServicio: number | null = null;
  listaproveedor: any[] = [];
  idVelatorio: number = 1; /// falta agregarlo del front
  mostrarDonarAtaud: boolean = true;
  fila: number = 0;
  utilizarArticulo: boolean | null = null;
  datosPresupuesto: any[] = [];
  mostrarTIpoOtorgamiento: boolean = true;
  selecionaTipoOtorgamiento: number | null = null;
  valoresTipoOrtogamiento: any[] = [
    { value: 1, label: 'Estudio socioeconómico' },
    { value: 2, label: 'EscritoLlibre' },
  ];
  mostrarQuitarPresupuesto: boolean = false;
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
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
    this.inicializarForm();
    this.buscarPaquetes();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      observaciones: [{ value: null, disabled: false }, [Validators.required]],
      notasServicio: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  buscarPaquetes(): void {
    this.loaderService.activar();
    const parametros = { idVelatorio: this.idVelatorio };
    this.gestionarOrdenServicioService
      .consultarPaquetes(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.paquetes = [];
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(respuesta.datos)
              )
            );
            return;
          }
          this.paquetes = mapearArregloTipoDropdown(
            datos,
            'nombrePaquete',
            'idPaquete'
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(error.error.datos)
              )
            );
          } catch (error) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(187)
            );
          }
        }
      );
  }

  detallePaqueteFunction(dd: Dropdown): void {
    let nombrePaquete = dd.selectedOption.label;
    this.mostrarTIpoOtorgamiento = false;
    if (nombrePaquete.trim() == 'Paquete social') {
      this.mostrarTIpoOtorgamiento = true;
    }
    this.loaderService.activar();
    this.buscarTipoAsignacion();
    this.caracteristicasPaquete.idPaquete = this.paqueteSeleccionado;
    const parametros = { idPaquete: this.paqueteSeleccionado };
    this.gestionarOrdenServicioService
      .consultarDetallePaquete(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log('detalle paquete', respuesta);
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.paquetes = [];
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(respuesta.datos)
              )
            );
            return;
          }
          this.datosPaquetes = datos;
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(error.error.datos)
              )
            );
          } catch (error) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(187)
            );
          }
        }
      );
  }

  buscarTipoAsignacion(): void {
    this.loaderService.activar();
    const parametros = { idPaquete: this.paqueteSeleccionado };
    this.gestionarOrdenServicioService
      .consultarTipoAsignacion(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          console.log('tipo asignacion', respuesta);

          if (respuesta.error) {
            this.tipoAsignacion = [];

            return;
          }
          const datos = respuesta.datos[0]['idAsignacion'];
          if (datos == '0') {
            this.tipoAsignacion = [];
            return;
          }
          this.tipoAsignacion = datos.split(',');

          console.log(this.tipoAsignacion);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
  }

  abrirPanel(
    event: MouseEvent,
    paqueteSeleccionado: any,
    noFila: number,
    proviene: string
  ): void {
    console.log(paqueteSeleccionado);
    paqueteSeleccionado.fila = noFila + 1;
    this.idServicio = Number(paqueteSeleccionado.idServicio);
    this.fila = noFila + 1;
    let validaRadioButton = paqueteSeleccionado.bloquearRadioButton ?? false;
    if (validaRadioButton) return;
    if (proviene == 'paquete') {
      this.mostrarKilometrajes = false;
      this.mostrarTraslado = false;
      this.mostrarProveedor = false;
      this.mostrarAtaudes = false;
      this.mostrarDonarAtaud = false;
      this.mostrarQuitarPresupuesto = false;

      if (Number(paqueteSeleccionado.idTipoServicio) == 4) {
        this.mostrarTraslado = true;
      }
      if (
        Number(paqueteSeleccionado.idProveedor) > 0 &&
        Number(paqueteSeleccionado.idTipoServicio) == 4
      ) {
        this.mostrarKilometrajes = true;
      }
      if (
        Number(paqueteSeleccionado.idTipoServicio) != 4 &&
        paqueteSeleccionado.idTipoServicio != ''
      ) {
        this.mostrarProveedor = true;
      }
      if (paqueteSeleccionado.idTipoServicio == '') {
        this.mostrarAtaudes = true;
      }
      if (Number(paqueteSeleccionado.idServicio) > 0) {
        this.consultarProveeedorServicio();
      }
      if (
        Number(paqueteSeleccionado.idAsignacion) == 1 ||
        Number(paqueteSeleccionado.idAsignacion) == 5
      ) {
        this.mostrarDonarAtaud = true;
      }
    } else {
      this.mostrarKilometrajes = false;
      this.mostrarTraslado = false;
      this.mostrarProveedor = false;
      this.mostrarAtaudes = false;
      this.mostrarDonarAtaud = false;
      this.mostrarQuitarPresupuesto = true;
    }

    this.overlayPanel.toggle(event);
  }

  abrirModalAgregarAlPrespuesto(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarAlPresupuestoComponent, {
      header: 'Agregar a presupuesto',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dummy: '',
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
      }
    });
  }

  abrirModalAgregarAtaud(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarAlPaqueteComponent, {
      header: 'Agregar ataúd',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        tipoAsignacion: this.tipoAsignacion,
        idVelatorio: this.idVelatorio,
        fila: this.fila,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == null) {
        return;
      }
      this.datosPaquetes.forEach((datos: any) => {
        if (Number(datos.fila) == Number(respuesta.fila)) {
          datos.idInventario = respuesta.idInventario;
          datos.proveedor = respuesta.nombreProveedor;
          datos.idProveedor = respuesta.idProveedor;
          datos.idArticulo = respuesta.idArticulo;
          datos.idAsignacion = respuesta.idAsignacion;
          datos.utilizarArticulo = false;
          datos.bloquearRadioButton = false;
        }
      });
    });
  }

  abrirModalAgregarProveedorTraslado(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarServicioComponent, {
      header: 'Agregar proveedor traslado',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        proveedor: this.listaproveedor,
        traslado: true,
        fila: this.fila,
        proviene: 'traslados',
        idServicio: this.idServicio,
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == null) {
        return;
      }
      console.log(respuesta);
      this.datosPaquetes.forEach((datos: any) => {
        if (Number(datos.fila) == Number(respuesta.fila)) {
          datos.idInventario = null;
          datos.proveedor = respuesta.proveedor;
          datos.idProveedor = respuesta.datosFormulario.proveedor;
          datos.kilometraje = respuesta.datosFormulario.kilometraje;
          datos.coordOrigen = respuesta.coordOrigen;
          datos.coordDestino = respuesta.coordDestino;
          datos.destino = respuesta.datosFormulario.destino;
          datos.origen = respuesta.datosFormulario.origen;
          datos.utilizarArticulo = false;
          datos.bloquearRadioButton = false;
        }
      });
    });
  }

  abrirModalAgregarProveedor(event: MouseEvent): void {
    console.log('tipo proveerdor');
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarServicioComponent, {
      header: 'Agregar proveedor',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        proveedor: this.listaproveedor,
        traslado: false,
        fila: this.fila,
        proviene: 'proveedor',
        idServicio: this.idServicio,
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == null) {
        return;
      }
      console.log(respuesta);
      this.datosPaquetes.forEach((datos: any) => {
        if (Number(datos.fila) == Number(respuesta.fila)) {
          datos.idInventario = null;
          datos.proveedor = respuesta.proveedor;
          datos.idProveedor = respuesta.datosFormulario.proveedor;
          datos.kilometraje = null;
          datos.coordOrigen = null;
          datos.coordDestino = null;
          datos.utilizarArticulo = false;
          datos.bloquearRadioButton = false;
        }
      });
    });
  }

  abrirModalAgregarAtauds(): void {
    this.formAgregarAtaud = this.formBuilder.group({
      ataud: [{ value: null, disabled: false }, [Validators.required]],
      proveedor: [{ value: null, disabled: false }, [Validators.required]],
    });
    this.mostrarModalAgregarAtaud = true;
  }

  abrirModalAgregarServicio() {
    const ref = this.dialogService.open(ModalAgregarServicioComponent, {
      header: 'Agregar servicio',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dummy: '', //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        //Obtener info cuando se cierre el modal en ModalVerTarjetaIdentificacionComponent
      }
    });
  }

  abrirModalVerKm(): void {
    const ref = this.dialogService.open(ModalVerKilometrajeComponent, {
      header: 'Ver kilometraje',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dummy: '', //Pasa info a ModalVerKilometrajeComponent
      },
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
        //Obtener info cuando se cierre el modal en ModalVerKilometrajeComponent
      }
    });
  }

  consultarProveeedorServicio(): void {
    const parametros = { idServicio: this.idServicio };
    this.gestionarOrdenServicioService
      .consultarProveeedorServicio(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          console.log('datos', datos);
          if (respuesta.error) {
            this.listaproveedor = [];
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(respuesta.datos)
              )
            );
            return;
          }
          this.listaproveedor = mapearArregloTipoDropdown(
            datos,
            'nombreProveedor',
            'idProveedor'
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          try {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(error.error.datos)
              )
            );
          } catch (error) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(187)
            );
          }
        }
      );
  }

  agregarArticulo(datos: any): void {
    console.log('datos agregar', datos);

    datos.proviene = 'paquete';
    this.paquete.activo = 1;
    this.paquete.cantidad = datos.cantidad ?? null;
    this.paquete.desmotivo = datos.desmotivo ?? null;
    this.paquete.idArticulo = datos.idArticulo ?? null;
    this.paquete.idProveedor = datos.idProveedor;
    this.paquete.idServicio = datos.idServicio ?? null;
    this.paquete.idTipoServicio = datos.idTipoServicio ?? null;
    this.paquete.importeMonto = datos.importeMonto ?? null;
    this.paquete.totalPaquete = datos.totalPaquete;
    this.servicioDetalleTraslado = {} as ServicioDetalleTrasladotoInterface;
    this.paquete.servicioDetalleTraslado = null;
    if (Number(datos.idTipoServicio) == 4) {
      this.servicioDetalleTraslado.destino = datos.destino ?? null;
      this.servicioDetalleTraslado.latitudInicial =
        datos.coordOrigen[0] ?? null;
      this.servicioDetalleTraslado.latitudFinal = datos.coordOrigen[1] ?? null;
      this.servicioDetalleTraslado.longitudInicial =
        datos.coordDestino[0] ?? null;
      this.servicioDetalleTraslado.longitudFinal =
        datos.coordDestino[1] ?? null;
      this.servicioDetalleTraslado.origen = datos.origen ?? null;
      this.paquete.servicioDetalleTraslado = this.servicioDetalleTraslado;
    }
    datos.bloquearRadioButton = true;
    this.datosPresupuesto.push(datos);
    console.log('datos presupusto', this.datosPresupuesto);
  }

  quitarArticulo(datos: any): void {
    console.log(datos);
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
        estado: EtapaEstado.Completado,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
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
        idEtapa: 3,
        estado: EtapaEstado.Activo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'solid',
        },
      },
    ];
    window.scrollTo(0, 0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit(3);
    console.log('INFO A GUARDAR STEP 3: ', this.form.value);
  }

  get f() {
    return this.form.controls;
  }
}
