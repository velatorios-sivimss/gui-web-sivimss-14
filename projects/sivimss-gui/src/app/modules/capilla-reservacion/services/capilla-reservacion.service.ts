import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { BaseService } from "../../../utils/base-service";
import { environment } from "projects/sivimss-gui/src/environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AutenticacionService} from "../../../services/autenticacion.service";


@Injectable()
export class CapillaReservacionService extends BaseService<HttpRespuesta<any>, any> {

  private auth_tokenCap: string = "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiOTkwOTYzNjNcIixcIm5vbWJyZVwiOlwiMSAxIDFcIixcImN1cnBcIjpcIjFcIn0iLCJpYXQiOjE2ODIzNTI1ODYsImV4cCI6MTY4Mjk1NzM4Nn0.HJ38iHcLT-9Oz0BouCq373LLv0qhO-OUqfiFq-piI_0";


  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "registrar-entrada", "art-modificar",
      31, "art-buscar", "art-detalle", "art-cambiar-estatus");
  }


  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json' });
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  buscarTodosPorFiltros(filtros: any): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json' });
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/art-buscar-general`, filtros );
  }


  registrarSalida(t: any): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/registrar-salida`, t);
  }



  obtenerCatalogoCapillasDisponibles(): Observable<HttpRespuesta<any>> {
    let velatorios = 'DOCTORES'
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json' });
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/capillas-disponibles`, velatorios);
  }



  obtenerCatalogoVelatorios(): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json' });
    const params = new HttpParams().append("servicio", "catalogo")
    debugger;
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }


  buscarCapillasPorIdVelatorio(id: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    const params = new HttpParams()
      .append("servicio", this._detalle)
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}` + id, { params});
  }

  consultarODS(folioODS: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    const params = new HttpParams()
      .append("servicio", 'buscar-ods')
      .append("palabra", folioODS);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`,{ params});
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  buscarPorIdVelatorio(id: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    const params = new HttpParams().append("servicio", "capillas-disponibles").append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, { params});
  }

  capillaOcupadaPorIdVelatorio(id: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    const params = new HttpParams().append("servicio", "capillas-ocupadas").append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}/buscar`, { params});
  }


  consultarCapillas(parametros: any): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/disponibilidad`, parametros);
  }

  consultaMes(mes: string,anio: string, idVelatorio: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-consulta-mes`,
      {"mes":mes,"anio":anio,"idVelatorio":idVelatorio});
  }

  consultaDetallePorDia(fecha: string, idCapilla: number): Observable<HttpRespuesta<any>> {
    const body = {fecha: fecha, idCapilla:idCapilla};
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/detalle`,
      body);
  }

  generarReporte(filtroArchivo:any): Observable<Blob> {
    const tipo = filtroArchivo.tipoReporte;
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    return this._http.post<any>(this._base + `${this._funcionalidad}/generarPdf/generarDocumento/` + tipo,
      {idVelatorio:filtroArchivo.idVelatorio,mes:filtroArchivo.mes,anio:filtroArchivo.anio,
        rutaNombreReporte:filtroArchivo.rutaNombreReporte,
        tipoReporte:filtroArchivo.tipoReporte},
      { responseType: 'blob' as any});
  }

  generarFormatEntregaCapilla(filtro: any): Observable<Blob> {
    //  entregaCapilla/generarDocumento/pdf
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json'});
    return this._http.post<any>(this._base + `${this._funcionalidad}/entregaCapilla/generarDocumento/pdf`,
      {idCapilla:filtro.idCapilla,folioOds:filtro.folioOds,
        rutaNombreReporte:filtro.rutaNombreReporte,
        tipoReporte:filtro.tipoReporte},
      { responseType: 'blob' as any});
  }

}
