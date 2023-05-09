import {Component, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {REGISTROS_PAGOS} from "../../constants/dummies";

@Component({
  selector: 'app-solicitar-factura',
  templateUrl: './solicitar-factura.component.html',
  styleUrls: ['./solicitar-factura.component.scss']
})
export class SolicitarFacturaComponent implements OnInit {


  solicitudForm!: FormGroup;
  indice: number = 0;
  tiposFactura: TipoDropdown[] = [];
  folios: TipoDropdown[] = [];
  datosContratanteForm!: FormGroup;

  constructor() {
  }

  ngOnInit(): void {
  }

  protected readonly DIEZ_ELEMENTOS_POR_PAGINA = DIEZ_ELEMENTOS_POR_PAGINA;
  servicios: any[] = REGISTROS_PAGOS;
}
