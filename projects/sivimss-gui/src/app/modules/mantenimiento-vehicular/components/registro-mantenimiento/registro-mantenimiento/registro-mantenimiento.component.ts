import {Component, OnInit} from '@angular/core';
import {CATALOGOS_TIPO_MANTENIMIENTO} from '../../../../inventario-vehicular/constants/dummies';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
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
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {RespuestaRegistroMantenimiento} from "../../../models/respuestaRegistroMantenimiento.interface";
import {VehiculoMantenimiento} from "../../../models/vehiculoMantenimiento.interface";

type VehiculoRegistro = Omit<VehiculoMantenimiento, "ID_MTTOVERIFINICIO" | "ID_MTTO_SOLICITUD" | "ID_MTTO_REGISTRO">

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
  vehiculoSeleccionado!: VehiculoRegistro;
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
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    if (this.config.data.vehiculo) {
      this.vehiculoSeleccionado = this.config.data.vehiculo;
    }
    if (this.config.data.id) {
      const id = this.config.data.id;
      this.realizarRegistro(id);
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
    this.cargadorService.activar();
    this.mantenimientoVehicularService.guardar(verificacion).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Registro agregado correctamente');
        this.abrirRegistroSolicitud();
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  abrirRegistroSolicitud(): void {
    this.ref.close();
    this.router.navigate(['detalle-mantenimiento', this.vehiculoSeleccionado.ID_VEHICULO], {relativeTo: this.route});
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

  asignarContrato(): void {
    const tipoMtto = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    if (tipoMtto.toString() !== '1') return;
    const proveedor = this.solicitudMantenimientoForm.get("nombreProveedor")?.value;
    const contrato = this.contratos.find(c => c.label === proveedor)?.value;
    this.solicitudMantenimientoForm.get("noContrato")?.setValue(contrato);
  }

  realizarRegistro(id: number): void {
    this.cargadorService.activar();
    this.mantenimientoVehicularService.obtenerDetalleRegistro(id).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length === 0) return;
        this.llenarVehiculo(respuesta.datos[0]);
        this.llenarFormulario(respuesta.datos[0]);
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  llenarVehiculo(respuesta: RespuestaRegistroMantenimiento): void {
    this.vehiculoSeleccionado = {
      verificacionDia: 'false',
      DESCRIPCION: "",
      DES_MARCA: respuesta.DES_MARCA,
      DES_MODALIDAD: "",
      DES_MODELO: respuesta.DES_MODELO,
      DES_MTTOESTADO: respuesta.DES_MTTOESTADO,
      DES_MTTO_TIPO: "",
      DES_NIVELOFICINA: "",
      DES_NUMMOTOR: respuesta.DES_NUMMOTOR,
      DES_NUMSERIE: respuesta.DES_NUMSERIE,
      DES_PLACAS: respuesta.DES_PLACAS,
      DES_SUBMARCA: respuesta.DES_SUBMARCA,
      DES_USO: "",
      ID_MTTOVEHICULAR: 0,
      ID_OFICINA: 0,
      ID_USOVEHICULO: 0,
      ID_VEHICULO: respuesta.ID_VEHICULO,
      ID_VELATORIO: 0,
      IMPORTE_PRIMA: 0,
      IND_ESTATUS: false,
      NOM_VELATORIO: respuesta.NOM_VELATORIO,
      TOTAL: 0,
      DES_DELEGACION: respuesta.DES_DELEGACION
    }
  }

  llenarFormulario(respuesta: RespuestaRegistroMantenimiento): void {
    this.solicitudMantenimientoForm.get('placas')?.patchValue(respuesta.DES_PLACAS)
    this.solicitudMantenimientoForm.get('marca')?.patchValue(respuesta.DES_MARCA)
    this.solicitudMantenimientoForm.get('anio')?.patchValue(respuesta.DES_MODELO)
    this.solicitudMantenimientoForm.get('kilometraje')?.patchValue(respuesta.KILOMETRAJE)
    // this.solicitudMantenimientoForm.get('tipoMantenimiento')?.patchValue(respuesta.)
    this.solicitudMantenimientoForm.get('modalidad')?.patchValue(respuesta.ID_MTTOMODALIDAD)
    // this.solicitudMantenimientoForm.get('matPreventivo')?.patchValue(respuesta)
    // this.solicitudMantenimientoForm.get('fechaMantenimiento')?.patchValue(respuesta)
    this.solicitudMantenimientoForm.get('notas')?.patchValue(respuesta.DES_NOTAS)
    this.solicitudMantenimientoForm.get('nombreProveedor')?.patchValue(respuesta.NOM_PROVEEDOR)
    this.solicitudMantenimientoForm.get('noContrato')?.patchValue(respuesta.DES_NUMCONTRATO)
    this.solicitudMantenimientoForm.get('taller')?.patchValue(respuesta.DES_NOMBRE_TALLER)
    this.solicitudMantenimientoForm.get('costoMantenimiento')?.patchValue(respuesta.COSTO_MTTO)
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

}
