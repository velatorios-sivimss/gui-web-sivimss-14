import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {forkJoin, Observable} from "rxjs";
import {SolicitudesPagoService} from './solicitudes-pago.service';
import { TipoDropdown } from '../../../models/tipo-dropdown';

@Injectable()
export class ReciboFormatoPagareResolver implements Resolve<any> {

  constructor(private solicitudesPagoService: SolicitudesPagoService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idSolicitud: number = route.paramMap.get('idSolicitud') as unknown as number;
    return this.solicitudesPagoService.detalleSolicitudPago(idSolicitud);
  }
}
