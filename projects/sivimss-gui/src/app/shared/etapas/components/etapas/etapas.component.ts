import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Etapa } from "projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface";

@Component({
  selector: 'app-etapas',
  templateUrl: './etapas.component.html',
  styleUrls: ['./etapas.component.scss']
})
export class EtapasComponent {

  @Input()
  etapas!: Etapa[];

  @Output()
  seleccionarEtapa: EventEmitter<Etapa> = new EventEmitter<Etapa>();

  seleccionEtapa(idEtapaSeleccionada: number) {
    const etapaSeleccionada = this.etapas.find((e: Etapa) => e.idEtapa === idEtapaSeleccionada);
    this.seleccionarEtapa.emit(etapaSeleccionada);
  }
}
