import { Injectable } from '@angular/core';
import { BaseService } from '../../../utils/base-service';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { BuscarCatalogo, BuscarGenerarFormatoActividades } from '../models/generar-formato-actividades.interface';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';
import { AutenticacionService } from '../../../services/autenticacion.service';

interface ConsultaVelatorio {
  idDelegacion: string | null
}

@Injectable()
export class GenerarFormatoActividadesService extends BaseService<HttpRespuesta<any>, any> {
  private readonly _nivel: string = 'catalogo_nivelOficina';
  private readonly _delegacion: string = 'catalogo_delegaciones';

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "insertar-generar-formato-actividades", "modificar-generar-formato-actividades",
      15, "catalogo-generar-formato-actividades", "detalle-generar-formato-actividades", "cambiar-estatus");
  }

  buscarPorFiltros(filtros: BuscarGenerarFormatoActividades, pagina: number, tamanio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio);
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros, { params });
  }

  obtenerGenerarFormatoActividades(filtros: BuscarGenerarFormatoActividades): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/${this._paginado}`, filtros);
  }

  obtenerDetalleGenerarFormatoActividades(id: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
      .append("palabra", id);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  velatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body: ConsultaVelatorio = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }

  obtenerCatalogos(buscarCatalogo: BuscarCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/nombre-promotor`, buscarCatalogo);
  }

  obtenerCatalogoEstados(): Observable<TipoDropdown[]> {
    const estados = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_estados'));
    return of(mapearArregloTipoDropdown(estados, "desc", "id"));
  }
}
