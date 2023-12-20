import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable } from 'rxjs';
import { BaseService } from 'projects/sivimss-gui/src/app/utils/base-service';

interface ValidarRfcCurp {
  rfc?: string | null;
  curp?: string | null;
}

@Injectable()
export class ContratarPSFPAService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient) {
    super(_http, `${environment.api.loginContratante}`, "", "", 1, "", "", "");
  }

  consutaCP(cp: string): Observable<any> {
    return this._http.get<any>(
      `http://serviciosdigitalesinterno-stage.imss.gob.mx/serviciosDigitales-rest/v1/domicilios/asentamientos/codigoPostal/` + cp
    );
  }

  obtenerPaises(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/pais`);
  }

  obtenerEstados(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/estado`);
  }

  obtenerPromotores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/promotores`);
  }

  validarCurpRfc(datos: ValidarRfcCurp): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/rfc-curp`, datos);
  }

}
