import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EstiloLinea } from "projects/sivimss-gui/src/app/shared/etapas/models/estilo-linea.interface";
import { EtapaEstado } from '../../models/etapa-estado.enum';

@Component({
  selector: 'app-etapa',
  templateUrl: './etapa.component.html',
  styleUrls: ['./etapa.component.scss']
})
export class EtapaComponent {

  readonly EtapaEstado = EtapaEstado;

  @Input()
  idEtapa!: number;

  @Input()
  maxWidth: number = 200;

  @Input()
  lineaIzquierda!: EstiloLinea;

  @Input()
  lineaDerecha!: EstiloLinea;

  @Input()
  textoInterior: string = '';

  @Input()
  textoExterior: string = '';

  @Input()
  estado: EtapaEstado = EtapaEstado.Inactivo;

  @Output()
  seleccionEtapa: EventEmitter<number> = new EventEmitter<number>();


  seleccionarEtapa() {
    this.seleccionEtapa.emit(this.idEtapa);
  }
}
