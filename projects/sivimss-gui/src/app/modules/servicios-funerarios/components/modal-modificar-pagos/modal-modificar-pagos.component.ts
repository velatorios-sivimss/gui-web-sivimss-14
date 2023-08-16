import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ActivatedRoute} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {DetallePagoService} from "../../services/detalle-pago.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {Dropdown} from "primeng/dropdown";
import {RegistrarPago} from "../../models/registrar-pago.interface";
import * as moment from "moment/moment";
import {PagosRealizados} from "../../models/detalle-servicios.interface";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-modal-modificar-pagos',
  templateUrl: './modal-modificar-pagos.component.html',
  styleUrls: ['./modal-modificar-pagos.component.scss']
})
export class ModalModificarPagosComponent implements OnInit {

  modificarPagoForm!: FormGroup;
  metodoPago!: TipoDropdown[];
  fechaActual = new Date();
  mensalidades:number = 0;
  tipoDePago: any;
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
              private mensajesSistemaService: MensajesSistemaService) { }

  ngOnInit(): void {
    this.inicializarFormulario(this.config.data.detalleRegistro);
    this.inicializarDatos();
    this.idPlanSpfa = this.config.data.detalleRegistro.idBitacoraPago;
  }

  inicializarFormulario(datos: PagosRealizados): void {
    let fecha;
    if(datos.fechaPago){
      const [anio,mes,dia] = datos.fechaPago.split('-');
      fecha = new Date(Number(anio) + '/' + Number(mes) + '/' + Number(dia));
    }

    this.modificarPagoForm = this.formBuilder.group({
      numeroAutorizacion: [{value: datos.numeroAutorizacion ?? null, disabled:false}],
      nombreBanco: [{value: datos.nombreBanco ?? null, disabled:false}],
      importe: [{value: datos.monto ?? null, disabled:false}],
      folioAutorizacion: [{value: datos.folioAutorizacion ?? null, disabled:false}],
      fecha: [{value: fecha ?? null, disabled:false}],
      totalPagar: [{value: null, disabled:false}],
      metodoPago: [{value: Number(datos.idMetodoPago), disabled:false}],
    });

    // this.cambioMetodoPago(null, )
    this.tipoDePago = datos.metodoPago;
    this.validarTipoPago(datos.metodoPago);

  }

  inicializarDatos(): void {
    this.metodoPago = this.config.data.metodosPago;
    this.mensalidades = Number(this.config.data.detallePago.total) / Number(this.config.data.detallePago.desNumeroPagos);
  }

  validarTipoPago(tipo: any): void {

    if(tipo.includes('Tarjeta crédito')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = true;
      this.validacion.importe = true;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
    }
    if(tipo.includes('Tarjeta débito')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = true;
      this.validacion.importe = true;
      this.validacion.totalPagar = false;
      this.validacion.folioAutorizacion = false;
      this.validacion.fecha = false;
    }
    if(tipo.includes('Transferencia')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = true;
      this.validacion.totalPagar = true;
      this.validacion.folioAutorizacion = true;
      this.validacion.fecha = true;
    }
    if(tipo.includes('Depósito')){
      this.validacion.nombreBanco = true;
      this.validacion.numeroAutorizacion = false;
      this.validacion.importe = true;
      this.validacion.totalPagar = true;
      this.validacion.folioAutorizacion = true;
      this.validacion.fecha = true;
    }
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

  generarObjetoModificar(): RegistrarPago {
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

  modificarPago(): void {
    this.confirmacionGuardar = false;
    this.loaderService.activar();
    let generarObjetoGuardado: RegistrarPago = this.generarObjetoModificar()
    this.detallePagoService.modificarPago(generarObjetoGuardado).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.ref.close(true)
      },
      error: (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error al guardar la información. Intenta nuevamente.')
      }
    });
  }

  cerrarModal() {
    this.ref.close(false);
  }

  get formulario(){
    return this.modificarPagoForm.controls;
  }

}
