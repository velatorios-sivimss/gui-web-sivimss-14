import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {GenerarOrdenServicioService} from "../../services/generar-orden-servicio.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

@Component({
  selector: 'app-modal-convenio-pf',
  templateUrl: './modal-convenio-pf.component.html',
  styleUrls: ['./modal-convenio-pf.component.scss']
})
export class ModalConvenioPfComponent implements OnInit {

  form!: FormGroup;
  objetoContratante!: any;
  contratantes!: TipoDropdown[];

  objetoBeneficiario!: any;
  beneficiarios: TipoDropdown[] = [];
  folioContrato: string = "";
  idContrato!: number;
  idVelatorio!: number;
  idPersona!: number;
  existeSiniestro:boolean = false;
  nombreVelatorio: string = "";

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly config: DynamicDialogConfig,
    private loaderService: LoaderService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.folioContrato = this.config.data;
    this.inicializarForm();
    this.consultarFolioPf();
  }


  inicializarForm(): void {
    this.form = this.formBuilder.group({
      contratante: [{value:null, disabled: false}, [Validators.required]],
      beneficiario: [{value:null, disabled: false}],
    })
  }

  consultarFolioPf(): void {
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarContratoPf(this.folioContrato).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos === null) {
          const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
          this.alertaService.mostrar(TipoAlerta.Precaucion, errorMsg || 'El contrato de Previsión Funeraria que deseas utilizar no se encuentra vigente. ');
          return
        }
        this.idContrato = respuesta.datos.idContratoPF;
        this.idVelatorio = respuesta.datos.idVelatorio
        this.nombreVelatorio = respuesta.datos.nombreVelatorio;
        this.consultarContratantes();
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    })
  }

  consultarContratantes(): void {
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarContratantesPf(this.idContrato).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.objetoContratante = respuesta.datos || [];
        this.contratantes = respuesta.datos.map((contratante: any) => (
          {label: contratante.nombreContratante, value: contratante.idContratante}
        ));
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    })
  }

  consultarBeneficiarios(): void {
    this.existeSiniestro = true;
    this.objetoContratante.forEach((contratante:any) => {
      if(contratante.idContratante == this.formulario.contratante.value){
        if(contratante.validaSiniestro == 0){
          this.existeSiniestro = false;
          const errorMsg: string =this.mensajesSistemaService.obtenerMensajeSistemaPorId(73);
          this.alertaService.mostrar(TipoAlerta.Precaucion,errorMsg ||  'El contrato de Previsión Funeraria ya cuenta con el límite de siniestros a cubrir.'  );
        }
      }
    });
    if(!this.existeSiniestro) return;
    this.loaderService.activar();

    this.gestionarOrdenServicioService.consultarBeneficiariosPf(this.idContrato,this.formulario.contratante.value).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.existeSiniestro = true;
        this.objetoBeneficiario = respuesta.datos || [];
        this.beneficiarios = respuesta.datos.map((beneficiario: any) => (
          {label: beneficiario.nombreBeneficiario, value: beneficiario.idPersona}
        ));
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    })
  }

  guardar(): void {

    const idPersona = this.obtenerIdPersona();

    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarPersona(idPersona).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.ref.close({
          finado: respuesta.datos[0],
          idContrato: this.idContrato,
          idVelacion: this.idVelatorio,
          idContratantePf: this.formulario.contratante.value,
          nombreVelatorio: this.nombreVelatorio
        });
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    })
  }

  obtenerIdPersona(): number {
    if(this.formulario.beneficiario.value){
      this.idPersona = this.formulario.beneficiario.value;
      return this.idPersona;
    }
    this.objetoContratante.forEach((contratante:any) => {
      if(contratante.idContratante == this.formulario.contratante.value){
        this.idPersona = contratante.idPersona;
        return contratante.idPersona;
      }
    });
    return this.idPersona
  }

  cancelar(): void {
    this.ref.close(false);
  }

  get formulario() {
    return this.form.controls;
  }

}
