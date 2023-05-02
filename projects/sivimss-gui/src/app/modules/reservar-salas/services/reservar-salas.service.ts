import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class ReservarSalasService extends  BaseService<HttpRespuesta<any>, any> {

  private auth_token2: string = "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiMVwiLFwibm9tYnJlXCI6XCIxIDEgMVwiLFwiY3VycFwiOlwiMVwifSIsImlhdCI6MTY4MTgzMjQ3MCwiZXhwIjoxNjgyNDM3MjcwfQ.Loy9ImNDZYD7tcEa3NsRUBcWJkvrpU18i6aq8hxKuGE";

  constructor( _http: HttpClient,private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`,"veri-registrar","veri-salida",
      1,"","veri-consulta-dia","");
  }

  obtenerCatalogoVelatorio(): Observable<HttpRespuesta<any>>{
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.get<HttpRespuesta<any>>(this._base + `consultaVelatorio/1`, { headers});
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8079/mssivimss-oauth/velatorio/consulta`, body);
  }

  consultarSalas(idVelatorio?: number,tipoSala?: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-buscar`,{idVelatorio:idVelatorio, tipoSala:tipoSala}, { headers});
  }

  consultarODS(folioODS: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-consulta-datos`,{folioODS:folioODS}, { headers});
  }

  consultarDetalleDia(fechaConsulta:string, idSala:number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-consulta-dia`,{fechaConsulta:fechaConsulta,idSala:idSala}, { headers});
  }

  consultaMes(mes: number,anio: number, tipoSala: number, idVelatorio: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-consulta-mes`,
      {"mes":mes,"anio":anio,"tipoSala":tipoSala,"idVelatorio":idVelatorio}, { headers});
  }

  generarReporte(filtroArchivo:any): Observable<Blob> {
    const tipo = filtroArchivo.tipoReporte;
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.post<any>(this._base + `${this._funcionalidad}/veri-reporte/generarDocumento/` + tipo,
      {idVelatorio:filtroArchivo.idVelatorio,indTipoSala:filtroArchivo.indTipoSala,
        mes:filtroArchivo.mes,anio:filtroArchivo.anio,rutaNombreReporte:filtroArchivo.rutaNombreReporte,
        tipoReporte:filtroArchivo.tipoReporte},
      { responseType: 'blob' as any});
  }
}




