import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OperacionesComunes } from './operaciones-comunes.interface';

export abstract class BaseService<T, ID> implements OperacionesComunes<T, ID> {
  protected constructor(
    protected _http: HttpClient,
    protected _base: string,
    protected _agregar: string,
    protected _actualizar: string,
    protected _paginado: string,
    protected _detalle: string,
    protected _estatus: string
  ) {}

  guardar(t: any): Observable<T> {
    return this._http.post<T>(this._base + `/${this._agregar}`, t);
  }

  actualizar(t: any): Observable<T> {
    return this._http.put<T>(this._base + `/${this._actualizar}`, t);
  }

  buscarPorId(id: ID): Observable<T> {
    const params = new HttpParams().append('servicio', this._detalle);
    return this._http.get<T>(this._base + `/` + id, {
      params,
    });
  }

  busquedaPaginado(t: any): Observable<T> {
    return this._http.post<T>(this._base, t);
  }
}
