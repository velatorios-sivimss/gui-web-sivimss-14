import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmacionServicio, Vehiculos } from '../../../models/vehiculos.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { CATALOGOS_DUMMIES, CATALOGOS_TTIPO_MANTENIMIENTO } from '../../../../inventario-vehicular/constants/dummies';

@Component({
  selector: 'app-solicitud-mantenimiento',
  templateUrl: './solicitud-mantenimiento.component.html',
  styleUrls: ['./solicitud-mantenimiento.component.scss'],
  providers: [DialogService]
})
export class SolicitudMantenimientoComponent implements OnInit {
  ventanaConfirmacion: boolean = false;

  @Input() vehiculoSeleccionado!: Vehiculos;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();
  creacionRef!: DynamicDialogRef;

  solicitudMantenimientoForm!: FormGroup;
  tiposProveedor: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoMantenimiento: TipoDropdown[] = CATALOGOS_TTIPO_MANTENIMIENTO;
  mantPreventivo: boolean = false
  mantcorrectivo: boolean = false
  opcionesMantenimiento: boolean = false


  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
  ) {this.vehiculoSeleccionado = this.config.data;}

  ngOnInit(): void {
    if (this.config?.data) {
      this.origen = this.config.data.origen;
        this.vehiculoSeleccionado = this.config.data.vehiculo;
    }
    this.vehiculoSeleccionado
    this.vehiculoSeleccionado.velatorio
    this.inicializarAgregarCapillaForm(this.vehiculoSeleccionado);
  }

  inicializarAgregarCapillaForm(vehiculoSeleccionado: Vehiculos) {
    this.solicitudMantenimientoForm = this.formBuilder.group({
      velatorio: [{value: vehiculoSeleccionado.velatorio, disabled: true}],
      fecha: [{value: vehiculoSeleccionado.fecha, disabled: false}, [Validators.required]],
      hora: [{value: vehiculoSeleccionado.hora, disabled: false}, [Validators.required]],
      vehiculo: [{value: vehiculoSeleccionado.vehiculo, disabled: false}, [Validators.required]],
      placas: [{value: vehiculoSeleccionado.placas, disabled: true}, [Validators.required]],
      nivelAceite: [{value: vehiculoSeleccionado.nivelAceite, disabled: false}],
      nivelAgua: [{value: vehiculoSeleccionado.nivelAgua, disabled: false}],
      calibracionNeumaticosTraseros: [{value: vehiculoSeleccionado.calibracionNeumaticosTraseros, disabled: false}],
      calibracionNeumaticosDelanteros: [{value: vehiculoSeleccionado.calibracionNeumaticosDelanteros, disabled: false}],
      nivelCombustible: [{value: vehiculoSeleccionado.nivelCombustible, disabled: false}],
      nivelBateria: [{value: vehiculoSeleccionado.nivelBateria, disabled: false}],
      limpiezaInterior: [{value: vehiculoSeleccionado.limpiezaInterior, disabled: false}],
      limpiezaExterior: [{value: vehiculoSeleccionado.limpiezaExterior, disabled: false}],
      codigoFalla: [{value: vehiculoSeleccionado.codigoFalla, disabled: false}],
      marca: [{value: vehiculoSeleccionado.marca, disabled: true}],
      anio: [{value: vehiculoSeleccionado.anio, disabled: true}],
      kilometraje: [{value: vehiculoSeleccionado.kilometraje, disabled: false}],
      tipoMantenimiento: [{value: vehiculoSeleccionado.tipoMantenimientoNumber, disabled: false}],
      fechaMantenimiento: [{value: vehiculoSeleccionado.fechaMantenimiento, disabled: false}],
      modalidad: [{value: vehiculoSeleccionado.modalidadNumber, disabled: false}],
      fechaRegistro: [{value: vehiculoSeleccionado.fechaRegistro, disabled: false}],

    });
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

  agregar():void{
    this.ventanaConfirmacion = true;
  }

  regresar(): void{
    this.ventanaConfirmacion = false;
  }

  cerrar(): void {
    this.ref.close()
  }


  mostrarOpcionesDeMantenimiento(){
this.opcionesMantenimiento = true

    if(this.mantPreventivo == false){
      this.mantPreventivo = true
    }else{
      this.mantPreventivo = false
    }
  }


}
