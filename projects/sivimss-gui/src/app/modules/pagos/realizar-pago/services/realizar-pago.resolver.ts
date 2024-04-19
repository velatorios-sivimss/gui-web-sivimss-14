import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RealizarPagoService} from "./realizar-pago.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {UsuarioEnSesion} from "../../../../models/usuario-en-sesion.interface";
import {obtenerVelatorioUsuarioLogueado} from "../../../../utils/funciones";
import {AutenticacionService} from "../../../../services/autenticacion.service";

@Injectable()
export class RealizarPagoResolver implements Resolve<any> {

  constructor(private realizarPagoService: RealizarPagoService,
              private authService: AutenticacionService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const velatorio: number | null = obtenerVelatorioUsuarioLogueado(usuario);
    const niveles$: Observable<TipoDropdown[]> = this.realizarPagoService.obtenerCatalogoNiveles();
    const foliosODS$: Observable<HttpRespuesta<any>> = this.realizarPagoService.consultarFoliosODS(velatorio);
    const foliosPrevFun$: Observable<HttpRespuesta<any>> = this.realizarPagoService.consultarFoliosPrevFun(velatorio);
    const foliosRevPrevFun$: Observable<HttpRespuesta<any>> = this.realizarPagoService.consultarFoliosRenPrevFun(velatorio);
    return forkJoin([foliosODS$, foliosPrevFun$, foliosRevPrevFun$, niveles$]);
  }
}
