import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";

import { RenovarConvenioPfService } from "./renovar-convenio-pf.service";

@Injectable()
export class RenovarConvenioPfResolver implements Resolve<any> {
  constructor(private renovarConvenioPfService: RenovarConvenioPfService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idConvenio: number = route.paramMap.get('idConvenio') as unknown as number;
    const catalogoParentesco$ = this.renovarConvenioPfService.obtenerCatalogoParentesco();
    const beneficiarios$ = this.renovarConvenioPfService.buscarBeneficiarios(idConvenio);
    const catalogoDatosGrales$ = this.renovarConvenioPfService.obtenerCatalogo({ idCatalogo: 1, idConvenio });
    return forkJoin([catalogoParentesco$, beneficiarios$, catalogoDatosGrales$]);
  }
}
