import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { ContratarPSFPAService } from '../../../mapa-contratar-plan-servicios-funerarios-pago-anticipado/services/contratar-psfpa.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

interface DetalleServicioFunerario {
  velatorio?: string;
  folioConvenio?: string;
  estatusConvenio?: string;
  tipoPaquete?: string;
  numPagos?: string;
  titular?: {
    curp?: string;
    rfc?: string;
    matricula?: string;
    nss?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    sexo?: string;
    fechaNacimiento?: string;
    nacionalidad?: string;
    paisNacimiento?: string;
    lugarNacimiento?: string;
    telefono?: string;
    correo?: string;
    calle?: string;
    numExterior?: string;
    numInterior?: string;
    cp?: string;
    colonia?: string;
    municipio?: string;
    estado?: string;
  },
  titularSubstituto?: {
    curp?: string;
    rfc?: string;
    matricula?: string;
    nss?: string;
    nombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    sexo?: string;
    fechaNacimiento?: string;
    nacionalidad?: string;
    paisNacimiento?: string;
    lugarNacimiento?: string;
    telefono?: string;
    correo?: string;
    calle?: string;
    numExterior?: string;
    numInterior?: string;
    cp?: string;
    colonia?: string;
    municipio?: string;
    estado?: string;
  }
}
@Component({
  selector: 'app-mi-plan-servicios-funerarios-pago-anticipado',
  templateUrl: './mi-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: ['./mi-plan-servicios-funerarios-pago-anticipado.component.scss'],
})
export class MiPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  beneficiarios: any[] = [];
  pagos = [];
  detalleServicioFunerario!: DetalleServicioFunerario;

  constructor(
    private dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private contratarPSFPAService: ContratarPSFPAService,
    private alertaService: AlertaService,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.detalleConvenio();
  }

  detalleConvenio() {
    let idPlanSfpa = this.rutaActiva.snapshot.queryParams.idPlanSfpa;
    this.contratarPSFPAService
      .obtenerDetalle(+idPlanSfpa)
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
            this.detalleServicioFunerario = respuesta.datos[0] || {};
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