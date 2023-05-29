import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {HttpRespuesta} from "projects/sivimss-gui/src/app/models/http-respuesta.interface";
import {MensajeSistema} from "projects/sivimss-gui/src/app/models/mensaje-sistema";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import { environment } from "../../environments/environment";
import {AlertaService, TipoAlerta} from "../shared/alerta/services/alerta.service";

@Injectable()
export class MensajesSistemaService {

  private mensajesSistemaSubject: BehaviorSubject<MensajeSistema[] | null> = new BehaviorSubject<MensajeSistema[] | null>(null);

  constructor(private readonly httpClient: HttpClient, private readonly alertaService: AlertaService) {
    this.obtenerMensajesSistema().subscribe({
      next: (mensajesSistema: MensajeSistema[]): void => {
        this.mensajesSistemaSubject.next(mensajesSistema);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      }
    });
  }

  obtenerMensajeSistemaPorId(id: number): string {
    const mensajeSistema = this.mensajesSistemaSubject.getValue()?.find((mensajeSistema: MensajeSistema) => mensajeSistema.idMensaje === id);
    return mensajeSistema ? mensajeSistema.desMensaje : '';
  }

  obtenerMensajesSistema(): Observable<MensajeSistema[]> {
    return this.httpClient.post<HttpRespuesta<any>>(environment.api.login + '/mensajes', {}).pipe(
      map((respuesta: HttpRespuesta<any>) => {
        return respuesta.datos as MensajeSistema[];
      })
    );
  }

  mostrarMensajeError(codigoError: string, defaultError: string = ''): void {
    const errorMsg: string = this.obtenerMensajeSistemaPorId(parseInt(codigoError));
    if (errorMsg !== '') {
      this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
      return;
    }
    if (defaultError !== '') {
      this.alertaService.mostrar(TipoAlerta.Error, defaultError);
      return;
    }
    this.alertaService.mostrar(TipoAlerta.Error, "Error Desconocido");
  }

}
