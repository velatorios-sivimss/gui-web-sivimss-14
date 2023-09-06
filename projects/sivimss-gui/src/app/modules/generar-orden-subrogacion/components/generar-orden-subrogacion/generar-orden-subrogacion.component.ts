import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from "primeng/overlaypanel";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from "@angular/forms";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { GenerarOrdenSubrogacion, OrdenSubrogacion } from "../../models/generar-orden-subrogacion.interface";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { ConfirmationService, LazyLoadEvent } from "primeng/api";
import { DetalleGenerarOrdenComponent } from "../detalle-generar-orden/detalle-generar-orden.component";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { GenerarOrdenSubrogacionService } from '../../services/generar-orden-subrogacion.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { finalize } from 'rxjs';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-generar-orden-subrogacion',
  templateUrl: './generar-orden-subrogacion.component.html',
  styleUrls: ['./generar-orden-subrogacion.component.scss'],
  providers: [DialogService, DescargaArchivosService, ConfirmationService, DynamicDialogConfig]
})
export class GenerarOrdenSubrogacionComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public ordenes: OrdenSubrogacion[] = [
    {
      id: 1,
      fechaOds: '01/09/2023',
      folioOds: 'DOC-000001',
      proveedor: 'Artículos y servicios Alta calidad del Noreste S.A. de C.V.',
      nombreFinado: 'Irma Jimenez Loranca',
      tipoServicio: '',
    },
    {
      id: 2,
      fechaOds: '02/09/2023',
      folioOds: 'DOC-000001',
      proveedor: 'Artículos y servicios Alta calidad del Noreste S.A. de C.V.',
      nombreFinado: 'Irma Jimenez Loranca',
      tipoServicio: '',
    },
  ];
  public ordenSeleccionado!: OrdenSubrogacion;
  public numPaginaActual: number = 0;
  public cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  public totalElementos: number = 0;
  public filtroForm!: FormGroup;
  public modificarRef!: DynamicDialogRef;
  public detalleRef!: DynamicDialogRef;
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public alertas = JSON.parse(localStorage.getItem('mensajes') as string);

  constructor(
    public config: DynamicDialogConfig,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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
      nivel: new FormControl({ value: null, disabled: false }, []),
      velatorio: new FormControl({ value: null, disabled: false }, []),
      folio: new FormControl({ value: null, disabled: false }, []),
      proveedor: new FormControl({ value: null, disabled: false }, []),
      fecha: new FormControl({ value: null, disabled: false }, []),
    });
  }

  abrirPanel(event: MouseEvent, ordenSeleccionado: OrdenSubrogacion): void {
    this.ordenSeleccionado = ordenSeleccionado;
    this.overlayPanel.toggle(event);
  }

  generarOrdenSubrogacion(): void {
    void this.router.navigate([`formato/${this.ordenSeleccionado.id}`], { relativeTo: this.activatedRoute });
  }

  paginar(evt: any): void { }

  limpiar(): void { }

  descargarReporteTabla(tipoReporte: string): void { }

  get ff() {
    return this.filtroForm.controls;
  }

}
