import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {SeguimientoNuevoConvenioService} from './seguimiento-nuevo-convenio.service';

@Injectable()
export class SeguimientoNuevoConvenioResolver implements Resolve<any> {

    constructor(private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.seguimientoNuevoConvenioService.obtenerCatalogoNiveles();
    }
}
