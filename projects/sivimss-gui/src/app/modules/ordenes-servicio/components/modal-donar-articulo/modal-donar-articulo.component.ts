import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-modal-donar-articulo',
  templateUrl: './modal-donar-articulo.component.html',
  styleUrls: ['./modal-donar-articulo.component.scss'],
})
export class ModalDonarArticuloComponent implements OnInit {
  ataud: string = '';
  salida: any = {};
  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
  ) {}

  ngOnInit(): void {
    this.salida = this.config.data.datos;
    this.ataud = this.config.data.datos;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(null);
  }

  donarAtaud(): void {
    const msg: string =this.mensajesSistemaService.obtenerMensajeSistemaPorId(114);
    this.alertaService.mostrar(TipoAlerta.Exito,msg || "El ataúd ya fue registrado como donado exitosamente.");


    this.salida.esDonado = 1;
    this.salida.proviene = 'paquete';
    this.ref.close(this.salida);
  }
}
