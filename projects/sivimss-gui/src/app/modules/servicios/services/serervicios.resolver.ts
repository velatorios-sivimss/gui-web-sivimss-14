import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {forkJoin, Observable} from "rxjs";

@Injectable()
export class ServiciosResolver implements Resolve<unknown> {

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<unknown> {
    return forkJoin([""]);
  }


}
