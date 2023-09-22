import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { SalasService } from './salas.service';

@Injectable()
export class SalasResolver implements Resolve<any> {

    constructor(private salasService: SalasService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return of([])
    }
}
