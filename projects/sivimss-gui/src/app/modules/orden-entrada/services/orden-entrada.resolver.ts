import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {OrdenEntradaService} from "./orden-entrada.service";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class OrdenEntradaResolver implements Resolve<any> {

  constructor(private ordenEntradaService: OrdenEntradaService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catDelegacion$ = this.ordenEntradaService.obtenerCatalogoDelegaciones();
    const catNivel$ = this.ordenEntradaService.obtenerCatalogoNiveles();
    const foliosODE$ = this.ordenEntradaService.consultarFolioODE();
    return forkJoin([catDelegacion$,catNivel$,foliosODE$]);
  }
}
