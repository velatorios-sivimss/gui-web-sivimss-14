import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-previsualizacion-archivo',
  templateUrl: './previsualizacion-archivo.component.html',
  styleUrls: ['./previsualizacion-archivo.component.scss']
})
export class PrevisualizacionArchivoComponent implements OnInit, AfterViewInit {

  blob: string = "";

  constructor(
    private readonly ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void { /* TODO document why this method 'ngOnInit' is empty */ }

  ngAfterViewInit(): void {
    this.blob = this.config.data;
  }

  guardar(): void {
    this.ref.close(true);
  }

  cancelar(): void {
    this.ref.close(false);
  }
}
