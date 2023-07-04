import {Injectable} from '@angular/core';
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {Observable} from "rxjs";

@Injectable()
export class GestionarPagoService extends BaseService<HttpRespuesta<any>, any> {

  private readonly _odsFolios: string = 'genpago-ods';
  private readonly _prevFunFolios: string = 'genpago-pf';
  private readonly _renPrevFunFolios: string = 'genpago-rpf';

  body = {velatorio: null}

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 66,
      'genpago-buscar', '', '');
  }

  consultarFoliosODS(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._odsFolios}`, this.body);
  }

  consultarFoliosPrevFun(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._prevFunFolios}`, this.body);
  }

  consultarFoliosRenPrevFun(): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/${this._renPrevFunFolios}`, this.body);
  }
}
