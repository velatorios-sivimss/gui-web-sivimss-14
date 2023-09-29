import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {AgregarPlanSFPA} from "../models/servicios-funerarios.interface";

@Injectable()
export class ServiciosFunerariosService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 67, '', '', '');
  }

  insertarPlanSFPA(planSFPA: AgregarPlanSFPA): Observable<HttpRespuesta<any>> {
  return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/inserta-plan-sfpa`,planSFPA);
  }

  consultarPlanSFPA(idPlanSfpa: number): Observable<HttpRespuesta<any>>{
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-detalle-plan-sfpa`,
      {idPlanSfpa:idPlanSfpa});
  }

  consultarNumeroPagos(idPlanSfpa: number): Observable<HttpRespuesta<any>>{
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-numero-pago-plan-sfpa`,
      {idPlanSfpa:idPlanSfpa});
  }

  obtenerCatalogoPais(): Observable<TipoDropdown[]> {
    const catalogo_pais = this.authService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    return of(mapearArregloTipoDropdown(catalogo_pais, 'desc', 'id'));
  }

  obtenerCatalogoEstados(): Observable<TipoDropdown[]> {
    const catalogo_estados = this.authService.obtenerCatalogoDeLocalStorage('catalogo_estados');
    return of(mapearArregloTipoDropdown(catalogo_estados, 'desc', 'id'));
  }

  obtenerCatalogoNumeroPagos(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/consulta-tipo-pago-mensual`);
  }

  obtenerCatalogoPaquetes(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/consulta-paquetes`);
  }

  consultarCURP(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-contratante-curp`,
      {curp:curp});
  }

  consultarRFC(rfc: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-contratante-rfc`,
      {rfc:rfc});
  }

  consultarMatriculaSiap(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/siap/${matricula}`);
  }

  consultarNSS(nss: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/nss/` + nss
    );
  }

  consutaCP(cp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/codigo-postal/` + cp
    );
  }

  validarAfiliado(curp: string, rfc: string, nss: string): Observable<HttpRespuesta<any>> {
    let objetoValidar:{curp?: string,rfc?: string, nss?: string} = {curp:curp,rfc:rfc,nss:nss};
    if(curp==="")delete objetoValidar.curp
    if(rfc==="")delete objetoValidar.rfc
    if(nss==="")delete objetoValidar.nss
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/consulta-valida-afiliado`,
      objetoValidar);
  }

}
