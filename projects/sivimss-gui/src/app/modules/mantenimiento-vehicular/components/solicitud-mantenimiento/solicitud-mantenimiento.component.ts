import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {
  CATALOGOS_PREV_ANUALES,
  CATALOGOS_PREV_EVENTUALES,
  CATALOGOS_PREV_SEMESTRALES,
  CATALOGOS_PREV_SEMESTRALES_MECANICO,
  CATALOGOS_PREV_SEMESTRALES_ELECTRICO,
  CATALOGOS_PREV_SEMESTRALES_HERRAMIENTAS,
  CATALOGOS_PREV_SEMESTRALES_VEHICULO,
} from "../../constants/catalogos-preventivo";
import { CATALOGOS_TIPO_MANTENIMIENTO } from "../../../inventario-vehicular/constants/dummies";
import { HttpErrorResponse } from "@angular/common/http";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { DatePipe } from "@angular/common";
import { ResumenAsignacion } from "../../models/resumenAsignacion.interface";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { RegistroSolicitudMttoInterface } from "../../models/registroSolicitudMtto.interface";
import { finalize } from "rxjs/operators";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { RespuestaSolicitudMantenimiento } from "../../models/respuestaSolicitudMantenimiento.interface";
import { VehiculoMantenimiento } from "../../models/vehiculoMantenimiento.interface";
import * as moment from 'moment';

type VehiculoSolicitud = Omit<VehiculoMantenimiento, "ID_MTTO_REGISTRO" | "ID_MTTO_SOLICITUD" | "ID_MTTOVERIFINICIO">

@Component({
  selector: 'app-solicitud',
  templateUrl: './solicitud-mantenimiento.component.html',
  styleUrls: ['./solicitud-mantenimiento.component.scss'],
  providers: [DialogService, DatePipe]
})
export class SolicitudMantenimientoComponent implements OnInit {
  ventanaConfirmacion: boolean = false;
  readonly CAPTURA_DE_SOLICITUD_MANTENIMIENTO: number = 1;
  readonly RESUMEN_DE_SOLICITUD_MANTENIMIENTO: number = 2;

  vehiculoSeleccionado!: VehiculoSolicitud;
  resumenAsignacion!: ResumenAsignacion;

  solicitudMantenimientoForm!: FormGroup;
  mantenimientosPrev: TipoDropdown[] = [];
  opcionesSemestrales: TipoDropdown[] = [];
  tiposMantenimiento: TipoDropdown[] = CATALOGOS_TIPO_MANTENIMIENTO;
  mode: string = 'update';
  modalidades: string[] = ['', 'Semestral', 'Anual', 'Frecuente'];

  idMttoVehicular: number | null = null;
  idSolicitudMtto: number | null = null;
  pasoSolicitudMantenimiento: number = 1;

  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private mantenimientoVehicularService: MantenimientoVehicularService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
  ) {

  }

  ngOnInit(): void {
    if (this.config.data.vehiculo) {
      this.vehiculoSeleccionado = this.config.data.vehiculo;
    }
    if (this.config.data.id) {
      const id = this.config.data.id;
      this.realizarSolicitud(id);
    }
    if (this.config.data.mode) {
      this.mode = this.config.data.mode;
    }
    this.inicializarSolicitudForm();
  }

  inicializarSolicitudForm(): void {
    this.solicitudMantenimientoForm = this.formBuilder.group({
      placas: [{ value: this.vehiculoSeleccionado ? this.vehiculoSeleccionado.DES_PLACAS : null, disabled: true }],
      marca: [{ value: this.vehiculoSeleccionado ? this.vehiculoSeleccionado.DES_MARCA : null, disabled: true }],
      anio: [{ value: this.vehiculoSeleccionado ? this.vehiculoSeleccionado.DES_MODELO : null, disabled: true }],
      kilometraje: [{ value: null, disabled: false }, [Validators.required]],
      tipoMantenimiento: [{ value: null, disabled: false }, [Validators.required]],
      matPreventivo: [{ value: null, disabled: false }],
      modalidad: [{ value: null, disabled: false }, [Validators.required]],
      opcionesSemestrales: [{ value: null, disabled: false }],
      fechaRegistro: [{ value: null, disabled: false }, [Validators.required]],
      fechaRegistro2: [{ value: null, disabled: false }, []],
      notas: [{ value: null, disabled: false }, [Validators.required]],
    });
    this.solicitudMantenimientoForm.get("modalidad")?.valueChanges.subscribe((): void => {
      this.asignarOpcionesMantenimiento();
    });

    this.solicitudMantenimientoForm.get("matPreventivo")?.valueChanges.subscribe((): void => {
      this.asignarOpcionesSemestrales();
    })
  }

  agregar(): void {
    this.resumenAsignacion = this.crearResumenAsignacion();
    this.pasoSolicitudMantenimiento = this.RESUMEN_DE_SOLICITUD_MANTENIMIENTO;
  }

  asignarOpcionesMantenimiento(): void {
    const modalidad: number = +this.solicitudMantenimientoForm.get("modalidad")?.value;
    if (![1, 2, 3].includes(modalidad)) return;
    if (modalidad === 1) {
      this.mantenimientosPrev = CATALOGOS_PREV_SEMESTRALES;
      this.asignarOpcionesSemestrales();
      return;
    }
    if (modalidad === 2) {
      this.mantenimientosPrev = CATALOGOS_PREV_ANUALES;
      return;
    }
    this.mantenimientosPrev = CATALOGOS_PREV_EVENTUALES;
  }

  asignarOpcionesSemestrales(): void {

    if (+this.smf.modalidad.value === 1 && +this.smf.tipoMantenimiento.value == 1) {
      this.opcionesSemestrales = [];
      this.smf.opcionesSemestrales.setValidators(Validators.required);
      switch (this.smf.matPreventivo.value) {
        case 'Verificación del sistema mecánico':
          this.opcionesSemestrales = CATALOGOS_PREV_SEMESTRALES_MECANICO;
          break;
        case 'Verificación del sistema eléctrico':
          this.opcionesSemestrales = CATALOGOS_PREV_SEMESTRALES_ELECTRICO;
          break;
        case 'Verificación de accesorios y herramientas':
          this.opcionesSemestrales = CATALOGOS_PREV_SEMESTRALES_HERRAMIENTAS;
          break;
        case 'Verificación del vehículo':
          this.opcionesSemestrales = CATALOGOS_PREV_SEMESTRALES_VEHICULO;
          break;
        default:
          break;
      }
    } else {
      this.smf.opcionesSemestrales.reset();
      this.smf.opcionesSemestrales.clearValidators();
    }
    this.smf.opcionesSemestrales.updateValueAndValidity();
  }

  crearResumenAsignacion(): ResumenAsignacion {
    const tipoMantenimiento = this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value;
    const tipoMantenimientoValor = this.tiposMantenimiento.find(m => m.value === tipoMantenimiento)?.label;
    const modalidad = this.solicitudMantenimientoForm.get("modalidad")?.value;
    const modalidadValor: string = this.modalidades[modalidad] || "";
    return {
      kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
      modalidad: modalidadValor,
      fechaRegistro: this.solicitudMantenimientoForm.get("fechaRegistro")?.value,
      fechaRegistro2: this.solicitudMantenimientoForm.get("fechaRegistro2")?.value,
      tipoMantenimiento: tipoMantenimientoValor ?? "",
      mantenimientoPreventivo: this.solicitudMantenimientoForm.get("matPreventivo")?.value,
      notas: this.solicitudMantenimientoForm.get("notas")?.value
    }
  }

  crearSolicitudMantenimiento(): RegistroSolicitudMttoInterface {
    return {
      idMttoVehicular: this.idSolicitudMtto ? this.vehiculoSeleccionado.ID_MTTOVEHICULAR : null,
      idMttoestado: 1,
      idVehiculo: this.vehiculoSeleccionado.ID_VEHICULO,
      idDelegacion: 1,
      idVelatorio: this.vehiculoSeleccionado.ID_VELATORIO,
      idEstatus: 1,
      verificacionInicio: null,
      solicitud: {
        idMttoSolicitud: this.idSolicitudMtto,
        idMttoVehicular: this.idSolicitudMtto ? this.vehiculoSeleccionado.ID_MTTOVEHICULAR : null,
        idMttoTipo: this.solicitudMantenimientoForm.get("tipoMantenimiento")?.value,
        idMttoModalidad: this.solicitudMantenimientoForm.get("modalidad")?.value,
        fecRegistro: this.datePipe.transform(this.solicitudMantenimientoForm.get("fechaRegistro")?.value, 'YYYY-MM-dd'),
        fecRegistro2: this.datePipe.transform(this.solicitudMantenimientoForm.get("fechaRegistro2")?.value, 'YYYY-MM-dd'),
        desMttoCorrectivo: this.resumenAsignacion.tipoMantenimiento === 'Preventivo' ? this.solicitudMantenimientoForm.get("matPreventivo")?.value : null,
        idMttoModalidadDet: 1,
        idEstatus: this.mode === 'update' ? (this.vehiculoSeleccionado.ID_MTTOESTADO ?? null) : 1,
        kilometraje: this.solicitudMantenimientoForm.get("kilometraje")?.value,
        desNotas: this.solicitudMantenimientoForm.get("notas")?.value
      },
      registro: null
    }
  }

  handleChangeTipoMtto() {
    if (this.smf.tipoMantenimiento.value == 1) {
      this.smf.matPreventivo.setValidators(Validators.required);
    } else {
      this.smf.matPreventivo.reset();
      this.smf.matPreventivo.clearValidators();
    }
    this.smf.matPreventivo.updateValueAndValidity();
  }

  guardarSolicitudMtto(): void {
    if (this.idSolicitudMtto) {
      this.actualizarSolicitudMtto();
      return;
    }
    this.guardarNuevaSolicitudMtto();
  }

  guardarNuevaSolicitudMtto(): void {
    const verificacion: RegistroSolicitudMttoInterface = this.crearSolicitudMantenimiento();
    this.mantenimientoVehicularService.guardar(verificacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Solicitud agregada correctamente');
        if (respuesta.datos.length > 0) {
          this.abrirRegistroSolicitud(respuesta.datos[0]?.ID_MTTOVEHICULAR);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  actualizarSolicitudMtto(): void {
    const verificacion: RegistroSolicitudMttoInterface = this.crearSolicitudMantenimiento();
    this.mantenimientoVehicularService.actualizar(verificacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Solicitud modificada correctamente');
        if (!this.vehiculoSeleccionado.ID_MTTOVEHICULAR || this.vehiculoSeleccionado.ID_MTTOVEHICULAR === 0) {
          this.ref.close(true);
          this.alertaService.mostrar(TipoAlerta.Precaucion, 'Solicitud modificada correctamente');
        } else {
          this.abrirRegistroSolicitud(this.vehiculoSeleccionado.ID_MTTOVEHICULAR);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  abrirRegistroSolicitud(idMttoVehiculo: number): void {
    this.ref.close(true);
    void this.router.navigate(['/programar-mantenimiento-vehicular/detalle-mantenimiento', idMttoVehiculo],
      { queryParams: { tabview: 1 } });
  }

  realizarSolicitud(id: number): void {
    this.cargadorService.activar()
    this.mantenimientoVehicularService.obtenerDetalleSolicitud(id).pipe(
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

  llenarVehiculo(respuesta: RespuestaSolicitudMantenimiento): void {
    this.vehiculoSeleccionado = {
      DESCRIPCION: "",
      ID_MTTOESTADO: respuesta.ID_MTTOESTADO,
      DES_DELEGACION: respuesta.DES_DELEGACION,
      DES_MARCA: respuesta.DES_MARCA,
      DES_MODALIDAD: respuesta.DES_MODALIDAD,
      DES_MODELO: respuesta.DES_MODELO,
      DES_MTTOESTADO: respuesta.DES_MTTOESTADO,
      DES_MTTO_TIPO: respuesta.DES_MTTO_TIPO,
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
      verificacionDia: 'false'
    }
  }

  llenarFormulario(respuesta: RespuestaSolicitudMantenimiento): void {
    const fecha = moment(respuesta.FEC_REGISTRO, 'DD-MM-yyyy').format('yyyy-MM-DD');
    this.solicitudMantenimientoForm.get('placas')?.patchValue(respuesta.DES_PLACAS);
    this.solicitudMantenimientoForm.get('marca')?.patchValue(respuesta.DES_MARCA);
    this.solicitudMantenimientoForm.get('anio')?.patchValue(respuesta.DES_MODELO);
    this.solicitudMantenimientoForm.get('kilometraje')?.patchValue(respuesta.NUM_KILOMETRAJE);
    this.solicitudMantenimientoForm.get('tipoMantenimiento')?.patchValue(respuesta.ID_MTTO_TIPO.toString());
    if (respuesta.DES_MTTO_CORRECTIVO) {
      this.solicitudMantenimientoForm.get('matPreventivo')?.patchValue(respuesta.DES_MTTO_CORRECTIVO);
    }
    this.solicitudMantenimientoForm.get('modalidad')?.patchValue(respuesta.ID_MTTOMODALIDAD);
    this.solicitudMantenimientoForm.get('fechaRegistro2')?.patchValue(new Date(this.diferenciaUTC(fecha)));
    this.solicitudMantenimientoForm.get('fechaRegistro')?.patchValue(new Date(this.diferenciaUTC(fecha)));
    this.solicitudMantenimientoForm.get('notas')?.patchValue(respuesta.DES_NOTAS);
    this.idSolicitudMtto = respuesta.ID_MTTO_SOLICITUD;

    this.validarFechaSemestral();
  }

  validarFechaSemestral() {
    if (this.smf.modalidad.value == 1) {
      this.smf.fechaRegistro2.setValidators(Validators.required);
    } else {
      this.smf.fechaRegistro2.reset();
      this.smf.fechaRegistro2.clearValidators();
    }
    this.smf.fechaRegistro2.updateValueAndValidity();
  }

  get smf() {
    return this.solicitudMantenimientoForm.controls;
  }

  diferenciaUTC(fecha: string) {
    let objetoFecha = new Date(fecha);
    return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
  }

}
