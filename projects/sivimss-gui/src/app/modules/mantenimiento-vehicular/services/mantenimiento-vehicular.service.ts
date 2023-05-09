import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";

@Injectable()
export class MantenimientoVehicularService extends BaseService<HttpRespuesta<any>, any> {

  constructor(override _http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "mtto-vehicular-agregar", "",
      40, "busqueda-vehiculos-mtto", "", "");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
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
}
