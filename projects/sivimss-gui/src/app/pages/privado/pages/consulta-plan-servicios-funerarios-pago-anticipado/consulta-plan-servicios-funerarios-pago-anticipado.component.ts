import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { ContratarPSFPAService } from '../mapa-contratar-plan-servicios-funerarios-pago-anticipado/services/contratar-psfpa.service';
import { Subscription, finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { ListadoPlanes } from './models/consulta-plan-sfpa.interface';
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import { AutenticacionContratanteService } from 'projects/sivimss-gui/src/app/services/autenticacion-contratante.service';

@Component({
  selector: 'app-consulta-plan-servicios-funerarios-pago-anticipado',
  templateUrl:
    './consulta-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: [
    './consulta-plan-servicios-funerarios-pago-anticipado.component.scss',
  ],
  providers: [AutenticacionContratanteService]
})
export class ConsultaPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  usuarioEnSesion!: UsuarioEnSesion | null;
  subs!: Subscription;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  planes: ListadoPlanes[] = [];
  totalElementos: number = 0;
  mostrarModalFaltaConvenio: boolean = false;
  errorSolicitud: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';

  constructor(
    private contratarPSFPAService: ContratarPSFPAService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private readonly autenticacionContratanteService: AutenticacionContratanteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subs = this.autenticacionContratanteService.usuarioEnSesion$.subscribe(
      (usuarioEnSesion: UsuarioEnSesion | null) => {
        this.usuarioEnSesion = usuarioEnSesion;
        this.buscarPlanes();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  buscarPlanes(): void {
    if (this.usuarioEnSesion?.cveUsuario) {
      this.contratarPSFPAService
        .obtenerListadoPlanes(this.usuarioEnSesion?.cveUsuario)
        .pipe(finalize(() => this.loaderService.desactivar()))
        .subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
              this.alertaService.mostrar(TipoAlerta.Error, this.errorSolicitud);
              return;
            }
            if (!respuesta.datos || respuesta.datos.length === 0) {
              this.mostrarModalFaltaConvenio = true;
              return;
            }
            this.planes = respuesta.datos || [];
            this.totalElementos = respuesta.datos?.length;
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
    }
  }

  verPlanPreFune(plan: ListadoPlanes): void {
    void this.router.navigate(
      [
        'externo-privado/consultar-plan-de-servicios-funerarios-pago-anticipado/mi-plan-de-servicios-funerarios-pago-anticipado',
      ],
      {
        queryParams: { idPlanSfpa: plan.idPlanSfpa },
      }
    );
  }
}