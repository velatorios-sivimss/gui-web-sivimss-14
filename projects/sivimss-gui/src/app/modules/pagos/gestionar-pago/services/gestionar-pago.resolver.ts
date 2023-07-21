import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {GestionarPagoService} from "./gestionar-pago.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable()
export class GestionarPagoResolver implements Resolve<any> {

  constructor(private gestionarPagoService: GestionarPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const foliosODS$: Observable<HttpRespuesta<any>> = this.gestionarPagoService.consultarFoliosODS();
    const foliosPrevFun$: Observable<HttpRespuesta<any>> = this.gestionarPagoService.consultarFoliosPrevFun();
    const foliosRevPrevFun$: Observable<HttpRespuesta<any>> = this.gestionarPagoService.consultarFoliosRenPrevFun();
    return forkJoin([foliosODS$, foliosPrevFun$, foliosRevPrevFun$]);
  }
}
