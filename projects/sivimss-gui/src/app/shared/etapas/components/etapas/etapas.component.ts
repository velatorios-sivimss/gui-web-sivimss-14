import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  GestionarEtapasService
} from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/services/gestionar-etapas.service';
import {Etapa} from "projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface";

@Component({
  selector: 'app-etapas',
  templateUrl: './etapas.component.html',
  styleUrls: ['./etapas.component.scss']
})
export class EtapasComponent implements OnInit {

  // @Input()
  etapas!: Etapa[];

  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private gestionarEtapasService: GestionarEtapasService
  ) {

  }

  ngOnInit() {
    this.gestionarEtapasService.etapas$.asObservable().subscribe(
      (etapas) => this.etapas = etapas
    );
  }

  seleccionEtapa(idEtapaSeleccionada: number) {
    const etapaSeleccionada = this.etapas.find((e: Etapa) => e.idEtapa === idEtapaSeleccionada);
    this.seleccionarEtapa.emit(etapaSeleccionada?.idEtapa);
  }

}
