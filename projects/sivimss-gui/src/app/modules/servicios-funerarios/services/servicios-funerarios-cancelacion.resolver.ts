import {Injectable} from '@angular/core';
import {RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {ServiciosFunerariosService} from "./servicios-funerarios.service";

@Injectable()
export class ServiciosFunerariosCancelacionResolver {

  constructor(private serviciosFunerariosService: ServiciosFunerariosService,) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HttpRespuesta<any>> {
    const idPlanSfpa: number = +route.queryParams.idPlanSfpa;
    return this.serviciosFunerariosService.consultarPlanSFPA(idPlanSfpa);
  }
}
