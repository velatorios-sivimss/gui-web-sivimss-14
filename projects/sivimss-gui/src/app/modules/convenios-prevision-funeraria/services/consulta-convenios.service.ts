import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from 'projects/sivimss-gui/src/app/utils/base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable, of} from 'rxjs';
import { AutenticacionService } from "../../../services/autenticacion.service";

interface PeticionDescarga {
  tipoReporte: "pdf" | "xls"
}

@Injectable()
export class ConsultaConveniosService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar", "actualizar", 22, "consultar", "detalle", "estatus");
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/buscar-serv`, filtros,
      {params});
  }

  descargarListadoPagaresPDF(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body: PeticionDescarga = { tipoReporte: "pdf"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-servicio/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }

  descargarListadoPagaresExcel(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body: PeticionDescarga = { tipoReporte: "xls"}
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-servicio/generarDocumento/pdf`
      , body, {headers, responseType: 'blob' as 'json'});
  }

}
