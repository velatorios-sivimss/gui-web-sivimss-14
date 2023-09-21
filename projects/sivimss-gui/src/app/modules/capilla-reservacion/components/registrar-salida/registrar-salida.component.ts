import {registrarSalida} from './../../models/capilla-reservacion.interface';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef,} from "primeng/dynamicdialog";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {FormBuilder} from '@angular/forms';
import {CapillaReservacionService} from '../../services/capilla-reservacion.service';
import {HttpErrorResponse} from '@angular/common/http';
import * as moment from 'moment'
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

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
    private mensajesSistemaService: MensajesSistemaService
  ) {
    this.registrarSalida = this.config.data;
  }

  ngOnInit(): void {
    this.idCapilla = this.registrarSalida.idCapilla;
    this.idVelatorio = this.registrarSalida.idVelatorio;
    this.fechaSalida = this.registrarSalida.fecha?.fecha;
    this.horaSalida = this.registrarSalida.fecha?.hora;
    this.obtenerDatosCapilla();
  }

  obtenerDatosCapilla(): void {

    this.capillaReservacionService.capillaOcupadaPorIdVelatorio(this.idVelatorio).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos) {
          respuesta.datos.forEach((x: any) => {
            if (x.idCapilla == this.idCapilla) {
              this.registroCapilla = x;
              this.registroCapilla.fechaEntrada = this.registroCapilla.fechaEntrada?.replace(/-/g, "/");
            }
          });
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  crearSalidaModificada(): registrarSalida {
    return {
      idCapilla: this.registrarSalida.idCapilla,
      idDisponibilidad: this.registroCapilla.idDisponibilidad,
      fechaSalida: moment(this.registrarSalida.fecha?.fecha).format('DD-MM-yyyy'),
      horaSalida: moment(this.registrarSalida.fecha?.hora).format('HH:mm')
    }
  }


  guardar(): void {
    const registrarEntradaBo: NuevaSalida = this.crearSalidaModificada()
    const solicitudEntrada: string = JSON.stringify(registrarEntradaBo)
    this.capillaReservacionService.registrarSalida(solicitudEntrada).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg);
        this.ref.close(true)
      },
      error: (error: HttpErrorResponse): void => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
      },
    })
  }

  cancelar(): void {
    this.ref.close(false);
  }
}
