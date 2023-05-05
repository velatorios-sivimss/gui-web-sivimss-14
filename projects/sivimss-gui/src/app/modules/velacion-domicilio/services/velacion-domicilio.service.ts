import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BaseService } from "../../../utils/base-service";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { environment } from "projects/sivimss-gui/src/environments/environment";
import { Observable, of } from "rxjs";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";

@Injectable()
export class VelacionDomicilioService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "crear", "modificar",
      58, "consultar", "detalle", "cambiar-estatus");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vales-salida-filtros`, filtros, { params });
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vales-salida`, {}, { params });
  }


  buscarTodasOdsGeneradas(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/consultar-vs-folios-osd`);
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8079/mssivimss-oauth/velatorio/consulta`, body);
  }
}
