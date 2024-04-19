import { Injectable } from '@angular/core';
import { BaseService } from '../../../utils/base-service';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { BuscarCatalogo, BuscarPromotores } from '../models/promotores.interface';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { AutenticacionService } from '../../../services/autenticacion.service';

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class PromotoresService extends BaseService<HttpRespuesta<any>, any> {
  private readonly _nivel: string = 'catalogo_nivelOficina';
  private readonly _delegacion: string = 'catalogo_delegaciones';

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "insertar-promotor", "modificar-promotor",
      15, "catalogo-promotor", "detalle-promotor", "cambiar-estatus");
  }

  buscarPorFiltros(filtros: BuscarPromotores, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  obtenerPromotores(filtros: BuscarPromotores): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros);
  }

  obtenerDetallePromotor(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeCookies((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  velatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: ConsultaVelatorio = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  obtenerCatalogos(buscarCatalogo: BuscarCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/nombre-promotor`, buscarCatalogo);
  }

  obtenerCatalogoEstados():Observable<TipoDropdown[]> {
    const estados = this.authService.obtenerCatalogoDeCookies(('catalogo_estados'));
    return of(mapearArregloTipoDropdown(estados, "desc", "id"));
  }
}
