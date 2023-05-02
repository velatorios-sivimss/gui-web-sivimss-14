// TODO: Regresar catalogos

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { PromotoresService } from './promotores.service';

@Injectable()
export class PromotoresResolver implements Resolve<any> {

    constructor(private promotoresService: PromotoresService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return of([])
    }
}
