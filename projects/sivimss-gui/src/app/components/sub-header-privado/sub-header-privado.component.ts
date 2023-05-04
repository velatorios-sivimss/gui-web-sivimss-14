import {Component, OnDestroy, OnInit} from '@angular/core';
import {UsuarioEnSesion} from "projects/sivimss-gui/src/app/models/usuario-en-sesion.interface";
import {AutenticacionService} from "projects/sivimss-gui/src/app/services/autenticacion.service";
import {Subscription} from "rxjs";
import {NotificacionesService} from "../../services/notificaciones.service";
import {HttpRespuesta} from "../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";

export interface NotificacionInterface {
  PATH?: string;
  mensaje?: string;
  idRegistro?: number;
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

  constructor(private readonly autenticacionService: AutenticacionService,
              private readonly notificacionService: NotificacionesService,
              private router: Router,) {
    this.existeNotificacion = false;
    this.notificacionService.consultaNotificacion().subscribe(
      (respuesta:HttpRespuesta<any>) => {
        if (respuesta.datos.length < 1){return}
        this.existeNotificacion = true;
        this.notificaciones = respuesta.datos;
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  ngOnInit(): void {
    this.subs = this.autenticacionService.usuarioEnSesion$.subscribe(
      (usuarioEnSesion: UsuarioEnSesion | null) => {
        this.usuarioEnSesion = usuarioEnSesion;
        localStorage.setItem('usuario', JSON.stringify(
          {'idDelegacion':this.usuarioEnSesion?.idDelegacion,'idVelatorio': this.usuarioEnSesion?.idVelatorio}));
      }
    );
  }

  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  seleccionarNotificacion(notificacion:NotificacionInterface): void {

  }

  registrarSalida(notificacion:NotificacionInterface):void {
    this.router.navigate([notificacion.PATH?.toLowerCase()],
      {queryParams:{idRegistro:notificacion.idRegistro}})
  }

  registrarMasTarde(notificacion:NotificacionInterface): void {
    const idRegistro = notificacion.idRegistro;
    this.notificacionService.renovarNotificacion(idRegistro).subscribe(
      (respuesta:HttpRespuesta<any>) => {
        this.renovarNotificaciones();
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  renovarNotificaciones(): void {
    this.existeNotificacion = false;
    this.notificacionService.consultaNotificacion().subscribe(
      (respuesta:HttpRespuesta<any>) => {
        if (respuesta.datos.length < 1){return}
        this.existeNotificacion = true;
        this.notificaciones = respuesta.datos;
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  aceptar(): void {

  }
}
