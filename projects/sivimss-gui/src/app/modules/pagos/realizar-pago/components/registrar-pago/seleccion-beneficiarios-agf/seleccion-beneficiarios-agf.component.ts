import {Component} from '@angular/core';
import {BENEFICIARIOS} from "../../../constants/catalogos";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {ActivatedRoute} from "@angular/router";
import {filter} from "rxjs/operators";
import {RegistroAGF} from "../../../modelos/registroAGF.interface";
import {RegistroPago} from "../../../modelos/registroPago.interface";

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
  ) {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.beneficiarios = respuesta.datos;
    this.obtenerParametrosAGF();
    console.log(this.datos_agf);
    console.log(this.datos_pago);
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
    console.log(this.datos_agf)
  }

}
