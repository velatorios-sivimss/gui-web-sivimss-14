import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioEnSesion } from "projects/sivimss-gui/src/app/models/usuario-en-sesion.interface";
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-sub-header-privado',
  templateUrl: './sub-header-privado.component.html',
  styleUrls: ['./sub-header-privado.component.scss']
})
export class SubHeaderPrivadoComponent implements OnInit, OnDestroy {
  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;

  constructor(private readonly autenticacionService: AutenticacionService) {
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

}
