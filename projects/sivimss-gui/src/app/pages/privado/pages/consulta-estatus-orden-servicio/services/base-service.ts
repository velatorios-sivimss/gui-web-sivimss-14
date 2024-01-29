import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


export abstract class BaseService<T, ID> {
  protected constructor(
    protected _http: HttpClient,
    protected _base: string,
    protected _paginado: string,
    protected _detalle: string
  ) {}

  buscarPorId(id: ID): Observable<T> {
    // params = new HttpParams().append('servicio', this._detalle);
    return this._http.get<T>(this._base + `/` + id);
  }

  busquedaPaginado(t: any): Observable<T> {
    return this._http.post<T>(this._base, t);
  }
}
