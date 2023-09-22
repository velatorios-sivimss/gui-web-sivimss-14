import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {PanteonesService} from './panteones.service';

@Injectable()
export class PanteonesResolver implements Resolve<any> {

  constructor(private panteonesService: PanteonesService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return of([])
  }
}
