import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { DIEZ_ELEMENTOS_POR_PAGINA } from '../../../../utils/constantes';

import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { BreadcrumbService } from '../../../../shared/breadcrumb/services/breadcrumb.service';
import { SERVICIO_BREADCRUMB } from '../../constants/breadcrumb';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AlertaService,
  TipoAlerta,
} from '../../../../shared/alerta/services/alerta.service';
import { DetalleRegistroOtorgamientoServiciosComponent } from '../detalle-registro-otorgamiento-servicios/detalle-registro-otorgamiento-servicios.component';
import { AgregarRegistroOtorgamientoServiciosComponent } from '../agregar-registro-otorgamiento-servicios/agregar-registro-otorgamiento-servicios.component';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { RegistroOtorgamientoServiciosService } from '../../services/registro-otorgamiento-servicios.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { OtorgamientoServicios } from '../../models/otorgamiento-servicios-interface';

@Component({
  selector: 'app-registro-otorgamiento-servicios',
  templateUrl: './registro-otorgamiento-servicios.component.html',
  styleUrls: ['./registro-otorgamiento-servicios.component.scss'],
  providers: [DialogService],
})
export class RegistroOtorgamientoServiciosComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  filtroForm!: FormGroup;
  mostrarRegistros: boolean = false;
  registroOtorgamientoSeleccionado: OtorgamientoServicios = {};
  otorgamientoServicioRef!: DynamicDialogRef;
  situarServicioRef!: DynamicDialogRef;
  nombreContratante: string | null = '';
  nombreFinado: string | null = null;
  folioODS: string | null = '';
  idODS: number = 0;
  arrayHistorial: Array<OtorgamientoServicios> =
    [] as Array<OtorgamientoServicios>;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private servicioOtorgamiento: RegistroOtorgamientoServiciosService
  ) {}

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      folioODS: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  consultaOtorgamientoServicios(): void {
    this.loaderService.activar();
    let folio = this.f.folioODS.value;
    this.folioODS = folio;
    this.servicioOtorgamiento
      .consultarPorFolio(folio)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;

          if (datos == null) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
            this.mostrarRegistros = false;
            return;
          }

          if (respuesta.error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }
          this.nombreContratante = datos.contrante;
          this.nombreFinado = datos.finado;
          this.arrayHistorial = datos.historialSituarServicioResponses;
          this.idODS = parseInt(datos.idOrden);
          this.mostrarRegistros = true;
        },
        error: (error: HttpErrorResponse) => {
          try {
            console.error(error);
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            console.error(error);
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        },
      });
  }

  abrirModalSituarServicios(): void {
    this.situarServicioRef = this.dialogService.open(
      AgregarRegistroOtorgamientoServiciosComponent,
      {
        header: 'Otorgamiento de un servicio',
        width: '920px',
        data: {
          idODS: this.idODS,
        },
      }
    );
    this.situarServicioRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.consultaOtorgamientoServicios();
      }
    });
  }

  abrirModalQuitarServicio(): void {
    this.otorgamientoServicioRef = this.dialogService.open(
      DetalleRegistroOtorgamientoServiciosComponent,
      {
        header: 'Quitar servicio',
        width: '920px',
        data: this.registroOtorgamientoSeleccionado,
      }
    );

    this.otorgamientoServicioRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.consultaOtorgamientoServicios();
      }
    });
  }

  abrirPanel(event: MouseEvent, registroOtorgamientoServicios: any): void {
    let datos = {
      fechaMostrar: registroOtorgamientoServicios.fechaSolicitud,
      idHistorialServicio: registroOtorgamientoServicios.idHistorialServicio,
      servicio: registroOtorgamientoServicios.nombreServicio,
      desNotas: registroOtorgamientoServicios.desNotas,
    };
    this.registroOtorgamientoSeleccionado = datos;
    this.overlayPanel.toggle(event);
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.mostrarRegistros = false;
  }

  get f() {
    return this.filtroForm?.controls;
  }
}
