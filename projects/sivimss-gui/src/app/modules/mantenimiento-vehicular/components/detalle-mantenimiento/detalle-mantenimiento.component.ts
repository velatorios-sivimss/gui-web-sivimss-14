import { Component, OnInit, ViewChild } from '@angular/core';
import { tablaRin } from "../../constants/tabla-rines";
import { OverlayPanel } from "primeng/overlaypanel";
import { VehiculoMantenimiento } from "../../models/vehiculoMantenimiento.interface";
import { ActivatedRoute } from "@angular/router";
import { forkJoin, Observable, of } from "rxjs";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { RespuestaVerificacion } from "../../models/respuestaVerificacion.interface";
import { RespuestaSolicitudMantenimiento } from "../../models/respuestaSolicitudMantenimiento.interface";
import { RespuestaRegistroMantenimiento } from "../../models/respuestaRegistroMantenimiento.interface";
import { obtenerFechaActual, obtenerHoraActual } from "../../../../utils/funciones-fechas";
import { NuevaVerificacionComponent } from "../nueva-verificacion/nueva-verificacion.component";
import {
  SolicitudMantenimientoComponent
} from "../solicitud-mantenimiento/solicitud-mantenimiento.component";
import {
  RegistroMantenimientoComponent
} from "../registro-mantenimiento/registro-mantenimiento.component";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-detalle-mantenimiento',
  templateUrl: './detalle-mantenimiento.component.html',
  styleUrls: ['./detalle-mantenimiento.component.scss'],
  providers: [DialogService]
})
export class DetalleMantenimientoComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  data = tablaRin;
  vehiculo!: VehiculoMantenimiento;
  verificacion!: RespuestaVerificacion;
  solicitudRegistro!: RespuestaSolicitudMantenimiento;
  registro!: RespuestaRegistroMantenimiento;
  fechaActual: string = `${obtenerFechaActual()} ${obtenerHoraActual()}`;
  modificarModal: boolean = false;
  indice: number = 0;
  idAgregarVehiculo: number = 0;

  solicitudMttoRef!: DynamicDialogRef;
  nuevaVerificacionRef!: DynamicDialogRef;
  registroMttoRef!: DynamicDialogRef;

  constructor(private route: ActivatedRoute,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    public dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.tabview) {
        this.indice = params.tabview;
      }
      this.obtenerRegistros();
    })
  }

  abrirPanel(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
  }

  obtenerRegistros(): void {
    this.vehiculo = this.route.snapshot.data["respuesta"][0].datos[0];
    const POSICION_VERIFICACION: number = 0;
    const POSICION_REGISTRO_MTTO: number = 1;
    const POSICION_SOLICITUD_MTTO: number = 2;
    forkJoin([this.obtenerVerificacionInicial(), this.obtenerRegistroMantenimiento(), this.obtenerSolicitudMantenimiento()])
      .subscribe({
        next: (respuesta): void => {
          this.verificacion = respuesta[POSICION_VERIFICACION].datos[0] || null;
          this.registro = respuesta[POSICION_REGISTRO_MTTO].datos[0] || null;
          this.solicitudRegistro = respuesta[POSICION_SOLICITUD_MTTO].datos[0] || null;
          if (this.verificacion) {
            this.vehiculo.ID_VEHICULO = this.verificacion.ID_VEHICULO;
            this.vehiculo.DES_MTTOESTADO = this.verificacion.DES_MTTOESTADO;
            this.vehiculo.DES_VELATORIO = this.verificacion.DES_VELATORIO || null;
            this.vehiculo.REF_MARCA = this.verificacion.REF_MARCA;
            this.vehiculo.REF_SUBMARCA = this.verificacion.REF_SUBMARCA;
            this.vehiculo.REF_MODELO = this.verificacion.REF_MODELO;
            this.vehiculo.REF_PLACAS = this.verificacion.REF_PLACAS;
          } else if (this.registro) {
            this.vehiculo.ID_VEHICULO = this.registro.ID_VEHICULO;
            this.vehiculo.DES_MTTOESTADO = this.registro.DES_MTTOESTADO;
            this.vehiculo.DES_VELATORIO = this.registro.NOM_VELATORIO || null;
            this.vehiculo.REF_MARCA = this.registro.REF_MARCA;
            this.vehiculo.REF_SUBMARCA = this.registro.REF_SUBMARCA;
            this.vehiculo.REF_MODELO = this.registro.REF_MODELO;
            this.vehiculo.REF_PLACAS = this.registro.REF_PLACAS;
          } else {
            this.vehiculo.ID_VEHICULO = this.solicitudRegistro.ID_VEHICULO;
            this.vehiculo.DES_MTTOESTADO = this.solicitudRegistro.DES_MTTOESTADO;
            this.vehiculo.DES_VELATORIO = this.solicitudRegistro.DES_VELATORIO || null;
            this.vehiculo.REF_MARCA = this.solicitudRegistro.REF_MARCA;
            this.vehiculo.REF_SUBMARCA = this.solicitudRegistro.REF_SUBMARCA;
            this.vehiculo.REF_MODELO = this.solicitudRegistro.REF_MODELO;
            this.vehiculo.REF_PLACAS = this.solicitudRegistro.REF_PLACAS;
          }
          this.vehiculo.DES_VELATORIO = this.verificacion?.DES_VELATORIO || this.registro?.NOM_VELATORIO || this.solicitudRegistro?.DES_VELATORIO;
          if (this.solicitudRegistro?.DES_MTTOESTADO) {
            this.vehiculo.DES_MTTOESTADO = this.solicitudRegistro.DES_MTTOESTADO;
          } else if (this.registro?.DES_MTTOESTADO) {
            this.vehiculo.DES_MTTOESTADO = this.registro.DES_MTTOESTADO;
          }
        }
      });
  }

  obtenerVerificacionInicial(): Observable<HttpRespuesta<any>> {
    if (!this.vehiculo.ID_MTTOVERIFINICIO) {
      return of({ datos: [], mensaje: '', codigo: 0, error: false });
    }
    return this.mantenimientoVehicularService.obtenerDetalleVerificacion(this.vehiculo.ID_MTTOVERIFINICIO);
  }

  obtenerSolicitudMantenimiento(): Observable<HttpRespuesta<any>> {
    if (!this.vehiculo.ID_MTTO_SOLICITUD) {
      return of({ datos: [], mensaje: '', codigo: 0, error: false });
    }
    return this.mantenimientoVehicularService.obtenerDetalleSolicitud(this.vehiculo.ID_MTTO_SOLICITUD);
  }

  obtenerRegistroMantenimiento(): Observable<HttpRespuesta<any>> {
    if (!this.vehiculo.ID_MTTO_REGISTRO) {
      return of({ datos: [], mensaje: '', codigo: 0, error: false });
    }
    return this.mantenimientoVehicularService.obtenerDetalleRegistro(this.vehiculo.ID_MTTO_REGISTRO);
  }

  abrirModalModificarVerificacion(): void {
    this.modificarModal = !this.modificarModal;
    this.nuevaVerificacionRef = this.dialogService.open(NuevaVerificacionComponent, {
      data: { id: this.vehiculo.ID_MTTOVERIFINICIO },
      header: "Modificar verificación",
      width: "920px"
    });

    this.nuevaVerificacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.obtenerRegistros();
      }
    })
  }

  abrirModalModificarSolicitud(): void {
    this.modificarModal = !this.modificarModal;
    this.registroMttoRef = this.dialogService.open(SolicitudMantenimientoComponent, {
      header: "Modificar solicitud de mantenimiento",
      width: "920px",
      data: { id: this.vehiculo.ID_MTTO_SOLICITUD },
    });

    this.registroMttoRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.obtenerRegistros();
      }
    })
  }

  abrirModalModificarRegistro(): void {
    this.modificarModal = !this.modificarModal;
    this.registroMttoRef = this.dialogService.open(RegistroMantenimientoComponent, {
      header: "Modificar registro de mantenimiento vehicular",
      width: "920px",
      data: { id: this.vehiculo.ID_MTTO_REGISTRO, mode: 'update' },
    });

    this.registroMttoRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.obtenerRegistros();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.solicitudMttoRef) {
      this.solicitudMttoRef.destroy();
    }
    if (this.nuevaVerificacionRef) {
      this.nuevaVerificacionRef.destroy();
    }
    if (this.registroMttoRef) {
      this.registroMttoRef.destroy();
    }
  }
}
