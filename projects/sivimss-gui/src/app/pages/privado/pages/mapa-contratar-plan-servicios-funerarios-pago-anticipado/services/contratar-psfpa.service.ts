import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable } from 'rxjs';
import { BaseService } from 'projects/sivimss-gui/src/app/utils/base-service';
import { ContratarPlanSFPA } from '../models/servicios-funerarios.interface';

interface ValidarRfcCurp {
  rfc?: string | null;
  curp?: string | null;
}

@Injectable()
export class ContratarPSFPAService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient) {
    super(_http, `${environment.api.conveniosPSF}`, "", "", 1, "", "", "");
  }

  insertarPlanSFPA(datos: ContratarPlanSFPA): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}/linea-plan-sfpa/crear`, datos);
  }

  obtenerListadoPlanes(cveUsuario: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}/linea-plan-sfpa/consulta-detalle-linea-plan-sfpa`, { cveUsuario });
  }

  obtenerDetalle(idPlanSfpa: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${this._base}/linea-plan-sfpa/ver-detalle-linea-plan-sfpa`, { idPlanSfpa });
  }

  consutaCP(cp: string): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(
      `${environment.api.servicios_externos}consultar/codigo-postal/` + cp
    );
  }

  obtenerPaquetes(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}/linea-plan-sfpa/consulta-paquetes`);
  }

  obtenerPromotores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}/linea-plan-sfpa/consulta-promotores`);
  }
}
