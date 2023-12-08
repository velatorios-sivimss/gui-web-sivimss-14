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

import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
@Component({
  selector: 'app-mi-convenio-prevision-funeraria',
  templateUrl: './mi-convenio-prevision-funeraria.component.html',
  styleUrls: ['./mi-convenio-prevision-funeraria.component.scss'],
})
export class MiConvenioPrevisionFunerariaComponent implements OnInit {
  beneficiarios: Beneficiarios[] = [];
  parentesco: any[] = [];

  datosGenerales: DatosGeneralesDetalle = {} as DatosGeneralesDetalle;
  datosGeneralesRenovacion: DatosGeneralesRenovacion =
    {} as DatosGeneralesRenovacion;
  errorSolicitud: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';
  ref!: DynamicDialogRef;
  agregarBeneficiarios: boolean = false;

  constructor(
    private dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.detalleConvenio();
    this.buscarParentesco();
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
            this.beneficiarios = respuesta.datos.beneficiarios || [];
            this.datosGeneralesRenovacion =
              respuesta.datos.datosRenovacion[0] || {};
            this.validarAlta();
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
      header: 'Detalle del beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: { item: item, validaModificacion: this.agregarBeneficiarios },
    });

    this.ref.onClose.subscribe((respuesta: any) => {
      if (respuesta) {
        item = respuesta;
      }
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
          idConvenio: this.datosGenerales.idConvenio,
          parentesco: this.parentesco,
          idVelatorio: this.datosGenerales.idVelatorio,
          velatorio: this.datosGenerales.velatorio,
          idContratante: this.datosGenerales.idContratante,
        },
      }
    );
    this.ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == 'exito') {
        this.detalleConvenio();
        console.log(respuesta);
      }
    });
  }

  cerrarModal(): void {
    this.ref.onClose;
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }

  abrirModalRenovarConvenio(event: MouseEvent): void {
    event.stopPropagation();
    this.ref = this.dialogService.open(ModalRenovarConvenioComponent, {
      header: 'Renovar convenio',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        item: this.datosGeneralesRenovacion,
      },
    });
    this.ref.onClose.subscribe((respuesta: any) => {});
  }

  buscarParentesco() {
    this.consultaConveniosService
      .parentesco()
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

          this.parentesco = mapearArregloTipoDropdown(
            respuesta.datos,
            'nombreParentesco',
            'idParentesco'
          );
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

  validarAlta(): void {
    this.agregarBeneficiarios = true;
    if (this.datosGeneralesRenovacion.tipoPrevision === 1) {
      if (this.beneficiarios.length < 3) {
        if (this.datosGeneralesRenovacion.periodoRenovacion === 1) {
          if (this.datosGeneralesRenovacion.titularFallecido === 0) {
            if (Number(this.datosGeneralesRenovacion.idEstatusConvenio) === 2)
              this.agregarBeneficiarios = true;
          }
        }
      }
    }
  }
}
