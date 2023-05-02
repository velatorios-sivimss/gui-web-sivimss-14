import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MENU_STEPPER} from '../../../../inventario-vehicular/constants/menu-stepper';
import {MenuItem} from 'primeng/api';
import {CATALOGOS_DUMMIES} from '../../../../inventario-vehicular/constants/dummies';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ConfirmacionServicio, Vehiculos} from '../../../models/vehiculos.interface';
import {AbstractControl, FormArray} from "@angular/forms";

import {Funcionalidad} from "projects/sivimss-gui/src/app/modules/roles/models/funcionalidad.interface";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {BreadcrumbService} from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {ActivatedRoute, Router} from '@angular/router';
import {DetalleNuevaVerificacionComponent} from '../detalle-nueva-verificacion/detalle-nueva-verificacion.component';

@Component({
  selector: 'app-nueva-verificacion',
  templateUrl: './nueva-verificacion.component.html',
  styleUrls: ['./nueva-verificacion.component.scss'],
  providers: [DialogService]
})
export class NuevaVerificacionComponent implements OnInit {

  @Input() vehiculoSeleccionado!: Vehiculos;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();
  creacionRef!: DynamicDialogRef;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  direccionReferencia: boolean = false;

  responsables: TipoDropdown[] = CATALOGOS_DUMMIES;
  tiposProveedor: TipoDropdown[] = CATALOGOS_DUMMIES;
  usos: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;
  numerosSerie: TipoDropdown[] = CATALOGOS_DUMMIES;

  nuevaVerificacionForm!: FormGroup;
  selectedNivelAceite: boolean = false;

  nuevaVerificacion!: Vehiculos;
  vehiculo: Vehiculos = {};
  // vehiculoSeleccionado!: Vehiculos;

  ventanaConfirmacion: boolean = false;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.vehiculoSeleccionado = this.config.data;
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.origen = this.config.data.origen;
      this.vehiculoSeleccionado = this.config.data.vehiculo;
    }
    this.vehiculoSeleccionado.velatorio;
    this.inicializarAgregarCapillaForm(this.vehiculoSeleccionado);
  }

  inicializarAgregarCapillaForm(vehiculoSeleccionado: Vehiculos) {
    this.nuevaVerificacionForm = this.formBuilder.group({
      velatorio: [{value: vehiculoSeleccionado.velatorio, disabled: true}],
      fecha: [{value: vehiculoSeleccionado.fecha, disabled: false}, [Validators.required]],
      hora: [{value: vehiculoSeleccionado.hora, disabled: false}, [Validators.required]],
      vehiculo: [{value: vehiculoSeleccionado.vehiculo, disabled: false}, [Validators.required]],
      placas: [{value: vehiculoSeleccionado.placas, disabled: false}, [Validators.required]],
      nivelAceite: [{value: vehiculoSeleccionado.nivelAceite, disabled: false}],
      nivelAgua: [{value: vehiculoSeleccionado.nivelAgua, disabled: false}],
      calibracionNeumaticosTraseros: [{value: vehiculoSeleccionado.calibracionNeumaticosTraseros, disabled: false}],
      calibracionNeumaticosDelanteros: [{value: vehiculoSeleccionado.calibracionNeumaticosDelanteros, disabled: false}],
      nivelCombustible: [{value: vehiculoSeleccionado.nivelCombustible, disabled: false}],
      nivelBateria: [{value: vehiculoSeleccionado.nivelBateria, disabled: false}],
      limpiezaInterior: [{value: vehiculoSeleccionado.limpiezaInterior, disabled: false}],
      limpiezaExterior: [{value: vehiculoSeleccionado.limpiezaExterior, disabled: false}],
      codigoFalla: [{value: vehiculoSeleccionado.codigoFalla, disabled: false}],
    });
  }


  confirmarAgregarServicio(): void {
    this.ventanaConfirmacion = true;
    /*
    * Se mandará solo texto para que el detalle solo lo imprim por lo que se deben llenar las variables
    * que son 'desc'*/
    this.vehiculo = {
      id: this.nuevaVerificacionForm.get("id")?.value,
      velatorio: this.nuevaVerificacionForm.get("categoria")?.value,
      fecha: this.nuevaVerificacionForm.get("tipoDeArticulo")?.value,
      hora: this.nuevaVerificacionForm.get("tipoDeMaterial")?.value,
      tamanio: this.nuevaVerificacionForm.get("tamanio")?.value,
      placas: this.nuevaVerificacionForm.get("clasificacionDeProducto")?.value,
      nivelAceite: this.nuevaVerificacionForm.get("modeloDeArticulo")?.value,
      nivelAgua: this.nuevaVerificacionForm.get("descripcionDeProducto")?.value,
      calibracionNeumaticosTraseros: this.nuevaVerificacionForm.get("largo")?.value,
      calibracionNeumaticosDelanteros: this.nuevaVerificacionForm.get("ancho")?.value,
      nivelCombustible: this.nuevaVerificacionForm.get("alto")?.value,
      estatus: this.nuevaVerificacionForm.get("estatus")?.value,
      nivelBateria: this.nuevaVerificacionForm.get("claveSAT")?.value,
      limpiezaInterior: this.nuevaVerificacionForm.get("cuentaClave")?.value,
      limpiezaExterior: this.nuevaVerificacionForm.get("cuentaContable")?.value,
      codigoFalla: this.nuevaVerificacionForm.get("partidaPresupuestal")?.value,
    };
  }


  regresarPagina(): void {
    this.indice--;
  }

  cancelar(): void {
    this.ref.close()
  }

  aceptar() {
    this.ventanaConfirmacion = true;
  }

  crearNuevaVerificacion() {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Verificacion agregada correctamente');
    this.ref.close();
    this.abrirModalRegistroMantenimiento();
  }

  abrirModalRegistroMantenimiento(): void {
    this.router.navigate(['detalle-verificacion'], {relativeTo: this.route});

  }

  get nvf() {
    return this.nuevaVerificacionForm.controls;
  }


}
