import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {MantenimientoVehicularService} from "./mantenimiento-vehicular.service";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class ReporteEncargadoResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const placas$ = this.mantenimientoVehicularService.obtenerCatalogoPlacas();
    const catalogoBase$ = this.mantenimientoVehicularService.obtenerCatalogoReporteEncargado();

    return forkJoin([placas$, catalogoBase$]);
  }
}
