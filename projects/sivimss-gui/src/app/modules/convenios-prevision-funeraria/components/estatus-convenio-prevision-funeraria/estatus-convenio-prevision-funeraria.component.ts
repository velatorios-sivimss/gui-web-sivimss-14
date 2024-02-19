import { Component, OnInit } from '@angular/core';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ConveniosPrevisionFunerariaInterface} from "../../models/convenios-prevision-funeraria.interface";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-estatus-convenio-prevision-funeraria',
  templateUrl: './estatus-convenio-prevision-funeraria.component.html',
  styleUrls: ['./estatus-convenio-prevision-funeraria.component.scss']
})
export class EstatusConvenioPrevisionFunerariaComponent implements OnInit {

  mensajeConfirmacion!: string;
  convenioSeleccionado:ConveniosPrevisionFunerariaInterface = {}

  constructor(
    private readonly loaderService: LoaderService,
    public config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private mensajesSistemaService: MensajesSistemaService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    this.convenioSeleccionado = this.config.data;
    this.mensajeConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(4);
  }

  aceptar(): void {
    this.loaderService.activar();
    const estatus = Number(this.convenioSeleccionado.estatusConvenio) == 3 ? 1 : 0;
    this.agregarConvenioPFService.cambiarEstatusConvenio(
      {folioConvenio:this.convenioSeleccionado.idConvenio,banderaActivo:estatus}).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        let idMensaje: number;
        estatus ? idMensaje = 69 : idMensaje = 19
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(idMensaje);
        this.alertaService.mostrar(TipoAlerta.Exito, errorMsg);
        this.ref.close(true);
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error al guardar la información. Intenta nuevamente.');
      }
    })
  }

  cancelar(): void {
    this.ref.close(false);
  }

}
