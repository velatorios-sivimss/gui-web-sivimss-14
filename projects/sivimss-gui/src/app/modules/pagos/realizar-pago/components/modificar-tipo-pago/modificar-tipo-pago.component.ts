import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig} from "primeng/dynamicdialog";
import {TIPO_PAGO_CATALOGOS_CONVENIO, TIPO_PAGO_CATALOGOS_ODS} from "../../constants/dummies";

@Component({
  selector: 'app-modificar-tipo-pago',
  templateUrl: './modificar-tipo-pago.component.html',
  styleUrls: ['./modificar-tipo-pago.component.scss']
})
export class ModificarTipoPagoComponent implements OnInit {

  pagosDeshabilitados: number[] = [5, 8];
  fechasDeshabilitadas: number[] = [3, 4, 5];
  idPago: number = 0;
  total: number = 0;

  readonly CAPTURA_DE_PAGO: number = 1;
  readonly RESUMEN_DE_PAGO: number = 2;
  pasoModificarPago: number = 1;

  tipoPagoForm!: FormGroup;
  tipoPago: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
    this.inicializarTipoPagoForm();
    this.llenarCatalogos();
  }

  inicializarTipoPagoForm(): void {
    this.tipoPagoForm = this.formBuilder.group({
      tipoPagoAnterior: [{value: '', disabled: true}],
      tipoPago: [{value: '', disabled: false}],
      fecha: [{value: null, disabled: false}, [Validators.required]],
      noAutorizacion: [{value: null, disabled: false}, [Validators.required]],
      nombreBanco: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  llenarCatalogos(): void {
    this.tipoPagoForm.get('tipoPagoAnterior')?.patchValue(this.config.data.metodoPago);
    this.total = this.config.data.importe;
    if (this.config.data.tipoPago === 'Pago de Orden de Servicio') {
      this.tipoPago = TIPO_PAGO_CATALOGOS_ODS.filter(t => ![1, 2].includes(t.value));
      console.log(this.tipoPago)
      return;
    }
    this.tipoPago = TIPO_PAGO_CATALOGOS_CONVENIO;
  }

  get pf() {
    return this.tipoPagoForm?.controls
  }


}
