import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/sivimss-gui/src/environments/environment';
import { Observable, of } from 'rxjs';
import { HttpRespuesta } from '../../../models/http-respuesta.interface';
import { BaseService } from '../../../utils/base-service';
import { GenerarOrdenSubrogacion } from '../models/generar-orden-subrogacion.interface';
import { TipoDropdown } from '../../../models/tipo-dropdown';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { mapearArregloTipoDropdown } from '../../../utils/funciones';

@Injectable()
export class GenerarOrdenSubrogacionService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "agregar-order", "actualizar-orden",
      37, "orden", "detalle-orden", "cambiar-estatus");
  }

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_nivelOficina'));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerVelatoriosPorDelegacion(delegacion: string | null = null): Observable<HttpRespuesta<any>> {
    const body = { idDelegacion: delegacion }
    return this._http.post<HttpRespuesta<any>>(`${environment.api.login}/velatorio/consulta`, body);
  }
}
