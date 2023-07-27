import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {OrdenEntradaService} from "./orden-entrada.service";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class OrdenEntradaResolver implements Resolve<any> {

  constructor(private ordenEntradaService: OrdenEntradaService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    return forkJoin([]);
  }
}
