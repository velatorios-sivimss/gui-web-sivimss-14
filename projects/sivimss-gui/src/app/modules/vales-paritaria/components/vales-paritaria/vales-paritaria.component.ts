import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {LazyLoadEvent} from "primeng/api";
import {USUARIOS_BREADCRUMB} from '../../../usuarios/constants/breadcrumb';
import {ValeParitaria} from "../../models/vale-paritaria.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS} from '../../../usuarios/constants/catalogos_dummies';
import {LoaderService} from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";

@Component({
  selector: 'app-vales-paritaria',
  templateUrl: './vales-paritaria.component.html',
})
export class ValesParitariaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;
  filtroForm!: FormGroup;

  valesParitaria: any[] = [];
  valeSeleccionado: any = null;
  opciones: TipoDropdown[] = CATALOGOS;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private breadcrumbService: BreadcrumbService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(USUARIOS_BREADCRUMB);
    this.inicializarFiltroForm();
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      matricula: [{value: 1234567, disabled: true}],
      delegacion: [{value: null, disabled: false}, [Validators.required]],
      importe: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.valesParitaria = [
        {
          id: 1,
          matricula: '000001',
          delegacion: 'Velatorio No. 14 San Luis Potosi y CD Valles',
          nombre: 'Heriberto Angelo Sánchez Maldonado',
          tipoContratacion: 'Activo',
          estatus: 'Activo'
        },
        {
          id: 2,
          matricula: '000002',
          delegacion: 'Velatorio No. 14 San Luis Potosi y CD Valles',
          nombre: 'Heriberto Angelo Sánchez Maldonado',
          tipoContratacion: 'Base',
          estatus: 'Jubilados'

        },
        {
          id: 3,
          matricula: '000003',
          delegacion: 'Velatorio No. 14 San Luis Potosi y CD Valles',
          nombre: 'Heriberto Angelo Sánchez Maldonado',
          tipoContratacion: 'Confianza',
          estatus: 'Pensionados'
        }
      ];
      this.totalElementos = 3;
    }, 0);
  }

  buscar() {
    this.loaderService.activar();
    setTimeout(() => {
      this.loaderService.desactivar();
    }, 2000);
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.filtroForm.reset();
    this.numPaginaActual = 0;
  }

  abrirPanel(event: MouseEvent, valeSeleccionado: ValeParitaria): void {
    this.valeSeleccionado = valeSeleccionado;
    this.overlayPanel.toggle(event);
  }

  get f() {
    return this.filtroForm.controls;
  }

}
