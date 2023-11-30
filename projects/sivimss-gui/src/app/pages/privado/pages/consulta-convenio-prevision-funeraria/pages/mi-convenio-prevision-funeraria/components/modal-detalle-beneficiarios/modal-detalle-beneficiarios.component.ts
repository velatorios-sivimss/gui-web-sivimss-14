import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalRegistrarNuevoBeneficiarioComponent } from '../modal-registrar-nuevo-beneficiario/modal-registrar-nuevo-beneficiario.component';
import { ModalEditarBeneficiarioComponent } from '../modal-editar-beneficiario/modal-editar-beneficiario.component';
import { ActivatedRoute } from '@angular/router';
import { Beneficiarios } from '../../../../models/Beneficiarios.interface';

@Component({
  selector: 'app-modal-detalle-beneficiarios',
  templateUrl: './modal-detalle-beneficiarios.component.html',
  styleUrls: ['./modal-detalle-beneficiarios.component.scss'],
})
export class ModalDetalleBeneficiariosComponent implements OnInit {
  beneficiarios: Beneficiarios = {} as Beneficiarios;

  constructor(
    private readonly dialogService: DialogService,
    public readonly config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.beneficiarios = this.config.data['item'];
  }

  abrirModalEditarBeneficiario(event: MouseEvent) {
    event.stopPropagation();
    this.ref.close();
    this.ref = this.dialogService.open(ModalEditarBeneficiarioComponent, {
      header: 'Editar beneficiaro',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        item: this.beneficiarios,
      },
    });

    this.ref.onClose.subscribe((respuesta: any) => {});
  }

  cerrarModal(): void {
    this.ref.close();
  }
}
