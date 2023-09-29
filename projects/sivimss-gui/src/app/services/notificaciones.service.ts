import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AutenticacionService} from "./autenticacion.service";
import {Observable} from "rxjs";
import {HttpRespuesta} from "../models/http-respuesta.interface";
import {environment} from "../../environments/environment";

@Injectable()
export class NotificacionesService {

  private auth_tokenCap: string = "eyJzaXN0ZW1hIjoic2l2aW1zcyIsImFsZyI6IkhTMjU2In0.eyJzdWIiOiJ7XCJpZFZlbGF0b3Jpb1wiOlwiMVwiLFwiaWRSb2xcIjpcIjFcIixcImRlc1JvbFwiOlwiQ09PUkRJTkFET1IgREUgQ0VOVFJcIixcImlkRGVsZWdhY2lvblwiOlwiMVwiLFwiaWRPZmljaW5hXCI6XCIxXCIsXCJpZFVzdWFyaW9cIjpcIjFcIixcImN2ZVVzdWFyaW9cIjpcIjk5MDk2MzYzXCIsXCJjdmVNYXRyaWN1bGFcIjpcIjk5MDk2MzYzXCIsXCJub21icmVcIjpcInVzdWFyaW8gdXN1YXJpbyB1c3VhcmlvXCIsXCJjdXJwXCI6XCJ1c3VhcmlvXCJ9IiwiaWF0IjoxNjgzMTU1NTc2LCJleHAiOjE2ODM3NjAzNzZ9.YMuti8IzemnO4Xm9A1AlZs1C7QLEymDMZ3-fgQRDrKY";


  readonly notificaciones = ["Tienes 10 vehículos, sin registrar la verificación al inicio de la jornada, recordamos que debes registrar diariamente",
    "Tienes 10 vehículos, sin registrar la verificación al inicio de la jornada, recordamos que debes registrar diariamente",
    "Tienes 10 vehículos, sin registrar la verificación al inicio de la jornada, recordamos que debes registrar diariamente"];

  constructor(private _http: HttpClient, private authService: AutenticacionService) {
  }

  consultaNotificacion(): Observable<HttpRespuesta<any>> {
    /*
    * se ingresa el 'idFuncionalidad 1' ya que el servicio se ejecuta de el inicio de sesión
    *  y no desde que se ingresa a un módulo en específico, verificar comportamiento con otros aplicativos*/
    return this._http.get<HttpRespuesta<any>>(`${environment.api.notificaciones}`)
  }

  // renovarNotificacion: Observable<HttpRespuesta<any>> {
  // const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth_tokenCap}`, 'Content-Type': 'application/json' });
  // return this._http.post<HttpRespuesta<any>>(`${environment.api.mssivimss}9/buscar-filtros/veri-alertas`, {},{headers});
  // }

  renovarNotificacion(idRegistro: any): Observable<HttpRespuesta<any>> {
    return this._http.post<HttpRespuesta<any>>(`${environment.api.mssivimss}9/veri-renovar-hora`, {idRegistro: idRegistro})
  }

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
