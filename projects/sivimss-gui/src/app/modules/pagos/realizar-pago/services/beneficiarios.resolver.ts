import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {RealizarPagoService} from "./realizar-pago.service";
import {Observable} from "rxjs";

@Injectable()
export class BeneficiariosResolver implements Resolve<any> {

  constructor(private realizarPagoService: RealizarPagoService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const nss: number = route.paramMap.get('nss') as unknown as number;
    return this.realizarPagoService.consultarBeneficiarios(nss);
  }
}
