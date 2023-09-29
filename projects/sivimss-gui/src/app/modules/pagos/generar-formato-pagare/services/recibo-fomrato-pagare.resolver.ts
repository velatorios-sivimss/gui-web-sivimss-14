import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import { GenerarFormatoPagareService } from "./generar-formato-pagare.service";
import {Observable} from "rxjs";

@Injectable()
export class ReciboFormatoPagareResolver implements Resolve<any> {

  constructor(private generarFormatoPagareService: GenerarFormatoPagareService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idODS: number = route.paramMap.get('idODS') as unknown as number;
    return this.generarFormatoPagareService.buscarDatosPagare(idODS);
  }
}
