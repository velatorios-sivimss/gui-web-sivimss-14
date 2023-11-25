import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { BusquedaConveniosPFServic } from './services/busqueda-convenios-pf.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';

import { OverlayPanel } from 'primeng/overlaypanel';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { Router } from '@angular/router';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { BusquedaPrevision } from './models/BusquedaPrevision.interface';
@Component({
  selector: 'app-consulta-convenio-prevision-funeraria',
  templateUrl: './consulta-convenio-prevision-funeraria.component.html',
  styleUrls: ['./consulta-convenio-prevision-funeraria.component.scss'],
})
export class ConsultaConvenioPrevisionFunerariaComponent implements OnInit {
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  convenios: BusquedaPrevision[] = [];
  itemConvenio!: BusquedaPrevision;

  totalElementos: number = this.convenios.length;
  mostrarModalFaltaConvenio: boolean = false;
  mostrarModalNoPuedeRenovar: boolean = false;
  mostrarModalNoSeEncuentraEnPeriodo: boolean = false;
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  constructor(
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.busqueda();
  }

  busqueda(): void {
    const valores = {
      pagina: this.numPaginaActual,
      tamanio: this.cantElementosPorPagina,
    };
    this.consultaConveniosService
      .consultarConvenios(valores)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta);

          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
            );
            return;
          }
          let total = respuesta.datos.length;
          if (total === 0 || respuesta.datos === null) {
            this.mostrarModalFaltaConvenio = true;
            return;
          }

          this.convenios = respuesta.datos.content || [];
          this.totalElementos = respuesta.datos.totalElements || 0;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);

          this.alertaService.mostrar(
            TipoAlerta.Error,
            'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
          );
        },
      });
  }

  abrirPanel(event: MouseEvent, itemConvenio: BusquedaPrevision): void {
    this.itemConvenio = itemConvenio;
    this.overlayPanel.toggle(event);
  }

  verPlanPreFune(): void {
    void this.router.navigate(
      [
        'externo-privado/consultar-mi-convenio-de-prevision-funeraria/mi-convenio-de-prevision-funeraria',
      ],
      {
        queryParams: { idpfs: this.itemConvenio.idConvenio },
      }
    );
  }
}
