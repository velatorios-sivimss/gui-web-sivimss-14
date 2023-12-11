import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { BaseService } from './base-service';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { AutenticacionService } from 'projects/sivimss-gui/src/app/services/autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class BusquedaEstatusOrdenesService extends BaseService<HttpRespuesta<any>,any> {

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.conveniosPF}`, '', '');
  }

  consultarOrdenes(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `ordenes-servicio/contratante`,
      parametros
    );
  }

  detalleOrden(idOrden: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'ordenes-servicio/ver-detalle/' + idOrden
    );
  }
}
