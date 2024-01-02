import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {GestionarPagoService} from "./gestionar-pago.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {obtenerVelatorioUsuarioLogueado} from "../../../../utils/funciones";

@Injectable()
export class GestionarPagoResolver implements Resolve<any> {

  constructor(private gestionarPagoService: GestionarPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    const foliosODS$: Observable<HttpRespuesta<any>> = this.gestionarPagoService.consultarFoliosODS(velatorio);
    const foliosPrevFun$: Observable<HttpRespuesta<any>> = this.gestionarPagoService.consultarFoliosPrevFun(velatorio);
    const foliosRevPrevFun$: Observable<HttpRespuesta<any>> = this.gestionarPagoService.consultarFoliosRenPrevFun(velatorio);
    return forkJoin([foliosODS$, foliosPrevFun$, foliosRevPrevFun$]);
  }
}
