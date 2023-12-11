import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable()
export class SeguimientoNuevoConvenioService extends BaseService<HttpRespuesta<any>, any> {

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "", "",
      77, "", "", "");
  }

  base: string = 'http://localhost:8077/mssivimss-pre-reg-conven/v1/sivimss';
  _filtros: string = 'preregistros';

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const body = {pagina, tamanio, ...filtros}
    return this._http.post<HttpRespuesta<any>>(this.base + `/buscar/${this._filtros}`,
      body);
  }
}
