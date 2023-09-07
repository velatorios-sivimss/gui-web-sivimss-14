
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { OverlayPanel } from "primeng/overlaypanel";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { GenerarOrdenSubrogacionService } from '../../services/generar-orden-subrogacion.service';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { GenerarOrdenSubrogacion } from '../../models/generar-orden-subrogacion.interface';
import { ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detalle-generar-orden',
  templateUrl: './detalle-generar-orden.component.html',
  styleUrls: ['./detalle-generar-orden.component.scss'],
  providers: [DialogService, DatePipe, ConfirmationService, DynamicDialogRef, DynamicDialogConfig]
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

  @Input() datos: any;

  cambiarEstatusRef!: DynamicDialogRef;
  modificarRef!: DynamicDialogRef;
  public editForm!: FormGroup;
  public catalogoServicios: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];


  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.inicializarEditForm();
  }

  inicializarEditForm(): void {
    this.editForm = this.formBuilder.group({
      version: new FormControl({ value: '1.0.0', disabled: true }, []),
      fecha: new FormControl({ value: null, disabled: false }, []),
      hora: new FormControl({ value: null, disabled: false }, []),
      delegacion: new FormControl({ value: null, disabled: false }, []),
      velatorio: new FormControl({ value: null, disabled: false }, []),
      razonSocial: new FormControl({ value: null, disabled: false }, []),
      numOrden: new FormControl({ value: null, disabled: false }, []),
      fechaOrden: new FormControl({ value: null, disabled: false }, []),
      nombreFinado: new FormControl({ value: null, disabled: false }, []),
      tipoTraslado: new FormControl({ value: null, disabled: false }, []),
      servicios: new FormControl({ value: null, disabled: false }, []),
      especificaciones: new FormControl({ value: null, disabled: false }, []),
      lugarOrigen: new FormControl({ value: null, disabled: false }, []),
      lugarDestino: new FormControl({ value: null, disabled: false }, []),
      distancia: new FormControl({ value: null, disabled: false }, []),
      nombreOperador: new FormControl({ value: null, disabled: false }, []),
      nombreAcompanante: new FormControl({ value: null, disabled: false }, []),
      numCarroza: new FormControl({ value: null, disabled: false }, []),
      numPlacas: new FormControl({ value: null, disabled: false }, []),
      horaPartida: new FormControl({ value: null, disabled: false }, []),
      diaPartida: new FormControl({ value: null, disabled: false }, []),
    });
  }

  get ef() {
    return this.editForm.controls;
  }

}
