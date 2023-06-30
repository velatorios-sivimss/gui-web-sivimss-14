import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable } from 'rxjs';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { BaseService } from '../../../utils/base-service';

@Injectable()
export class ContratantesService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient) {
    super(_http, `${environment.api.mssivimss}`, "agregar-contratante", "actualizar-contratante",
      11, "usr-contratantes", "detalle-contratante", "cambiar-estatus");
  }

  // Buscar Contratantes
  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  // Detalle Contratante
  obtenerDetalleContratante(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  // Actualizar - BASE , actualizar

  // Cambiar estatus - BASE , cambiarEstatus

  descargarReporteTabla(datosBusqueda: any): Observable<Blob> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-cat-usr-contra/generarDocumento/pdf`
      , datosBusqueda, { responseType: 'blob' as 'json' });
  }

  obtenerCatalogoTiposMateriales(): Observable<HttpRespuesta<any>> {
    const params = new HttpParams().append("servicio", "art-tipo-materiales")
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo`, { params });
  }
}
