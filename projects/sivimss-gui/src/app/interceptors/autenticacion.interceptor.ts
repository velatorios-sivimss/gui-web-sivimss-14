import {HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {SIVIMSS_TOKEN} from "projects/sivimss-gui/src/app/utils/constantes";
import {EMPTY} from "rxjs";

@Injectable()
export class AutenticacionInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): any {
    const token = localStorage.getItem(SIVIMSS_TOKEN);
    if (!token) return EMPTY;
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(request);
  }

}
