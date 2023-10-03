import {Component} from '@angular/core';
import {BENEFICIARIOS} from "../../../constants/catalogos";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {ActivatedRoute} from "@angular/router";
import {filter} from "rxjs/operators";
import {RegistroAGF} from "../../../modelos/registroAGF.interface";
import {RegistroPago} from "../../../modelos/registroPago.interface";
import {RealizarPagoService} from "../../../services/realizar-pago.service";
import {AlertaService, TipoAlerta} from "../../../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {HttpErrorResponse} from "@angular/common/http";

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

  constructor(private readonly activatedRoute: ActivatedRoute,
              private realizarPagoService: RealizarPagoService,
              private alertaService: AlertaService,
              private mensajesSistemaService: MensajesSistemaService,
  ) {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.beneficiarios = respuesta.datos;
  }

  obtenerParametrosAGF(): void {
    this.activatedRoute.queryParams.pipe(
    ).subscribe(params => {
        const {datos_agf, datos_pago} = params;
        this.datos_agf = JSON.parse(atob(datos_agf));
        this.datos_pago = JSON.parse(atob(datos_pago));
      }
    );
  }

  seleccionarBeneficiario(nombre: string, curp: string): void {
    this.datos_agf.cveCURPBeneficiario = curp;
    this.datos_agf.nombreBeneficiario = nombre;
    this.realizarPagoService.guardar(this.datos_pago).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago registrado correctamente');
      },
      error: (error: HttpErrorResponse): void => {
        const ERROR: string = 'Error al guardar la información del Pago. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        console.log(error);
      }
    });
  }

  crearAGF(): void {

  }

}
