import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";

@Injectable()
export class GenerarOrdenServicioService extends BaseService<HttpRespuesta<any>, any> {

  constructor(_http:HttpClient, private authService: AutenticacionService){
    super(_http, `${environment.api.mssivimss}`,"","",
      20,"","","");
  }

  obtenerCatalogoParentesco(): Observable<TipoDropdown[]> {
    const catalogo_parentesco = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_parentesco'));
    return of(mapearArregloTipoDropdown(catalogo_parentesco, "desc", "id"));
  }

  obtenerCatalogoPais(): Observable<TipoDropdown[]> {
    const catalogo_pais = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_pais'));
    return of(mapearArregloTipoDropdown(catalogo_pais, "desc", "id"));
  }

  obtenerCatalogoEstado(): Observable<TipoDropdown[]> {
    const catalogo_estados = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_estados'));
    return of(mapearArregloTipoDropdown(catalogo_estados, "desc", "id"));
  }

  obtenerCatalogosUnidadesMedicas(): Observable<TipoDropdown[]> {
  const catalogo_unidadesMedicas = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_unidadesMedicas'));
  return of(mapearArregloTipoDropdown(catalogo_unidadesMedicas, "desc", "id"));
  }

  consutaCP(cp:String): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/codigo-postal/`+ cp )
  }

  consultarCURP(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/buscar-filtros/orden-consultar-curp`,
      {curp:curp})
  }

  consultarRFC(rfc: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/buscar-filtros/orden-consultar-rfc`,
      {rfc:rfc})
  }
}

