import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { GenerarOrdenSubrogacion } from "../../models/generar-orden-subrogacion.interface";
import { OverlayPanel } from "primeng/overlaypanel";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { GenerarOrdenSubrogacionService } from '../../services/generar-orden-subrogacion.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';

@Component({
  selector: 'app-detalle-generar-orden',
  templateUrl: './detalle-generar-orden.component.html',
  styleUrls: ['./detalle-generar-orden.component.scss'],
  providers: [DialogService]
})
export class DetalleGenerarOrdenComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @Input() generarOrdenSubrogacion!: GenerarOrdenSubrogacion;

  @Input() origen!: string;

  @Output()
  confirmacionAceptar: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  cancelarConfirmacion: EventEmitter<boolean> = new EventEmitter<boolean>();

  cambiarEstatusRef!: DynamicDialogRef;
  modificarRef!: DynamicDialogRef;


  constructor(
    private alertaService: AlertaService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void { }

}
