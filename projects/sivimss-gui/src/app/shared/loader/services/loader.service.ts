import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, finalize, tap } from 'rxjs/operators';


@Injectable()
export class LoaderService {

  /**
   * Para saber cuantas veces ha sido activado. Solo se podrá desactivar si el numero de activaciones es igual a cero.
   * @private
   */
  private activaciones: number[] = [];

  private loaderSubject = new BehaviorSubject<boolean>(false);
  private fondoBlancoSubject = new BehaviorSubject<boolean>(false);

  loader$: Observable<boolean> = this.loaderSubject.asObservable();


  mostrarLoaderHastaCompletar<T>(obs$: Observable<T>): Observable<T> {
    return of(null)
      .pipe(
        tap(() => this.activar()),
        concatMap(() => obs$),
        finalize(() => this.desactivar())
      );
  }

  /**
   *
   * @param fondoBlanco Si es true pone el fondo totalmente blanco y sin transparencias.
   */
  activar(fondoBlanco: boolean = false) {
    this.activaciones.push(1);
    this.loaderSubject.next(true);
    if (fondoBlanco) {
      this.loaderSubject.next(true);
    }
  }

  desactivar() {
    this.activaciones.pop();
    if (this.activaciones.length === 0) {
      this.loaderSubject.next(false);
    }
  }

}
