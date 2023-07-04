import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from "primeng/overlaypanel";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { BusquedaContratante, ConfirmarContratante, UsuarioContratante } from "../../models/usuario-contratante.interface";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { ConfirmationService, LazyLoadEvent } from "primeng/api";
import { DetalleContratantesComponent } from "../detalle-contratantes/detalle-contratantes.component";
import { ModificarContratantesComponent } from "../modificar-contratantes/modificar-contratantes.component";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { ALERTA_ESTATUS } from "../../constants/alertas";
import { ContratantesService } from '../../services/contratantes.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { ReporteTabla } from '../../../velacion-domicilio/models/velacion-domicilio.interface';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';

@Component({
  selector: 'app-contratantes',
  templateUrl: './contratantes.component.html',
  styleUrls: ['./contratantes.component.scss'],
  providers: [DialogService, DescargaArchivosService, ConfirmationService]
})
export class ContratantesComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  filtroForm!: FormGroup;

  contratantes: BusquedaContratante[] = [];
  contratanteSeleccionado: BusquedaContratante = {};

  alertaEstatus: string[] = ALERTA_ESTATUS;

  modificarRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  retorno: ConfirmarContratante = {};
  mensajeArchivoConfirmacion: string | undefined;
  alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  estatus: TipoDropdown[] = [
    {
      value: true,
      label: 'Activo'
    },
    {
      value: false,
      label: 'Inactivo'
    },
  ];

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private contratantesService: ContratantesService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      curp: [{ value: null, disabled: false }, Validators.maxLength(18)],
      nss: [{ value: null, disabled: false }, Validators.maxLength(11)],
      nombre: [{ value: null, disabled: false }, Validators.maxLength(30)],
      estatus: [{ value: null, disabled: false }]
    });
  }

  modalConfirmacion() {
    this.confirmationService.confirm({
      message: this.mensajeArchivoConfirmacion,
      accept: () => { },
    });
  }

  paginar(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.contratantesService.buscarPorFiltros(this.filtroForm.getRawValue(), this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos) {
          this.contratantes = respuesta.datos.content;
          this.totalElementos = respuesta.datos.totalElements;
        } else {
          this.contratantes = [];
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.clearValidatorsFiltroForm();
    this.paginar();
  }

  clearValidatorsFiltroForm() {
    this.ff.curp.clearValidators();
    this.ff.curp.updateValueAndValidity();
    this.ff.nss.clearValidators();
    this.ff.nss.updateValueAndValidity();
    this.ff.nombre.clearValidators();
    this.ff.nombre.updateValueAndValidity();
    this.ff.estatus.clearValidators();
    this.ff.estatus.updateValueAndValidity();
  }

  abrirModalDetalleContratante(contratante: UsuarioContratante): void {
    this.detalleRef = this.dialogService.open(DetalleContratantesComponent, {
      header: "Ver detalle",
      width: "920px",
      data: { contratante: contratante, origen: "detalle" },
    });

    this.detalleRef.onClose.subscribe((respuesta: ConfirmarContratante) => {
      if (respuesta?.estatus) {
        this.paginar();
      }
    });
  }

  abrirModalCambiarEstatus(contratante: UsuarioContratante): void {
    this.detalleRef = this.dialogService.open(DetalleContratantesComponent, {
      header: contratante.estatus ? "Desactivar contratante" : "Activar contratante",
      width: "920px",
      data: { contratante: contratante, origen: "estatus" },
    });

    this.detalleRef.onClose.subscribe((respuesta: ConfirmarContratante) => {
      if (respuesta?.estatus) {
        this.paginar();
      }
    });
  }

  descargarReporteTabla(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: "Disponibilidad de capillas" };
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    this.descargaArchivosService.descargarArchivo(
      this.contratantesService.descargarReporteTabla(this.reporteTabla(tipoReporte)),
      configuracionArchivo
    ).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.modalConfirmacion();
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        if (mensaje) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje || "Error en la descarga del documento. Intenta nuevamente.");
        }
      },
    });
  }

  reporteTabla(tipoReporte: string): ReporteTabla {
    return {
      curp: this.ff.curp.value,
      nss: this.ff.nss.value,
      nomContratante: this.ff.nombre.value,
      estatus: this.ff.estatus.value,
      rutaNombreReporte: 'reportes/generales/ReporteCatUsrContra.jrxml',
      tipoReporte,
    }
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
