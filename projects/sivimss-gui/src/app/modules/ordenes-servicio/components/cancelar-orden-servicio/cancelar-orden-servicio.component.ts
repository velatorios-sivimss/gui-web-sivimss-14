import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {OrdenServicioPaginado} from "../../models/orden-servicio-paginado.interface";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {ConsultarOrdenServicioService} from "../../services/consultar-orden-servicio.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";

@Component({
  selector: 'app-cancelar-orden-servicio',
  templateUrl: './cancelar-orden-servicio.component.html',
  styleUrls: ['./cancelar-orden-servicio.component.scss']
})
export class CancelarOrdenServicioComponent implements OnInit {

  form!: FormGroup;
  horasExcedidas: boolean = false;

  confirmacion: boolean = false;
  mensajeCancelacion: string = "";
  ODSSeleccionada!:OrdenServicioPaginado;
  precioCancelacionODS!: string;

  constructor(private formBuilder: FormBuilder,
              private readonly ref: DynamicDialogRef,
              private mensajesSistemaService: MensajesSistemaService,
              public config: DynamicDialogConfig,
              private consultarOrdenServicioService: ConsultarOrdenServicioService,
              private alertaService: AlertaService,
              private loaderService: LoaderService,
              ) {
  }

  ngOnInit(): void {
    this.ODSSeleccionada = this.config.data.ods;
    this.consultarPrecioCancelacion();
    this.config.data.ods.tiempoGeneracionODSHrs > 24 ? this.horasExcedidas = true : this.horasExcedidas = false;
    this.mensajeCancelacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(62);
    this.inicializarForm();
  }

  inicializarForm() {
    this.form = this.formBuilder.group({
      motivoCancelacion: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  consultarPrecioCancelacion(): void {
    this.loaderService.activar();
    this.consultarOrdenServicioService.consultarPrecioCancelacionODS().pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        this.precioCancelacionODS = respuesta.datos[0].costoCancelacion;
      },
      (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    )

  }

  quitarEspacioInicio(): void{
    this.f.motivoCancelacion.setValue(
      this.f.motivoCancelacion.value.trimStart()
    )
  }

  guardar() {
    const objetoCancelacion ={
      idOrdenServicio: this.ODSSeleccionada.idOrdenServicio,
      costoCancelacion: Number(this.precioCancelacionODS),
      numeroFolio: this.ODSSeleccionada.numeroFolio,
      motivoCancelacion: this.f.motivoCancelacion.value,
    }
    this.ref.close(objetoCancelacion);
  }


  cancelar(): void {
    this.ref.close(false);
  }

  get f() {
    return this.form.controls;
  }
}
