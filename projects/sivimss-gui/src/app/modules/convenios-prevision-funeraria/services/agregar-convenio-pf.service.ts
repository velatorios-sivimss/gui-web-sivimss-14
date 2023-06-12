import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {Observable, of} from "rxjs";
import {AutenticacionService} from "../../../services/autenticacion.service";

import {BaseService} from "../../../utils/base-service";

import {environment} from "../../../../environments/environment";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";

@Injectable()
export class AgregarConvenioPFService extends BaseService<HttpRespuesta<any>,any> {
  constructor(_http: HttpClient, private  authService: AutenticacionService) {
  super(_http, `${environment.api.mssivimss}`, "agregar", "actualizar", 28,
    "consultar", "detalle", "estatus");
  }
  obtenerCatalogoPaises(): Observable<TipoDropdown[]> {
    const paises = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_pais'));
    return of(mapearArregloTipoDropdown(paises, "desc", "id"));
  }

  obtenerCatalogoEstados():Observable<TipoDropdown[]> {
    const estados = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_estados'));
    return of(mapearArregloTipoDropdown(estados, "desc", "id"));
  }

  consultaCURP(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-contratante-curp`,
      {curp: curp});
  }

  consultaRFC(rfc: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-contratante-rfc`,
      {rfc: rfc});
  }

  consutaCP(cp:String): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/codigo-postal/`+ cp )
  }

  obtenerCatalogoParentesco(): Observable<TipoDropdown[]> {
    const catalogo_parentesco = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_parentesco'));
    return of(mapearArregloTipoDropdown(catalogo_parentesco, "desc", "id"));
  }


}