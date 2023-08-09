import { Component, OnInit } from '@angular/core';
import { CATALOGOS_TIPO_MANTENIMIENTO } from '../../../inventario-vehicular/constants/dummies';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { HttpErrorResponse } from "@angular/common/http";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { mapearArregloTipoDropdown } from "../../../../utils/funciones";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { ResumenRegistro } from "../../models/resumenRegistro.interface";
import { RegistroMantenimiento } from "../../models/registroMantenimiento.interface";
import { finalize } from "rxjs/operators";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { RespuestaRegistroMantenimiento } from "../../models/respuestaRegistroMantenimiento.interface";
import { VehiculoMantenimiento } from "../../models/vehiculoMantenimiento.interface";
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ERROR_GUARDAR_INFORMACION } from '../../constants/catalogos-filtros';

type VehiculoRegistro = Omit<VehiculoMantenimiento, "ID_MTTOVERIFINICIO" | "ID_MTTO_SOLICITUD">

@Component({
  selector: 'app-registro',
  templateUrl: './registro-mantenimiento.component.html',
  styleUrls: ['./registro-mantenimiento.component.scss'],
  providers: [DialogService, DatePipe]
})
export class RegistroMantenimientoComponent implements OnInit {

  readonly POSICION_CATALOGOS_PROVEEDORES: number = 2;

  ventanaConfirmacion: boolean = false;
  tiposMantenimiento: TipoDropdown[] = CATALOGOS_TIPO_MANTENIMIENTO;
  catalogoProveedores: TipoDropdown[] = [];
  mantenimientosPrev: TipoDropdown[] = [];
  opcionesSemestrales: TipoDropdown[] = [];
  vehiculoSeleccionado!: VehiculoRegistro;
  idVehiculo: number = 0;
  contratos: TipoDropdown[] = [];
  resumenRegistro!: ResumenRegistro;
  solicitudMantenimientoForm!: FormGroup;
  mode: string = 'update';
  modalidades: string[] = ['', 'Semestral', 'Anual', 'Frecuente'];
  cicloCompleto: boolean = false;

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
    private datePipe: DatePipe,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    if (this.config.data.vehiculo) {
      this.vehiculoSeleccionado = this.config.data.vehiculo;
    }
    if (this.config.data.cicloCompleto) {
      this.cicloCompleto = this.config.data.cicloCompleto;
    }
    if (this.config.data.mode) {
      this.mode = this.config.data.mode;
    }
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const catalogos = respuesta[this.POSICION_CATALOGOS_PROVEEDORES].datos;
    this.catalogoProveedores = mapearArregloTipoDropdown(catalogos, "NOM_PROVEEDOR", "ID_PROVEEDOR");
    this.obtenerCatalogoContratos();

    this.inicializarRegistroMantenimientoForm();
  }

  obtenerCatalogoContratos(value: number | null = null) {
    this.mantenimientoVehicularService.obtenerCatalogoContratos(value).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.contratos = mapearArregloTipoDropdown(respuesta.datos, "DES_CONTRATO", "ID_CONTRATO");
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  inicializarRegistroMantenimientoForm(): void {
    this.solicitudMantenimientoForm = this.formBuilder.group({
      placas: [{ value: this.vehiculoSeleccionado ? this.vehiculoSeleccionado?.DES_PLACAS : null, disabled: true }],
      marca: [{ value: this.vehiculoSeleccionado ? this.vehiculoSeleccionado?.DES_MARCA : null, disabled: true }],
      anio: [{ value: this.vehiculoSeleccionado ? this.vehiculoSeleccionado?.DES_MODELO : null, disabled: true }],
      kilometraje: [{ value: null, disabled: false }, [Validators.required]],
      tipoMantenimiento: [{ value: null, disabled: false }, [Validators.required]],
      modalidad: [{ value: null, disabled: false }, []],
      matPreventivo: [{ value: null, disabled: false }, []],
      opcionesSemestrales: [{ value: null, disabled: false }],
      fechaMantenimiento: [{ value: null, disabled: false }, [Validators.required]],
      notas: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(350)]],
      nombreProveedor: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(100)]],
      noContrato: [{ value: null, disabled: false }, []],
      taller: [{ value: null, disabled: false }, [Validators.required]],
      costoMantenimiento: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(9)]],
    });

    this.solicitudMantenimientoForm.get("modalidad")?.valueChanges.subscribe(() => {
      this.asignarOpcionesMantenimiento();
    });

    this.solicitudMantenimientoForm.get("matPreventivo")?.valueChanges.subscribe((): void => {
      this.asignarOpcionesSemestrales();
    });

    if (this.config.data.id) {
      const id = this.config.data.id;
      this.realizarRegistro(id);
    }
  }

  agregar(): void {
    this.ventanaConfirmacion = true;
    this.resumenRegistro = this.crearResumenRegistro();
  }

  regresar(): void {
    this.ventanaConfirmacion = false;
  }

  cerrar(): void {
    this.ref.close(false)
  }

  asignarOpcionesMantenimiento(): void {
    const modalidad: number = +this.solicitudMantenimientoForm.get("modalidad")?.value;
    if (+this.smf.tipoMantenimiento.value === 1 && [1, 2, 3].includes(modalidad)) {
      this.obtenerCatalogoMtto(modalidad);
    }
  }

  asignarOpcionesSemestrales(): void {
    if (+this.smf.modalidad.value === 1 && +this.smf.tipoMantenimiento.value == 1) {
      this.opcionesSemestrales = [];
      this.smf.opcionesSemestrales.setValidators(Validators.required);
      this.obtenerCatalogoMttoDetalle(this.smf.matPreventivo.value);
    } else {
      this.smf.opcionesSemestrales.reset();
      this.smf.opcionesSemestrales.clearValidators();
    }
    this.smf.opcionesSemestrales.updateValueAndValidity();
  }

  crearResumenRegistro(): ResumenRegistro {
    const tipoMantenimiento = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    const tipoMantenimientoValor = this.tiposMantenimiento.find(m => m.value === tipoMantenimiento)?.label;
    const modalidad = this.solicitudMantenimientoForm.get("modalidad")?.value;
    const modalidadValor: string = this.modalidades[modalidad] || "";
    const proveedor = this.solicitudMantenimientoForm.get("nombreProveedor")?.value;
    const nombreProveedor = this.catalogoProveedores.find(p => p.value === proveedor)?.label;

    const mttoPreventivo = this.mantenimientosPrev.find(e => e.value === this.smf.matPreventivo.value)?.label;
    const mttoPreventivoDetalle = this.opcionesSemestrales.find(e => e.value === this.smf.opcionesSemestrales.value)?.label;

    let descContrato = this.solicitudMantenimientoForm.get("noContrato")?.value;
    if (this.smf.tipoMantenimiento.value == 1) {
      descContrato = this.contratos.find(p => p.value === descContrato)?.label;
    }

    return {
      tipoMantenimiento: tipoMantenimientoValor ?? "",
      fechaMantenimiento: this.solicitudMantenimientoForm.get("fechaMantenimiento")?.value,
      notas: this.solicitudMantenimientoForm.get("notas")?.value,
      nombreProveedor: nombreProveedor ?? '',
      numeroContrato: descContrato,
      taller: this.solicitudMantenimientoForm.get("taller")?.value,
      costo: this.solicitudMantenimientoForm.get("costoMantenimiento")?.value,
      kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
      modalidad: modalidadValor,
      nombreProveedorTexto: this.solicitudMantenimientoForm.get("nombreProveedor")?.value,
      mantenimientoPreventivo: mttoPreventivo ?? '',
      mantenimientoPreventivoDetalle: mttoPreventivoDetalle ?? '',
    }
  }

  crearSolicitudMantenimiento(): RegistroMantenimiento {
    return {
      idMttoVehicular: this.cicloCompleto ? null : +this.vehiculoSeleccionado.ID_MTTOVEHICULAR,
      idMttoestado: 1,
      idVehiculo: this.vehiculoSeleccionado.ID_VEHICULO,
      idDelegacion: 1,
      idVelatorio: this.vehiculoSeleccionado.ID_VELATORIO,
      idEstatus: 1,
      verificacionInicio: null,
      solicitud: null,
      registro: {
        idMttoRegistro: this.mode === 'update' ? this.vehiculoSeleccionado.ID_MTTO_REGISTRO : this.cicloCompleto ? null : this.vehiculoSeleccionado.ID_MTTO_REGISTRO,
        idMttoVehicular: this.cicloCompleto ? null : +this.vehiculoSeleccionado.ID_MTTOVEHICULAR,
        idMttoModalidad: this.solicitudMantenimientoForm.get("modalidad")?.value ? +this.solicitudMantenimientoForm.get("modalidad")?.value : null,
        idMantenimiento: this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value ? +this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value : null,
        desNombreProveedor: +this.smf.tipoMantenimiento.value == 2 ? this.solicitudMantenimientoForm.get("nombreProveedor")?.value : null,
        desNotas: this.solicitudMantenimientoForm.get("notas")?.value,
        idProveedor: +this.smf.tipoMantenimiento.value == 1 ? this.solicitudMantenimientoForm.get("nombreProveedor")?.value : null,
        desNumcontrato: this.smf.tipoMantenimiento.value == 2 ? this.solicitudMantenimientoForm.get("noContrato")?.value : null,
        idContrato: this.smf.tipoMantenimiento.value == 1 ? this.solicitudMantenimientoForm.get("noContrato")?.value : null,
        kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
        desNombreTaller: this.solicitudMantenimientoForm.get("taller")?.value,
        costoMtto: +this.smf.tipoMantenimiento.value == 2 ? this.solicitudMantenimientoForm.get("costoMantenimiento")?.value : null,
        // desMttoCorrectivo: this.solicitudMantenimientoForm.get("matPreventivo")?.value,
        fecRegistro: this.datePipe.transform(this.solicitudMantenimientoForm.get("fechaMantenimiento")?.value, 'YYYY-MM-dd'),
        idMttoTipoModalidad: this.smf.matPreventivo.value ? +this.smf.matPreventivo.value : null,
        idMttoTipoModalidadDet: this.smf.opcionesSemestrales.value ? +this.smf.opcionesSemestrales.value : null,
      }
    }
  }

  aceptarSolicitud(): void {
    const verificacion: RegistroMantenimiento = this.crearSolicitudMantenimiento();
    this.cargadorService.activar();
    this.mantenimientoVehicularService.guardar(verificacion).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta.error && !respuesta.datos) {
            this.alertaService.mostrar(TipoAlerta.Precaucion, respuesta.mensaje);
          } else {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Registro agregado correctamente');
            if (respuesta.datos.length > 0) {
              this.abrirRegistroSolicitud(respuesta.datos[0]?.ID_MTTOVEHICULAR);
            } else {
              this.abrirRegistroSolicitud(respuesta.datos);
            }
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
          if (error.statusText === 'Unknown Error') {
            this.alertaService.mostrar(TipoAlerta.Error, ERROR_GUARDAR_INFORMACION);
          } else {
            this.mensajesSistemaService.mostrarMensajeError(error);
          }
        }
      });
  }

  abrirRegistroSolicitud(idMttoVehiculo: number): void {
    this.ref.close(true);
    void this.router.navigate(['/programar-mantenimiento-vehicular/detalle-mantenimiento', idMttoVehiculo],
      { queryParams: { tabview: 2 } });
  }

  obtenerCatalogoMtto(id: number): void {
    this.cargadorService.activar()
    this.mantenimientoVehicularService.obtenerCatalogoMtto(id).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.mantenimientosPrev = mapearArregloTipoDropdown(respuesta.datos, "DES_MTTO_MODALIDAD", "ID_MTTO_MODALIDAD");
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
        }
      });
  }

  obtenerCatalogoMttoDetalle(id: number): void {
    this.cargadorService.activar()
    this.mantenimientoVehicularService.obtenerCatalogoMttoDetalle(id).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          this.opcionesSemestrales = mapearArregloTipoDropdown(respuesta.datos, "DES_MTTO_MODALIDAD_DET", "ID_MTTO_MODALIDAD_DET");
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error);
        }
      });
  }

  gestionarCampos(): void {
    const tipoMtto = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    this.solicitudMantenimientoForm.get("nombreProveedor")?.setValue(null);
    this.solicitudMantenimientoForm.get("noContrato")?.setValue(null);
    this.solicitudMantenimientoForm.get("modalidad")?.clearValidators();
    this.solicitudMantenimientoForm.get("matPreventivo")?.clearValidators();
    if (tipoMtto.toString() === '1') {
      this.solicitudMantenimientoForm.get("costoMantenimiento")?.clearValidators()
      this.solicitudMantenimientoForm.get("taller")?.clearValidators();
      this.solicitudMantenimientoForm.get("noContrato")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("modalidad")?.setValue(null);
      this.solicitudMantenimientoForm.get("modalidad")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("matPreventivo")?.setValue(null);
      this.solicitudMantenimientoForm.get("matPreventivo")?.addValidators([Validators.required]);
      const modalidad: number = +this.solicitudMantenimientoForm.get("modalidad")?.value;
      if ([1, 2, 3].includes(modalidad)) {
        this.obtenerCatalogoMtto(modalidad);
      }
    } else {
      this.mantenimientosPrev = [];
      this.opcionesSemestrales = [];
    }
    if (tipoMtto.toString() === '2') {
      this.solicitudMantenimientoForm.get("noContrato")?.clearValidators();
      this.solicitudMantenimientoForm.get("taller")?.setValue(null);
      this.solicitudMantenimientoForm.get("taller")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("costoMantenimiento")?.setValue(null);
      this.solicitudMantenimientoForm.get("costoMantenimiento")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("taller")?.addValidators([Validators.required]);
    }
    this.solicitudMantenimientoForm.get("costoMantenimiento")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("taller")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("modalidad")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("matPreventivo")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("noContrato")?.updateValueAndValidity();
  }

  asignarContrato(): void {
    const tipoMtto = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    if (tipoMtto && tipoMtto.toString() !== '1') return;
    this.obtenerCatalogoContratos(this.solicitudMantenimientoForm.get('nombreProveedor')?.value);
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
          this.mensajesSistemaService.mostrarMensajeError(error);
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
      ID_MTTOVEHICULAR: respuesta.ID_MTTOVEHICULAR,
      ID_OFICINA: 0,
      ID_USOVEHICULO: 0,
      ID_VEHICULO: respuesta.ID_VEHICULO,
      ID_VELATORIO: respuesta.ID_VELATORIO,
      IMPORTE_PRIMA: 0,
      IND_ESTATUS: false,
      DES_VELATORIO: respuesta.NOM_VELATORIO,
      TOTAL: 0,
      DES_DELEGACION: respuesta.DES_DELEGACION,
      ID_MTTO_REGISTRO: respuesta.ID_MTTO_REGISTRO,
    }
  }

  llenarFormulario(respuesta: RespuestaRegistroMantenimiento): void {
    const fecha = moment(respuesta.FEC_REGISTRO, 'DD-MM-yyyy').format('yyyy-MM-DD');
    this.solicitudMantenimientoForm.get('placas')?.patchValue(respuesta.DES_PLACAS);
    this.solicitudMantenimientoForm.get('marca')?.patchValue(respuesta.DES_MARCA);
    this.solicitudMantenimientoForm.get('anio')?.patchValue(respuesta.DES_MODELO);
    this.solicitudMantenimientoForm.get('kilometraje')?.patchValue(respuesta.NUM_KILOMETRAJE);
    this.solicitudMantenimientoForm.get('tipoMantenimiento')?.patchValue(String(respuesta.ID_MANTENIMIENTO));
    this.solicitudMantenimientoForm.get('modalidad')?.patchValue(respuesta.ID_MTTOMODALIDAD); //Falta
    // this.solicitudMantenimientoForm.get('matPreventivo')?.patchValue(respuesta.DES_MTTO_CORRECTIVO);
    this.solicitudMantenimientoForm.get('fechaMantenimiento')?.patchValue(respuesta.FEC_REGISTRO ? new Date(this.diferenciaUTC(fecha)) : null);
    this.solicitudMantenimientoForm.get('notas')?.patchValue(respuesta.DES_NOTAS);
    this.solicitudMantenimientoForm.get('nombreProveedor')?.patchValue(respuesta.ID_MANTENIMIENTO == 1 ? respuesta.ID_PROVEEDOR : respuesta.DES_NOMBRE_PROVEEDOR);
    this.solicitudMantenimientoForm.get('noContrato')?.patchValue(respuesta.ID_MANTENIMIENTO == 1 ? respuesta.ID_PROVEEDOR : respuesta.DES_NUMCONTRATO);
    this.solicitudMantenimientoForm.get('taller')?.patchValue(respuesta.DES_NOMBRE_TALLER);
    this.solicitudMantenimientoForm.get('costoMantenimiento')?.patchValue(respuesta.MON_COSTO_MTTO);

    this.solicitudMantenimientoForm.get('matPreventivo')?.patchValue(respuesta.ID_MTTO_MODALIDAD);
    this.solicitudMantenimientoForm.get('opcionesSemestrales')?.patchValue(respuesta.ID_MTTO_MODALIDAD_DET);

    const tipoMtto = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;

    if (tipoMtto.toString() === '1') {
      this.solicitudMantenimientoForm.get("costoMantenimiento")?.clearValidators()
      this.solicitudMantenimientoForm.get("taller")?.clearValidators()
      this.solicitudMantenimientoForm.get("modalidad")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("matPreventivo")?.addValidators([Validators.required]);
    }
    if (tipoMtto.toString() === '2') {
      this.solicitudMantenimientoForm.get("fechaMantenimiento")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("taller")?.addValidators([Validators.required]);
      this.solicitudMantenimientoForm.get("taller")?.addValidators([Validators.required]);
    }
    this.solicitudMantenimientoForm.get("fechaMantenimiento")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("costoMantenimiento")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("taller")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("modalidad")?.updateValueAndValidity();
    this.solicitudMantenimientoForm.get("matPreventivo")?.updateValueAndValidity();

    this.asignarOpcionesSemestrales();
  }

  diferenciaUTC(fecha: string) {
    let objetoFecha = new Date(fecha);
    return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

}
