import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { VelacionDomicilioService } from '../../services/velacion-domicilio.service';
import { finalize } from 'rxjs';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { mensajes } from '../../../reservar-salas/constants/mensajes';
import { VelacionDomicilioInterface } from '../../models/velacion-domicilio.interface';
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-registrar-entrada-equipo',
  templateUrl: './registrar-entrada-equipo.component.html',
  styleUrls: ['./registrar-entrada-equipo.component.scss'],
  providers: [CookieService]
})
export class RegistrarEntradaEquipoComponent implements OnInit {

  confirmacion: boolean = false;
  registrarEntradaForm!: FormGroup;
  valeSeleccionado: VelacionDomicilioInterface = {}
  alertas = JSON.parse(this.cookieService.get('mensajes') as string) || mensajes;

  constructor(
    public config: DynamicDialogConfig,
    private alertaService: AlertaService,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private velacionDomicilioService: VelacionDomicilioService,
    private readonly loaderService: LoaderService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.valeSeleccionado = this.config.data.valeSeleccionado;
    }
    this.inicializarRegistrarEntradaForm();
  }

  inicializarRegistrarEntradaForm(): void {
    this.registrarEntradaForm = this.formBulder.group({
      fechaEntrada: [{ value: new Date(), disabled: true }, []],
      nombreResponsableEntrega: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
      matriculaResponsableEntrega: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]]
    });
  }

  registrarEntrada(): void {
    this.velacionDomicilioService.registrarSalida(this.datosGuardar()).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
        this.referencia.close(true);
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error Desconocido");
      }
    });
  }

  datosGuardar() {
    return {
      idValeSalida: this.valeSeleccionado.idValeSalida,
      ...this.registrarEntradaForm.value,
      fechaEntrada: moment(this.ref.fechaEntrada.value).format('DD-MM-yyyy'),
    }
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get ref() {
    return this.registrarEntradaForm.controls;
  }

}
