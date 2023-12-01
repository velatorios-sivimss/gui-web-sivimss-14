import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalEditarBeneficiarioComponent } from '../modal-editar-beneficiario/modal-editar-beneficiario.component';
import { Beneficiarios } from '../../../../models/Beneficiarios.interface';

@Component({
  selector: 'app-modal-detalle-beneficiarios',
  templateUrl: './modal-detalle-beneficiarios.component.html',
  styleUrls: ['./modal-detalle-beneficiarios.component.scss'],
})
export class ModalDetalleBeneficiariosComponent implements OnInit {
  beneficiarios: Beneficiarios = {} as Beneficiarios;

  constructor(
    private dialogService: DialogService,
    public readonly config: DynamicDialogConfig,
    private ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.beneficiarios = this.config.data['item'];
  }

  abrirModalEditarBeneficiario(event: MouseEvent) {
    event.stopPropagation();

    const ref = this.dialogService.open(ModalEditarBeneficiarioComponent, {
      header: 'Editar beneficiario',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        item: this.beneficiarios,
      },
    });

    ref.onClose.subscribe((respuesta: any) => {
      if (respuesta) {
        this.beneficiarios = respuesta;
      }
    });
  }

  cerrarModal(): void {
    this.ref.close(this.beneficiarios);
  }
}
