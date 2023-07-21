import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {GestionarPagoService} from "./gestionar-pago.service";

@Injectable()
export class DetalleGestionPagoResolver implements Resolve<boolean> {

  constructor(private gestionarPagoService: GestionarPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idPagoBitacora: number = route.paramMap.get('idPagoBitacora') as unknown as number;
    const idFlujo: number = route.paramMap.get('idFlujo') as unknown as number;
    return this.gestionarPagoService.obtenerDetallePago(idPagoBitacora, idFlujo);
  }
}
