import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
// import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';
import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subheader-privado',
  templateUrl: './subheader-privado.component.html',
  styleUrls: ['./subheader-privado.component.scss'],
  providers: [AutenticacionContratanteService]
})
export class SubheaderPrivadoComponent implements OnInit, OnDestroy {
  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;

  constructor(public autenticacionContratanteService: AutenticacionContratanteService) { }

  ngOnInit(): void {
    this.subs = this.autenticacionContratanteService.usuarioEnSesion$.subscribe(
      (usuarioEnSesion: UsuarioEnSesion | null) => {
        this.usuarioEnSesion = usuarioEnSesion;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  cerrarSesion() {
    this.autenticacionContratanteService.cerrarSesion();
  }
}
