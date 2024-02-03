import {Injectable} from "@angular/core";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {Observable} from "rxjs";
import {RegistrarPago} from "../models/registrar-pago.interface";

@Injectable()
export class DetallePagoService extends BaseService<HttpRespuesta<any>, any>{
  constructor( _http: HttpClient,private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`,"","",
      61,"","","");
  }

  // obtenerVelatorios(idPlan:number): Observable<HttpRespuesta<any>> {
  //   const body = { idPlan: idPlan }
  //   return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-buscar`, body);
  // }

  obtenerCatalogoTipoPago(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/pago-anticipado-metodos-pago`)
  }

  obtenerDetallePago(idPlan: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base +
      `${this._funcionalidad}/buscar-filtros/pago-anticipado-obtener-detalle`, {idPlan: idPlan});
  }

  guardarPago(pago:RegistrarPago): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base +
      `${this._funcionalidad}/pago-anticipado-registrar-pago`, pago)
  }

  modificarPago(pago:RegistrarPago): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(this._base +
      `${this._funcionalidad}/pago-anticipado-modificar-pago`, pago)
  }

  desactivarPago(bitacora: any): Observable<HttpRespuesta<any>> {
    return this._http.put<HttpRespuesta<any>>(this._base +  `${this._funcionalidad}/pago-anticipado-desactivar-pago`,
      bitacora)
  }

  reciboParcialidades(objeto:any): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/pago-anticipado-generar-parcialidades/generarDocumento/${objeto.tipoReporte}`,
      objeto, {headers, responseType: 'blob' as 'json'})
  }

  reciboPago(objeto:any):Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/pago-anticipado-generar-recibo-pago/generarDocumento/pdf`,
      objeto, {headers, responseType: 'blob' as 'json'})
  }

  obtenerDetalleBitacoraPago(idPagoSFPA: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base +
      `${this._funcionalidad}/buscar-filtros/pago-anticipado-bitacora-pago`, {idPagoParcialidad: idPagoSFPA});
  }
}
