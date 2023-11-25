import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {HttpClient} from "@angular/common/http";
import {AutenticacionService} from "../../../../services/autenticacion.service";
import {environment} from "../../../../../environments/environment";
import {BaseService} from "../../../../utils/base-service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Injectable()
export class SeguimientoNuevoConvenioService extends BaseService<HttpRespuesta<any>, any> {

    constructor(override _http: HttpClient, private authService: AutenticacionService) {
        super(_http, `${environment.api.mssivimss}`, "", "",
            0, "", "", "");
    }

    obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
        const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
        return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
    }

    obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
        const body: { idDelegacion: string | null } = {idDelegacion: delegacion}
        return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
    }
}
