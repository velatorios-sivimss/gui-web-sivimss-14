import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ConveniosPrevisionFunerariaInterface} from "../../models/convenios-prevision-funeraria.interface";
import {OverlayPanel} from "primeng/overlaypanel";
import {DynamicDialogConfig} from "primeng/dynamicdialog";

@Component({
  selector: 'app-detalle-convenio-prevision-funeraria',
  templateUrl: './detalle-convenio-prevision-funeraria.component.html',
  styleUrls: ['./detalle-convenio-prevision-funeraria.component.scss']
})
export class DetalleConvenioPrevisionFunerariaComponent implements OnInit {

  @Input() convenio!: ConveniosPrevisionFunerariaInterface;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  constructor(
    public config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    if(this.config?.data){
      this.convenio = this.config.data;
    }
  }

  abrirRenovar(): void {

  }

  abrirModalModificar(): void {

  }

  abrirActivar(): void {

  }



}
