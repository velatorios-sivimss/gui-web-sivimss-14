import {AfterViewInit, Component, OnInit,Renderer2} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-previsualizacion-archivo',
  templateUrl: './previsualizacion-archivo.component.html',
  styleUrls: ['./previsualizacion-archivo.component.scss']
})
export class PrevisualizacionArchivoComponent implements OnInit,AfterViewInit {

  blob: string = "";

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.blob = this.config.data;
  }

  guardar(): void {
    let link = this.renderer.createElement('a');
    link.setAttribute('download','Disponibilidad de capillas');
    link.setAttribute('href', this.blob);
    link.click();
    link.remove();
    this.ref.close();
  }

  cancelar(): void {
    this.ref.close();
  }
}
