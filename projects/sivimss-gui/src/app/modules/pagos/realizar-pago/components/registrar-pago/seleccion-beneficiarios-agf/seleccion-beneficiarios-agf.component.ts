import {Component} from '@angular/core';
import {BENEFICIARIOS} from "../../../constants/catalogos";

@Component({
  selector: 'app-seleccion-beneficiarios-agf',
  templateUrl: './seleccion-beneficiarios-agf.component.html',
  styleUrls: ['./seleccion-beneficiarios-agf.component.scss']
})
export class SeleccionBeneficiariosAgfComponent {

  beneficiarios: any[] = BENEFICIARIOS;

}
