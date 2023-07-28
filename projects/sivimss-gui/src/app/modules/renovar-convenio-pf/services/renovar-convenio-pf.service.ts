import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { Observable, of } from "rxjs";
import { AutenticacionService } from "../../../services/autenticacion.service";
import { environment } from "projects/sivimss-gui/src/environments/environment";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { BaseService } from "../../../utils/base-service";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";
import {
  Beneficiario,
  BuscarConvenioPlanAnterior,
  BuscarConvenioPlanNuevo,
  CambiarEstatus,
  ObtenerCatalogo,
  RenovarPlan,
  ReporteAnexoDiez,
  ReporteConvenioPlanAnterior,
  ReporteConvenioPlanNuevo,
  VerificarDocumentacion,
} from "../models/convenio.interface";

@Injectable()
export class RenovarConvenioPfService extends BaseService<HttpRespuesta<any>, any> {
  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, "registrar-beneficiario", "actualizar-benef", 29,
      "paginado", "buscar-beneficiarios", "estatus-benef");
  }

  buscarConvenioPlanNuevo(convenioPlanNuevo: BuscarConvenioPlanNuevo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/plan-nuevo`, convenioPlanNuevo);
  }

  buscarConvenioPlanAnterior(convenioPlanAnterior: BuscarConvenioPlanAnterior): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/plan-anterior`, convenioPlanAnterior);
  }

  buscarBeneficiarios(idConvenio: number): Observable<HttpRespuesta<any>> {
    const params = new HttpParams()
      .append("servicio", this._detalle)
      .append("palabra", idConvenio);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar`, { params });
  }

  obtenerDetalleBeneficiario(idBeneficiario: number): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/detalle-beneficiario`, { idBeneficiario });
  }

  crearBeneficiario(beneficiario: Beneficiario): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._agregar}`, beneficiario);
  }

  actualizarBeneficiario(beneficiario: Beneficiario): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/${this._actualizar}`, beneficiario);
  }

  cambiarEstatusBeneficiario(cambiarEstatus: CambiarEstatus): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/estatus-benef`, cambiarEstatus);
  }

  obtenerCatalogo(catalogo: ObtenerCatalogo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/buscar/buscar-catalogos`, catalogo);
  }

  verificarDocumentacion(documentacion: VerificarDocumentacion): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/verificar-documentacion`, documentacion);
  }

  renovarPlan(renovarPlan: RenovarPlan): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/renovar-plan`, renovarPlan);
  }

  reporteConvenioNuevo(reporteConvenioPlanNuevo: ReporteConvenioPlanNuevo): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/generar-adenda-anual/generarDocumento/pdf`, reporteConvenioPlanNuevo);
  }

  reporteConvenioAnterior(reporteConvenioPlanAnterior: ReporteConvenioPlanAnterior): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/generar-convenio-anterior/generarDocumento/pdf`, reporteConvenioPlanAnterior);
  }

  reporteAnexo(reporteAnexoDiez: ReporteAnexoDiez): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/generar-hoja-afiliacion/generarDocumento/pdf`, reporteAnexoDiez);
  }

  obtenerCatalogoParentesco(): Observable<TipoDropdown[]> {
    const catalogo_parentesco = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_parentesco'));
    return of(mapearArregloTipoDropdown(catalogo_parentesco, "desc", "id"));
  }
}