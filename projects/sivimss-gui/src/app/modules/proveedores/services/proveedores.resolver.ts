// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ProveedoresService } from './proveedores.service';

@Injectable()
export class ProveedoresResolver implements Resolve<any> {

    constructor(private ProveedoresResolver: ProveedoresService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return of([])
    }
}
