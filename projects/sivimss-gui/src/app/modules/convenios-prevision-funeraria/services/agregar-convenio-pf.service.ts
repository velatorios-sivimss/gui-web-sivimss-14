import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

import {Observable, of} from "rxjs";
import {AutenticacionService} from "../../../services/autenticacion.service";

import {BaseService} from "../../../utils/base-service";

import {environment} from "../../../../environments/environment";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {ModeloGuardarPorEmpresa} from "../models/modelo-guardar-por-empresa.interface";
import {ModeloGuardarPorPersona} from "../models/modelo-guardar-por-persona.interface";
import {PlantillaControlSalida} from "../../consulta-donaciones/models/generar-plantilla-interface";

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

  consultaCURPRFC(rfc?:string, curp?: string): Observable<HttpRespuesta<any>>{
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/buscar-filtros/convenio-pf-validaCurpRfc`,
      {curp: curp, rfc:rfc})
  }

  consultarMatriculaSiap(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/siap/${matricula}`);
  }

  consutaCP(cp:number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/buscar-filtros/convenio-pf-consultar-cp`, {cp:cp} )
  }

  obtenerCatalogoParentesco(): Observable<TipoDropdown[]> {
    const catalogo_parentesco = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_parentesco'));
    return of(mapearArregloTipoDropdown(catalogo_parentesco, "desc", "id"));
  }

  consultarPaquetes(idVelatorio:number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/convenio-pf-paquetes`,{idVelatorio:idVelatorio});
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion:number): Observable<HttpRespuesta<any>>{
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }

  consultaPromotores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/catalogo/convenio-pf-promotores`);
  }

  consultarFolioConvenioEmpresa(folioConvenio:string):  Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/buscar-filtros/convenio-pf-buscar-folio-empresa`,{folioConvenio:folioConvenio});
  }

  consultarFolioPersona(folioConvenio:string):  Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base+`${this._funcionalidad}/buscar-filtros/convenio-pf-buscar-folio-persona`,{folioConvenio:folioConvenio});
  }

  guardarConvenioPorGrupoEmpresa(objetoEmpresa: ModeloGuardarPorEmpresa): Observable<HttpRespuesta<any>>{
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/convenio-pf-agregar-convenio-empresa`,objetoEmpresa);
  }

  guardarConvenioPorPersona(objetoPersona: ModeloGuardarPorPersona): Observable<HttpRespuesta<any>>{
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/convenio-pf-agregar-convenio-persona`,objetoPersona);
  }

  generarPlantilla(plantailla:PlantillaControlSalida): Observable<Blob> {
    return this._http.post<any>(
      this._base + `${this._funcionalidad}/convenio-pf-generar-pdf/generarDocumento/pdf`, plantailla,
      {responseType: 'blob' as any});
  }

}
