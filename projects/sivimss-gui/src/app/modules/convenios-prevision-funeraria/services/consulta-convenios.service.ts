import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { BaseService } from 'projects/sivimss-gui/src/app/utils/base-service';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable } from 'rxjs';
import { AutenticacionService } from "../../../services/autenticacion.service";
import { FiltrosConvenio } from "../models/filtros-convenio.interface";

interface PeticionDescarga {
  tipoReporte: "pdf" | "xls"
}

@Injectable()
export class ConsultaConveniosService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar", "actualizar", 27, "consultar", "detalle", "estatus");
  }

  buscarPorFiltros(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consulta-general`, filtros,
      { params });
  }

  consultarConvenios(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-convenios`, filtros, { params });
  }

  consultarBeneficiarios(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-beneficiarios`, filtros, { params });
  }

  consultarAfiliados(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-afiliados`, filtros, { params });
  }

  consultarSiniestros(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-siniestros`, filtros, { params });
  }

  consultarVigencias(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-vigencias`, filtros, { params });
  }

  consultarFacturas(filtros: FiltrosConvenio, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-facturas`, filtros, { params });
  }

  descargarPDF<T>(body: T): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });

    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-tabla-convenios/generarDocumento/pdf`, body,
      { headers, responseType: 'blob' as 'json' })
  }

  descargarExcel<T>(body: T): Observable<Blob> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });

    return this._http.post<any>(this._base + `${this._funcionalidad}/reporte-tabla-convenios/generarDocumento/xls`, body,
      { headers, responseType: 'blob' as 'json' })
  }

  descargarListadoPagaresPDF(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body: PeticionDescarga = { tipoReporte: "pdf" }
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-servicio/generarDocumento/pdf`
      , body, { headers, responseType: 'blob' as 'json' });
  }

  descargarListadoPagaresExcel(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const body: PeticionDescarga = { tipoReporte: "xls" }
    return this._http.post<any>(this._base + `${this._funcionalidad}/imprimir-servicio/generarDocumento/pdf`
      , body, { headers, responseType: 'blob' as 'json' });
  }

}
