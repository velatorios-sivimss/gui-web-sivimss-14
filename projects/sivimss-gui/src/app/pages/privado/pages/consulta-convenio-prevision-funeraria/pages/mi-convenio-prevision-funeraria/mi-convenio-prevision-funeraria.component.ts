import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModalDetalleBeneficiariosComponent } from './components/modal-detalle-beneficiarios/modal-detalle-beneficiarios.component';
import { ModalRenovarConvenioComponent } from './components/modal-renovar-convenio/modal-renovar-convenio.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { BusquedaConveniosPFServic } from '../../services/busqueda-convenios-pf.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DatosGeneralesDetalle } from '../../models/DatosGeneralesDetalle.interface';
import { Beneficiarios } from '../../models/Beneficiarios.interface';
import { DatosGeneralesRenovacion } from '../../models/DatosGeneralesRenovacion.interface';
import { ModalRegistrarNuevoBeneficiarioComponent } from './components/modal-registrar-nuevo-beneficiario/modal-registrar-nuevo-beneficiario.component';

@Component({
  selector: 'app-mi-convenio-prevision-funeraria',
  templateUrl: './mi-convenio-prevision-funeraria.component.html',
  styleUrls: ['./mi-convenio-prevision-funeraria.component.scss'],
})
export class MiConvenioPrevisionFunerariaComponent implements OnInit {
  beneficiarios: Beneficiarios[] = [];
  ref!: DynamicDialogRef;

  datosGenerales: DatosGeneralesDetalle = {} as DatosGeneralesDetalle;
  datosGeneralesRenovacion: DatosGeneralesRenovacion =
    {} as DatosGeneralesRenovacion;
  errorSolicitud: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';

  constructor(
    private readonly dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.detalleConvenio();
  }

  abrirModalRenovarConvenio(event: MouseEvent): void {
    event.stopPropagation();
    this.ref = this.dialogService.open(ModalRenovarConvenioComponent, {
      header: 'Renovar convenio',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    this.ref.onClose.subscribe((respuesta: any) => {});
  }

  detalleConvenio() {
    let idPlan = this.rutaActiva.snapshot.queryParams.idpfs;
    this.consultaConveniosService
      .detalleConvenio(idPlan)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
            );
            return;
          }
          try {
            this.datosGenerales = respuesta.datos.datosGenerales[0] || {};
            this.beneficiarios = respuesta.datos.beneficiarios;
            this.datosGeneralesRenovacion =
              respuesta.datos.datosRenovacion[0] || {};
          } catch (error) {
            console.error(error);
          }
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

  abrirModalDetalleBeneficiarios(event: MouseEvent, item: any): void {
    event.stopPropagation();
    this.ref = this.dialogService.open(ModalDetalleBeneficiariosComponent, {
      header: 'Detalle de los beneficiarios',
      style: { maxWidth: '876px', width: '100%' },
      data: { item: item },
    });

    this.ref.onClose.subscribe((respuesta: any) => {
      console.log(respuesta);
    });
  }

  abrirModalRegistroNuevoBeneficiario(event: MouseEvent) {
    event.stopPropagation();

    this.ref = this.dialogService.open(
      ModalRegistrarNuevoBeneficiarioComponent,
      {
        header: 'Registrar nuevo beneficiaro',
        style: { maxWidth: '876px', width: '100%' },
        data: {
          dato1: null,
        },
      }
    );
    this.ref.onClose.subscribe((respuesta: any) => {});
  }

  cerrarModal(): void {
    this.ref.onClose;
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
