import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ActivatedRoute} from "@angular/router";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-detalle-beneficiario-convenios-prevision-funeraria',
  templateUrl: './detalle-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./detalle-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class DetalleBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;
  readonly POSICION_DELEGACIONES = 5;

  beneficiario!: any;
  parentesco!: TipoDropdown[];
  parentescoDescripcion!: TipoDropdown[];
  velatorio!: TipoDropdown[] ;
  velatorioDescripcion: string = "";
  delegacionDescripcion: string = "";
  delegaciones!: TipoDropdown[];

  constructor(
    private route: ActivatedRoute,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private readonly loaderService: LoaderService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.beneficiario = this.config.data;
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.delegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.parentescoDescripcion = this.parentesco.filter( (elemento) => {
      return elemento.value == this.beneficiario.parentesco;
    })
    this.consultarDelegacion()
    this.consultaVelatorio();
  }

  consultarDelegacion(): void {
    this.beneficiario
    this.delegaciones.forEach((delegacion:any) => {
      if(delegacion.value == +this.beneficiario.delegacion)this.delegacionDescripcion = delegacion.label;
    });
  }

  consultaVelatorio(): void {
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarVelatorios(+this.beneficiario.delegacion).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.velatorio = respuesta.datos.map((velatorio: any) => (
          {label: velatorio.nomVelatorio, value: velatorio.idVelatorio})) || [];

        this.velatorio.forEach((velatorio: any) => {
          if (velatorio.value == +this.beneficiario.velatorio) this.velatorioDescripcion = velatorio.label;
        });
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    })
  }

  aceptar(): void {
    this.ref.close();
  }

}
