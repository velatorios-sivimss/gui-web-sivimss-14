import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalEditarBeneficiarioComponent } from '../modal-editar-beneficiario/modal-editar-beneficiario.component';
import { Beneficiarios } from '../../../../models/Beneficiarios.interface';
import { BusquedaConveniosPFServic } from '../../../../services/busqueda-convenios-pf.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-modal-detalle-beneficiarios',
  templateUrl: './modal-detalle-beneficiarios.component.html',
  styleUrls: ['./modal-detalle-beneficiarios.component.scss'],
})
export class ModalDetalleBeneficiariosComponent implements OnInit {
  beneficiarios: Beneficiarios = {} as Beneficiarios;
  validaModificacion: boolean = false;

  mensajeError: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';

  constructor(
    private dialogService: DialogService,
    public readonly config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private alertaService: AlertaService,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.beneficiarios = this.config.data['item'];
    this.validaModificacion = this.config.data['validaModificacion'];
  }

  abrirModalEditarBeneficiario(event: MouseEvent) {
    event.stopPropagation();

    const ref = this.dialogService.open(ModalEditarBeneficiarioComponent, {
      header: 'Editar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        item: this.beneficiarios,
      },
    });

    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta) {
        this.beneficiarios = respuesta;
      }
    });
  }

  cerrarModal(): void {
    this.ref.close(this.beneficiarios);
  }

  desactivarBeneficiario(): void {
    let parametros = {
      idContratante: this.beneficiarios.idContratanteBeneficiarios,
      idPersona: this.beneficiarios.idPersona,
    };
    this.consultaConveniosService
      .desactivarBeneficiario(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error !== false && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(TipoAlerta.Error, this.mensajeError);
            return;
          }

          if (respuesta.mensaje === 'Exito') {
            this.alertaService.mostrar(
              TipoAlerta.Exito,
              'Beneficiario eliminado correctamente'
            );
            this.ref.close('exito');
          } else this.mostrarMensaje(Number(respuesta.mensaje));
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajeError);
        },
      });
  }

  mostrarMensaje(numero: number): void {
    switch (numero) {
      case 186:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'El servicio no responde, no permite más llamadas.'
        );
        break;
      case 187:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
        break;
      case 33:
        this.alertaService.mostrar(TipoAlerta.Info, 'R.F.C. no valido.');
        break;

      case 52:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al consultar la información.'
        );
        break;
      case 5:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al guardar la información. Intenta nuevamente.'
        );
        break;
      case 184:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El servicio de RENAPO  no esta disponible.'
        );
        break;
      case 802:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El beneficiario ya fue registrado con anterioridad, ingrese un beneficiario diferente.'
        );
        break;
      default:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
    }
  }
}
