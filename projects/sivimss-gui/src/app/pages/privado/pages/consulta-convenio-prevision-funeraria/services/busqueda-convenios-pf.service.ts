import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from './base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable} from 'rxjs';
import {AutenticacionService} from 'projects/sivimss-gui/src/app/services/autenticacion.service';

@Injectable({
  providedIn: 'root',
})
export class BusquedaConveniosPFServic extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.conveniosPF}`, '', '', '', '', '');
  }

  readonly _basePagos: string = environment.api.conveniosPSF;

  consultarConvenios(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/mis-convenios`, parametros);
  }

  detalleConvenio(idConvenio: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'convenio-pf/detalle-convenio/' + idConvenio);
  }

  consultarBeneficiariosPorPersona(objeto: any): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + `convenio-pf/empresa-persona-detalle-convenio/${objeto.idConvenio}/${objeto.idContratante}`
    );
  }

  descargarConvenio(parametros: any): Observable<Blob> {
    return this._http.post<Blob>(this._base + `convenio-pf/generarDocumentoNuevoPlan`,
      parametros, {responseType: 'blob' as 'json',});
  }

  actualizarBeneficiario(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/actualizar-beneficiario`, parametros);
  }

  parentesco(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'catalogo/parentesco');
  }

  buscarCurpRFC(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + 'convenio-pf/validar-curp-rfc', parametros);
  }

  altaBeneficiario(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/alta-beneficiario`, parametros);
  }

  desactivarBeneficiario(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/desactivar-beneficiario`, parametros);
  }

  buscarDatosGeneralesContratante(idVelatorio: Number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'convenio-pf/datos-generales-contratante/' + idVelatorio);
  }

  buscarPaquetes(idVelatorio: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'catalogo/paquetes/' + idVelatorio);
  }

  buscarPromotores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'catalogo/promotores');
  }

  buscarCodigoPostal(codigoPostal: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'consultar/codigo-postal/' + codigoPostal);
  }

  buscarPaises(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'consultar/paises');
  }

  agregarContratoPersona(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/alta-plan-pf/persona`, parametros);
  }

  estado(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'consultar/estados');
  }

  agregarPersona(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/alta-persona-empresa`, parametros);
  }

  agregarContratoEmpresa(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `convenio-pf/alta-plan-pf/empresa`, parametros);
  }

  consultarConvenioEmpresa(idConvenio: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `convenio-pf/empresa-convenio/${idConvenio}`)
  }

  consultarMatriculaSIAP(matricula: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `consultar/matricula/${matricula}`)
  }

  guardarDatosPago(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._basePagos + `/pago/online/crear`, body);
  }

  detalleReciboPago(folio: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._basePagos + `/pago/online/obtener/${folio}`)
  }

  descargar(folio: number): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json', Accept: 'application/json'});
    return this._http.get<any>(this._basePagos + `/pago/online/reporte/${folio}`,
      {headers, responseType: 'blob' as 'json'});
  }

  renovarConvenio(idConvenio: number): Observable<HttpRespuesta<any>> {
    const body = {idConvenio}
    return this._http.post<HttpRespuesta<any>>(environment.api.conveniosPF + 'convenio-pf/renovar-convenio', body);
  }
}
