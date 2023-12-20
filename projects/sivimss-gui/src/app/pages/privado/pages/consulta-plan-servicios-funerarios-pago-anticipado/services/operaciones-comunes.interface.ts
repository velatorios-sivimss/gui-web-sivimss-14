import { Observable } from "rxjs";

export interface OperacionesComunes<T, ID> {
    guardar(t: T): Observable<T>;
    actualizar(t: T): Observable<T>;
    buscarPorId(id: ID): Observable<T>;
}
