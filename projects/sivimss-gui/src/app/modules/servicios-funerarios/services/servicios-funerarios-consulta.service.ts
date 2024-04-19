import {Injectable} from "@angular/core";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";
import {Observable, of} from "rxjs";
import {TipoDropdown} from "../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../utils/funciones";
import {PaginadoInterface} from "../models/paginado.interface";
import {GenerarReporte} from "../models/servicios-funerarios.interface";

@Injectable()
export class ServiciosFunerariosConsultaService extends BaseService<HttpRespuesta<any>, any>{
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 68, '', '', '');
  }

  readonly _delegacion: string = 'catalogo_delegaciones';
  readonly _nivel: string = 'catalogo_nivelOficina';
  readonly _plan: string = 'catalogo_estatusPlanSFPA';

  obtenerCatalogoNiveles(): Observable<TipoDropdown[]> {
    const niveles = this.authService.obtenerCatalogoDeCookies((this._nivel));
    return of(mapearArregloTipoDropdown(niveles, "desc", "id"));
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeCookies((this._delegacion));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }

  obtenerCatalogoEstatusPlan(): Observable<TipoDropdown[]> {
    const plan = this.authService.obtenerCatalogoDeCookies((this._plan));
    return of(mapearArregloTipoDropdown(plan, "desc", "id"));
  }

  obtenerCatalogoVelatoriosPorDelegacion(delegacion:number): Observable<HttpRespuesta<any>>{
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/velatorios/${delegacion}`);
  }

  paginar(pagina: number, tamanio: number, objeto:PaginadoInterface): Observable<HttpRespuesta<any>>{
    const params = new HttpParams()
      .append('pagina' , pagina)
      .append('tamanio', tamanio)
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/consulta-filtro-plan-sfpa`,
      objeto,{params});
  }

  generarArchivoPaginador(objetoPaginado: GenerarReporte): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base +
      `${this._funcionalidad}/buscar/reporte-consulta-plan-sfpa`,
      objetoPaginado);
  }

  consultarContrato(idPlanSfpa: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base +
      `${this._funcionalidad}/buscar/genera-reporte`,
      {idPlanSFPA: idPlanSfpa});
  }
}
