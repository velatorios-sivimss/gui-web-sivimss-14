import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { HttpRespuesta } from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import { MensajeSistema } from "projects/sivimss-gui/src/app/models/mensaje-sistema";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class MensajesSistemaService {

  private mensajesSistemaSubject: BehaviorSubject<MensajeSistema[] | null> = new BehaviorSubject<MensajeSistema[] | null>(null);

  constructor(private readonly httpClient: HttpClient) {
    this.obtenerMensajesSistema().subscribe(
      (mensajesSistema: MensajeSistema[]) => {
        this.mensajesSistemaSubject.next(mensajesSistema);
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  obtenerMensajeSistemaPorId(id: number): string {
    const mensajeSistema = this.mensajesSistemaSubject.getValue()?.find((mensajeSistema: MensajeSistema) => mensajeSistema.idMensaje === id);
    return mensajeSistema ? mensajeSistema.desMensaje : '';
  }

  obtenerMensajesSistema(): Observable<MensajeSistema[]> {
    const respMensajes = {
      "error": false,
      "codigo": 200,
      "mensaje": "Exito",
      "datos": [
        {
          "idMensaje": 1,
          "desMensaje": "¿Estás seguro de modificar el registro?"
        },
        {
          "idMensaje": 2,
          "desMensaje": "¿Estás seguro de cerrar sesión?"
        }]
    }
    //return this.httpClient.get<HttpRespuesta<any>>('http://localhost:8079/mssivimss-oauth/mensajes');
    return this.httpClient.post<HttpRespuesta<any>>('https://sivimss-ds.apps.ocp.imss.gob.mx/mssivimss-oauth/v1/mensajes',{}).pipe(
      map((respuesta: HttpRespuesta<any>) => {
        return respuesta.datos as MensajeSistema[];
      })
    );
  }

}
