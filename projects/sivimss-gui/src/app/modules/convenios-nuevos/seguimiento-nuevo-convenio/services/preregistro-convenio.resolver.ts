import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {SeguimientoNuevoConvenioService} from "./seguimiento-nuevo-convenio.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable({providedIn: 'root'})
export class PreregistroConvenioResolver implements Resolve<boolean> {
  constructor(private seguimientoConvenioService: SeguimientoNuevoConvenioService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const idConvenio: number = route.paramMap.get('idConvenio') as unknown as number;
    const idTipo: number = route.paramMap.get('tipoConvenio') as unknown as number;
    const $convenio: Observable<HttpRespuesta<any>> = this.seguimientoConvenioService.buscarConvenioPorPersona(idConvenio, idTipo);
    const $paquetes: Observable<HttpRespuesta<any>> = this.seguimientoConvenioService.obtenerCatalogoPaquetes();
    const $beneficiarios: Observable<HttpRespuesta<any>> = this.seguimientoConvenioService.buscarConvenioPorSeccion(idConvenio, idTipo, 2);
    const $promotores: Observable<HttpRespuesta<any>> = this.seguimientoConvenioService.obtenerCatalogoPromotores();
    const $parentesco: Observable<HttpRespuesta<any>> = this.seguimientoConvenioService.obtenerCatalogoParentesco();
    if (+idTipo === 2) {
      return forkJoin([$convenio, $paquetes, $parentesco, $beneficiarios]);
    }
    if (+idTipo === 3) {
      return forkJoin([$convenio, $paquetes, $parentesco]);
    }
    return forkJoin([$convenio, $paquetes, $promotores]);
  }
}
