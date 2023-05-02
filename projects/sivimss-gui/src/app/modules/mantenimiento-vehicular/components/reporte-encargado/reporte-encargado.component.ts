import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Vehiculos } from '../../models/vehiculos.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { CATALOGOS_DUMMIES } from '../../../inventario-vehicular/constants/dummies';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reporte-encargado',
  templateUrl: './reporte-encargado.component.html',
  styleUrls: ['./reporte-encargado.component.scss'],
  providers: [DialogService]
})
export class ReporteEncargadoComponent implements OnInit {
  data = [{ dia: "Lunes", valor: 38 },];
  dataDetalle = [{ rin: "No. 11", presicion: 38 },{ rin: "No. 11", presicion: 38 },{ rin: "No. 11", presicion: 38 },];


  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0

  vehiculos: Vehiculos[] = []
  vehiculoSeleccionado: Vehiculos = {}

  filtroForm!: FormGroup

  creacionRef!: DynamicDialogRef
  detalleRef!: DynamicDialogRef
  modificacionRef!: DynamicDialogRef

  tipoReportes: TipoDropdown[] = CATALOGOS_DUMMIES

  mostrarDetalle: boolean = false;
  mostrarTabla: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // this.actualizarBreadcrumb();
    this.inicializarFiltroForm()
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get fmp(){
    return this.filtroForm?.controls;
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      tipoReporte: [{ value: null, disabled: false }, [Validators.required]],
      placa: [{ value: null, disabled: false }, [Validators.required]],
      fechaVigenciaDesde: [{ value: null, disabled: false }, [Validators.required]],
      fecahVigenciaHasta: [{ value: null, disabled: false }, [Validators.required]],
    })
  }

  consultaServicioEspecifico():string{
    return "";
  }


  buscar(){
 this.mostrarTabla = true
  }


  abrirDetallereporteEncargado(articulo:Vehiculos){
this.mostrarDetalle = true;
  }


}
