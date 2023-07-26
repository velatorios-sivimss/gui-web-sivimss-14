import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GestionarEtapasActualizacionService } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/services/gestionar-etapas-actualizacion.service';
import { Etapa } from "projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface";

@Component({
  selector: 'app-etapas-actualizacion',
  templateUrl: './etapas-actualizacion.component.html',
  styleUrls: ['./etapas-actualizacion.component.scss']
})
export class EtapasActualizacionComponent implements OnInit {

  // @Input()
  etapas!: Etapa[];

  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private gestionarEtapasService: GestionarEtapasActualizacionService
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
