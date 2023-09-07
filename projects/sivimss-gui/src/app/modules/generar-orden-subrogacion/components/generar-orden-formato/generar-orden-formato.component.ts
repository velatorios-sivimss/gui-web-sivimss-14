import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from "primeng/api";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { GenerarOrdenSubrogacionService } from '../../services/generar-orden-subrogacion.service';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-generar-orden-formato',
  templateUrl: './generar-orden-formato.component.html',
  styleUrls: ['./generar-orden-formato.component.scss'],
  providers: [DatePipe, ConfirmationService, DynamicDialogConfig]
})
export class GenerarOrdenFormatoComponent implements OnInit {

  public editForm!: FormGroup;
  public catalogoServicios: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];

  constructor(
    public config: DynamicDialogConfig,
    private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
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
