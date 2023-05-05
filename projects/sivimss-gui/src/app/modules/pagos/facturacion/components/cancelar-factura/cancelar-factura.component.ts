import {Component, OnInit} from '@angular/core';
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-cancelar-factura',
  templateUrl: './cancelar-factura.component.html',
  styleUrls: ['./cancelar-factura.component.scss']
})
export class CancelarFacturaComponent implements OnInit {

  motivos: TipoDropdown[] = [];
  cancelarForm!: FormGroup;
  indice: number = 0;

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.inicializarCancelarForm();
  }

  limpiarFiltros(): void {

  }

  private inicializarCancelarForm(): void {
    this.cancelarForm = this.formBuilder.group({
      motivoCancelacion: [{value: null, disabled: false}],
      folioRelacionado: [{value: null, disabled: false}]
    })
  }

  guardar(): void {
    if (this.indice === 0) {
      this.indice++;
      return;
    }
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
  }
}
