import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { SalaVelatorio } from '../../models/sala-velatorio.interface';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { RegistrarEntradaComponent } from "../registrar-entrada/registrar-entrada.component";
import { RegistrarSalidaComponent } from "../registrar-salida/registrar-salida.component";
import { LoaderService } from "../../../../shared/loader/services/loader.service";
import { ControlVehiculos } from '../../models/control-vehiculos.interface';

@Component({
  selector: 'app-listado-vehiculos',
  templateUrl: './listado-vehiculos.component.html',
  styleUrls: ['./listado-vehiculos.component.scss'],
  providers: [DialogService]
})
export class ListadoVehiculosComponent implements OnInit, OnDestroy {
  @Input() controlVehiculos: ControlVehiculos[] = [];
  @Output() registrarEntradaEvent = new EventEmitter();
  @Output() registrarSalidaEvent = new EventEmitter();

  registrarEntradaRef!: DynamicDialogRef;
  registrarSalidaRef!: DynamicDialogRef;

  velatorios: TipoDropdown[] = [];
  delegaciones: TipoDropdown[] = [];
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  numPaginaActual: number = 0;
  totalElementos: number = 0;
  velatorio: number = 0;
  delegacion: number = 0;

  constructor(
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void { }

  registrarActividad(sala: SalaVelatorio): void {
    if (sala.estadoSala != "DISPONIBLE") {
      this.registrarSalida(sala);
      return;
    }
    this.registrarEntrada(sala);
  }

  registrarEntrada(sala: SalaVelatorio): void {
    this.registrarEntradaRef = this.dialogService.open(RegistrarEntradaComponent, {
      header: 'Registrar Entrada',
      width: '920px',
      data: { sala: sala },
    });
    this.registrarEntradaRef.onClose.subscribe((respuesta) => {
      if (respuesta) {
        // TO DO Emitir salida, consultar listado y actualizar vista
        // this.consultaSalasCremacion();
      }
    });
  }

  private registrarSalida(sala: SalaVelatorio): void {
    this.registrarSalidaRef = this.dialogService.open(RegistrarSalidaComponent, {
      header: 'Registrar Salida',
      width: '920px',
      data: { sala: sala },
    });
    this.registrarSalidaRef.onClose.subscribe((respuesta) => {
      if (respuesta) {
        // TO DO Emitir salida, consultar listado y actualizar vista
        // this.consultaSalasCremacion();
      }
    });
  }

  retornarColor(estatus: number): string {
    if (estatus === 1) { return "#08A451" }
    if (estatus === 0) { return "#E10000" }
    // if (estatus === "MANTENIMIENTO") { return "#ffff00" }
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
