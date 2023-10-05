import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {FacturacionService} from "./facturacion.service";

@Injectable()
export class CancelarFacturaResolver implements Resolve<any> {

  constructor(private facturacionService: FacturacionService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.facturacionService.consultarMotivosCancelacion();
  }
}
