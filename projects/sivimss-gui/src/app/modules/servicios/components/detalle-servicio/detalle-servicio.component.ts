import {Component, Input, OnInit, Output, ViewChild,EventEmitter} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Servicio,ConfirmacionServicio} from "../../models/servicio.interface";
import {OverlayPanel} from "primeng/overlaypanel";
import {ModificarServicioComponent} from "../modificar-servicio/modificar-servicio.component";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-detalle-servicio',
  templateUrl: './detalle-servicio.component.html',
  styleUrls: ['./detalle-servicio.component.scss'],
  providers: [DialogService]
})


export class DetalleServicioComponent implements OnInit {

  @Input() servicioSeleccionado!: Servicio;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  abrirModificar: boolean = false;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              public dialogService: DialogService,
              private alertaService: AlertaService) { }

  ngOnInit(): void {

    //Escenario selección ícono 'ojo' detalle o cambio estatus vista rápida
    if(this.config?.data){
      this.servicioSeleccionado = this.config.data.servicio;
      this.origen = this.config.data.origen;
    }
  }

  abrirModalModificarServicio():void{
    this.creacionRef = this.dialogService.open(ModificarServicioComponent, {
      header:"Modificar servicio",
      width:"920px",
    })

    this.creacionRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
         this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio modificado correctamente');
          this.ref.close();
      }
    })
  }

  aceptar():void {
    if(this.origen == "detalle"){
      this.ref.close();
    }
    if(this.origen == "agregar" || this.origen == "modificar" ){
      this.confirmacionAceptar.emit({estatus:true,origen:this.origen});
    }
    if(this.origen == "estatus"){
      this.ref.close(this.servicioSeleccionado);
    }
  }

  regresar(): void{

    this.confirmacionAceptar.emit({estatus:true,origen:"regresar"});
  }

  cerrar(): void {
    this.ref.close();
  }
}
