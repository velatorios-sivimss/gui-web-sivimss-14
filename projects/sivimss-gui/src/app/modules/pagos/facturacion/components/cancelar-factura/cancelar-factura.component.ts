import {Component, OnInit} from '@angular/core';
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";

interface ParamsCancelar {
  folioFactura: number,
  folioFiscal: string,
  folioRelacionado: string
}

@Component({
  selector: 'app-cancelar-factura',
  templateUrl: './cancelar-factura.component.html',
  styleUrls: ['./cancelar-factura.component.scss']
})
export class CancelarFacturaComponent implements OnInit {

  motivos: TipoDropdown[] = [];
  cancelarForm!: FormGroup;
  mostrarDialogCancelacion: boolean = false;
  registroCancelar!: ParamsCancelar;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
    this.obtenerParametrosCancelar();
  }

  ngOnInit(): void {
    this.inicializarCancelarForm();
  }

  inicializarCancelarForm(): void {
    this.cancelarForm = this.formBuilder.group({
      motivoCancelacion: [{value: null, disabled: false}, [Validators.required]],
      folioRelacionado: [{value: this.registroCancelar.folioRelacionado, disabled: false}, [Validators.required]]
    });
  }

  get fc() {
    return this.cancelarForm.controls;
  }

  obtenerParametrosCancelar(): void {
    this.activatedRoute.queryParams.pipe(
    ).subscribe(params => {
        const {datos_cancelar} = params;
        this.registroCancelar = JSON.parse(atob(datos_cancelar));
      }
    );
  }
}
