import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RealizarPagoService} from "./realizar-pago.service";

@Injectable()
export class RealizarPagoResolver implements Resolve<any> {

  constructor(private realizarPagoService: RealizarPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TipoDropdown[]> {
    return this.realizarPagoService.obtenerCatalogoNiveles();
  }
}
