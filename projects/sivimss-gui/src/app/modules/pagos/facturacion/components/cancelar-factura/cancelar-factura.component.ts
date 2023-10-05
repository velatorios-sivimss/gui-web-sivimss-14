import {Component, OnInit} from '@angular/core';
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";

interface ParamsCancelar {
  folioFactura: number,
  folioFiscal: string,
  folioRelacionado: string
}

interface MotivoCancelacion {
  descripcion: string,
  clave: string,
  idMotivoCancelacion: number,
  aplicaFolio: boolean
}

@Component({
  selector: 'app-cancelar-factura',
  templateUrl: './cancelar-factura.component.html',
  styleUrls: ['./cancelar-factura.component.scss']
})
export class CancelarFacturaComponent implements OnInit {

  motivos: TipoDropdown[] = [];
  motivosCancelacion: MotivoCancelacion[] = [];
  cancelarForm!: FormGroup;
  registroCancelar!: ParamsCancelar;

  readonly CAPTURA_DE_CANCELACION: number = 1;
  readonly RESUMEN_DE_CANCELACION: number = 2;
  pasoCancelarFactura: number = 1;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
    this.obtenerParametrosCancelar();
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.inicializarCancelarForm();
  }

  inicializarCancelarForm(): void {
    this.cancelarForm = this.formBuilder.group({
      motivoCancelacion: [{value: null, disabled: false}, [Validators.required]],
      folioRelacionado: [{value: this.registroCancelar.folioRelacionado, disabled: false}, [Validators.required]]
    });
  }

  obtenerParametrosCancelar(): void {
    this.activatedRoute.queryParams.pipe(
    ).subscribe(params => {
        const {datos_cancelar} = params;
        this.registroCancelar = JSON.parse(atob(datos_cancelar));
      }
    );
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    this.motivosCancelacion = respuesta.datos;
    this.motivos = mapearArregloTipoDropdown(respuesta.datos, 'descripcion', 'idMotivoCancelacion');
  }

  generarCancelacionFactura(): void {

  }

  get fc() {
    return this.cancelarForm.controls;
  }


}
