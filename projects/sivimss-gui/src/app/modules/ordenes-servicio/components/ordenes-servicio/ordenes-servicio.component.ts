import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LazyLoadEvent } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import {
  ModalGenerarTarjetaIdentificacionComponent
} from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-generar-tarjeta-identificacion/modal-generar-tarjeta-identificacion.component";
import { ModalVerTarjetaIdentificacionComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-tarjeta-identificacion/modal-ver-tarjeta-identificacion.component";
import { AlertaService } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import { LoaderService } from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "projects/sivimss-gui/src/app/utils/constantes";

@Component({
  selector: 'app-ordenes-servicio',
  templateUrl: './ordenes-servicio.component.html',
  styleUrls: ['./ordenes-servicio.component.scss']
})
export class OrdenesServicioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  filtroForm!: FormGroup;

  opciones: any[] = [
    {
      label: 'Opción 1',
      value: 0,
    },
    {
      label: 'Opción 2',
      value: 1,
    },
    {
      label: 'Opción 3',
      value: 2,
    }
  ];

  ordenesServicio: any[] = [];
  ordenServicioSeleccionada: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private loaderService: LoaderService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar([
      {
        icono: 'imagen-icono-operacion-sivimss.svg',
        titulo: 'Operación SIVIMSS'
      },
      {
        icono: '',
        titulo: 'Órdenes de servicio'
      }
    ]);
    this.inicializarFiltroForm();
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      velatorio: [{value: null, disabled: false}, []],
      numeroFolio: [{value: null, disabled: false}, []],
      nombreContratante: [{value: null, disabled: false}, []],
      nombreFinado: [{value: null, disabled: false}, []],
      tipoOrden: [{value: null, disabled: false}, []],
      unidadProcedencia: [{value: null, disabled: false}, []],
      numeroContrato: [{value: null, disabled: false}, []],
      estatus: [{value: null, disabled: false}, []]
    });
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.ordenesServicio = [
        {
          id: 1,
          numeroFolio: 'DOC-000001',
          velatorio: 'Velatorio No. 14 San Luis Potosi y CD Valles',
          nombreContratante: 'Heriberto Angelo Sánchez Maldonado',
          nombreFinado: 'Alberto Lima Durazo',
          estatus: 'Pre-orden'
        },
        {
          id: 2,
          numeroFolio: 'DOC-000001',
          velatorio: 'Velatorio No. 14 San Luis Potosi y CD Valles',
          nombreContratante: 'Heriberto Angelo Sánchez Maldonado',
          nombreFinado: 'Alberto Lima Durazo',
          estatus: 'Cancelada'
        },
        {
          id: 3,
          numeroFolio: 'DOC-000001',
          velatorio: 'Velatorio No. 14 San Luis Potosi y CD Valles',
          nombreContratante: 'Heriberto Angelo Sánchez Maldonado',
          nombreFinado: 'Alberto Lima Durazo',
          estatus: 'Activa'
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

  abrirPanel(event: MouseEvent, ordenServicioSeleccionada: any): void {
    this.ordenServicioSeleccionada = ordenServicioSeleccionada;
    this.overlayPanel.toggle(event);
  }

  abrirModalGenerarTarjetaIdent() {
    const ref = this.dialogService.open(ModalGenerarTarjetaIdentificacionComponent, {
      header: 'Generar tarjeta de identificación',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalGenerarTarjetaIdentificacionComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalGenerarTarjetaIdentificacionComponent
      }
    });
  }

  abrirModalVerTarjetaIdent() {
    const ref = this.dialogService.open(ModalVerTarjetaIdentificacionComponent, {
      header: 'Ver tarjeta de identificación',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalVerTarjetaIdentificacionComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalVerTarjetaIdentificacionComponent
      }
    });
  }

}
