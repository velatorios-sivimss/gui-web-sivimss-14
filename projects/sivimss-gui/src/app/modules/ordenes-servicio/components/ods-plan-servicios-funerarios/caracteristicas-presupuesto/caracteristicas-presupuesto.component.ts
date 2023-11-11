import {
  AfterContentChecked,
  ChangeDetectorRef,
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

import { ContratanteInterface } from '../../../models/Contratante.interface';
import { CodigoPostalIterface } from '../../../models/CodigoPostal.interface';
import { FinadoSFInterface} from '../../../models/Finado.interface';
import { CaracteristicasPresupuestoInterface } from '../../../models/CaracteristicasPresupuesto,interface';
import { CaracteristicasPaqueteInterface } from '../../../models/CaracteristicasPaquete.interface';
import { CaracteristicasDelPresupuestoInterface } from '../../../models/CaracteristicasDelPresupuesto.interface';
import { DetallePaqueteInterface } from '../../../models/DetallePaquete.interface';
import { ServicioDetalleTrasladotoInterface } from '../../../models/ServicioDetalleTraslado.interface';
import { DetallePresupuestoInterface } from '../../../models/DetallePresupuesto.interface';
import { InformacionServicioVelacionInterface } from '../../../models/InformacionServicioVelacion.interface';
import { InformacionServicioInterface } from '../../../models/InformacionServicio.interface';
import { ContenidoPaqueteInterface } from '../../../models/ContenidoPaquete,interface';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';

import { finalize } from 'rxjs/operators';

import { LoaderService } from '../../../../../shared/loader/services/loader.service';
import { GenerarOrdenServicioService } from '../../../services/generar-orden-servicio.service';

import { HttpRespuesta } from '../../../../../models/http-respuesta.interface';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { Dropdown } from 'primeng/dropdown';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { ModalEliminarArticuloComponent } from '../../modal-eliminar-articulo/modal-eliminar-articulo.component';
import { ModalDonarArticuloComponent } from '../../modal-donar-articulo/modal-donar-articulo.component';
import { UsuarioEnSesion } from '../../../../../models/usuario-en-sesion.interface';
import {AltaODSSFInterface} from "../../../models/AltaODSSF.interface";
import {GestionarEtapasServiceSF} from "../../../services/gestionar-etapas.service-sf";
import {DropDownDetalleInterface} from "../../../models/drop-down-detalle.interface";

@Component({
  selector: 'app-caracteristicas-presupuesto-sf',
  templateUrl: './caracteristicas-presupuesto.component.html',
  styleUrls: ['./caracteristicas-presupuesto.component.scss'],
})
export class CaracteristicasPresupuestoSFComponent
  implements OnInit, AfterContentChecked
{
  @Output()
  seleccionarEtapa: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  dd!: Dropdown;

  paqueteSeleccionado: any;
  form!: FormGroup;

  mostrarModalAgregarAtaud: boolean = false;
  formAgregarAtaud!: FormGroup;

  altaODS: AltaODSSFInterface = {} as AltaODSSFInterface;
  contratante: ContratanteInterface = {} as ContratanteInterface;
  cp: CodigoPostalIterface = {} as CodigoPostalIterface;
  finado: FinadoSFInterface = {} as FinadoSFInterface;
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
  idVelatorio!: number;
  mostrarDonarAtaud: boolean = true;
  fila: number = 0;
  utilizarArticulo: boolean | null = null;
  datosPresupuesto: any[] = [];
  mostrarTIpoOtorgamiento: boolean = false;
  selecionaTipoOtorgamiento: number | null = null;
  valoresTipoOrtogamiento: any[] = [
    { value: 1, label: 'Estudio socioeconómico' },
    { value: 2, label: 'Escrito libre' },
  ];
  mostrarQuitarPresupuesto: boolean = false;
  total: number = 0;
  valorFila: any = {};
  elementosEliminadosPaquete: any[] = [];
  tipoOrden: number = 0;
  esExtremidad: number = 0;
  esObito: number = 0;
  bloquearPaquete: boolean = false;
  paqueteSeleccionadoDD!:Dropdown;
  valorPrevioDD: number = 0;
  confCambiarPaquete:boolean = false;
  tablaPaqueteSeleccion!: any;
  costoServiciosPorPaquete!: number;
  confQuitarPresupuesto: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private loaderService: LoaderService,

    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasServiceSF,
    private changeDetector: ChangeDetectorRef
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
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.idVelatorio = +usuario.idVelatorio;
    this.buscarPaquetes();

    this.gestionarEtapasService.altaODS$.asObservable().subscribe(
      (datodPrevios) => this.llenarAlta(datodPrevios)
    );
    this.gestionarEtapasService.datosEtapaCaracteristicas$.asObservable().subscribe(
      (datosEtapaCaracteristicas) =>this.inicializarForm(datosEtapaCaracteristicas)
    );
  }

  llenarAlta(datodPrevios: AltaODSSFInterface): void {
    this.altaODS = datodPrevios;
    this.tipoOrden = Number(this.altaODS.finado.idTipoOrden);
  }

  inicializarForm(datos: any): void {
    this.paqueteSeleccionado = datos.paqueteSeleccionado;
    this.mostrarTIpoOtorgamiento = datos.mostrarTIpoOtorgamiento;
    this.datosPaquetes = datos.datosPaquetes;
    this.datosPresupuesto = datos.datosPresupuesto;
    this.elementosEliminadosPaquete = datos.elementosEliminadosPaquete;
    this.selecionaTipoOtorgamiento = datos.selecionaTipoOtorgamiento;
    this.total = datos.total;
    this.form = this.formBuilder.group({
      observaciones: [{ value: datos.observaciones, disabled: false }],
      notasServicio: [{ value: datos.notasServicio, disabled: false }],
    });
  }

  buscarPaquetes(): void {
    this.loaderService.activar();
    const parametros = { idVelatorio: this.idVelatorio };
    this.gestionarOrdenServicioService.consultarPaquetes(parametros).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
        {
        next:(respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.paquetes = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Info,errorMsg || 'El servicio no responde, no permite más llamadas.');
            return;
          }
          this.paquetes = mapearArregloTipoDropdown(datos,'nombrePaquete','idPaquete');
        },
        error:(error: HttpErrorResponse) => {
          try {
            const errorMsg: string =this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
            this.alertaService.mostrar(TipoAlerta.Info,errorMsg || 'El servicio no responde, no permite más llamadas.');
          } catch (error) {
            const errorMsg: string =this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(TipoAlerta.Info,errorMsg || 'El servicio no responde, no permite más llamadas.');
          }
        }
      }
    )
  }

  confirmarCambioPaquete(dd:Dropdown): void {
    if(this.valorPrevioDD == null){
      this.paqueteSeleccionadoDD = dd;
      this.detallePaqueteFunction();
      return
    }
    this.confCambiarPaquete = true;
    this.paqueteSeleccionadoDD = dd.selectedOption;
  }

  limpiarODS(): void {
    const datosEtapaInformacionServicio = {
      fechaCortejo: null,
      fechaCremacion: null,
      fechaRecoger: null,
      horaRecoger: null,
      horaCortejo: null,
      horaCremacion: null,
      idPanteon: null,
      idPromotor: null,
      idSala: null,
      cp: null,
      fechaInstalacion: null,
      fechaVelacion: null,
      horaInstalacion: null,
      horaVelacion: null,
      idCapilla: null,
      calle: null,
      interior: null,
      exterior: null,
      colonia: null,
      municipio: null,
      estado: null,
      gestionadoPorPromotor: null,
      promotor: null,
    };
    this.gestionarEtapasService.datosEtapaInformacionServicio$.next(datosEtapaInformacionServicio);
  }

  valorPrevio(dd:Dropdown):void {
    this.valorPrevioDD = dd.selectedOption?.value ?? null;
  }

  cancelarCambioPaquete(): void{
    this.confCambiarPaquete = false;
    this.paqueteSeleccionado = this.valorPrevioDD;
  }


  detallePaqueteFunction(): void {
    let nombrePaquete = this.paqueteSeleccionadoDD.label;
    this.limpiarODS();
    this.confCambiarPaquete = false;
    this.dd = this.paqueteSeleccionadoDD.value;
    this.mostrarTIpoOtorgamiento = false;
    if (nombrePaquete.trim() == 'Paquete social') {
      this.mostrarTIpoOtorgamiento = true;
    }
    this.datosPresupuesto = [];
    this.elementosEliminadosPaquete = [];
    this.total = 0;
    this.loaderService.activar();
    this.buscarTipoAsignacion();
    this.caracteristicasPaquete.idPaquete = this.paqueteSeleccionado;
    const parametros = { idPaquete: this.paqueteSeleccionado };
    this.gestionarOrdenServicioService
      .consultarDetallePaquete(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.paquetes = [];
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
          this.datosPaquetes = datos;
          this.costoServiciosPorPaquete = datos[0].totalPaquete;
        },
        error: (error: HttpErrorResponse) => {
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
      });
  }

  buscarTipoAsignacion(): void {
    this.loaderService.activar();
    const parametros = { idPaquete: this.paqueteSeleccionado };
    this.gestionarOrdenServicioService
      .consultarTipoAsignacion(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
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
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  abrirPanel(
    event: MouseEvent,
    paqueteSeleccionado: any,
    noFila: number,
    proviene: string
  ): void {
    this.tablaPaqueteSeleccion = paqueteSeleccionado;
    paqueteSeleccionado.fila = noFila + 1;
    this.idServicio = Number(paqueteSeleccionado.idServicio);
    this.fila = noFila + 1;
    let validaRadioButton = paqueteSeleccionado.bloquearRadioButton ?? false;
    if (validaRadioButton && proviene != 'presupuesto') return;

    this.valorFila = paqueteSeleccionado;
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
          datos.concepto = respuesta.concepto;
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
        paqueteSeleccionado: this.paqueteSeleccionado,
        filaSeleccionada: this.datosPaquetes,

        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == null) {
        return;
      }
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


      let totalImporte =  respuesta.costoExtraKilometros + this.datosPaquetes[0].importe;
      let totalPaquete = respuesta.costoExtraKilometros + this.datosPaquetes[0].totalPaquete;
      /*Reiniciar los costos de tabla paquete*/
      this.datosPaquetes.forEach((precio:any) => {
        precio.importe = this.costoServiciosPorPaquete;
        precio.totalPaquete = this.costoServiciosPorPaquete;
      });
      /*Ingresar nuevo costo de tabla paquete si el kilometraje excede los previstos por promotor*/
      if(respuesta.costoExtraKilometros > 0) {
        this.datosPaquetes.forEach((datoPaquete: any) => {
          datoPaquete.importe = totalImporte;
          datoPaquete.totalPaquete = totalPaquete
        });
      }
    });
  }

  abrirModalAgregarProveedor(event: MouseEvent): void {
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
        paqueteSeleccionado: this.tablaPaqueteSeleccion
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == null) {
        return;
      }

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
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.listaproveedor = [];
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
          this.listaproveedor = mapearArregloTipoDropdown(
            datos,
            'nombreProveedor',
            'idProveedor'
          );
        },
        error: (error: HttpErrorResponse) => {
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
      });
  }

  agregarArticulo(datos: any): void {
    if(!datos.proveedor){
      setTimeout(()=> {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Agrega un proveedor para asignar al presupuesto');
      datos.utilizarArticulo = null;
      },100);
      return
    }
    datos.proviene = 'paquete';
    this.paquete.activo = 1;
    this.paquete.cantidad = datos.cantidad ?? null;
    this.paquete.desmotivo = datos.desmotivo ?? null;
    this.paquete.idArticulo = datos.idArticulo ?? null;
    this.paquete.idProveedor = datos.idProveedor;
    this.paquete.idServicio = datos.idServicio ?? null;
    this.paquete.idTipoServicio = datos.idTipoServicio ?? null;
    this.paquete.importeMonto = datos.importe ?? null;
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
    this.totalpresupuesto();
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  totalpresupuesto(): void {
    let datosPresupuesto = this.datosPresupuesto;
    let totalPaquete = 0;
    let totalArticulos = 0;

    datosPresupuesto.forEach(function (datos) {
      if (datos.proviene == 'paquete') {
        totalPaquete = datos.totalPaquete;
      } else {
        totalArticulos += Number(datos.importe);
      }
    });
    let pretotal = Number(totalPaquete) + Number(totalArticulos);
    this.total = pretotal;
  }
  quitarArticulo(datos: any,rowIndex: number): void {
    datos.fila = rowIndex + 1;
    const ref = this.dialogService.open(ModalEliminarArticuloComponent, {
      header: '',
      style: { maxWidth: '600px', width: '100%' },
      data: {},
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) {
        datos.desmotivo = salida;
        this.elementosEliminadosPaquete.push(datos);
        this.quitarPaquete(datos);
      }else{
        datos.utilizarArticulo = null;
      }
    });
  }
  quitarPaquete(datos: any) {
    let nuevoArray = this.datosPaquetes.filter(
      (item) => datos.fila !== item.fila
    );
    this.datosPaquetes = nuevoArray;
  }

  quitarPresupuesto(): void {
    this.confQuitarPresupuesto = false
    let nuevoArray = this.datosPresupuesto.filter(
      (item) => this.valorFila.fila !== item.fila
    );

    this.datosPresupuesto = nuevoArray;
    //se agregara mensaje de que se elimino??
    this.totalpresupuesto();
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
    this.seleccionarEtapa.emit({idEtapaSeleccionada:1, detalle_orden_servicio: true});
  }

  continuar() {
    if(!this.validarSeleccionPaquete()) return;
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
    this.seleccionarEtapa.emit({idEtapaSeleccionada:3, detalle_orden_servicio: true});
    this.datosAlta();
  }

  datosAlta(): void {
    let obj: DropDownDetalleInterface = JSON.parse(localStorage.getItem("drop_down") as string)
    let datosEtapaCaracteristicas = {
      observaciones: this.f.observaciones.value,
      notasServicio: this.f.notasServicio.value,
      paqueteSeleccionado: this.paqueteSeleccionado,
      mostrarTIpoOtorgamiento: this.mostrarTIpoOtorgamiento,
      selecionaTipoOtorgamiento: this.selecionaTipoOtorgamiento,
      datosPaquetes: this.datosPaquetes,
      datosPresupuesto: this.datosPresupuesto,
      elementosEliminadosPaquete: this.elementosEliminadosPaquete,
      total: this.total,
    };
    this.gestionarEtapasService.datosEtapaCaracteristicas$.next(
      datosEtapaCaracteristicas
    );
    obj.tablaPaquete = datosEtapaCaracteristicas.datosPaquetes;
    localStorage.setItem("drop_down",JSON.stringify(obj));
    this.datosPresupuesto.forEach((datos: any) => {
      let detalle: DetallePresupuestoInterface =
        {} as DetallePresupuestoInterface;

      detalle.cantidad = Number(datos.cantidad);
      let datosDonados = datos.esDonado ?? false;
      detalle.esDonado = 0;

      if (datosDonados) {
        detalle.esDonado = 1;
      }

      detalle.idArticulo =
        datos.idArticulo == '' || datos.idArticulo == null
          ? null
          : Number(datos.idArticulo);
      detalle.idCategoria = parseInt(datos.idCategoria);
      detalle.idInventario =
        datos.idInventario == '' || datos.idInventario == null
          ? null
          : Number(datos.idInventario);
      detalle.idProveedor = parseInt(datos.idProveedor);
      detalle.idServicio =
        datos.idServicio == '' || datos.idServicio == null
          ? null
          : Number(datos.idServicio);
      detalle.idTipoServicio = parseInt(datos.idTipoServicio);
      detalle.servicioDetalleTraslado = null;

      detalle.proviene = datos.proviene;

      if (Number(datos.idTipoServicio) == 4) {
        let traslado: ServicioDetalleTrasladotoInterface =
          {} as ServicioDetalleTrasladotoInterface;
        traslado.destino = datos.destino;
        traslado.longitudInicial = Number(datos.coordOrigen[0]);
        traslado.latitudInicial = Number(datos.coordOrigen[1]);
        traslado.longitudFinal = Number(datos.coordDestino[0]);
        traslado.latitudFinal = Number(datos.coordDestino[1]);
        traslado.origen = datos.origen;
        traslado.totalKilometros = datos.kilometraje;
        detalle.servicioDetalleTraslado = traslado;
      }
      detalle.importeMonto = datos.totalPaquete ?? null;
      this.detallePresupuesto.push(detalle);
    });

    //paquetes

    this.datosPaquetes.forEach((datos: any) => {
      let detalle: DetallePaqueteInterface = {} as DetallePaqueteInterface;

      detalle.cantidad = Number(datos.cantidad);
      detalle.idArticulo = parseInt(datos.idArticulo);
      detalle.desmotivo = datos.desmotivo;
      detalle.activo = 1;
      detalle.idProveedor = datos.idProveedor ?? null;
      detalle.idServicio =
        datos.idServicio == '' ? null : Number(datos.idServicio);
      detalle.idTipoServicio =
        datos.idTipoServicio == '' ? null : Number(datos.idTipoServicio);
      detalle.servicioDetalleTraslado = null;
      detalle.importeMonto = Number(datos.importe);
      detalle.totalPaquete = Number(datos.totalPaquete);
      detalle.idCategoriaPaquete = datos.idCategoria === "" ? null : Number(datos.idCategoria)

      if (Number(datos.idTipoServicio) == 4) {
        let traslado: ServicioDetalleTrasladotoInterface =
          {} as ServicioDetalleTrasladotoInterface;
        detalle.activo = datos.activo ?? 1;
        let cordenadas = datos.coordOrigen ?? null;
        traslado.longitudInicial = null;
        traslado.latitudInicial = null;
        traslado.longitudFinal = null;
        traslado.latitudFinal = null;
        if (cordenadas != null) {
          traslado.longitudInicial = Number(datos.coordOrigen[0]);
          traslado.latitudInicial = Number(datos.coordOrigen[1]);
          traslado.longitudFinal = Number(datos.coordDestino[0]);
          traslado.latitudFinal = Number(datos.coordDestino[1]);
        }
        traslado.destino = datos.destino ?? null;
        traslado.origen = datos.origen ?? null;
        traslado.totalKilometros = datos.kilometraje ?? null;
        detalle.servicioDetalleTraslado = traslado ?? null;
      }
      this.detallePaquete.push(detalle);
    });

    this.elementosEliminadosPaquete.forEach((datos: any) => {
      let detalle: DetallePaqueteInterface = {} as DetallePaqueteInterface;

      detalle.cantidad = parseInt(datos.cantidad);
      detalle.idArticulo = parseInt(datos.idArticulo) ?? null;
      detalle.desmotivo = datos.desmotivo ?? null;
      detalle.activo = 0;
      detalle.idProveedor =
        datos.idProveedor == '' ? null : Number(datos.idProveedor);
      detalle.idServicio =
        datos.idServicio == '' ? null : Number(datos.idServicio);
      detalle.idTipoServicio =
        datos.idTipoServicio == '' ? null : Number(datos.idTipoServicio);
      detalle.servicioDetalleTraslado = null;
      detalle.importeMonto = Number(datos.importe) ?? null;
      detalle.totalPaquete = Number(datos.totalPaquete) ?? null;
      detalle.idCategoriaPaquete = datos.idCategoria === "" ? null : Number(datos.idCategoria)

      if (Number(datos.idTipoServicio) == 4) {
        let traslado: ServicioDetalleTrasladotoInterface =
          {} as ServicioDetalleTrasladotoInterface;
        detalle.activo = parseInt(datos.activo) ?? 0;
        let cordenadas = parseInt(datos.coordOrigen) ?? null;
        traslado.longitudInicial = null;
        traslado.latitudInicial = null;
        traslado.longitudFinal = null;
        traslado.latitudFinal = null;
        if (cordenadas != null && !isNaN(cordenadas)) {
          traslado.longitudInicial = Number(datos.coordOrigen[0]);
          traslado.latitudInicial = Number(datos.coordOrigen[1]);
          traslado.longitudFinal = Number(datos.coordDestino[0]);
          traslado.latitudFinal = Number(datos.coordDestino[1]);
        }
        traslado.destino = datos.destino ?? null;
        traslado.origen = datos.origen ?? null;
        traslado.totalKilometros = datos.kilometraje ?? null;
        detalle.servicioDetalleTraslado = traslado ?? null;
      }
      this.detallePaquete.push(detalle);
    });

    //presupuesto

    this.caracteristicasDelPresupuesto.idPaquete = this.paqueteSeleccionado;
    this.caracteristicasDelPresupuesto.notasServicio =
      this.f.notasServicio.value;
    this.caracteristicasDelPresupuesto.observaciones =
      this.f.observaciones.value;
    this.caracteristicasDelPresupuesto.totalPresupuesto = Number(this.total);
    this.caracteristicasDelPresupuesto.detallePresupuesto =
      this.detallePresupuesto;

    this.altaODS.caracteristicasPresupuesto = this.caracteristicasPresupuesto;
    this.caracteristicasPresupuesto.caracteristicasDelPresupuesto =
      this.caracteristicasDelPresupuesto;
    this.caracteristicasDelPresupuesto.detallePresupuesto =
      this.detallePresupuesto;

    //paquete
    this.caracteristicasPaquete.idPaquete = this.paqueteSeleccionado;
    this.caracteristicasPaquete.otorgamiento =
      this.selecionaTipoOtorgamiento ?? null;

    this.caracteristicasPaquete.detallePaquete = null;
    this.caracteristicasPresupuesto.caracteristicasPaquete = null;
    if (this.detallePaquete.length > 0) {
      this.caracteristicasPresupuesto.caracteristicasPaquete =
        this.caracteristicasPaquete;
      this.caracteristicasPaquete.detallePaquete = this.detallePaquete;
    }

    // this.detallePresupuesto = arrayDatosPresupuesto;

    this.gestionarEtapasService.altaODS$.next(this.altaODS);
  }

  get f() {
    return this.form.controls;
  }

  abrirModalAgregarAlPrespuesto(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarAlPresupuestoComponent, {
      header: 'Agregar a presupuesto',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        idVelatorio: this.idVelatorio,
        tipoOrden: this.tipoOrden,
        presupuesto: this.datosPresupuesto
      },
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) {
        this.datosPresupuesto.push(salida);
        this.totalpresupuesto();
      }
    });
  }

  abrirModalDonarAtaud(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalDonarArticuloComponent, {
      header: 'Donar ataúd',
      style: { maxWidth: '353px', width: '100%' },
      data: {
        datos: this.valorFila,
      },
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) {
        this.quitarPaquete(salida);
        this.datosPresupuesto.push(salida);
        this.totalpresupuesto();
      }
    });
  }

  validarSeleccionPaquete(): boolean {
    if(this.datosPresupuesto.length > 0){
      return true
    }else{
      this.alertaService.mostrar(TipoAlerta.Info,this.mensajesSistemaService.obtenerMensajeSistemaPorId(101));
      return false
    }
  }

  validacionFormulario(): boolean {
    if (this.dd || this.altaODS.caracteristicasPresupuesto.caracteristicasPaquete?.idPaquete) {
      const drop:any = this.dd;
      if(drop == 3){
        return this.selecionaTipoOtorgamiento != null ? false: true;
      }
      return false;
    }
    return true;
  }
}
