import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {SolicitudesPagoService} from './solicitudes-pago.service';
import {HttpRespuesta} from "../../../models/http-respuesta.interface";

@Injectable()
export class SolicitudesPagoResolver implements Resolve<any> {

  constructor(private solicitudesPagoService: SolicitudesPagoService) {
  }

  resolve(): Observable<any> {
    const ejercicios$: Observable<HttpRespuesta<any>> = this.solicitudesPagoService.obtenerCatalogoEjercicios();
    const tipoSolicitudes$: Observable<HttpRespuesta<any>> = this.solicitudesPagoService.obtenerCatalogoTipoSolicitud();
    const catalogoVelatorio$: Observable<HttpRespuesta<any>> = this.solicitudesPagoService.obtenerCatalogoVelatorios();
    const catalogoUnidad$: Observable<HttpRespuesta<any>> = this.solicitudesPagoService.obtenerCatalogoUnidadesAdmon();
    const catalogoBanco$: Observable<HttpRespuesta<any>> = this.solicitudesPagoService.obtenerCatalogoDatosBanco();
    return forkJoin([ejercicios$, tipoSolicitudes$, catalogoVelatorio$, catalogoUnidad$, catalogoBanco$])
  }
}
