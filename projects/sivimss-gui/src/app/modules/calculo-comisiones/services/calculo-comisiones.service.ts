import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {BaseService} from 'projects/sivimss-gui/src/app/utils/base-service';
import {environment} from 'projects/sivimss-gui/src/environments/environment';
import {Observable, of} from 'rxjs';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { AutenticacionService } from '../../../services/autenticacion.service';

@Injectable()
export class CalculoComisionesService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-rec-pagos", "", 47, "consulta-comisiones", "", "");
  }

  private readonly _promotores: string = 'listprom-comisiones';
  private readonly _filtros: string = 'buscar-comisiones';

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  buscarPorFiltros(filtros: any, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params: HttpParams = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._filtros}`, filtros,
      {params});
  }
  
  obtenerDetallePromotor(idComision: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${idComision}?servicio=detalle-comisiones`);
  }

  obtenerDetalleODS(idComision: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${idComision}?servicio=ordenes-comisiones`);
  }

  obtenerDetalleConveniosPF(idComision: number): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${idComision}?servicio=convenios-comisiones`);
  }

  obtenerDetalleComisiones(body: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detcomi-comisiones`,body);
  }

  obtenerPromotores(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${this._base}${this._funcionalidad}?servicio=listprom-comisiones`);
  }


}
