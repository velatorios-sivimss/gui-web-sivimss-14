import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { BalanceCajaService } from '../../services/balance-caja.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { mensajes } from '../../../reservar-salas/constants/mensajes';
import { ModificarPagoInterface } from '../../models/balance-caja.interface';

@Component({
  selector: 'app-modificar-pago',
  templateUrl: './modificar-pago.component.html',
  styleUrls: ['./modificar-pago.component.scss']
})
export class ModificarPagoComponent implements OnInit {

  modificarPagoForm!: FormGroup;
  pagoSeleccionado: ModificarPagoInterface = {}
  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;
  balanceSeleccionado: any;
  fechaCierre: any;
  horaCierre: any;
  esModificacion: boolean = true;

  constructor(
    private alertaService: AlertaService,
    private formBulder: FormBuilder,
    private balanceCajaService: BalanceCajaService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.balanceSeleccionado = this.balanceCajaService.balanceSeleccionado;
    console.log("BALANCE SELECCIONADO: ", this.balanceSeleccionado);
    if (this.balanceSeleccionado.fecHoraCierre) {
      let parts = this.balanceSeleccionado.fecHoraCierre.split(' ');
      if (parts.length === 2) {
        this.fechaCierre = parts[0];
        this.horaCierre = parts[1];
      }
    }
    if (this.balanceSeleccionado.modifPago) {
      this.esModificacion = false;
    } else {
      this.inicializarModificarPagoForm();
    }
  }

  inicializarModificarPagoForm(): void {
    this.modificarPagoForm = this.formBulder.group({
      modificarPago: [{ value: null, disabled: false }, [Validators.maxLength(100), Validators.required]],
    });
  }

  modificarPago(): void {
    let data = {
      idPagoDetalle: this.balanceSeleccionado.idPagoDetalle,
      motivoModifica: this.modificarPagoForm.get("modificarPago")?.value
    }
    console.log("DATA: ", data);
  }

  limpiar(): void {
    this.modificarPagoForm.reset();
  }

  get ref() {
    return this.modificarPagoForm.controls;
  }

}
