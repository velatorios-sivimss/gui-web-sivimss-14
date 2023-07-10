import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable, of} from 'rxjs';

@Injectable()
export class DetalleGestionPagoResolver implements Resolve<boolean> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const idPagoBitacora: number = route.paramMap.get('idPagoBitacora') as unknown as number;
    return of(true);
  }
}
