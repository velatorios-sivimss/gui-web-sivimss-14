import {Component, OnInit} from '@angular/core';
import {CATALOGOS_TIPO_MANTENIMIENTO} from '../../../../inventario-vehicular/constants/dummies';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {VehiculoTemp} from "../../../models/vehiculo-temp.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MantenimientoVehicularService} from "../../../services/mantenimiento-vehicular.service";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {
  CATALOGOS_PREV_ANUALES,
  CATALOGOS_PREV_EVENTUALES,
  CATALOGOS_PREV_SEMESTRALES
} from "../../../constants/catalogos-preventivo";

interface ResumenRegistro {
  tipoMantenimiento: string,
  fechaMantenimiento: string,
  notas: string,
  nombreProveedor: string,
  numeroContrato: string,
  taller: string,
  costo: string,
  kilometraje: string
}

@Component({
  selector: 'app-registro-mantenimiento',
  templateUrl: './registro-mantenimiento.component.html',
  styleUrls: ['./registro-mantenimiento.component.scss'],
  providers: [DialogService]
})
export class RegistroMantenimientoComponent implements OnInit {

  readonly POSICION_CATALOGOS_PROVEEDORES: number = 2;

  ventanaConfirmacion: boolean = false;

  tiposMantenimiento: TipoDropdown[] = CATALOGOS_TIPO_MANTENIMIENTO;
  catalogoProveedores: TipoDropdown[] = [];
  mantenimientosPrev: TipoDropdown[] = [];
  vehiculoSeleccionado!: VehiculoTemp;
  resumenRegistro!: ResumenRegistro;
  solicitudMantenimientoForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private router: Router,
  ) {
    this.vehiculoSeleccionado = this.config.data;
  }

  ngOnInit(): void {
    this.vehiculoSeleccionado = this.config.data.vehiculo;
    this.inicializarRegistroMantenimientoForm(this.vehiculoSeleccionado);
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const catalogos = respuesta[this.POSICION_CATALOGOS_PROVEEDORES].datos;
    this.catalogoProveedores = mapearArregloTipoDropdown(catalogos, "NOM_PROVEEDOR", "ID_PROVEEDOR");
  }

  inicializarRegistroMantenimientoForm(vehiculoSeleccionado: VehiculoTemp) {
    this.solicitudMantenimientoForm = this.formBuilder.group({
      placas: [{value: vehiculoSeleccionado.DES_PLACAS, disabled: true}],
      marca: [{value: vehiculoSeleccionado.DES_MARCA, disabled: true}],
      anio: [{value: vehiculoSeleccionado.DES_MODELO, disabled: true}],
      kilometraje: [{value: null, disabled: false}, [Validators.required]],
      tipoMantenimiento: [{value: null, disabled: false}, [Validators.required]],
      modalidad: [{value: null, disabled: false}, [Validators.required]],
      matPreventivo: [{value: null, disabled: false}],
      fechaMantenimiento: [{value: null, disabled: false}, [Validators.required]],
      notas: [{value: null, disabled: false}, [Validators.required]],
      nombreProveedor: [{value: null, disabled: false}, [Validators.required]],
      noContrato: [{value: null, disabled: false}, [Validators.required]],
      taller: [{value: null, disabled: false}, [Validators.required]],
      costoMantenimiento: [{value: null, disabled: false}, [Validators.required]],
    });
    this.solicitudMantenimientoForm.get("modalidad")?.valueChanges.subscribe(() => {
      this.asignarOpcionesMantenimiento();
    })
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

  agregar(): void {
    this.ventanaConfirmacion = true;
    this.resumenRegistro = this.crearResumenRegistro();
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

  crearResumenRegistro(): ResumenRegistro {
    const tipoMantenimiento = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    const tipoMantenimientoValor = this.tiposMantenimiento.find(m => m.value === tipoMantenimiento)?.label;
    return {
      tipoMantenimiento: tipoMantenimientoValor || "",
      fechaMantenimiento: this.solicitudMantenimientoForm.get("fechaMantenimiento")?.value,
      notas: this.solicitudMantenimientoForm.get("notas")?.value,
      nombreProveedor: this.solicitudMantenimientoForm.get("nombreProveedor")?.value,
      numeroContrato: this.solicitudMantenimientoForm.get("noContrato")?.value,
      taller: this.solicitudMantenimientoForm.get("taller")?.value,
      costo: this.solicitudMantenimientoForm.get("costoMantenimiento")?.value,
      kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value
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
      solicitud: null,
      registro: {
        idMttoRegistro: null,
        idMttoVehicular: this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value,
        idMttoModalidad: this.solicitudMantenimientoForm.get("modalidad")?.value,
        idMantenimiento: 1,
        desNotas: this.solicitudMantenimientoForm.get("notas")?.value,
        idProveedor: this.solicitudMantenimientoForm.get("nombreProveedor")?.value,
        desNumcontrato: this.solicitudMantenimientoForm.get("noContrato")?.value
      }
    }
  }

  aceptarSolicitud(): void {
    const verificacion = this.crearSolicitudMantenimiento();
    this.mantenimientoVehicularService.guardar(verificacion).subscribe(
      (respuesta) => {
        if (!respuesta.datos) return
        this.alertaService.mostrar(TipoAlerta.Exito, 'Registro agregado correctamente');
        this.ref.close();
        this.router.navigate(['detalle-registro-mantenimiento'], {relativeTo: this.route});
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

}
