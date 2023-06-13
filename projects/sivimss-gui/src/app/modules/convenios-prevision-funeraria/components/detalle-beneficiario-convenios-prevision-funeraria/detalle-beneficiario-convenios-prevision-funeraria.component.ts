import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import * as moment from "moment";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detalle-beneficiario-convenios-prevision-funeraria',
  templateUrl: './detalle-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./detalle-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class DetalleBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiario!: BeneficiarioInterface;
  parentesco!: TipoDropdown[];
  parentescoDescripcion!: TipoDropdown[];

  constructor(
    private route: ActivatedRoute,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.beneficiario = this.config.data;
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];

    this.parentescoDescripcion = this.parentesco.filter( (elemento) => {
      return elemento.value == this.beneficiario.velatorio;
    })
  }

  aceptar(): void {
    this.ref.close();
  }

}
