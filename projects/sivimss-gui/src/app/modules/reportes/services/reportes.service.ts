import {Injectable} from "@angular/core";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {AgregarPlanSFPA} from "../../servicios-funerarios/models/servicios-funerarios.interface";
import {FiltroReporte} from "../models/filtro-reporte.interface";

@Injectable()
export class ReportesService extends BaseService<HttpRespuesta<any>, any>{

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 25, '', '', '');
  }

  readonly _delegacion: string = 'catalogo_delegaciones';
  readonly _nivel: string = 'catalogo_nivelOficina';

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeLocalStorage((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion:number): Observable<HttpRespuesta<any>>{
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }


  consultarTipoReportes(tipoReporte: number ): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos_reportes}buscar-reportes/${tipoReporte}`);
  }

  consultarODSComisionPromotor(id_delegacion: number, id_velatorio: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consultar-ordenes`,
      {id_delegacion: id_delegacion, id_velatorio:id_velatorio});
  }

  consultarPromotoresComisionPromotor(): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/catalogo/consultar-promotores`);
  }

  generarReporte(filtros: any,tipoReporte: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar` + tipoReporte,
      filtros);
  }



}
