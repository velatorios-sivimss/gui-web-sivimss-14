import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {MantenimientoVehicularService} from './mantenimiento-vehicular.service';
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";

@Injectable()
export class MantenimientoVehicularResolver implements Resolve<any> {

  constructor(private mantenimientoVehicularService: MantenimientoVehicularService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const niveles$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoNiveles();
    const delegaciones$: Observable<TipoDropdown[]> = this.mantenimientoVehicularService.obtenerCatalogoDelegaciones();
    const proveedores$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoProvedores();
    const placas$: Observable<HttpRespuesta<any>> = this.mantenimientoVehicularService.obtenerCatalogoPlacas();

    return forkJoin([niveles$, delegaciones$, proveedores$, placas$])
  }
}
