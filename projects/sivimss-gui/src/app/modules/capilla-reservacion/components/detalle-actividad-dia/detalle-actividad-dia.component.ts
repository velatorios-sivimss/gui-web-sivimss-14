import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig,DynamicDialogRef,} from "primeng/dynamicdialog";
import * as moment from 'moment';
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {CapillaReservacionService} from "../../services/capilla-reservacion.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {DetalleDiaSeleccionado} from "../../models/capilla-reservacion.interface";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-detalle-actividad-dia',
  templateUrl: './detalle-actividad-dia.component.html',
  styleUrls: ['./detalle-actividad-dia.component.scss']
})
export class DetalleActividadDiaComponent implements OnInit {

  fechaSeleccionada: string = "";
  idCapilla!: number;
  detalleCapillas: DetalleDiaSeleccionado[] = [];

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private readonly loaderService: LoaderService,
    private capillaReservacionService: CapillaReservacionService,
    private alertaService: AlertaService,
  )
  { }

  ngOnInit(): void {
    // this.fechaSeleccionada = this.config.data.fecha.replace(/-/g, "/");
    this.fechaSeleccionada = this.config.data.fecha;
    this.idCapilla = this.config.data.idCapilla;
    this.consultarDetalle();
  }

  consultarDetalle(): void {
    this.loaderService.activar();

    this.capillaReservacionService.consultaDetallePorDia(this.fechaSeleccionada,this.idCapilla).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.detalleCapillas = respuesta.datos;
        this.fechaSeleccionada = this.config.data.fecha.replace(/-/g, "/");
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    )


  }

  aceptar(): void {
    this.ref.close();
  }
}



