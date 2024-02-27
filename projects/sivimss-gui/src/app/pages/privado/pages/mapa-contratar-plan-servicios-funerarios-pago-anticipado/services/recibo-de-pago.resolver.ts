import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { ContratarPSFPAService } from './contratar-psfpa.service';

@Injectable()
export class ReciboDePagoResolver implements Resolve<boolean> {

  constructor(private contratarPSFPAService: ContratarPSFPAService,) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const folioPago: number = route.paramMap.get('idFolio') as unknown as number;
    const detalleReciboPago$ = this.contratarPSFPAService.detalleReciboPago(folioPago);
    const catMesesPago$ = this.contratarPSFPAService.obtenerCatalogoMesesPago();
    return forkJoin([detalleReciboPago$, catMesesPago$]);
  }
}
