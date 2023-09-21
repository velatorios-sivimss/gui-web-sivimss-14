import {ModificarCapillaComponent} from '../modificar-capilla/modificar-capilla.component';
import {AgregarCapillaComponent} from '../agregar-capilla/agregar-capilla.component';
import {CapillaService} from "../../services/capilla.service";
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BreadcrumbService} from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {HttpErrorResponse} from '@angular/common/http';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ActivatedRoute} from '@angular/router';
import {SERVICIO_BREADCRUMB} from '../../../servicios/constants/breadcrumb';
import {DIEZ_ELEMENTOS_POR_PAGINA} from "projects/sivimss-gui/src/app/utils/constantes";
import {Capilla} from "../../models/capilla.interface";
import {CATALOGOS_DUMMIES} from '../../../inventario-vehicular/constants/dummies';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {FiltroCapilla} from '../../models/filtro-capilla.interface';
import {DetalleCapillaComponent} from '../detalle-capilla/detalle-capilla.component';

@Component({
  selector: 'app-capillas',
  templateUrl: './capillas.component.html',
  styleUrls: ['./capillas.component.scss'],
  providers: [DialogService]
})
export class CapillasComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;
  capillas: Capilla[] = [];

  capillaSeleccionada!: Capilla;

  creacionRef!: DynamicDialogRef
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  filtroForm!: FormGroup;
  agregarCapillaForm!: FormGroup;
  modificarCapillaForm!: FormGroup;

  mostrarModalAgregarCapilla: boolean = false;
  mostrarModalModificarCapilla: boolean = false;
  usuarios: any;

  paginacionConFiltrado: boolean = false;

  velatorio: any;
  idCap: any;
  nomCap: any;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private capillaService: CapillaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }


  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  obtenerObjetoParaFiltrado(): FiltroCapilla {
    return {
      idVelatorio: parseInt(this.filtroForm.get("velatorio")?.value),
      idCapilla: parseInt(this.filtroForm.get("id")?.value),
      nombre: this.filtroForm.get("nombre")?.value,
    };
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      nombre: [{value: null, disabled: false}, [Validators.required]],
      id: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.paginarPorFiltros();
  }

  abrirModalDetalleCapilla(capilla: Capilla) {
    this.creacionRef = this.dialogService.open(DetalleCapillaComponent, {
      header: "Detalle de capilla",
      width: "920px",
      data: {capilla, origen: "detalle"},
    });
  }

  abrirModalcambiarEstatusCapilla(capilla: Capilla) {
    this.creacionRef = this.dialogService.open(DetalleCapillaComponent, {
      header: "Detalle de capilla",
      width: "920px",
      data: {capilla, origen: "estatus"},
    });
  }

  abrirPanel(event: MouseEvent, capillaSeleccionada: Capilla): void {
    this.capillaSeleccionada = capillaSeleccionada;
    this.overlayPanel.toggle(event);
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarPorFiltros();
  }


  seleccionarPaginacion(): void {
    if (this.paginacionConFiltrado) {
      this.paginarPorFiltros();
    } else {
      this.paginarPorFiltros();
    }
  }

  paginarPorFiltros(): void {
    const filtros = this.obtenerObjetoParaFiltrado();
    const solicitudFiltros = JSON.stringify(filtros);
    this.capillaService.buscarPorFiltros2(solicitudFiltros, this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta): void => {
        this.capillas = respuesta!.datos.content;
        this.totalElementos = respuesta!.datos.totalElements;
        if (this.totalElementos == 0) {
          this.alertaService.mostrar(TipoAlerta.Error, 'No se encontró información relacionada a tu búsqueda.');
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  abrirModalModificarCapilla(): void {
    this.creacionRef = this.dialogService.open(ModificarCapillaComponent, {
      header: "Modificar capilla",
      width: "920px",
      data: {capilla: this.capillaSeleccionada, origen: "modificar"},
    });

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Capilla modificada correctamente');
        this.paginarPorFiltros();
      }
    })
  }

  get f() {
    return this.filtroForm.controls;
  }

  abrirModalAgregarCapilla(): void {
    this.creacionRef = this.dialogService.open(AgregarCapillaComponent, {
      header: "Registrar capilla nueva",
      width: "920px"
    });

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Capilla agregada correctamente');
      }
    })
  }


}
