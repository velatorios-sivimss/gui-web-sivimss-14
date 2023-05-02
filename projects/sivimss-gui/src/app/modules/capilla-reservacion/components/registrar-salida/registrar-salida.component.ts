import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-registrar-salida',
  templateUrl: './registrar-salida.component.html',
  styleUrls: ['./registrar-salida.component.scss']
})
export class RegistrarSalidaComponent implements OnInit {

  constructor(
    private alertaService: AlertaService,
    private readonly ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {

  }


  confirmarEntrada(valor?:boolean): void {
    if(valor){
      this.alertaService.mostrar(TipoAlerta.Exito, 'as registrado la salida/término del servicio correctamente.');
      this.ref.close();
    }
  }

  cancelar(): void {
    this.ref.close();
  }

}
