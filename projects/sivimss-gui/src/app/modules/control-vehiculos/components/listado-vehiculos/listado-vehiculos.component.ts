import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { RegistrarEntradaComponent } from "../registrar-entrada/registrar-entrada.component";
import { RegistrarSalidaComponent } from "../registrar-salida/registrar-salida.component";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { ControlVehiculoListado } from '../../models/control-vehiculos.interface';

@Component({
  selector: 'app-listado-vehiculos',
  templateUrl: './listado-vehiculos.component.html',
  styleUrls: ['./listado-vehiculos.component.scss'],
  providers: [DialogService]
})
export class ListadoVehiculosComponent implements OnInit, OnDestroy {
  @Input() controlVehiculos: ControlVehiculoListado[] = [];
  @Input() delegacion: number | null = null;
  @Input() velatorio: number | null = null;

  @Output() actualizarListadoEvent = new EventEmitter();

  registrarEntradaRef!: DynamicDialogRef;
  registrarSalidaRef!: DynamicDialogRef;

  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  numPaginaActual: number = 0;
  totalElementos: number = 0;

  constructor(
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void { /* TODO document why this method 'ngOnInit' is empty */ }

  registrarActividad(vehiculo: ControlVehiculoListado): void {
    if (vehiculo.disponible == 1) {
      this.registrarSalida(vehiculo);
      return;
    }
    this.registrarEntrada(vehiculo);
  }

  registrarEntrada(vehiculo: ControlVehiculoListado): void {
    this.registrarEntradaRef = this.dialogService.open(RegistrarEntradaComponent, {
      header: 'Entrada de vehículo',
      width: '920px',
      data: { vehiculo },
    });
    this.registrarEntradaRef.onClose.subscribe((respuesta) => {
      if (respuesta) {
        this.actualizarListadoEvent.emit();
      }
    });
  }

  registrarSalida(vehiculo: ControlVehiculoListado): void {
    this.registrarSalidaRef = this.dialogService.open(RegistrarSalidaComponent, {
      header: 'Elección de vehículo',
      width: '920px',
      data: {
        delegacion: this.delegacion,
        velatorio: this.velatorio,
        vehiculo,
      },
    });
    this.registrarSalidaRef.onClose.subscribe((respuesta) => {
      if (respuesta) {
        this.actualizarListadoEvent.emit();
      }
    });
  }

  retornarColor(estatus: number): string {
    if (estatus === 1) { return "#08A451" }
    if (estatus === 0) { return "#E10000" }
    return "";
  }

  ngOnDestroy(): void {
    if (this.registrarEntradaRef) {
      this.registrarEntradaRef.destroy()
    }
    if (this.registrarSalidaRef) {
      this.registrarSalidaRef.destroy()
    }
  }
}
