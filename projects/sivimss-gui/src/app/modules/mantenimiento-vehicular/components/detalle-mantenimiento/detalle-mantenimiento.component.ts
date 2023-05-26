import {Component, OnInit, ViewChild} from '@angular/core';
import {tablaRin} from "../../constants/tabla-rines";
import {OverlayPanel} from "primeng/overlaypanel";
import {VehiculoMantenimiento} from "../../models/vehiculoMantenimiento.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {forkJoin, Observable, of} from "rxjs";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MantenimientoVehicularService} from "../../services/mantenimiento-vehicular.service";
import {RespuestaVerificacion} from "../../models/respuestaVerificacion.interface";
import {RespuestaSolicitudMantenimiento} from "../../models/respuestaSolicitudMantenimiento.interface";
import {RespuestaRegistroMantenimiento} from "../../models/respuestaRegistroMantenimiento.interface";

@Component({
  selector: 'app-detalle-mantenimiento',
  templateUrl: './detalle-mantenimiento.component.html',
  styleUrls: ['./detalle-mantenimiento.component.scss']
})
export class DetalleMantenimientoComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  data = tablaRin;
  vehiculo!: VehiculoMantenimiento;
  verificacion!: RespuestaVerificacion;
  solicitudRegistro!: RespuestaSolicitudMantenimiento;
  registro!: RespuestaRegistroMantenimiento;

  constructor(private route: ActivatedRoute,
              private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  ngOnInit(): void {
    this.vehiculo = this.route.snapshot.data["respuesta"].datos.content[0];
    console.log(this.vehiculo)
    this.obtenerRegistros();
  }

  abrirPanel(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayPanel.toggle(event);
  }

  obtenerRegistros(): void {
    const POSICION_VERIFICACION: number = 0;
    const POSICION_REGISTRO_MTTO: number = 1;
    const POSICION_SOLICITUD_MTTO: number = 2;
    forkJoin([this.obtenerVerificacionInicial(), this.obtenerRegistroMantenimiento(), this.obtenerSolicitudMantenimiento()])
      .subscribe({
        next: (respuesta): void => {
          this.verificacion = respuesta[POSICION_VERIFICACION].datos[0] || null;
          this.registro = respuesta[POSICION_REGISTRO_MTTO].datos[0] || null;
          this.solicitudRegistro = respuesta[POSICION_SOLICITUD_MTTO].datos[0] || null;
        }
      })
  }

  obtenerVerificacionInicial(): Observable<HttpRespuesta<any>> {
    if (!this.vehiculo.ID_MTTOVERIFINICIO) {
      return of({datos: [], mensaje: '', codigo: 0, error: false});
    }
    return this.mantenimientoVehicularService.obtenerDetalleVerificacion(this.vehiculo.ID_MTTOVERIFINICIO);
  }

  obtenerSolicitudMantenimiento(): Observable<HttpRespuesta<any>> {
    if (!this.vehiculo.ID_MTTO_SOLICITUD) {
      return of({datos: [], mensaje: '', codigo: 0, error: false});
    }
    return this.mantenimientoVehicularService.obtenerDetalleSolicitud(this.vehiculo.ID_MTTO_SOLICITUD);
  }

  obtenerRegistroMantenimiento(): Observable<HttpRespuesta<any>> {
    if (!this.vehiculo.ID_MTTO_REGISTRO) {
      return of({datos: [], mensaje: '', codigo: 0, error: false});
    }
    return this.mantenimientoVehicularService.obtenerDetalleRegistro(this.vehiculo.ID_MTTO_REGISTRO);
  }
}
