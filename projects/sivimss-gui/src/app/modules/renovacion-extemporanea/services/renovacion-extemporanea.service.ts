import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { environment } from "projects/sivimss-gui/src/environments/environment";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { BaseService } from "../../../utils/base-service";
import {
  ConveniosPrevision
} from "../models/convenios-prevision.interface";

@Injectable()
export class RenovacionExtemporaneaService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "generar-renovacion-ext", "actualizar", 71,
      "renovacion-ext", "detalle-renovacion-ext", "estatus");
  }

  buscarPorFiltros(filtros: ConveniosPrevision, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  obtenerDetalleConvenio(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  obtenerNombreContratantes(filtros: ConveniosPrevision): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._agregar}`, filtros);
  }
}