import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {BalanceCajaService} from './balance-caja.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';

@Injectable()
export class BalanceCajaResolver implements Resolve<any> {

  constructor(private calculoComisionesService: BalanceCajaService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$: Observable<TipoDropdown[]> = this.calculoComisionesService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.calculoComisionesService.obtenerCatalogoDelegaciones();
    return forkJoin([niveles$, delegaciones$])
  }
}
