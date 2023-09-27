import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioEnSesion } from "projects/sivimss-gui/src/app/models/usuario-en-sesion.interface";
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { Subscription } from "rxjs";
import { NotificacionesService } from "../../services/notificaciones.service";
import { HttpRespuesta } from "../../models/http-respuesta.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { MensajesSistemaService } from '../../services/mensajes-sistema.service';
import { AlertaService, TipoAlerta } from "../../shared/alerta/services/alerta.service";

export interface NotificacionInterface {
  path?: string;
  mensaje?: string;
  idRegistro?: number;
  indTipoSala?: boolean;
  usoSala?: string;
  idSala?: number;
  nombreSala?: string;
  cu?: string;
}

@Component({
  selector: 'app-sub-header-privado',
  templateUrl: './sub-header-privado.component.html',
  styleUrls: ['./sub-header-privado.component.scss'],
  providers: [NotificacionesService]
})
export class SubHeaderPrivadoComponent implements OnInit, OnDestroy {

  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;
  existeNotificacion: boolean;
  notificaciones: NotificacionInterface[] = [];
  mostrarModalConfirmacion: boolean = false;
  MENSAJE_CONFIRMACION_ID: number = 2;
  msgConfirmacion: string = "";
  overlayVisible: boolean = false;

  constructor(
    private readonly autenticacionService: AutenticacionService,
    private alertaService: AlertaService,
    private readonly notificacionService: NotificacionesService,
    private router: Router,
    private mensajesSistemaService: MensajesSistemaService
  ) {
    this.existeNotificacion = false;
    this.notificacionService.consultaNotificacion().subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length < 1) {
          return
        }
        const horaActual = new Date();
        const horaLimiteInicio = new Date();
        const horaLimiteFin = new Date();

        horaLimiteInicio.setHours(15, 0, 0, 0);
        horaLimiteFin.setHours(23, 59, 59, 999);

        if (horaActual >= horaLimiteInicio && horaActual <= horaLimiteFin) {
          console.log('La hora actual está en el rango permitido.');
          respuesta.datos.forEach((notificacion: any) => {
            if (notificacion.cu === "69") {
              if (!this.notificacionYaEmpujada(this.notificaciones, notificacion)){
                this.notificaciones.push(notificacion);
              }
            }
          });
        } else {
          console.log('La hora actual está fuera del rango permitido.');
        }

        respuesta.datos.forEach((notificacion: any) => {
          if (notificacion.cu === "9") {
            if (!this.notificacionYaEmpujada(this.notificaciones, notificacion)){
              this.notificaciones.push(notificacion);
            }
          }
        });


        respuesta.datos.forEach((notificacion: any) => {
          if (notificacion.cu === "40") {
            if (!this.notificacionYaEmpujada(this.notificaciones, notificacion)){
              this.notificaciones.push(notificacion);
            }
          }
        });

        if (this.notificaciones.length > 0) {
          this.existeNotificacion = true
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  notificacionYaEmpujada(notificaciones: any[], notificacion: any): boolean {
    return notificaciones.some(notif => notif.mensaje === notificacion.mensaje);
  }

  ngOnInit(): void {
    this.subs = this.autenticacionService.usuarioEnSesion$.subscribe(
      (usuarioEnSesion: UsuarioEnSesion | null) => {
        this.usuarioEnSesion = usuarioEnSesion;
        localStorage.setItem('usuario', JSON.stringify(
          {
            'idRol': this.usuarioEnSesion?.idRol,
            'idDelegacion': this.usuarioEnSesion?.idDelegacion,
            'idVelatorio': this.usuarioEnSesion?.idVelatorio,
            'idOficina': this.usuarioEnSesion?.idOficina
          }));
      }
    );
  }

  cerrarSesion(): void {
    this.msgConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(this.MENSAJE_CONFIRMACION_ID);
    this.mostrarModalConfirmacion = true;
  }

  cerrarSesionConfirmacion(): void {
    this.autenticacionService.cerrarSesion();
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  seleccionarNotificacion(notificacion: NotificacionInterface): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  registrarSalida(notificacion: any): void {
    let validacionRuta: boolean = false;
    let datos = {
      estadoSala: notificacion.botones.usoSala,
      tipoSala: notificacion.botones.indTipoSala,
      idRegistro: notificacion.botones.idRegistro,
      idSala: notificacion.botones.idSala,
      nombreSala: notificacion.botones.nombreSala
    }
    localStorage.setItem('reserva-sala', JSON.stringify(datos));
    if (this.router.url.includes('/reservar-salas/(salas:salas)')) {
      validacionRuta = true
    }
    this.router.navigate(['../../', notificacion.botones.url?.toLowerCase(), { outlets: { salas: "salas" } }]).then(() => {
      if (validacionRuta) {
        window.location.reload()
      }
    })
  }

  registrarMasTarde(notificacion: any): void {
    const idRegistro = notificacion.botones.idRegistro;
    this.notificacionService.renovarNotificacion(idRegistro).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.renovarNotificaciones();
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }
    })
  }

  renovarNotificaciones(): void {
    this.existeNotificacion = false;
    this.notificacionService.consultaNotificacion().subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos.length < 1) {
          return
        }
        this.notificaciones = respuesta.datos.filter((sala: any) => {
          return sala.mensaje.trim() != ""
        });
        if (this.notificaciones.length > 0) {
          this.existeNotificacion = true
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      }
    })
  }

  aceptar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

}
