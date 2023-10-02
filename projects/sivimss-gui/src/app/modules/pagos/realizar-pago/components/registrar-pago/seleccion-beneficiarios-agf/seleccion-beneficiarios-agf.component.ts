import {Component} from '@angular/core';
import {BENEFICIARIOS} from "../../../constants/catalogos";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {ActivatedRoute} from "@angular/router";
import {filter} from "rxjs/operators";

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

  constructor(private readonly activatedRoute: ActivatedRoute,
  ) {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.beneficiarios = respuesta.datos;
    this.obtenerParametrosAGF();
  }

  obtenerParametrosAGF(): void {
    this.activatedRoute.queryParams.pipe(
      filter(params => params.datos_agf)
    ).subscribe(params => {
        const {datos_agf} = params
        console.log(atob(datos_agf));
      }
    )
  }

}
