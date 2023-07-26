import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ConfirmacionServicio, ConveniosPrevision } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/models/convenios-prevision.interface';

@Component({
  selector: 'app-habilitar-renovacion',
  templateUrl: './habilitar-renovacion.component.html',
  styleUrls: ['./habilitar-renovacion.component.scss']
})
export class HabilitarRenovacionComponent implements OnInit {
  @Input() convenioSeleccionado!: ConveniosPrevision;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;
  habilitarRenobacionForm!: FormGroup;

  abrirHabilitar: boolean = false;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private alertaService: AlertaService) { }

  ngOnInit(): void {
    //Escenario selección ícono 'ojo' detalle o cambio estatus vista rápida
    this.inicializarAgregarServicioForm();
    if (this.config?.data) {
      this.convenioSeleccionado = this.config.data.servicio;
      this.origen = this.config.data.origen;
    }
  }


  inicializarAgregarServicioForm(): void {
    this.habilitarRenobacionForm = this.formBuilder.group({
      justificacion: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  aceptar(): void {
    this.ref.close();
  }

  continuarHabilitacion() {
    this.abrirHabilitar = true;
    console.log('habilitarrenobacion');
  }

  regresar(): void {
    this.confirmacionAceptar.emit({ estatus: true, origen: "regresar" });
  }

  cerrar(): void {
    this.ref.close();
  }

  realizarCombenio() {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Renovación habilitada correctamente');
    this.ref.close();
    this.confirmacionAceptar.emit({ estatus: true, origen: this.origen });
  }

  get hrf() {
    return this.habilitarRenobacionForm?.controls;
  }

}
