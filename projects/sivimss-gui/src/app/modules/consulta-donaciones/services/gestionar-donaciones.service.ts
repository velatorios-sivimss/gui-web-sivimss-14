import { BaseService } from "../../../utils/base-service";
import { HttpRespuesta } from "../../../models/http-respuesta.interface";
import { Observable, of } from "rxjs";
import { TipoDropdown } from "../../../models/tipo-dropdown";
import { mapearArregloTipoDropdown } from "../../../utils/funciones";

import {AutenticacionService} from "../../../services/autenticacion.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../../environments/environment";
import {GuardarAgregarDonacion} from "../models/consulta-donaciones-interface";
import {PlantillaAceptarDonacion, PlantillaControlSalida} from "../models/generar-plantilla-interface";
import {AgregarSalidaDonacionInterface} from "../models/agregar-salida-donacion-interface";

@Injectable()
export class GestionarDonacionesService extends BaseService<HttpRespuesta<any>, any> {


  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http,`${environment.api.mssivimss}`,"","",59,"",""
    ,"");
  }

  obtenerCatalogoDelegaciones(): Observable<TipoDropdown[]> {
    const delegaciones = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_delegaciones'));
    return of(mapearArregloTipoDropdown(delegaciones, "desc", "id"));
  }


  obtenerCatalogoPaises(): Observable<TipoDropdown[]> {
    const paises = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_pais'));
    return of(mapearArregloTipoDropdown(paises, "desc", "id"));
  }

  obtenerCatalogoEstados():Observable<TipoDropdown[]> {
    const estados = this.authService.obtenerCatalogoDeLocalStorage(('catalogo_estados'));
    return of(mapearArregloTipoDropdown(estados, "desc", "id"));
  }

  consultaContratantePorFolioODS(claveFolio: string): Observable<HttpRespuesta<any>> {
    const estatusOrdenServicio: number = 2;
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-nombre-contratante`,
      {claveFolio:claveFolio,estatusOrdenServicio: estatusOrdenServicio} );
  }

  consultaFinadoPorFolioODS(claveFolio: string): Observable<HttpRespuesta<any>> {
    const estatusOrdenServicio: number = 2;
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-nombre-finado`,
      {claveFolio:claveFolio,estatusOrdenServicio: estatusOrdenServicio});
  }

  consultaAceptacionAtaudDonado(claveFolio: string): Observable<HttpRespuesta<any>> {
    const estatusOrdenServicio: number = 2;
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-ataud-donado`,
      {claveFolio:claveFolio,estatusOrdenServicio: estatusOrdenServicio});
  }

  consultaControlSalidaAtaudes(): Observable<HttpRespuesta<any>> {
    const servicio =  "detalle-salida-ataud-donado";
    const params = new HttpParams().append("servicio", servicio);
    return this._http.get<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/`, {  params });

  }

  consultaCURP(curp: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-contratante-curp`,
      {curp: curp});
  }

  consultaRFC(rfc: string): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/detalle-contratante-rfc`,
      {rfc: rfc});
  }

  consutaCP(cp:String): Observable<HttpRespuesta<any>> {
    return this._http.get<HttpRespuesta<any>>(`${environment.api.servicios_externos}consultar/codigo-postal/`+ cp )
  }

  guardarAgregarDonacion(donacion: GuardarAgregarDonacion): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/agregar-donacion`,
      donacion);
  }

  generarPlantillaAgregarDonacion(plantilla:PlantillaAceptarDonacion): Observable<Blob> {
    return this._http.post<any>(this._base + `${this._funcionalidad}/plantilla-aceptacion-control/generarDocumento/pdf`, plantilla,
      {responseType: 'blob' as any});
  }


  guardarControlSalidaDonacion(informacion:AgregarSalidaDonacionInterface): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(this._base + `${this._funcionalidad}/agregar-salida-donacion`, informacion);
  }

  generarPlantillaControlSalida(plantailla:PlantillaControlSalida): Observable<Blob> {
    return this._http.post<any>(
      this._base + `${this._funcionalidad}/plantilla-control-salida-donacion/generarDocumento/pdf`, plantailla,
      {responseType: 'blob' as any});
  }
}
