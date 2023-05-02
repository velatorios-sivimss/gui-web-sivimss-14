import { ConfirmacionServicio, Proveedores } from './../../models/proveedores.interface';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ModificarProveedorComponent } from '../modificar-proveedor/modificar-proveedor.component';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-detalle-proveedor',
  templateUrl: './detalle-proveedor.component.html',
  styleUrls: ['./detalle-proveedor.component.scss']
})
export class DetalleProveedorComponent implements OnInit {

  @Input() proveedorSeleccionado!: Proveedores;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;
  acordionAbierto: boolean = false;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  abrirModificar: boolean = false;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              public dialogService: DialogService,
              private alertaService: AlertaService) { }

  ngOnInit(): void {

    //Escenario selección ícono 'ojo' detalle o cambio estatus vista rápida
    if(this.config?.data){
      this.proveedorSeleccionado = this.config.data.proveedor;
      this.origen = this.config.data.origen;
    }
  }

  abrirAcordion(){
    if(this.acordionAbierto == false){
      this.acordionAbierto = true;
    }else{
      this.acordionAbierto = false;
    }
  }

  abrirModalModificarServicio():void{
    this.creacionRef = this.dialogService.open(ModificarProveedorComponent, {
      header:"Modificar proveedor",
      width:"920px",
    })

    this.creacionRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
         this.alertaService.mostrar(TipoAlerta.Exito, 'Proveedor modificado correctamente');
        this.ref.close();
      }
    })
  }


   abrirModalModificacionProveedor() {
      // this.modificar.emit(true)
   }

  cancelar(): void {
    this.ref.close()
  }

  regresar(): void{

    this.confirmacionAceptar.emit({estatus:true,origen:"regresar"});
  }

  aceptar():void {
    if(this.origen == "detalle"){
      this.ref.close();
    }
    if(this.origen == "agregar" || this.origen == "modificar" ){
      this.confirmacionAceptar.emit({estatus:true,origen:this.origen});
    }
    if(this.origen == "estatus"){
      this.ref.close(this.proveedorSeleccionado);
    }
  }

  cerrar(): void {
    this.ref.close();
  }


}
