import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
// import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';
import { AutenticacionService } from 'projects/sivimss-gui/src/app/services/autenticacion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subheader-privado',
  templateUrl: './subheader-privado.component.html',
  styleUrls: ['./subheader-privado.component.scss'],
  providers: [AutenticacionService]
})
export class SubheaderPrivadoComponent implements OnInit, OnDestroy {
  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;

  constructor(public autenticacionContratanteService: AutenticacionService) { }

  ngOnInit(): void {
    this.subs = this.autenticacionContratanteService.usuarioEnSesion$.subscribe(
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

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  cerrarSesion() { }
}
