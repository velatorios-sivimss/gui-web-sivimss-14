import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { ContratarPSFPAService } from '../../../mapa-contratar-plan-servicios-funerarios-pago-anticipado/services/contratar-psfpa.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { DetalleServicioFunerario, TitularesBeneficiarios } from '../../models/consulta-plan-sfpa.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
@Component({
  selector: 'app-mi-plan-servicios-funerarios-pago-anticipado',
  templateUrl: './mi-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: ['./mi-plan-servicios-funerarios-pago-anticipado.component.scss'],
  providers: [DescargaArchivosService]
})
export class MiPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  beneficiarios: TitularesBeneficiarios[] = [];
  titular!: TitularesBeneficiarios;
  titularSubstituto!: TitularesBeneficiarios;
  detalleServicioFunerario!: DetalleServicioFunerario;
  idPlanSfpa: number | undefined;

  constructor(
    private dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private contratarPSFPAService: ContratarPSFPAService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    this.cargarScript(() => {
    });
    this.subscripcionMotorPagos()
    this.detalleConvenio();
  }

  cargarScript(callback: () => void): void {
    const elementoId: string = 'realizar-pago';
    if (!document.getElementById(elementoId)) {
      const body: HTMLElement = document.body;
      const elemento_ref = this.renderer.createElement('script');
      elemento_ref.type = 'text/javascript';
      elemento_ref.src = '../../../../../../assets/js/control-pagos.js';
      elemento_ref.id = elementoId;
      elemento_ref.async = true;
      elemento_ref.defer = true;
      this.renderer.appendChild(body, elemento_ref);
      elemento_ref.onload = callback;
    } else {
      callback();
    }
  }

  iniciarPago(): void {
    const elemento_ref = document.querySelector('.realizar-pago');
    if (!elemento_ref) return;
    elemento_ref.setAttribute('data-objeto', JSON.stringify({ referencia: 'Mensualidad SFPA', monto: 1 }));
  }

  subscripcionMotorPagos(): void {
    // Escucha el evento personalizado
    document.addEventListener('datosRecibidos', (event) => {
      const data = (event as CustomEvent).detail;
      if (data.error && !data) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Error en la realización del pago en línea.');
        return;
      }
      if (data.transaction && data.transaction.status_detail === 3) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago realizado con éxito.');
      }
      if (data.transaction && [9, 11, 12].includes(data.transaction.status_detail)) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Pago rechazado.');
      }
    });
  }

  detalleConvenio() {
    this.idPlanSfpa = this.rutaActiva.snapshot.queryParams.idPlanSfpa;
    if (this.idPlanSfpa) {
      this.loaderService.activar();
      this.contratarPSFPAService
        .obtenerDetalle(+this.idPlanSfpa)
        .pipe(finalize(() => this.loaderService.desactivar()))
        .subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
              this.alertaService.mostrar(
                TipoAlerta.Error,
                'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
              );
              return;
            }
            try {
              this.detalleServicioFunerario = respuesta.datos || {};
              this.titular = this.detalleServicioFunerario.titularesBeneficiarios[0];
              this.titularSubstituto = this.detalleServicioFunerario.titularesBeneficiarios[1];
              if (this.detalleServicioFunerario.titularesBeneficiarios.length > 2)
                this.beneficiarios.push(this.detalleServicioFunerario.titularesBeneficiarios[2]);
              if (this.detalleServicioFunerario.titularesBeneficiarios.length > 3)
                this.beneficiarios.push(this.detalleServicioFunerario.titularesBeneficiarios[3]);
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
  }

  verContrato(): void {
    if (this.idPlanSfpa) {
      const configuracionArchivo: OpcionesArchivos = {};
      this.loaderService.activar();
      this.contratarPSFPAService
        .verContrato(+this.idPlanSfpa)
        .pipe(finalize(() => this.loaderService.desactivar()))
        .subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            const file = new Blob(
              [this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
              { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
            const url = window.URL.createObjectURL(file);
            window.open(url);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
    }
  }
}