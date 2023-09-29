import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Etapa} from "projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface";
import {GestionarEtapasServiceSF} from "../../../../modules/ordenes-servicio/services/gestionar-etapas.service-sf";

@Component({
  selector: 'app-etapas-convenio-sfpa',
  templateUrl: './etapas-convenio-sfpa.component.html',
  styleUrls: ['./etapas-convenio-sfpa.scss']
})
export class EtapasConvenioSfpaComponent implements OnInit {

  // @Input()
  etapas!: Etapa[];

  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private gestionarEtapasService: GestionarEtapasServiceSF
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
