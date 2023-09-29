import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {MantenimientoVehicularService} from "./mantenimiento-vehicular.service";
import {forkJoin, Observable} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";

@Injectable()
export class MantenimientoPredictivoResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    const placas$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoPlacas();
    const catalogoBase$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoMttoPredictivo();
    const periodo$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoPeriodo();
    return forkJoin([niveles$, delegaciones$, placas$, catalogoBase$, periodo$]);
  }

}
