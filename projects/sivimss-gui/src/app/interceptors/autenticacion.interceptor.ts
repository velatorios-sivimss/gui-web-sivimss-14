import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SIVIMSS_TOKEN } from "projects/sivimss-gui/src/app/utils/constantes";

@Injectable()
export class AutenticacionInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): any {
    const token = localStorage.getItem(SIVIMSS_TOKEN);
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }

}
