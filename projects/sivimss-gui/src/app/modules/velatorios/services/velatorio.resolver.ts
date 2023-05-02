import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {VelatorioService} from "./velatorio.service";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class VelatorioResolver implements Resolve<HttpRespuesta<any>> {

  constructor(private velatorioService: VelatorioService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.velatorioService.obtenerCatalogoNiveles();
  }
}
