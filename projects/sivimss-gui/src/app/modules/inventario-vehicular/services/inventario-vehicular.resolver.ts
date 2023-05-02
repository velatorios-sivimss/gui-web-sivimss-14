// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { InventarioVehicularService } from './inventario-vehicular.service';

@Injectable()
export class InventarioVehicularResolver implements Resolve<any> {

    constructor(private inventarioVehicularService: InventarioVehicularService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return of([])
    }
}
