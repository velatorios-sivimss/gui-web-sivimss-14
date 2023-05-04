import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AutenticacionService} from "./autenticacion.service";
import {Observable} from "rxjs";
import {HttpRespuesta} from "../models/http-respuesta.interface";

@Injectable()
export class NotificacionesService {

  readonly notificaciones = ["Tienes 10 vehículos, sin registrar la verificación al inicio de la jornada, recordamos que debes registrar diariamente",
    "Tienes 10 vehículos, sin registrar la verificación al inicio de la jornada, recordamos que debes registrar diariamente",
    "Tienes 10 vehículos, sin registrar la verificación al inicio de la jornada, recordamos que debes registrar diariamente"];
  private _http: any;

  constructor(_http: HttpClient,private authService: AutenticacionService) {
  }

  // consultaAlertas(): Observable<HttpRespuesta<any>> {
    // body = {};
    // return this._http.post<HttpRespuesta<any>>("localhost:8082/mssivimss-ctrol-permisos/v1/sivimss/service/9/buscar-filtros/veri-alertas",body);
  // }


  existenNotificaciones(): boolean {
    return this.obtenerNotificaciones().length !== 0
  }

  guardarNotificaciones(): void {
    localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
  }

  consultarNotificaciones(): string[] {
    return this.obtenerNotificaciones();
  }

  borrarNotificaciones(): void {
    localStorage.removeItem('notificaciones');
  }

  obtenerNotificaciones(): string[] {
    const notificaciones = JSON.parse(localStorage.getItem('notificaciones') as string);
    return notificaciones || this.notificaciones;
  }
}
