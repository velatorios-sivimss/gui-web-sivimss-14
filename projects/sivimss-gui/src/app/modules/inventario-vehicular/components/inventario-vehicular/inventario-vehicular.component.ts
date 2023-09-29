// TODO: Retirar Catalogos Dummies
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { LazyLoadEvent } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';

import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { INVENTARIO_VEHICULAR_BREADCRUMB } from '../../constants/breadcrumb';
import { Vehiculo } from '../../models/vehiculo.interface';

import { AgregarVehiculoComponent } from '../agregar-vehiculo/agregar-vehiculo.component';
import { ModificarVehiculoComponent } from '../modificar-vehiculo/modificar-vehiculo.component';
import { VerDetalleVehiculoComponent } from '../ver-detalle-vehiculo/ver-detalle-vehiculo.component';
import { CATALOGOS_DUMMIES } from '../../constants/dummies';

@Component({
  selector: 'app-inventario-vehicular',
  templateUrl: './inventario-vehicular.component.html',
  styleUrls: ['./inventario-vehicular.component.scss'],
  providers: [DialogService]
})
export class InventarioVehicularComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;
  niveles: TipoDropdown[] = CATALOGOS_DUMMIES;
  delegaciones: TipoDropdown[] = CATALOGOS_DUMMIES;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  vehiculos: Vehiculo[] = [];
  vehiculoSeleccionado!: Vehiculo;
  mostrarModalDetalleVehiculo: boolean = false;
  propiedad = false;

  creacionRef!: DynamicDialogRef
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(INVENTARIO_VEHICULAR_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: false }],
      delegacion: [{ value: null, disabled: false }],
      velatorio: [{ value: null, disabled: false }],
      vehiculo: [{ value: null, disabled: false }]
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
  }

  buscar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.vehiculos = [
        {
          id: 1,
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          uso: "Utilitario administrativo",
          responsable: "Alberto Lima Dorantes",
          tipoVehiculo: "Carrosa con detalles religiosos",
          estatus: true,
          usuario: "Araceli Ortega Benancio",
          tipoContrato: "HEANZ780713HDFCCD00",
          fechaVigenciaInicio: new Date(),
          fechaVigenciaFin: new Date(),
          marca: "Nissan",
          modelo: "NP300 Chasis TM",
          placas: "A001AAA",
          noMotor: "B10S2511Z20KC2",
          noCilindros: 6,
          transmision: "Automática",
          desTransmision: "Vehículo con capacidad de transportar cargas pesadas",
          combustible: "150 lt.",
          desCombustible: "Vehículo con capacidad de transportar cargas pesadas",
          tarjetaCirculacion: "201856789012",
          vigenciaTarjetaFin: new Date(),
          noSerie: "Miguel Alemán Barcenas",
          fechaAdquisicion: new Date(),
          vigenciaDocumentacion: "3 años",
          costoTotal: 430000.50,
          aseguradora: "MAPFRE",
          poliza: "D0000000001726354",
          vigenciaSeguro: "3 años",
          importePrima: 430000.50,
          riesgos: "Riesgos generales de auto nuevo de agencia",
        },
        {
          id: 2,
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          uso: "Utilitario administrativo",
          responsable: "Alberto Lima Dorantes",
          tipoVehiculo: "Carrosa con detalles religiosos",
          estatus: false
        },
        {
          id: 3,
          velatorio: "No. 14 San Luis Potosí y CD Valles",
          uso: "Utilitario administrativo",
          responsable: "Alberto Lima Dorantes",
          tipoVehiculo: "Carrosa con detalles religiosos",
          estatus: true
        }
      ];
      this.totalElementos = this.vehiculos.length;
    }, 0);
  }

  abrirPanel(event: MouseEvent, vehiculoSeleccionado: Vehiculo): void {
    this.vehiculoSeleccionado = vehiculoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleVehiculo(vehiculoSeleccionado: Vehiculo): void {
    this.vehiculoSeleccionado = vehiculoSeleccionado;
    this.detalleRef = this.dialogService.open(VerDetalleVehiculoComponent, {
      data: vehiculoSeleccionado,
      header: "Ver Detalle",
      width: "920px"
    });

    this.detalleRef.onClose.subscribe((respuesta) => {
      if (respuesta.modificar) {
        this.abrirModalModificacionVehiculo();
      }
    })
  }

  abrirModalCreacionVehiculo(): void {
    this.creacionRef = this.dialogService.open(AgregarVehiculoComponent, {
      header: "Agregar vehículo",
      width: "920px"
    });
  }

  abrirModalModificacionVehiculo(): void {
    this.creacionRef = this.dialogService.open(ModificarVehiculoComponent, {
      data: this.vehiculoSeleccionado,
      header: "Modificar vehículo",
      width: "920px"
    })
  }

  ngOnDestroy(): void {
    if (this.creacionRef) {
      this.creacionRef.destroy();
    }
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
    if (this.modificacionRef) {
      this.modificacionRef.destroy();
    }
  }

}
