import {Component, OnInit} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

import * as moment from "moment";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Dropdown} from "primeng/dropdown";
import {DetallePagoService} from "../../services/detalle-pago.service";
import {RegistrarPago} from "../../models/registrar-pago.interface";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-modal-realizar-pago',
  templateUrl: './modal-realizar-pago.component.html',
  styleUrls: ['./modal-realizar-pago.component.scss']
})
export class ModalRealizarPagoComponent implements OnInit {


  generarPagoForm!: FormGroup;
  metodoPago!: TipoDropdown[];
  fechaActual = new Date();
  mensalidades:number = 0;
  tipoDePago: string = "";
  confirmacionGuardar: boolean = false;
  idPlanSpfa!: number;

  validacion: any = {nombreBanco: false, numeroAutorizacion: false,importe: false, totalPagar: false,
                      folioAutorizacion: false, fecha:false}

  constructor(private route: ActivatedRoute,
              private alertaService: AlertaService,
              private detallePagoService: DetallePagoService,
              public readonly ref: DynamicDialogRef,
              public readonly config: DynamicDialogConfig,
              private formBuilder: FormBuilder,
              private loaderService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.inicializarDatos()
    this.idPlanSpfa = this.route.snapshot.queryParams.idPlanSfpa;
  }

  inicializarFormulario(): void {
    this.generarPagoForm = this.formBuilder.group({
      numeroAutorizacion: [{value: null, disabled:false}],
             nombreBanco: [{value: null, disabled:false}],
                 importe: [{value: null, disabled:false}],
       folioAutorizacion: [{value: null, disabled:false}],
                   fecha: [{value: null, disabled:false}],
              totalPagar: [{value: null, disabled:false}],
              metodoPago: [{value: null, disabled:false}],
    });
  }

  inicializarDatos(): void {
    this.metodoPago = this.config.data.metodosPago;
    this.mensalidades = Number(this.config.data.detallePago.total) / Number(this.config.data.detallePago.desNumeroPagos);
  }

  cambioMetodoPago(dd: Dropdown): void {
    this.formulario.numeroAutorizacion.patchValue(null);
    this.formulario.nombreBanco.patchValue(null);
    this.formulario.importe.patchValue(null);
    this.formulario.folioAutorizacion.patchValue(null);
    this.formulario.fecha.patchValue(null);
    this.formulario.totalPagar.patchValue(null);
    this.tipoDePago = dd.selectedOption.label;
    if(dd.selectedOption.label.includes('Tarjeta crédito')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = true;
      this.validacion.importe = true;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
    }
    if(dd.selectedOption.label.includes('Tarjeta débito')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = true;
      this.validacion.importe = true;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
    }
    if(dd.selectedOption.label.includes('Transferencia')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = true;
      this.validacion.totalPagar = true;
      this.validacion.folioAutorizacion = true;
      this.validacion.fecha = true;
    }
    if(dd.selectedOption.label.includes('Depósito')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = true;
      this.validacion.totalPagar = true;
      this.validacion.folioAutorizacion = true;
      this.validacion.fecha = true;
    }
  }

  cerrarModal() {
    this.ref.close(false);
  }

  guardarPago(): void {
    this.confirmacionGuardar = false;
    this.loaderService.activar();
    let generarObjetoGuardado: RegistrarPago = this.generarObjetoGuardado()
    this.detallePagoService.guardarPago(generarObjetoGuardado).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.alertaService.mostrar(TipoAlerta.Exito,  "Pago modificado correctamente.")
        this.ref.close(true)
      },
      error: (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error al guardar la información. Intenta nuevamente.')
      }
    });
  }
  generarObjetoGuardado(): RegistrarPago {
    return {
      idPlan: +this.idPlanSpfa,
      idTipoPago: +this.formulario.metodoPago.value ?? null,
      fechaPago: this.formulario.fecha.value ? moment(this.formulario.fecha.value).format('YYYY-MM-DD') : null,
      numeroAutorizacion: this.formulario.numeroAutorizacion.value ?? null,
      folioAutorizacion:this.formulario.folioAutorizacion.value ?? null,
      nombreBanco: this.formulario.nombreBanco.value ?? null,
      importe: this.formulario.importe.value ?? null,
    }
  }

  get formulario(){
    return this.generarPagoForm.controls;
  }
}
