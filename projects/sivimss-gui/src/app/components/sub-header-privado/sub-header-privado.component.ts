import {Component, OnDestroy, OnInit} from '@angular/core';
import {UsuarioEnSesion} from "projects/sivimss-gui/src/app/models/usuario-en-sesion.interface";
import {AutenticacionService} from "projects/sivimss-gui/src/app/services/autenticacion.service";
import {Subscription} from "rxjs";
import {NotificacionesService} from "../../services/notificaciones.service";

@Component({
  selector: 'app-sub-header-privado',
  templateUrl: './sub-header-privado.component.html',
  styleUrls: ['./sub-header-privado.component.scss'],
  providers: [NotificacionesService,]
})
export class SubHeaderPrivadoComponent implements OnInit, OnDestroy {

  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;
  existeNotificacion: boolean;
  notificaciones: string[] = [];

  constructor(private readonly autenticacionService: AutenticacionService,
              private readonly notificacionService: NotificacionesService) {
    this.existeNotificacion = notificacionService.existenNotificaciones();
    this.notificaciones = notificacionService.consultarNotificaciones();
  }

  ngOnInit(): void {
    this.subs = this.autenticacionService.usuarioEnSesion$.subscribe(
      (usuarioEnSesion: UsuarioEnSesion | null) => {
        this.usuarioEnSesion = usuarioEnSesion;
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

}
