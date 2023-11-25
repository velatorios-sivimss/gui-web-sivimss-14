import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalDetalleBeneficiariosComponent } from './components/modal-detalle-beneficiarios/modal-detalle-beneficiarios.component';
import { ModalRenovarConvenioComponent } from './components/modal-renovar-convenio/modal-renovar-convenio.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mi-convenio-prevision-funeraria',
  templateUrl: './mi-convenio-prevision-funeraria.component.html',
  styleUrls: ['./mi-convenio-prevision-funeraria.component.scss'],
})
export class MiConvenioPrevisionFunerariaComponent implements OnInit {
  nombres: any[] = [
    {
      id: 1,
      nombre: 'Nombre',
      primerApellido: 'Primer apellido',
      segundoApellido: 'Segundo apellido',
    },
    {
      id: 2,
      nombre: 'Nombre',
      primerApellido: 'Primer apellido',
      segundoApellido: 'Segundo apellido',
    },
    {
      id: 3,
      nombre: 'Nombre',
      primerApellido: 'Primer apellido',
      segundoApellido: 'Segundo apellido',
    },
  ];

  constructor(
    private readonly dialogService: DialogService,
    private rutaActiva: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let idpf = this.rutaActiva.snapshot.queryParams.idpfs;
    console.log(idpf);
  }

  abrirModalDetalleBeneficiarios(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalDetalleBeneficiariosComponent, {
      header: 'Detalle de beneficiarios',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {});
  }

  abrirModalRenovarConvenio(event: MouseEvent): void {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalRenovarConvenioComponent, {
      header: 'Renovar convenio',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        dato1: null,
      },
    });
    ref.onClose.subscribe((respuesta: any) => {});
  }
}
