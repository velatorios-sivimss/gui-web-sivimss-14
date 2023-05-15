import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {
  CATALOGOS_PREV_ANUALES,
  CATALOGOS_PREV_EVENTUALES,
  CATALOGOS_PREV_SEMESTRALES
} from "../../../constants/catalogos-preventivo";
import {CATALOGOS_TTIPO_MANTENIMIENTO} from "../../../../inventario-vehicular/constants/dummies";
import {RegistroVerificacionInterface} from "../../../models/registro-verificacion.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {DatePipe} from "@angular/common";
import {ResumenAsignacion} from "../../../models/resumenAsignacion.interface";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-solicitud-mantenimiento',
  templateUrl: './solicitud-mantenimiento.component.html',
  styleUrls: ['./solicitud-mantenimiento.component.scss'],
  providers: [DialogService, DatePipe]
})
export class SolicitudMantenimientoComponent implements OnInit {
  ventanaConfirmacion: boolean = false;

  vehiculoSeleccionado!: VehiculoTemp;
  resumenAsignacion!: ResumenAsignacion;

  solicitudMantenimientoForm!: FormGroup;
  mantenimientosPrev: TipoDropdown[] = [];
  tiposMantenimiento: TipoDropdown[] = CATALOGOS_TTIPO_MANTENIMIENTO;
  modalidades: string[] = ['', 'Semestral', 'Anual', 'Frecuente']

  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private mantenimientoVehicularService: MantenimientoVehicularService
  ) {
    this.vehiculoSeleccionado = this.config.data;
  }

  ngOnInit(): void {
    this.vehiculoSeleccionado = this.config.data.vehiculo;
    this.inicializarSolicitudForm(this.vehiculoSeleccionado);
  }

  inicializarSolicitudForm(vehiculoSeleccionado: VehiculoTemp) {
    this.solicitudMantenimientoForm = this.formBuilder.group({
      placas: [{value: vehiculoSeleccionado.DES_PLACAS, disabled: true}],
      marca: [{value: vehiculoSeleccionado.DES_MARCA, disabled: true}],
      anio: [{value: vehiculoSeleccionado.DES_MODELO, disabled: true}],
      kilometraje: [{value: null, disabled: false}, [Validators.required]],
      tipoMantenimiento: [{value: null, disabled: false}, [Validators.required]],
      matPreventivo: [{value: null, disabled: false}],
      modalidad: [{value: null, disabled: false}, [Validators.required]],
      fechaRegistro: [{value: null, disabled: false}, [Validators.required]],
      notas: [{value: null, disabled: false}, [Validators.required]],
    });
    this.solicitudMantenimientoForm.get("modalidad")?.valueChanges.subscribe(() => {
      this.asignarOpcionesMantenimiento();
    })
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

  agregar(): void {
    this.resumenAsignacion = this.crearResumenAsignacion();
    this.ventanaConfirmacion = true;
  }

  regresar(): void {
    this.ventanaConfirmacion = false;
  }

  cerrar(): void {
    this.ref.close()
  }

  asignarOpcionesMantenimiento(): void {
    const modalidad: number = +this.solicitudMantenimientoForm.get("modalidad")?.value;
    if (![1, 2, 3].includes(modalidad)) return;
    if (modalidad === 1) {
      this.mantenimientosPrev = CATALOGOS_PREV_SEMESTRALES;
      return;
    }
    if (modalidad === 2) {
      this.mantenimientosPrev = CATALOGOS_PREV_ANUALES;
      return;
    }
    this.mantenimientosPrev = CATALOGOS_PREV_EVENTUALES;
  }

  crearResumenAsignacion(): ResumenAsignacion {
    const tipoMantenimiento = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    const tipoMantenimientoValor = this.tiposMantenimiento.find(m => m.value === tipoMantenimiento)?.label;
    const modalidad = this.solicitudMantenimientoForm.get("modalidad")?.value;
    const modalidadValor = this.modalidades[modalidad] || "";
    return {
      kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
      modalidad: modalidadValor,
      fechaRegistro: this.solicitudMantenimientoForm.get("fechaRegistro")?.value,
      tipoMantenimiento: tipoMantenimientoValor || "",
      mantenimientoPreventivo: this.solicitudMantenimientoForm.get("matPreventivo")?.value,
      notas: this.solicitudMantenimientoForm.get("notas")?.value
    }
  }

  crearSolicitudMantenimiento() {
    return {
      idMttoVehicular: null,
      idMttoestado: 1,
      idVehiculo: this.vehiculoSeleccionado.ID_VEHICULO,
      idDelegacion: 1,
      idVelatorio: 1,
      idEstatus: 1,
      verificacionInicio: null,
      solicitud: {
        idMttoSolicitud: null,
        idMttoVehicular: null,
        idMttoTipo: this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value,
        idMttoModalidad: this.solicitudMantenimientoForm.get("modalidad")?.value,
        fecRegistro: this.datePipe.transform(this.solicitudMantenimientoForm.get("fechaRegistro")?.value, 'YYYY-MM-dd'),
        desMttoCorrectivo: this.solicitudMantenimientoForm.get("matPreventivo")?.value,
        idMttoModalidadDet: 1,
        idEstatus: 1
      },
      registro: null
    }
  }

  aceptarSolicitud(): void {
    const verificacion = this.crearSolicitudMantenimiento();
    this.mantenimientoVehicularService.guardar(verificacion).subscribe(
      (respuesta) => {
        if (!respuesta.datos) return
        this.alertaService.mostrar(TipoAlerta.Exito, 'Solicitud agregada correctamente');
        this.ref.close();
        this.router.navigate(['detalle-verificacion'], {
            relativeTo: this.route, queryParams: {
              vehiculo: JSON.stringify(this.vehiculoSeleccionado),
              solicitud: JSON.stringify(this.resumenAsignacion)
            }
          }
        );
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }
}
