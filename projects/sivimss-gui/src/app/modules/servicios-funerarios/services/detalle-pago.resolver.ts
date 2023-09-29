import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {DetallePagoService} from "./detalle-pago.service";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class DetallePagoResolver implements Resolve<HttpRespuesta<any>> {
  constructor(private detallePagoService: DetallePagoService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catTipoPago$ = this.detallePagoService.obtenerCatalogoTipoPago();
    return forkJoin([catTipoPago$])
  }
}
