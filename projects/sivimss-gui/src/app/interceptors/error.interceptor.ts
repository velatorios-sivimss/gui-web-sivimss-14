import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AlertaService } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { AutenticacionContratanteService } from "../services/autenticacion-contratante.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private alertaService: AlertaService,
    private autententicacionService: AutenticacionService,
    private autenticacionContratanteService: AutenticacionContratanteService,
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.error instanceof ErrorEvent) {
          // this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error inesperado');
          console.error('Ha ocurrido un error inesperado: ', err);
        } else if (err instanceof HttpErrorResponse) {
          this.mostrarErrorDeServidor(err);
        } else {
          // this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error inesperado');
          console.error('Ha ocurrido un error inesperado: ', err);
        }
        return throwError(err);
      })
    );
  }

  private mostrarErrorDeServidor(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        // this.alertaService.mostrar(TipoAlerta.Error, 'Acceso no autorizado');
        console.error(`Acceso no autorizado: `, error);
        this.cerrarSesionConRedireccion();
        break;

      case 403:
        // this.alertaService.mostrar(TipoAlerta.Error, 'Acceso no autorizado');
        console.error(`Acceso no autorizado: `, error);
        this.cerrarSesionConRedireccion();
        break;

      case 404:
        // this.alertaService.mostrar(TipoAlerta.Error, 'Recurso no encontrado');
        console.error(`Recurso no encontrado: `, error);
        break;

      case 500:
        // this.alertaService.mostrar(TipoAlerta.Error, 'Error interno del servidor');
        console.error(`Error interno del servidor: `, error);
        break;

      default:
        // this.alertaService.mostrar(TipoAlerta.Error, 'Ha ocurrido un error inesperado');
        console.error(`Error desconocido: `, error);
        break;
    }
  }

  private cerrarSesionConRedireccion() {
    const pathname = window.location.pathname;
    if (pathname.includes('/externo-privado') || pathname.includes('/externo-public')) {
      this.autenticacionContratanteService.cerrarSesion();
    } else {
      this.autententicacionService.cerrarSesion();
    }
  }

}
