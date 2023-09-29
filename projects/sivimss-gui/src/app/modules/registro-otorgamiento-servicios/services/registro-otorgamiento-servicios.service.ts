import {HttpRespuesta} from '../../../models/http-respuesta.interface';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AutenticacionService} from '../../../services/autenticacion.service';
import {environment} from '../../../../environments/environment';
import {BaseService} from '../../../utils/base-service';
import {Observable} from 'rxjs';

@Injectable()
export class RegistroOtorgamientoServiciosService extends BaseService<
  HttpRespuesta<any>,
  any
> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 53, '', '', '');
  }

  consultarPorFolio(folio: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/admin-consultar-historial`,
      {folio: folio}
    );
  }

  consultarTiposServicios(
    idOrdenServicio: number
  ): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/admin-consultar-tipos-servicios`,
      {idOrdenServicio: idOrdenServicio}
    );
  }

  nuevoOTorgamiento(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/admin-guardar-situar-servicio`,
      datos
    );
  }

  quitarOTorgamiento(datos: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `${this._funcionalidad}/admin-quitar-situar-servicio`,
      datos
    );
  }
}
