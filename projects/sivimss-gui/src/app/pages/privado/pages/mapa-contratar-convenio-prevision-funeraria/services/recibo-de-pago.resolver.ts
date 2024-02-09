import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {
  BusquedaConveniosPFServic
} from "../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service";

@Injectable()
export class ReciboDePagoResolver implements Resolve<boolean> {

  constructor(private consultaConveniosService: BusquedaConveniosPFServic,) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const folioPago: number = route.paramMap.get('idFolio') as unknown as number;
    return this.consultaConveniosService.detalleReciboPago(folioPago);
  }
}
