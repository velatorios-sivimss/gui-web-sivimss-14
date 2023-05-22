import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class MantenimientoVehicularService extends BaseService<HttpRespuesta<any>, any> {

  readonly _nivel: string = 'catalogo_nivelOficina';
  readonly _delegacion: string = 'catalogo_delegaciones';

  private vehiculo$ = new BehaviorSubject<any>({});
  vehiculoSeleccionado$ = this.vehiculo$.asObservable();

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "mtto-vehicular-agregar", "mtto-vehicular-modificar",
      40, "busqueda-vehiculos-mtto", "", "");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatorios(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: ConsultaVelatorio = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  obtenerCatalogoProvedores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/?servicio=cat-mtto-proveedores`);
  }

  buscarPorFiltros(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/buscar/busqueda-vehiculos-mtto`, {},
      {params});
  }

  override guardar(t: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/${this._agregar}`, t);
  }

  override buscarPorPagina(pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._paginado)
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2`, {params})
  }

  obtenerDetalleVerificacion(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", 'detalle-verificacion-inicio')
      .append("palabra", id)
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/buscar`, {params})
  }


  obtenerDetalleSolicitud(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", 'detalle-solicitud-mtto')
      .append("palabra", id)
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/buscar`, {params})
  }

  obtenerDetalleRegistro(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", 'detalle-registro-mtto')
      .append("palabra", id)
    return this._http.get<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/buscar`, {params})
  }

  override actualizar(t: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/${this._actualizar}`, t);
  }

  setVehiculo(vehiculo: any): void {
    this.vehiculo$.next(vehiculo);
  }

  obtenerRegistroVehiculo(idVehiculo: number): Observable<HttpRespuesta<any>> {
    const body = {idVehiculo}
    return this._http.post<HttpRespuesta<any>>(`http://localhost:8082/mssivimss-ctrol-permisos/sivimss/service/2/buscar/${this._paginado}`, body)
  }
}
