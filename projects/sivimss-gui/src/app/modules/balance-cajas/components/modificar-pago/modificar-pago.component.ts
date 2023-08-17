import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import {BalanceCajaService} from '../../services/balance-caja.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { mensajes } from '../../../reservar-salas/constants/mensajes';
import {ModificarPagoInterface} from '../../models/balance-caja.interface';

@Component({
  selector: 'app-modificar-pago',
  templateUrl: './modificar-pago.component.html',
  styleUrls: ['./modificar-pago.component.scss']
})
export class ModificarPagoComponent implements OnInit {

  modificarPagoForm!: FormGroup;
  pagoSeleccionado: ModificarPagoInterface = {}
  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

  constructor(
    public config: DynamicDialogConfig,
    private alertaService: AlertaService,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private balanceCajaService: BalanceCajaService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.pagoSeleccionado = this.config.data.pagoSeleccionado;
    }
    this.inicializarModificarPagoForm();
  }

  inicializarModificarPagoForm(): void {
    this.modificarPagoForm = this.formBulder.group({
        modificarPago: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
    });
  }

  modificarPago(): void {

  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get ref() {
    return this.modificarPagoForm.controls;
  }

}
