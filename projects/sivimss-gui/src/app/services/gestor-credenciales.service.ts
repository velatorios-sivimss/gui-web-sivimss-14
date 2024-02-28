import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {HttpRespuesta} from "../models/http-respuesta.interface";
import {BaseService} from "../utils/base-service";

@Injectable()
export class GestorCredencialesService extends BaseService<HttpRespuesta<any>, any> {

  constructor(_http: HttpClient) {
    super(_http, `${environment.api.conveniosPSF}`, "", "", 1, "", "", "");
  }

  obtenerToken(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}/linea-plan-sfpa/consulta-pago-api/` );
  }

}
