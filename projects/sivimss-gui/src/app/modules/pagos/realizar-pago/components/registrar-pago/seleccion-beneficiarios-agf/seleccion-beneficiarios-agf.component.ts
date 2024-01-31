import {Component} from '@angular/core';
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {ActivatedRoute} from "@angular/router";
import {RegistroAGF} from "../../../modelos/registroAGF.interface";
import {RealizarPagoService} from "../../../services/realizar-pago.service";
import {AlertaService, TipoAlerta} from "../../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {Location} from "@angular/common";

interface Beneficiario {
  nombreBeneficiario: string;
  curp: string;
  numComponente: string;
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
  mostrarModalErrorAGF: boolean = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    private realizarPagoService: RealizarPagoService,
    private alertaService: AlertaService,
    private cargadorService: LoaderService
  ) {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.beneficiarios = respuesta.datos || [];
    this.obtenerParametrosAGF();
  }

  obtenerParametrosAGF(): void {
    this.activatedRoute.queryParams.subscribe(params => {
        const {datos_agf} = params;
        this.datos_agf = JSON.parse(window.atob(datos_agf));
      }
    );
  }

  seleccionarBeneficiario(nombre: string, curp: string, id: string): void {
    this.datos_agf.cveCURPBeneficiario = curp;
    this.datos_agf.nombreBeneficiario = nombre;
    this.datos_agf.idBeneficiario = +id;
    this.cargadorService.activar();
    this.realizarPagoService.guardarAGF(this.datos_agf).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => this.manejoRespuestaExitosaPago(),
      error: (error: HttpErrorResponse): void => this.manejoRespuestaErrorPago(error)
    });
  }

  private manejoRespuestaExitosaPago(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Pago registrado correctamente');
    this.location.back();
  }

  private manejoRespuestaErrorPago(error: HttpErrorResponse): void {
    this.mostrarModalErrorAGF = true;
    console.log(error);
  }

  finalizarAGF(): void {
    this.mostrarModalErrorAGF = false;
    this.location.back();
  }

}
