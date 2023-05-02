import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import * as moment from 'moment';

@Component({
  selector: 'app-detalle-actividad-dia',
  templateUrl: './detalle-actividad-dia.component.html',
  styleUrls: ['./detalle-actividad-dia.component.scss']
})
export class DetalleActividadDiaComponent implements OnInit {

  fechaSeleccionada: string = "";

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  )
  { }

  ngOnInit(): void {
    this.fechaSeleccionada = moment(this.config.data).format("DD/MM/yyyy");
  }


  aceptar(): void {
  this.ref.close();
  }
}



