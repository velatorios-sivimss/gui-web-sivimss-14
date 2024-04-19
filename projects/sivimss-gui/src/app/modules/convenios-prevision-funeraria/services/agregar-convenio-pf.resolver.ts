import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {forkJoin, Observable} from "rxjs";

import {AgregarConvenioPFService} from "./agregar-convenio-pf.service";
import {UsuarioEnSesion} from "../../../models/usuario-en-sesion.interface";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class AgregarConvenioPfResolver implements Resolve<any> {
  constructor(private agregarConvenioPFService: AgregarConvenioPFService,
              private authService: AutenticacionService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const catalogoPaises$ = this.agregarConvenioPFService.obtenerCatalogoPaises();
    const catalogoEstados$ = this.agregarConvenioPFService.obtenerCatalogoEstados();
    const catalogoParentesco$ = this.agregarConvenioPFService.obtenerCatalogoParentesco();
    const catalogoPaquete$ = this.agregarConvenioPFService.consultarPaquetes(+usuario.idVelatorio);
    const catalogoPromotores$ = this.agregarConvenioPFService.consultaPromotores();
    const catDelegacion$ = this.agregarConvenioPFService.obtenerCatalogoDelegaciones();
    return forkJoin([catalogoPaises$,catalogoEstados$, catalogoParentesco$, catalogoPaquete$,catalogoPromotores$,
                            catDelegacion$]);
  }
}
