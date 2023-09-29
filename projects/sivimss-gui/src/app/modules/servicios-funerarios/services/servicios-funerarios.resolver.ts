import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {forkJoin, Observable} from "rxjs";
import {ServiciosFunerariosService} from "./servicios-funerarios.service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";


@Injectable()
export class ServiciosFunerariosResolver implements  Resolve<HttpRespuesta<any>> {

  constructor(private serviciosFunerariosService:ServiciosFunerariosService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>{
    const catEstados$ = this.serviciosFunerariosService.obtenerCatalogoEstados();
    const catPaises$ = this.serviciosFunerariosService.obtenerCatalogoPais();
    const catNumeroPagos$ = this.serviciosFunerariosService.obtenerCatalogoNumeroPagos();
    const catPaquetes$ = this.serviciosFunerariosService.obtenerCatalogoPaquetes();
    return forkJoin([catEstados$,catPaises$,catNumeroPagos$,catPaquetes$]);
  }
}
