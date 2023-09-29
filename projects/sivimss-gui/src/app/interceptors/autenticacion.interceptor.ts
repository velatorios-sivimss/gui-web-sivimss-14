import {HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {SIVIMSS_TOKEN} from "projects/sivimss-gui/src/app/utils/constantes";

@Injectable()
export class AutenticacionInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): any {
    const token = localStorage.getItem(SIVIMSS_TOKEN);
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    /** INICIA: Prueba para interceptar peticion de servicios externo y reemplazarla por un protocolo http */
    if (request.url.includes("mssivimss-ser-externos")) {
      request = request.clone({
        url: request.url.replace('https://','http://')
      })
    }
    /** TERMINA: Prueba para interceptar peticion de servicios externo y reemplazarla por un protocolo http */
    return next.handle(request);
  }

}
