import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {forkJoin, Observable} from "rxjs";

import {AgregarConvenioPFService} from "./agregar-convenio-pf.service";

@Injectable()
export class AgregarConvenioPfResolver implements Resolve<any> {
  constructor(private agregarConvenioPFService: AgregarConvenioPFService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catalogoPaises$ = this.agregarConvenioPFService.obtenerCatalogoPaises();
    const catalogoEstados$ = this.agregarConvenioPFService.obtenerCatalogoEstados();
    const catalogoParentesco$ = this.agregarConvenioPFService.obtenerCatalogoParentesco();
    const catalogoPaquete$ = this.agregarConvenioPFService.consultarPaquetes();
    const catalogoPromotores$ = this.agregarConvenioPFService.consultaPromotores();
    return forkJoin([catalogoPaises$,catalogoEstados$, catalogoParentesco$, catalogoPaquete$,catalogoPromotores$]);
  }
}
