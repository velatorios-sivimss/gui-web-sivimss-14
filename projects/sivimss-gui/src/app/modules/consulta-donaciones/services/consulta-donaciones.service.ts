import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { environment } from "projects/sivimss-gui/src/environments/environment";
import { BaseService } from "../../../utils/base-service";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { Observable, of } from "rxjs";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";
import {GuardarAgregarDonacion} from "../models/consulta-donaciones-interface";
import {AgregarSalidaDonacionInterface} from "../models/agregar-salida-donacion-interface";
import {PlantillaAceptarDonacion, PlantillaControlSalida} from "../models/generar-plantilla-interface";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class ConsultaDonacionesService extends BaseService<HttpRespuesta<any>, any> {
  private auth_token2: string = "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiMVwiLFwibm9tYnJlXCI6XCIxIDEgMVwiLFwiY3VycFwiOlwiMVwifSIsImlhdCI6MTY4MzA0Mzk0OCwiZXhwIjoxNjgzNjQ4NzQ4fQ.lzgUw1U3115meofhWZXrYCDMaxP9QFAYpZ6yEbhRGZE";


  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "consultar-donados", "consu-filtrodonados",
      64, "consultar-donados", "consultar-velatorio", "consultar-nivel");
  }

  buscarAtaudesPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json' });
    const params = new HttpParams().append("pagina", pagina).append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consu-filtrodonados`, filtros, {  params });
    // return this._http.post<HttpRespuesta<any>>(this._base + `1/buscar/buscar-usuarios`, filtros, {headers, params});
  }

  exportarArchivo(tipoArchivo: any,):  Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json' });
    const params = new HttpParams().append("servicio", "generarDocumento")
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/generarDocumento`, tipoArchivo, {  params });
  }

  obtenerCatalogoataudes(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    const params = new HttpParams().append("servicio", "consultar-donados").append("pagina", pagina).append("tamanio", tamanio)
    return this._http.get<HttpRespuesta<any>>(this._base + `1`, { params})
  }



  actualizarAtaudes(capilla: any): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json'});
    return this._http.put<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._actualizar}`, capilla);
  }



  obtenerCatalogoVelatorios(): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json' });
    const params = new HttpParams().append("servicio", "consultar-velatorio")
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, {  params });
  }

  obtenerCatalogoNiveles():  Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json' });
    const params = new HttpParams().append("servicio", "consultar-nivel")
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, {  params });
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion:number): Observable<HttpRespuesta<any>>{
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }


}
