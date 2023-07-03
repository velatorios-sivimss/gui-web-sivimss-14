import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {GESTIONAR_PAGO_BREADCRUMB} from "../../constants/breadcrumb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../utils/constantes";
import {LazyLoadEvent} from "primeng/api";
import {validarUsuarioLogueado} from "../../../../../utils/funciones";

@Component({
  selector: 'app-gestionar-pago',
  templateUrl: './gestionar-pago.component.html',
  styleUrls: ['./gestionar-pago.component.scss']
})
export class GestionarPagoComponent implements OnInit {
  filtroGestionarPagoForm!: FormGroup;

  catalogoVelatorios: TipoDropdown[] = [];
  foliosODS: TipoDropdown[] = [];
  foliosPNCPF: TipoDropdown[] = [];
  foliosPRCPF: TipoDropdown[] = [];

  pagos: any[] = [];
  tipoFolio: null | 1 | 2 | 3 = null;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GESTIONAR_PAGO_BREADCRUMB);
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.filtroGestionarPagoForm = this.formBuilder.group({
      velatorio: [{value: null, disabled: false}],
      folioODS: [{value: null, disabled: false}],
      folioPNCPF: [{value: null, disabled: false}],
      folioPRCPF: [{value: null, disabled: false}],
      elaboracionInicio: [{value: null, disabled: false}],
      elaboracionFin: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
    });
  }

  limpiarFolios(folio: 1 | 2 | 3): void {
    this.tipoFolio = folio;
    if (folio === 1) {
      this.filtroGestionarPagoForm.get('folioPNCPF')?.patchValue(null);
      this.filtroGestionarPagoForm.get('folioPRCPF')?.patchValue(null);
      return;
    }
    if (folio === 2) {
      this.filtroGestionarPagoForm.get('folioODS')?.patchValue(null);
      this.filtroGestionarPagoForm.get('folioPRCPF')?.patchValue(null);
      return;
    }
    this.filtroGestionarPagoForm.get('folioODS')?.patchValue(null);
    this.filtroGestionarPagoForm.get('folioPNCPF')?.patchValue(null);
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
  }

}
