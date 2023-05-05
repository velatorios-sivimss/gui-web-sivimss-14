import {Component, OnInit, ViewChild} from '@angular/core';
import {MENU_STEPPER} from '../../../../inventario-vehicular/constants/menu-stepper';
import {CATALOGOS_DUMMIES} from '../../../../inventario-vehicular/constants/dummies';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Vehiculos} from '../../../models/vehiculos.interface';
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {BreadcrumbService} from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {obtenerFechaActual, obtenerHoraActual} from "../../../../../utils/funciones-fechas";
import {VerificacionInicio} from "../../../models/verificacion-inicio.interface";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {HttpErrorResponse} from "@angular/common/http";
import {RegistroVerificacionInterface} from "../../../models/registro-verificacion.interface";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MenuItem} from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";

@Component({
  selector: 'app-nueva-verificacion',
  templateUrl: './nueva-verificacion.component.html',
  styleUrls: ['./nueva-verificacion.component.scss'],
  providers: [DialogService]
})
export class NuevaVerificacionComponent implements OnInit {

  vehiculoSeleccionado!: VehiculoTemp;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;

  nuevaVerificacionForm!: FormGroup;

  nuevaVerificacion!: VerificacionInicio;
  vehiculo: Vehiculos = {};

  ventanaConfirmacion: boolean = false;
  horaActual: string = obtenerHoraActual();
  fechaActual: string = obtenerFechaActual();

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
    private mantenimientoVehicularService: MantenimientoVehicularService
  ) {
  }

  ngOnInit(): void {
    this.vehiculoSeleccionado = this.config.data.vehiculo;
    this.inicializarVerificacionForm();
    this.revisarRuta();
  }

  revisarRuta(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.ref.close();
      }
    });
  }

  inicializarVerificacionForm(): void {
    this.nuevaVerificacionForm = this.formBuilder.group({
      nivelAceite: [{value: null, disabled: false}, [Validators.required]],
      nivelAgua: [{value: null, disabled: false}, [Validators.required]],
      calibracionNeumaticosTraseros: [{value: null, disabled: false}, [Validators.required]],
      calibracionNeumaticosDelanteros: [{value: null, disabled: false}, [Validators.required]],
      nivelCombustible: [{value: null, disabled: false}, [Validators.required]],
      nivelBateria: [{value: null, disabled: false}, [Validators.required]],
      limpiezaInterior: [{value: null, disabled: false}, [Validators.required]],
      limpiezaExterior: [{value: null, disabled: false}, [Validators.required]],
      codigoFalla: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  obtenerValorNivel(valor: number): string {
    const valores: number[] = [1, 5, 10];
    if (!valores.includes(valor)) return "";
    if (valor === 1) return "BAJO";
    if (valor === 5) return "MEDIO";
    return "CORRECTO";
  }

  crearResumenNuevaVerificacion(): VerificacionInicio {
    return {
      idCalNeuDelanteros: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("calibracionNeumaticosDelanteros")?.value),
      idCalNeuTraseros: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("calibracionNeumaticosTraseros")?.value),
      idCodigoFallo: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("codigoFalla")?.value),
      idLimpiezaExterior: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("limpiezaExterior")?.value),
      idLimpiezaInterior: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("limpiezaInterior")?.value),
      idMttoVehicular: null,
      idMttoVerifInicio: null,
      idNivelAceite: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("nivelAceite")?.value),
      idNivelAgua: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("nivelAgua")?.value),
      idNivelBateria: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("nivelBateria")?.value),
      idNivelCombustible: this.obtenerValorNivel(+this.nuevaVerificacionForm.get("nivelCombustible")?.value)
    }
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    this.ref.close()
  }

  aceptar(): void {
    this.indice++;
    this.nuevaVerificacion = this.crearResumenNuevaVerificacion();
  }

  crearNuevaVerificacion(): RegistroVerificacionInterface {
    return {
      idMttoVehicular: null,
      idMttoestado: 1,
      idVehiculo: 1,
      idDelegacion: 1,
      idVelatorio: 1,
      idEstatus: 1,
      verificacionInicio: {
        idMttoVerifInicio: null,
        idMttoVehicular: null,
        idCalNeuDelanteros: this.nuevaVerificacionForm.get("calibracionNeumaticosDelanteros")?.value,
        idCalNeuTraseros: this.nuevaVerificacionForm.get("calibracionNeumaticosTraseros")?.value,
        idCodigoFallo: this.nuevaVerificacionForm.get("codigoFalla")?.value,
        idLimpiezaExterior: this.nuevaVerificacionForm.get("limpiezaExterior")?.value,
        idLimpiezaInterior: this.nuevaVerificacionForm.get("limpiezaInterior")?.value,
        idNivelAceite: this.nuevaVerificacionForm.get("nivelAceite")?.value,
        idNivelAgua: this.nuevaVerificacionForm.get("nivelAgua")?.value,
        idNivelBateria: this.nuevaVerificacionForm.get("nivelBateria")?.value,
        idNivelCombustible: this.nuevaVerificacionForm.get("nivelCombustible")?.value
      },
      solicitud: null,
      registro: null
    }
  }

  guardarNuevaVerificacion(): void {
    const verificacion: RegistroVerificacionInterface = this.crearNuevaVerificacion();
    this.mantenimientoVehicularService.guardar(verificacion).subscribe(
      (respuesta) => {
        if (!respuesta.datos) return
        this.alertaService.mostrar(TipoAlerta.Exito, 'Verificacion agregada correctamente');
        this.abrirRegistroMantenimiento();
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  abrirRegistroMantenimiento(): void {
    this.ref.close();
    this.router.navigate(['detalle-verificacion'], {
      relativeTo: this.route,
      queryParams: {
        vehiculo: JSON.stringify(this.vehiculoSeleccionado),
        solicitud: JSON.stringify(this.nuevaVerificacion)
      }
    });
  }

  get nvf() {
    return this.nuevaVerificacionForm.controls;
  }


}
