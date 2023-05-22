import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ControlVehiculoConsultaDia } from '../../models/calendario-vehiculos.interface';
import { ControlVehiculosService } from "../../services/control-vehiculos.service";
import { finalize } from "rxjs/operators";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'app-ver-actividad-vehiculos',
  templateUrl: './ver-actividad-vehiculos.component.html',
  styleUrls: ['./ver-actividad-vehiculos.component.scss']
})
export class VerActividadVehiculosComponent implements OnInit {

  fechaSeleccionada: string = "";
  idVehiculo: number = 0;
  vehiculos: ControlVehiculoConsultaDia[] = [];

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private controlVehiculosService: ControlVehiculosService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.fechaSeleccionada = this.config.data.fechaSeleccionada;
    this.idVehiculo = this.config.data.idVehiculo;
    this.consultarDetalleDia();
  }

  consultarDetalleDia(): void {
    this.loaderService.activar();
    this.controlVehiculosService.consultarDetalleDia(this.idVehiculo, this.fechaSeleccionada).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.vehiculos = respuesta.datos;
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    );
  }

  aceptar(): void {
    this.ref.close();
  }

}
