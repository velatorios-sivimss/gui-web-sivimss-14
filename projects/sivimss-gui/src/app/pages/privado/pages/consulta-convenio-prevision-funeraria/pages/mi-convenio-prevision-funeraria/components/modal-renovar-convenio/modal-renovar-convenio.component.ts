import {Component, OnInit} from '@angular/core';
import {DatosGeneralesRenovacion} from '../../../../models/DatosGeneralesRenovacion.interface';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-modal-renovar-convenio',
  templateUrl: './modal-renovar-convenio.component.html',
  styleUrls: ['./modal-renovar-convenio.component.scss'],
})
export class ModalRenovarConvenioComponent implements OnInit {
  datosGeneralesRenovacion: DatosGeneralesRenovacion =
    {} as DatosGeneralesRenovacion;

  constructor(
    private readonly dialogService: DialogService,
    public readonly config: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {
  }

  ngOnInit(): void {
    this.datosGeneralesRenovacion = this.config.data['item'];
  }

  cerrarModal(): void {
    this.ref.destroy();
  }

  realizarPago(): void {
    this.ref.close({renovacion: true})
  }
}
