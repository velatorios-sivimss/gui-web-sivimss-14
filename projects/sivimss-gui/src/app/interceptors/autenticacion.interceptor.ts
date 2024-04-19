import {HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {SIVIMSS_TOKEN, SIVIMSS_TOKEN_ONLINE} from "projects/sivimss-gui/src/app/utils/constantes";
import {CookieService} from "ngx-cookie-service";

@Injectable()
export class AutenticacionInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): any {
    let token = this.cookieService.get(SIVIMSS_TOKEN);
    const pathname = window.location.pathname;
    if (pathname.includes('/externo-privado')) {
      token = this.cookieService.get(SIVIMSS_TOKEN_ONLINE);
    }
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    /** INICIA: Prueba para interceptar peticion de servicios externo y reemplazarla por un protocolo http */
    if (request.url.includes("mssivimss-ser-externos") || request.url.includes("serviciosdigitalesinterno")) {
      request = request.clone({
        url: request.url.replace('http://', 'https://')
      })
    }
    /** TERMINA: Prueba para interceptar peticion de servicios externo y reemplazarla por un protocolo http */
    return next.handle(request);
  }

}
