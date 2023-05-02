import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import * as moment from "moment";

@Component({
  selector: 'app-detalle-beneficiario-convenios-prevision-funeraria',
  templateUrl: './detalle-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./detalle-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class DetalleBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  beneficiario!: BeneficiarioInterface;

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
    this.beneficiario = this.config.data;
  }

  aceptar(): void {
    this.ref.close();
  }

}
