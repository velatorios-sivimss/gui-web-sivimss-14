import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {MantenimientoVehicularService} from "./mantenimiento-vehicular.service";
import {forkJoin, Observable} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {TipoDropdown} from "../../../models/tipo-dropdown";

@Injectable()
export class ReporteEncargadoResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const placas$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoPlacas();
    const catalogoBase$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoReporteEncargado();
    const niveles$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    
    return forkJoin([placas$, catalogoBase$, niveles$, delegaciones$]);
  }
}
