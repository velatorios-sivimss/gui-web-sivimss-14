import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { OrdenEntradaService } from "./orden-entrada.service";
import { forkJoin, Observable } from "rxjs";
import { UsuarioEnSesion } from "../../../models/usuario-en-sesion.interface";
import {AutenticacionService} from "../../../services/autenticacion.service";

@Injectable()
export class OrdenEntradaResolver implements Resolve<any> {

  constructor(private ordenEntradaService: OrdenEntradaService,
              private authService: AutenticacionService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const catDelegacion$ = this.ordenEntradaService.obtenerCatalogoDelegaciones();
    const catNivel$ = this.ordenEntradaService.obtenerCatalogoNiveles();
    const foliosODE$ = this.ordenEntradaService.consultarFolioODE();
    let usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    let datos = {
      "idVelatorio": usuario.idVelatorio,
      "numFolioOrdenEntrada": null,
      "nomProveedor": null,
      "fechaInicio": null,
      "fechaFin": null
    }
    // const paginado$ = this.ordenEntradaService.buscarPorFiltros(0, 10, datos);
    return forkJoin([catDelegacion$, catNivel$, foliosODE$]);
  }
}
