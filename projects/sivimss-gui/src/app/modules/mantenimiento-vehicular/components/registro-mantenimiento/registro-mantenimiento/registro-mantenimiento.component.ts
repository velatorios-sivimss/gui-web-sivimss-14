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
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {ResumenRegistro} from "../../../models/resumenRegistro.interface";
import {RegistroMantenimiento} from "../../../models/registroMantenimiento.interface";


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
  contratos: TipoDropdown[] = [];
  resumenRegistro!: ResumenRegistro;
  solicitudMantenimientoForm!: FormGroup;

  modalidades: string[] = ['', 'Semestral', 'Anual', 'Frecuente'];

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
  }

  ngOnInit(): void {
    if (this.config.data.vehiculo) {
      this.vehiculoSeleccionado = this.config.data.vehiculo;
    }
    this.inicializarRegistroMantenimientoForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const catalogos = respuesta[this.POSICION_CATALOGOS_PROVEEDORES].datos;
    this.catalogoProveedores = mapearArregloTipoDropdown(catalogos, "NOM_PROVEEDOR", "ID_PROVEEDOR");
    this.contratos = mapearArregloTipoDropdown(catalogos, "ID_PROVEEDOR", "DES_TIPO_CONTRATO");
  }

  inicializarRegistroMantenimientoForm(): void {
    this.solicitudMantenimientoForm = this.formBuilder.group({
      placas: [{value: this.vehiculoSeleccionado.DES_PLACAS, disabled: true}],
      marca: [{value: this.vehiculoSeleccionado.DES_MARCA, disabled: true}],
      anio: [{value: this.vehiculoSeleccionado.DES_MODELO, disabled: true}],
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
    const modalidad = this.solicitudMantenimientoForm.get("modalidad")?.value;
    const modalidadValor: string = this.modalidades[modalidad] || "";
    return {
      tipoMantenimiento: tipoMantenimientoValor || "",
      fechaMantenimiento: this.solicitudMantenimientoForm.get("fechaMantenimiento")?.value,
      notas: this.solicitudMantenimientoForm.get("notas")?.value,
      nombreProveedor: this.solicitudMantenimientoForm.get("nombreProveedor")?.value,
      numeroContrato: this.solicitudMantenimientoForm.get("noContrato")?.value,
      taller: this.solicitudMantenimientoForm.get("taller")?.value,
      costo: this.solicitudMantenimientoForm.get("costoMantenimiento")?.value,
      kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
      modalidad: modalidadValor,
      matPreventivo: this.solicitudMantenimientoForm.get("matPreventivo")?.value
    }
  }

  crearSolicitudMantenimiento(): RegistroMantenimiento {
    return {
      idMttoVehicular: null,
      idMttoestado: 1,
      idVehiculo: this.vehiculoSeleccionado.ID_VEHICULO,
      idDelegacion: 1,
      idVelatorio: this.vehiculoSeleccionado.ID_VELATORIO,
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
        desNumcontrato: this.solicitudMantenimientoForm.get("noContrato")?.value,
        kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
        desNombreTaller: this.solicitudMantenimientoForm.get("taller")?.value,
        costoMtto: this.solicitudMantenimientoForm.get("costoMantenimiento")?.value,
      }
    }
  }

  aceptarSolicitud(): void {
    const verificacion: RegistroMantenimiento = this.crearSolicitudMantenimiento();
    this.mantenimientoVehicularService.guardar(verificacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Registro agregado correctamente');
        this.abrirRegistroSolicitud();
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error)
      }
    });
  }

  abrirRegistroSolicitud(): void {
    this.ref.close();
    this.router.navigate(['detalle-registro-mantenimiento'], {
        relativeTo: this.route, queryParams: {
          vehiculo: JSON.stringify(this.vehiculoSeleccionado),
          solicitud: JSON.stringify(this.resumenRegistro)
        }
      }
    );
  }

  gestionarCampos(): void {
    const tipoMtto = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    this.solicitudMantenimientoForm.get("nombreProveedor")?.setValue(null);
    this.solicitudMantenimientoForm.get("noContrato")?.setValue(null);
    this.solicitudMantenimientoForm.get("fechaMantenimiento")?.clearValidators();
    this.solicitudMantenimientoForm.get("costoMantenimiento")?.clearValidators()
    this.solicitudMantenimientoForm.get("taller")?.clearValidators()
    this.solicitudMantenimientoForm.get("modalidad")?.clearValidators()
    this.solicitudMantenimientoForm.get("matPreventivo")?.clearValidators()
    if (tipoMtto.toString() === '1') {
      this.solicitudMantenimientoForm.get("noContrato")?.disable();
      this.solicitudMantenimientoForm.get("fechaMantenimiento")?.setValue(null);
      this.solicitudMantenimientoForm.get("fechaMantenimiento")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("taller")?.setValue(null);
      this.solicitudMantenimientoForm.get("taller")?.addValidators([Validators.required])
      this.solicitudMantenimientoForm.get("costoMantenimiento")?.setValue(null);
      this.solicitudMantenimientoForm.get("taller")?.addValidators([Validators.required])
    }
    if (tipoMtto.toString() === '2') {
      this.solicitudMantenimientoForm.get("noContrato")?.enable();
      this.solicitudMantenimientoForm.get("modalidad")?.setValue(null);
      this.solicitudMantenimientoForm.get("modalidad")?.addValidators([Validators.required])
      this.solicitudMantenimientoForm.get("matPreventivo")?.setValue(null);
      this.solicitudMantenimientoForm.get("matPreventivo")?.addValidators([Validators.required])
    }
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

  asignarContrato(): void {
    const tipoMtto = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    if (tipoMtto.toString() !== '1') return;
    const proveedor = this.solicitudMantenimientoForm.get("nombreProveedor")?.value;
    const contrato = this.contratos.find(c => c.label === proveedor)?.value;
    this.solicitudMantenimientoForm.get("noContrato")?.setValue(contrato);
    console.log(tipoMtto, proveedor, contrato)
  }
}
