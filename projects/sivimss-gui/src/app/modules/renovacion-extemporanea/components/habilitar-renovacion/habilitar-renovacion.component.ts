import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ConfirmacionServicio, ConveniosPrevision, GenerarRenovacionConvenio } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/models/convenios-prevision.interface';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { RenovacionExtemporaneaService } from '../../services/renovacion-extemporanea.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ERROR_GUARDAR_INFORMACION } from '../../../mantenimiento-vehicular/constants/catalogos-filtros';

@Component({
  selector: 'app-habilitar-renovacion',
  templateUrl: './habilitar-renovacion.component.html',
  styleUrls: ['./habilitar-renovacion.component.scss']
})
export class HabilitarRenovacionComponent implements OnInit {
  @Input() convenioSeleccionado!: ConveniosPrevision;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;
  habilitarRenovacionForm!: FormGroup;

  abrirHabilitar: boolean = false;
  mostrarMsjConfirmacion: boolean = false;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private readonly loaderService: LoaderService,
    private renovacionExtemporaneaService: RenovacionExtemporaneaService,
    private mensajesSistemaService: MensajesSistemaService
  ) { }

  ngOnInit(): void {
    //Escenario selección ícono 'ojo' detalle o cambio estatus vista rápida
    this.inicializarAgregarServicioForm();
    if (this.config?.data) {
      this.convenioSeleccionado = this.config.data.convenio;
      this.obtenerDetalleConvenio();
    }
  }

  obtenerDetalleConvenio() {
    if (this.convenioSeleccionado.id) {
      this.loaderService.activar();
      this.renovacionExtemporaneaService.obtenerDetalleConvenio(this.convenioSeleccionado.id)
        .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
          next: (respuesta: HttpRespuesta<any>): void => {
            if (respuesta?.datos) {
              this.convenioSeleccionado = respuesta?.datos;
            }
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
          }
        });
    }
  }


  inicializarAgregarServicioForm(): void {
    this.habilitarRenovacionForm = this.formBuilder.group({
      justificacion: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(100)]],
    });
  }

  cancelar(): void {
    this.ref.close(false);
  }

  habilitarRenovacion() {
    this.abrirHabilitar = true;
    this.habilitarRenovacionForm.markAllAsTouched();
  }

  habilitarRenovacionConfirmar() {
    this.mostrarMsjConfirmacion = true;
  }

  renovarConvenio() {
    this.loaderService.activar();
    this.renovacionExtemporaneaService.renovarCovenio(this.datosRenovacionConvenio())
      .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta?.datos) {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(146);
            this.alertaService.mostrar(TipoAlerta.Exito, msg);
            this.ref.close(true);
          } else {
            if (respuesta.mensaje === '36') {
              const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(36);
              this.alertaService.mostrar(TipoAlerta.Error, msg);
            }
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, ERROR_GUARDAR_INFORMACION);
        }
      });
  }

  datosRenovacionConvenio(): GenerarRenovacionConvenio {
    return {
      idConvenio: this.convenioSeleccionado.id,
      justificacion: this.hrf.justificacion.value,
      indRenovacion: 1,
    }
  }

  get hrf() {
    return this.habilitarRenovacionForm?.controls;
  }

}
