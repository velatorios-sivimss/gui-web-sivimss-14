import { Component, OnInit } from '@angular/core';
import * as moment from "moment/moment";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {SalaVelatorioConsultaDia} from "../../models/sala-velatorio.interface";
import {ReservarSalasService} from "../../services/reservar-salas.service";
import {finalize,map} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-ver-actividad-salas',
  templateUrl: './ver-actividad-salas.component.html',
  styleUrls: ['./ver-actividad-salas.component.scss']
})
export class VerActividadSalasComponent implements OnInit {

  fechaSeleccionada: string = "";
  idSala:number = 0;
  salas: SalaVelatorioConsultaDia[] = [];

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private reservarSalasService:ReservarSalasService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.fechaSeleccionada = this.config.data.fecha;
    this.idSala = this.config.data.idSala;
    this.consultarDetalleDia();
  }

  consultarDetalleDia(): void {
    this.loaderService.activar();
    this.reservarSalasService.consultarDetalleDia(this.fechaSeleccionada,this.idSala).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: any) => {
        respuesta.datos.forEach((SalaVelatorioConsultaDia:SalaVelatorioConsultaDia) => {
          const [hoursEntrada, minutesEntrada, secondsEntrada] = SalaVelatorioConsultaDia.horaEntrada.split(':');
          const [hoursSalida, minutesSalida] = SalaVelatorioConsultaDia.horaSalida.split(':');
          SalaVelatorioConsultaDia.horaEntrada = new Date();
            SalaVelatorioConsultaDia.horaEntrada.setHours(hoursEntrada);
            SalaVelatorioConsultaDia.horaEntrada.setMinutes(minutesEntrada);
            SalaVelatorioConsultaDia.horaEntrada.setSeconds(secondsEntrada);
          if(SalaVelatorioConsultaDia.horaSalida){
            SalaVelatorioConsultaDia.horaSalida = new Date();
              SalaVelatorioConsultaDia.horaSalida.setHours(hoursSalida);
              SalaVelatorioConsultaDia.horaSalida.setMinutes(minutesSalida);
          }
        });
        this.salas = respuesta.datos;
      },
      (error:HttpErrorResponse) => {
        console.error("ERROR: ", error.message);
      }
    );
  }

  aceptar(): void {
    this.ref.close();
  }

}
