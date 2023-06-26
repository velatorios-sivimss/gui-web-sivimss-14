import { Component, OnInit, ViewChild } from '@angular/core';
import { MENU_STEPPER } from '../../../inventario-vehicular/constants/menu-stepper';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import { ActivatedRoute, Router } from '@angular/router';
import { obtenerFechaActual, obtenerHoraActual } from "../../../../utils/funciones-fechas";
import { VerificacionInicio } from "../../models/verificacionInicio.interface";
import { MantenimientoVehicularService } from "../../services/mantenimiento-vehicular.service";
import { HttpErrorResponse } from "@angular/common/http";
import { RegistroVerificacionInterface } from "../../models/registroVerificacion.interface";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { MenuItem } from "primeng/api";
import { OverlayPanel } from "primeng/overlaypanel";
import { MensajesSistemaService } from "../../../../services/mensajes-sistema.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { RespuestaVerificacion } from "../../models/respuestaVerificacion.interface";
import { VehiculoMantenimiento } from "../../models/vehiculoMantenimiento.interface";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { finalize } from "rxjs/operators";

type VehiculoVerificacion = Omit<VehiculoMantenimiento, "ID_MTTO_REGISTRO" | "ID_MTTO_SOLICITUD" | "ID_MTTOVERIFINICIO">

@Component({
  selector: 'app-nueva',
  templateUrl: './nueva-verificacion.component.html',
  styleUrls: ['./nueva-verificacion.component.scss'],
  providers: [DialogService]
})
export class NuevaVerificacionComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly CAPTURA_DE_NUEVA_VERIFICACION: number = 1;
  readonly RESUMEN_DE_NUEVA_VERIFICACION: number = 2;

  vehiculoSeleccionado!: VehiculoVerificacion;

  menuStep: MenuItem[] = MENU_STEPPER;

  nuevaVerificacionForm!: FormGroup;

  nuevaVerificacion!: VerificacionInicio;

  ventanaConfirmacion: boolean = false;
  horaActual: string = obtenerHoraActual();
  fechaActual: string = obtenerFechaActual();

  idMttoVehicular: number | null = null;
  idVerificacion: number | null = null;
  pasoNuevaVerificacion: number = 1;

  calibraciones: any[] = [
    { rin: 13, presion: 30 },
    { rin: 14, presion: 32 },
    { rin: 15, presion: 34 },
  ]

  constructor(
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private router: Router,
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
      this.realizarVerificacion(id);
    }
    this.inicializarVerificacionForm();
  }

  inicializarVerificacionForm(): void {
    this.nuevaVerificacionForm = this.formBuilder.group({
      nivelAceite: [{ value: null, disabled: false }, [Validators.required]],
      nivelAgua: [{ value: null, disabled: false }, [Validators.required]],
      calibracionNeumaticosTraseros: [{ value: null, disabled: false }, [Validators.required]],
      calibracionNeumaticosDelanteros: [{ value: null, disabled: false }, [Validators.required]],
      nivelCombustible: [{ value: null, disabled: false }, [Validators.required]],
      nivelBateria: [{ value: null, disabled: false }, [Validators.required]],
      limpiezaInterior: [{ value: null, disabled: false }, [Validators.required]],
      limpiezaExterior: [{ value: null, disabled: false }, [Validators.required]],
      codigoFalla: [{ value: null, disabled: false }, [Validators.required]],
    });
    this.nuevaVerificacionForm.markAllAsTouched();
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
    if (this.pasoNuevaVerificacion === this.RESUMEN_DE_NUEVA_VERIFICACION) {
      this.pasoNuevaVerificacion = this.CAPTURA_DE_NUEVA_VERIFICACION;
      return;
    }
    this.ref.close(false)
  }

  aceptar(): void {
    this.pasoNuevaVerificacion = this.RESUMEN_DE_NUEVA_VERIFICACION;
    this.nuevaVerificacion = this.crearResumenNuevaVerificacion();
  }

  crearVerificacion(): RegistroVerificacionInterface {
    return {
      idMttoVehicular: this.idMttoVehicular,
      idMttoestado: 1,
      idVehiculo: this.vehiculoSeleccionado.ID_VEHICULO,
      idDelegacion: 1,
      idVelatorio: this.vehiculoSeleccionado.ID_VELATORIO,
      idEstatus: 1,
      verificacionInicio: {
        idMttoVerifInicio: this.idVerificacion,
        idMttoVehicular: this.idMttoVehicular,
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

  guardarVerificacion(): void {
    if (this.idMttoVehicular) {
      this.actualizarVerificacion();
      return;
    }
    this.guardarNuevaVerificacion();
  }

  guardarNuevaVerificacion(): void {
    const verificacion: RegistroVerificacionInterface = this.crearVerificacion();
    this.mantenimientoVehicularService.guardar(verificacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (!respuesta.datos) return;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Verificacion agregada correctamente');
        this.abrirRegistroMantenimiento(respuesta.datos);
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  actualizarVerificacion(): void {
    const verificacion: RegistroVerificacionInterface = this.crearVerificacion();
    this.mantenimientoVehicularService.actualizar(verificacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (!respuesta.datos) return;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Verificacion modificada correctamente');
        if (typeof respuesta.datos === 'boolean') {
          this.ref.close(true);
        } else {
          this.abrirRegistroMantenimiento(respuesta.datos[0].ID_MTTOVEHICULAR);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error)
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  abrirRegistroMantenimiento(idMttoVehicular: number): void {
    this.ref.close(true);
    void this.router.navigate(['/programar-mantenimiento-vehicular/detalle-mantenimiento', idMttoVehicular],
      { queryParams: { tabview: 0 } });
  }

  realizarVerificacion(id: number): void {
    this.cargadorService.activar();
    this.mantenimientoVehicularService.obtenerDetalleVerificacion(id).pipe(
      finalize(() => this.cargadorService.desactivar())).subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          if (respuesta.datos.length === 0) return;
          this.obtenerVehiculo(respuesta.datos[0]);
          this.llenarFormulario(respuesta.datos[0]);
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error)
          this.mensajesSistemaService.mostrarMensajeError(error.message);
        }
      });
  }

  obtenerVehiculo(respuesta: RespuestaVerificacion): void {
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
      ID_VELATORIO: respuesta.ID_VELATORIO,
      IMPORTE_PRIMA: 0,
      IND_ESTATUS: false,
      DES_VELATORIO: respuesta.DES_VELATORIO,
      TOTAL: 0,
      DES_DELEGACION: respuesta.DES_DELEGACION
    }
  }

  llenarFormulario(respuesta: RespuestaVerificacion): void {
    this.nuevaVerificacionForm.get('nivelAceite')?.patchValue(respuesta.ID_NIVELACEITE);
    this.nuevaVerificacionForm.get('nivelAgua')?.patchValue(respuesta.ID_NIVELAGUA);
    this.nuevaVerificacionForm.get('calibracionNeumaticosTraseros')?.patchValue(respuesta.ID_CALNEUTRASEROS);
    this.nuevaVerificacionForm.get('calibracionNeumaticosDelanteros')?.patchValue(respuesta.ID_CALNEUDELANTEROS);
    this.nuevaVerificacionForm.get('nivelCombustible')?.patchValue(respuesta.ID_NIVELCOMBUSTIBLE);
    this.nuevaVerificacionForm.get('nivelBateria')?.patchValue(respuesta.ID_NIVELBATERIA);
    this.nuevaVerificacionForm.get('limpiezaInterior')?.patchValue(respuesta.ID_LIMPIEZAINTERIOR);
    this.nuevaVerificacionForm.get('limpiezaExterior')?.patchValue(respuesta.ID_LIMPIEZAEXTERIOR);
    this.nuevaVerificacionForm.get('codigoFalla')?.patchValue(respuesta.ID_CODIGOFALLO);
    this.idMttoVehicular = respuesta.ID_MTTOVEHICULAR;
    this.idVerificacion = respuesta.ID_MTTOVERIFINICIO;
  }

  get nvf() {
    return this.nuevaVerificacionForm.controls;
  }

}
