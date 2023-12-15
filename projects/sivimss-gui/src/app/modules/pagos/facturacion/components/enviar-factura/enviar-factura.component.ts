import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {PATRON_CORREO} from "../../../../../utils/constantes";

interface ParamsEnviar {
  folioFactura: number,
  folioFiscal: string,
  folioRelacionado: string
}

@Component({
  selector: 'app-enviar-factura',
  templateUrl: './enviar-factura.component.html',
  styleUrls: ['./enviar-factura.component.scss']
})
export class EnviarFacturaComponent implements OnInit {

  enviarForm!: FormGroup;
  mostrarDialogEnviar: boolean = false;
  registroEnviar!: ParamsEnviar;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
    this.obtenerParametrosEnviar();
  }

  ngOnInit(): void {
    this.inicializarEnviarForm();
  }

  obtenerParametrosEnviar(): void {
    this.activatedRoute.queryParams.pipe(
    ).subscribe(params => {
        const {datos_enviar} = params;
        this.registroEnviar = JSON.parse(window.atob(datos_enviar));
      }
    );
  }

  inicializarEnviarForm(): void {
    this.enviarForm = this.formBuilder.group({
      correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
    });
  }

  get fc() {
    return this.enviarForm.controls;
  }

}
