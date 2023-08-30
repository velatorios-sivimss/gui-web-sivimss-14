import {Injectable} from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {FacturacionService} from "./facturacion.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable()
export class FacturacionResolver implements Resolve<boolean> {

  constructor(private facturacionService: FacturacionService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const foliosODS$: Observable<HttpRespuesta<any>> = this.facturacionService.obtenerFolioODS();
    return forkJoin([foliosODS$]);
  }
}
