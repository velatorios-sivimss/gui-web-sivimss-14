import {Component, OnInit} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';

@Component({
  selector: 'app-modal-nota-remision',
  templateUrl: './modal-nota-remision.component.html',
  styleUrls: ['./modal-nota-remision.component.scss']
})
export class ModalNotaRemisionComponent implements OnInit {
  mensaje: string = '';

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public dialogService: DialogService,
    private loaderService: LoaderService
  ) {
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.mensaje = this.config.data.mensaje;
    }
    this.loaderService.activar();
  }

  cancelar(): void {
    this.ref.close()
  }
}
