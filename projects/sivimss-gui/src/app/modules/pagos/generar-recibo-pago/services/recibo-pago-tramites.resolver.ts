import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {GenerarReciboService} from "./generar-recibo-pago.service";
import {Observable} from "rxjs";

@Injectable()
export class ReciboPagoTramitesResolver implements Resolve<any> {

  constructor(private generarReciboService: GenerarReciboService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idBitacora: number = route.paramMap.get('idPagoBitacora') as unknown as number;
    return this.generarReciboService.buscarDatosReportePagos(idBitacora);
  }
}
