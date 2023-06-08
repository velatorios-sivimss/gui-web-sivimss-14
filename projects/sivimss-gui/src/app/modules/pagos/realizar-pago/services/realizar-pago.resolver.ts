import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RealizarPagoService} from "./realizar-pago.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable()
export class RealizarPagoResolver implements Resolve<any> {

  constructor(private realizarPagoService: RealizarPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    const niveles$: Observable<TipoDropdown[]> = this.realizarPagoService.obtenerCatalogoNiveles();
    const foliosODS$: Observable<HttpRespuesta<any>> = this.realizarPagoService.consultarFoliosODS();
    const foliosPrevFun$: Observable<HttpRespuesta<any>> = this.realizarPagoService.consultarFoliosPrevFun();
    const foliosRevPrevFun$: Observable<HttpRespuesta<any>> = this.realizarPagoService.consultarFoliosRenPrevFun();
    return forkJoin([niveles$, foliosODS$, foliosPrevFun$, foliosRevPrevFun$]);
  }
}
