import {AfterViewInit, Component, Renderer2} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";

@Component({
  selector: 'app-previsualizacion-archivo',
  templateUrl: './previsualizacion-archivo.component.html',
  styleUrls: ['./previsualizacion-archivo.component.scss']
})
export class PrevisualizacionArchivoComponent implements AfterViewInit {

  blob: string = "";

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private renderer: Renderer2,
  ) {
  }

  ngAfterViewInit(): void {
    this.blob = this.config.data;
  }

  guardar(): void {
    let link = this.renderer.createElement('a');
    link.setAttribute('download', 'Disponibilidad de capillas');
    link.setAttribute('href', this.blob);
    link.click();
    link.remove();
    this.ref.close();
  }

  cancelar(): void {
    this.ref.close();
  }
}
