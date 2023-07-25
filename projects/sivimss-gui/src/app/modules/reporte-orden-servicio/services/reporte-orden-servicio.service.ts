import {Injectable} from "@angular/core";
import {BaseService} from "../../../utils/base-service";
import {HttpRespuesta} from "../../../models/http-respuesta.interface";
import {HttpClient} from "@angular/common/http";
import {AutenticacionService} from "../../../services/autenticacion.service";
import {environment} from "../../../../environments/environment";

@Injectable()
export class ReporteOrdenServicioService extends BaseService<HttpRespuesta<any>, any>{

  constructor(_http: HttpClient, private authService: AutenticacionService) {
    super(_http, `${environment.api.mssivimss}`, '', '', 25, '', '', '');
  }
}
