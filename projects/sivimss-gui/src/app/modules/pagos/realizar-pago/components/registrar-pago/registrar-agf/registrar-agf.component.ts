import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-registrar-agf',
  templateUrl: './registrar-agf.component.html',
  styleUrls: ['./registrar-agf.component.scss']
})
export class RegistrarAgfComponent implements OnInit {
  agfForm!: FormGroup;
  ramos: TipoDropdown[] = [];
  identificaciones: TipoDropdown[] = [];
  indice: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.inicializarAgfForm();
  }

  aceptar(): void {
    if (this.indice === 1) {
      this.ref.close();
      this.router.navigate(['../agf-seleccion-beneficiarios'], {relativeTo: this.route})
      return;
    }
    this.indice++;
  }

  private inicializarAgfForm(): void {
    this.agfForm = this.formBuilder.group({
      ramo: [{value: null, disabled: false}],
      identificacionOficial: [{value: null, disabled: false}],
      numeroIdentificacion: [{value: null, disabled: false}],
      curp: [{value: null, disabled: false}],
      actaDefuncion: [{value: null, disabled: false}],
      cuentaGastos: [{value: null, disabled: false}],
      documentoNSS: [{value: null, disabled: false}],
    })
  }

  cancelar(): void {

  }
}
