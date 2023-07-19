import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {SolicitudesPagoService} from './solicitudes-pago.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';

@Injectable()
export class SolicitudesPagoResolver implements Resolve<any> {

  constructor(private solicitudesPagoService: SolicitudesPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$: Observable<TipoDropdown[]> = this.solicitudesPagoService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.solicitudesPagoService.obtenerCatalogoDelegaciones();
    return forkJoin([niveles$, delegaciones$])
  }
}
