import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {forkJoin, Observable} from "rxjs";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {ServiciosFunerariosConsultaService} from "./servicios-funerarios-consulta.service";


@Injectable()
export class ServiciosFunerariosConsultaResolver implements  Resolve<HttpRespuesta<any>> {

  constructor(private serviciosFunerariosService:ServiciosFunerariosConsultaService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>{
    const catDelegacion$ = this.serviciosFunerariosService.obtenerCatalogoDelegaciones();
    const catNivel$ = this.serviciosFunerariosService.obtenerCatalogoNiveles();
    const catEstatus$ = this.serviciosFunerariosService.obtenerCatalogoEstatusPlan();
    return forkJoin([catDelegacion$,catNivel$,catEstatus$]);
  }
}
