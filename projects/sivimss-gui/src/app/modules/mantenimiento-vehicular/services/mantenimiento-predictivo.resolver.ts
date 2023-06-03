import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {MantenimientoVehicularService} from "./mantenimiento-vehicular.service";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class MantenimientoPredictivoResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$ = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$ = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    const placas$ = this.mantenimientoVehicularService.obtenerCatalogoPlacas();
    const catalogoBase$ = this.mantenimientoVehicularService.obtenerCatalogoMttoPredictivo();
    return forkJoin([niveles$, delegaciones$, placas$, catalogoBase$]);
  }

}
