import { registrarSalida } from './../../models/capilla-reservacion.interface';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {DynamicDialogConfig,DynamicDialogRef,} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import { FormBuilder } from '@angular/forms';
import { CapillaReservacionService } from '../../services/capilla-reservacion.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment'
type NuevaSalida = Omit<registrarSalida, 'idSalida'>
@Component({
  selector: 'app-registrar-salida',
  templateUrl: './registrar-salida.component.html',
  styleUrls: ['./registrar-salida.component.scss']
})
export class RegistrarSalidaComponent implements OnInit {



  @Input() registrarSalida!: registrarSalida;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<registrarSalida>();

  creacionRef!: DynamicDialogRef;
  acordionAbierto: boolean = false;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;
  horaEntrada: any;

  registroCapilla!: registrarSalida;
  idCapilla: any;
  idVelatorio!: any;
  idDisponibilidad: any;
  fechaSalida: any;
  horaSalida: any;

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef,
    public capillaReservacionService: CapillaReservacionService,
  ) {
    this.registrarSalida = this.config.data;
    // this.crearSalidaModificada()
  }

  ngOnInit(): void {
    this.idCapilla =  this.registrarSalida.idCapilla;
    this.idVelatorio =  this.registrarSalida.idVelatorio;
    this.fechaSalida = this.registrarSalida.fecha?.fecha;
    this.horaSalida = this.registrarSalida.fecha?.hora;
    this.obtenerDatosCapilla();



    // this.crearSalidaModificada();
    // this.idDisponibilidad =  this.registrarSalida.idCapilla;
    // this.fechaSalida =  this.registrarSalida.fechaSalida;
    // this.horaSalida =  this.registrarSalida.horaSalida;
  }

  obtenerDatosCapilla(): void {

    this.capillaReservacionService.capillaOcupadaPorIdVelatorio(this.idVelatorio).subscribe(
      (respuesta) => {
        if (respuesta.datos) {
          respuesta.datos.forEach( (x:any) => {
            if(x.idCapilla == this.idCapilla){
              this.registroCapilla = x;
              this.registroCapilla.fechaEntrada = this.registroCapilla.fechaEntrada?.replace(/-/g, "/");
              return
            }
          });
          // this.capilla = respuesta!.datos.map((capilla: any) => {
          //   return { label: capilla.nomCapilla, value: capilla.idCapilla };
          // });
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }











  crearSalidaModificada(): registrarSalida{
    return {
      idCapilla:   this.registrarSalida.idCapilla,
      idDisponibilidad:   this.registroCapilla.idDisponibilidad,
      fechaSalida:  moment(this.registrarSalida.fecha?.fecha).format('DD-MM-yyyy'),
      horaSalida:   moment(this.registrarSalida.fecha?.hora).format('HH:mm')
    }
  }


  guardar(): void {
    const registrarEntradaBo: NuevaSalida = this.crearSalidaModificada()
    const solicitudEntrada: string = JSON.stringify(registrarEntradaBo)
    this.capillaReservacionService.registrarSalida(solicitudEntrada).subscribe(
      () => {
        this.alertaService.mostrar(
          TipoAlerta.Exito,
          'Has registrado la entrada/inicio del servicio correctamente.',
        )
        this.ref.close(true)
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Alta incorrecta')
        this.ref.close(false)
        console.error('ERROR: ', error.message)
      },
    )
  }

  cancelar(): void {
    this.ref.close(false);
  }

}
