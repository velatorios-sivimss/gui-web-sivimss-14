import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from 'projects/sivimss-gui/src/app/utils/base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable, of} from 'rxjs';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { AutenticacionService } from '../../../services/autenticacion.service';

@Injectable()
export class SolicitudesPagoService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-solipagos", "", 65, "consultar-solipagos", "detalle-solipagos", "");
  }

  private readonly _filtros: string = 'buscar-solipagos';

  obtenerCatalogoEjercicios(): Observable<HttpRespuesta<any>> {
    const servicio =  "ejercicios-solipagos";
    const params = new HttpParams().append("servicio", servicio);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, { params });
  }

  obtenerCatalogoTipoSolicitud(): Observable<HttpRespuesta<any>> {
    const servicio =  "tipsolic-solipagos";
    const params = new HttpParams().append("servicio", servicio);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, { params });
  }
  
  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._filtros}`, filtros,
      {params});
  }

  detalleSolicitudPago(idSolicitud: number): Observable<HttpRespuesta<any>> {
    const body = {idSolicitud}
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._detalle}`, body);
  }

}
