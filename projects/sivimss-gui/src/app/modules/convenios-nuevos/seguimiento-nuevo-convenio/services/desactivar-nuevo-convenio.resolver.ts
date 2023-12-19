import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {SeguimientoNuevoConvenioService} from "./seguimiento-nuevo-convenio.service";

@Injectable({
  providedIn: 'root'
})
export class DesactivarNuevoConvenioResolver implements Resolve<boolean> {
  constructor(private seguimientoConvenioService: SeguimientoNuevoConvenioService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idConvenio: number = route.paramMap.get('idConvenio') as unknown as number;
    return this.seguimientoConvenioService.buscarConvenioPorPersona(idConvenio);
  }
}
