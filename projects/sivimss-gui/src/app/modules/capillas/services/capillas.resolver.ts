import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  RouterStateSnapshot
} from '@angular/router';
import {Observable} from 'rxjs';

import {CapillaService} from './capilla.service';
import {HttpRespuesta} from '../../../models/http-respuesta.interface';


@Injectable()
export class CapillasResolver implements Resolve<HttpRespuesta<any>> {

  constructor(private capillaService: CapillaService) {
  }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HttpRespuesta<any>> {
    return this.capillaService.obtenerCatalogoCapillas();
  }
}
