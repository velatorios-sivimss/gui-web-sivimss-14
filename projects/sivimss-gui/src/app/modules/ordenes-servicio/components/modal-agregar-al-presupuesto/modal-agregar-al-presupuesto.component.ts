import { Component, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ModalAgregarServicioComponent } from 'projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-servicio/modal-agregar-servicio.component';
import { ModalAgregarAtaudComponent } from '../modal-agregar-ataud/modal-agregar-ataud.component';
import { ModalAgregarUrnaComponent } from '../modal-agregar-urna/modal-agregar-urna.component';
import { ModalAgregarEmpaqueComponent } from '../modal-agregar-empaque/modal-agregar-empaque.component';
import { ModalAgregarArticulosComplementariosComponent } from '../modal-agregar-articulos-complementarios/modal-agregar-articulos-complementarios.component';

@Component({
  selector: 'app-modal-agregar-al-presupuesto',
  templateUrl: './modal-agregar-al-presupuesto.component.html',
  styleUrls: ['./modal-agregar-al-presupuesto.component.scss'],
})
export class ModalAgregarAlPresupuestoComponent implements OnInit {
  idVelatorio: number = 0;
  muestraServicio: boolean = true;

  idInventario: number[] = [];
  servicioExtremidad: boolean = true;

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    this.idVelatorio = this.config.data.idVelatorio;
    this.mostrarOpciones(this.config.data.tipoOrden);
    this.servicioExtremidad = this.config.data.servicioExtremidad;
    this.config.data.presupuesto.forEach((dato:any) => {
      this.idInventario.push(dato.idInventario)
    });
  }

  mostrarOpciones(tipoOrden: number): void {
    if (tipoOrden == 3) this.muestraServicio = false;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(null);
  }

  abrirModalAgregarServicio(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarServicioComponent, {
      header: 'Agregar servicio',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        proveedor: [],
        traslado: false,
        fila: -1,
        proviene: 'servicios',
        idServicio: 0,
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) this.cerrarmodal(salida);
    });
  }

  abrirModalAgregarAtaud(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarAtaudComponent, {
      header: 'Agregar ataúd',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        idVelatorio: this.idVelatorio,
        idInventarios: this.idInventario
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) this.cerrarmodal(salida);
    });
  }

  abrirModalAgregarUrna(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarUrnaComponent, {
      header: 'Agregar urna',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        idVelatorio: this.idVelatorio,
        idInventarios: this.idInventario
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) this.cerrarmodal(salida);
    });
  }

  abrirModalAgregarEmpaque(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarEmpaqueComponent, {
      header: 'Agregar empaque',
      style: { maxWidth: '876px', width: '100%' },
      data: {
        idVelatorio: this.idVelatorio,
        idInventarios: this.idInventario
        //Pasa info a ModalVerTarjetaIdentificacionComponent
      },
    });
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) this.cerrarmodal(salida);
    });
  }

  abrirModalAgregarArticulosComplementarios(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(
      ModalAgregarArticulosComplementariosComponent,
      {
        header: 'Agregar artículos complementarios',
        style: { maxWidth: '876px', width: '100%' },
        data: {
          idVelatorio: this.idVelatorio,
          //Pasa info a ModalVerTarjetaIdentificacionComponent
        },
      }
    );
    ref.onClose.subscribe((salida: any) => {
      if (salida != null) this.cerrarmodal(salida);
    });
  }

  cerrarmodal(salida: any): void {
    this.ref.close(salida);
  }
}
