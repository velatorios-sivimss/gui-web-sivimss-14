import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { ValeParitariaService } from "./vale-paritaria.service";

@Injectable()
export class ValeParitariaResolver<t>{

    constructor(private valeParitariaService: ValeParitariaService) { }
    
}
