import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable} from 'rxjs';
import {SeguimientoNuevoConvenioService} from "./seguimiento-nuevo-convenio.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable({providedIn: 'root'})
export class DesactivarNuevoConvenioResolver implements Resolve<boolean> {
  constructor(private seguimientoConvenioService: SeguimientoNuevoConvenioService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idConvenio: number = route.paramMap.get('idConvenio') as unknown as number;
    const idTipo: number = route.paramMap.get('tipoConvenio') as unknown as number;
    const $convenio: Observable<HttpRespuesta<any>> = this.seguimientoConvenioService.buscarConvenioPorPersona(idConvenio, idTipo);
    return forkJoin([$convenio]);
  }
}
