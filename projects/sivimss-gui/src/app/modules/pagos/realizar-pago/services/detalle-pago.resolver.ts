import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {RealizarPagoService} from "./realizar-pago.service";

@Injectable()
export class DetallePagoResolver implements Resolve<any> {

  constructor(private realizarPagoService: RealizarPagoService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idPagoBitacora: number = route.paramMap.get('idPagoBitacora') as unknown as number;
    return this.realizarPagoService.consultarDetallePago(idPagoBitacora);
  }
}
