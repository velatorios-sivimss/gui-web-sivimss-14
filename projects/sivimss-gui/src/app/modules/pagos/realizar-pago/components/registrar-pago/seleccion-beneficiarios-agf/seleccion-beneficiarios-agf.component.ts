import {Component} from '@angular/core';
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {ActivatedRoute, Router} from "@angular/router";
import {RegistroAGF} from "../../../modelos/registroAGF.interface";
import {RegistroPago} from "../../../modelos/registroPago.interface";
import {RealizarPagoService} from "../../../services/realizar-pago.service";
import {AlertaService, TipoAlerta} from "../../../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from "../../../../../../models/http-respuesta.interface";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";

interface Beneficiario {
  nombreBeneficiario: string;
  curp: string;
}

@Component({
  selector: 'app-seleccion-beneficiarios-agf',
  templateUrl: './seleccion-beneficiarios-agf.component.html',
  styleUrls: ['./seleccion-beneficiarios-agf.component.scss']
})
export class SeleccionBeneficiariosAgfComponent {

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  beneficiarios: Beneficiario[] = [];
  datos_agf!: RegistroAGF;
  datos_pago!: RegistroPago;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private route: Router,
    private realizarPagoService: RealizarPagoService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService
  ) {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.beneficiarios = respuesta.datos || [];
    this.obtenerParametrosAGF();
  }

  obtenerParametrosAGF(): void {
    this.activatedRoute.queryParams.subscribe(params => {
        const {datos_agf, datos_pago} = params;
        this.datos_agf = JSON.parse(window.atob(datos_agf));
        this.datos_pago = JSON.parse(window.atob(datos_pago));
      }
    );
  }

  seleccionarBeneficiario(nombre: string, curp: string): void {
    this.datos_agf.cveCURPBeneficiario = curp;
    this.datos_agf.nombreBeneficiario = nombre;
    this.cargadorService.activar();
    this.realizarPagoService.guardar(this.datos_pago).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejoRespuestaBeneficiarios(respuesta),
      error: (error: HttpErrorResponse): void => this.manejoRespuestaErrorPago(error)
    });
  }

  private manejoRespuestaBeneficiarios(respuesta: HttpRespuesta<any>): void {
    const {idPagoDetalle} = respuesta.datos[0];
    this.crearAGF(idPagoDetalle);
  }

  crearAGF(idPagoDetalle: number): void {
    this.datos_agf.idPagoDetalle = idPagoDetalle;
    this.realizarPagoService.guardarAGF(this.datos_agf).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => this.manejoRespuestaExitosaPago(),
      error: (error: HttpErrorResponse): void => this.manejoRespuestaErrorPago(error)
    });
  }

  private manejoRespuestaExitosaPago(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Pago registrado correctamente');
    void this.route.navigate(['../../../pago-orden-servicio'], {relativeTo: this.activatedRoute})
  }

  private manejoRespuestaErrorPago(error: HttpErrorResponse): void {
    const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
    console.log(error);
  }

}
