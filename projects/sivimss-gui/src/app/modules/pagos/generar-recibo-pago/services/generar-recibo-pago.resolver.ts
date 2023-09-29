import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {GenerarReciboService} from './generar-recibo-pago.service';
import {TipoDropdown} from "../../../../models/tipo-dropdown";

@Injectable()
export class GenerarReciboResolver implements Resolve<any> {

  constructor(private generarReciboService: GenerarReciboService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$: Observable<TipoDropdown[]> = this.generarReciboService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.generarReciboService.obtenerCatalogoDelegaciones();
    return forkJoin([niveles$, delegaciones$])
  }
}
