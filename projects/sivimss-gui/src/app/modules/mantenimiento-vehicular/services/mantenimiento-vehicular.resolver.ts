// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { MantenimientoVehicularService } from './mantenimiento-vehicular.service';

@Injectable()
export class MantenimientoVehicularResolver implements Resolve<any> {

    constructor(private mantenimientoVehicularResolver: MantenimientoVehicularService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return of([])
    }
}
