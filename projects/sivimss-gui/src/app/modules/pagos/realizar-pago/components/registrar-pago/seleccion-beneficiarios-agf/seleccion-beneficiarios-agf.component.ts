import {Component} from '@angular/core';
import {BENEFICIARIOS} from "../../../constants/catalogos";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-seleccion-beneficiarios-agf',
  templateUrl: './seleccion-beneficiarios-agf.component.html',
  styleUrls: ['./seleccion-beneficiarios-agf.component.scss']
})
export class SeleccionBeneficiariosAgfComponent {

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  constructor(private readonly activatedRoute: ActivatedRoute,
  ) {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.beneficiarios = respuesta.datos;
  }

  beneficiarios: any[] = BENEFICIARIOS;

  protected readonly DIEZ_ELEMENTOS_POR_PAGINA = DIEZ_ELEMENTOS_POR_PAGINA;
}
