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

  _filtros: string = 'buscar-preregistros';
  _paquetes: string = 'buscar-paquetes';
  _baseParentesco: string = environment.api.conveniosPF;

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._filtros}`,
      filtros, {params});
  }

  buscarConvenioPorPersona(idConvenio: number, idFLujo: number): Observable<HttpRespuesta<any>> {
    const body = +idFLujo === 2 ? {idFLujo, idConvenio, seccion: 1} : {idFLujo, idConvenio};
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/buscar-detalle-preregistros`, body);
  }

  buscarConvenioPorSeccion(idConvenio: number, idFLujo: number, seccion: number): Observable<HttpRespuesta<any>> {
    const body = {idFLujo, idConvenio, seccion};
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/buscar-detalle-preregistros`, body);
  }

  buscarBeneficiarioPorPersona(id: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}/buscar/beneficiarios/${id}`);
  }

  obtenerCatalogoPaquetes(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar/${this._paquetes}`, {});
  }

  cambiarEstatusConvenio(idConvenio: number, idFLujo: number): Observable<HttpRespuesta<any>> {
    const body = {idFLujo, idConvenio};
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/activar-desactivar`, body);
  }

  validaRFCCurp(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/validar-rfc-curp`, body);
  }

  consutaCP(cp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/codigo-postal/` + cp);
  }

  consultarNSS(nss: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/nss/` + nss);
  }

  consultarMatriculaSiap(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/siap/${matricula}`);
  }

  obtenerCatalogoPromotores(): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append('servicio', 'buscar-promotores')
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}`, {params});
  }

  obtenerCatalogoParentesco(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._baseParentesco + 'catalogo/parentesco');
  }

  guardarConvenioPorPersona(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/actu-datos-conve-persona`, body);
  }

  guardarPlanPA(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/actu-datos-conve-pa`, body);
  }
}
