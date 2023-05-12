import { BaseService } from "../../../utils/base-service";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Observable, of } from "rxjs";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { BuscarVehiculosDisponibles } from "../models/control-vehiculos.interface";
import { EntradaVehiculo, SalidaVehiculo } from "../models/registro-vehiculo.interface";
import { GenerarReporteCalendar } from "../models/calendario-vehiculos.interface";

@Injectable()
export class ControlVehiculosService extends BaseService<HttpRespuesta<any>, any> {

  private auth_token2: string = "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjFcIixcImN2ZU1hdHJpY3VsYVwiOlwiMVwiLFwibm9tYnJlXCI6XCIxIDEgMVwiLFwiY3VycFwiOlwiMVwifSIsImlhdCI6MTY4MTgzMjQ3MCwiZXhwIjoxNjgyNDM3MjcwfQ.Loy9ImNDZYD7tcEa3NsRUBcWJkvrpU18i6aq8hxKuGE";

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "veri-registrar", "veri-salida",
      60, "", "veri-consulta-dia", "");
  }

  obtenerVehiculosDisponibles(buscar: BuscarVehiculosDisponibles): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/disp-vehiculos`, buscar);
  }

  obtenerVehiculosCalendario(buscar: BuscarVehiculosDisponibles): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/VehiculosDisponibles-Calendario`, buscar);
  }

  obtenerDatosVehiculo(idVehiculo: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/vehiculo-disponible`, { idVehiculo });
  }

  guardarEntrada(entradaVehiculo: EntradaVehiculo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/entrada-vehiculos`, entradaVehiculo);
  }

  guardarSalida(salidaVehiculo: SalidaVehiculo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/salida-vehiculos`, salidaVehiculo);
  }

  obtenerDatosFolioOds(idODS: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consulta-ods`, { idODS });
  }

  obtenerOperadores(idVehiculo: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consulta-operador`, { idVehiculo });
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8087/mssivimss-oauth/velatorio/consulta`, body);
  }

  consultarODS(folioODS: number): Observable<HttpRespuesta<any>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_token2}`, 'Content-Type': 'application/json' });
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar-filtros/veri-consulta-datos`, { folioODS: folioODS }, { headers });
  }

  consultarDetalleDia(idVehiculo: number, fecDia: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/detalle-vehiculo-dia`, { idVehiculo, fecDia });
  }

  generarReporteCalendar(generarReporteCalendar: GenerarReporteCalendar): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    return this._http.post<any>(this._base + `${this._funcionalidad}/buscar/gen-doc-vehiculos`
      , generarReporteCalendar, { headers, responseType: 'blob' as 'json' });
  }
}




