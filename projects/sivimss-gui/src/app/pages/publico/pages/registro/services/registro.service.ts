import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable } from 'rxjs';
import { IRegistrarContratante } from '../models/registro-contratante.interface';
import { ValidarRfcCurp } from '../../autenticacion/models/validar-rfc-curp.interface';
import { BaseService } from 'projects/sivimss-gui/src/app/utils/base-service';

@Injectable()
export class RegistroService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient) {
    super(_http, `${environment.api.loginContratante}`, "", "", 1, "", "", "");
  }

  registrarContratante(contratante: IRegistrarContratante): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${environment.api.loginContratante}/registrar/contratante`, contratante);
  }

  consutaCP(cp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/codigo-postal/` + cp
    );
  }

  obtenerPaises(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/pais`);
  }

  obtenerEstados(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/estado`);
  }

  validarCurpRfc(datos: ValidarRfcCurp): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${environment.api.loginContratante}/catalogos/consulta/rfc-curp`, datos);
  }

}
