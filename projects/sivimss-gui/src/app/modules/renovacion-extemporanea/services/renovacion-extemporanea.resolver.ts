
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, Resolve,
    RouterStateSnapshot
} from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { RenovacionExtemporaneaService } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/services/renovacion-extemporanea.service';

@Injectable()
export class RenovacionExtemporaneaResolver implements Resolve<any> {

    constructor(private renovacionExtemporaneaResolver: RenovacionExtemporaneaService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const catNiveles$ = this.renovacionExtemporaneaResolver.obtenerCatalogoNiveles();
        const catDelegacion$ = this.renovacionExtemporaneaResolver.obtenerCatalogoDelegaciones();
        return forkJoin([catNiveles$, catDelegacion$]);
    }
}
