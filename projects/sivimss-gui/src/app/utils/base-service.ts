import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {OperacionesComunes} from './operaciones-comunes.interface';

export abstract class BaseService<T, ID> implements OperacionesComunes<T, ID> {

  protected constructor(
    protected _http: HttpClient,
    protected _base: string,
    protected _agregar: string,
    protected _actualizar: string,
    protected _funcionalidad: number,
    protected _paginado: string,
    protected _detalle: string,
    protected _estatus: string
  ) {
  }

  guardar(t: any): Observable<T> {
    return this._http.post<T>(this._base + `${this._funcionalidad}/${this._agregar}`, t);
  }

  actualizar(t: any): Observable<T> {
    return this._http.put<T>(this._base + `${this._funcionalidad}/${this._actualizar}`, t);
  }

  cambiarEstatus(id: any): Observable<T> {
    return this._http.put<T>(this._base + `${this._funcionalidad}/${this._estatus}`, id);
  }

  buscarPorId(id: ID): Observable<T> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
    return this._http.get<T>(this._base + `${this._funcionalidad}/` + id, {params});
  }

  buscarPorPagina(pagina: number, tamanio: number): Observable<T> {
    const params = new HttpParams()
      .append("pagina", pagina)
      .append("tamanio", tamanio)
      .append("servicio", this._paginado)
    return this._http.get<T>(this._base + `${this._funcionalidad}`, {params})
  }

}
