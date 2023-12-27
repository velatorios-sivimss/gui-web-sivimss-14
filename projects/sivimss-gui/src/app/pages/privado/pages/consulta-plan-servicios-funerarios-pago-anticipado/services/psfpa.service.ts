import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { BaseService } from './base-service';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable } from 'rxjs';
import { AutenticacionService } from 'projects/sivimss-gui/src/app/services/autenticacion.service';

@Injectable({
  providedIn: 'root',
})
export class PSFPAService extends BaseService<
  HttpRespuesta<any>,
  any
> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.conveniosPF}`, '', '', '', '', '');
  }

  consultarConvenios(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `convenio-pf/mis-convenios`,
      parametros
    );
  }

  detalleConvenio(idConvenio: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'convenio-pf/detalle-convenio/' + idConvenio
    );
  }

  descargarConvenio(parametros: any): Observable<Blob> {
  return this._http.post<Blob>(
      this._base + `convenio-pf/generarDocumentoNuevoPlan`,
      parametros,
      {
        responseType: 'blob' as 'json',
      }
    );
  }

  parentesco(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'catalogo/parentesco'
    );
  }

  buscarCurpRFC(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + 'convenio-pf/validar-curp-rfc',
      parametros
    );
  }

  buscarDatosGeneralesContratante(
    idVelatorio: Number
  ): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'convenio-pf/datos-generales-contratante/' + idVelatorio
    );
  }

  buscarPaquetes(idVelatorio: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'catalogo/paquetes/' + idVelatorio
    );
  }

  buscarPromotores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'catalogo/promotores'
    );
  }
  buscarCodigoPostal(codigoPostal: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      this._base + 'consultar/codigo-postal/' + codigoPostal
    );
  }

  buscarPaises(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + 'consultar/paises');
  }

  agregarContratoPersona(parametros: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(
      this._base + `convenio-pf/alta-plan-pf/persona`,
      parametros
    );
  }
}
