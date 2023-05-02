import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { RolService } from "./rol.service";

@Injectable()
export class RolResolver implements Resolve<HttpRespuesta<any>>{

    constructor(private rolService: RolService) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<HttpRespuesta<any>> {
        return this.rolService.obtenerCatRoles();
    }
}
