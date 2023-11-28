import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
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
    public ref: DynamicDialogRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //this.beneficiarios = this.route.snapshot.data['item'];
    console.log('aeuasd noasndoasd ');
    console.log(this.route.snapshot);
    console.log(this.route.snapshot.data['valores']);
  }

  abrirModalRegistroNuevoBeneficiario(event: MouseEvent) {
    event.stopPropagation();
    this.ref.close();
    const ref = this.dialogService.open(
      ModalRegistrarNuevoBeneficiarioComponent,
      {
        header: 'Registrar nuevo beneficiaro',
        style: { maxWidth: '876px', width: '100%' },
        data: {
          dato1: null,
        },
      }
    );
    ref.onClose.subscribe((respuesta: any) => {});
  }

  abrirModalEditarBeneficiario(event: MouseEvent) {
    event.stopPropagation();
    this.ref.close();
    const ref = this.dialogService.open(ModalEditarBeneficiarioComponent, {
      header: 'Editar beneficiaro',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {});
  }
}
