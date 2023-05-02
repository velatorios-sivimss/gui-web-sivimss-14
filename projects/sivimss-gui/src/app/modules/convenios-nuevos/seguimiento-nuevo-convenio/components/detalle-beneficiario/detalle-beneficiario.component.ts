import { Beneficiarios } from './../../models/beneficiarios.interface';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmacionServicio } from '../../models/seguimiento-nuevo-convenio.interface';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ModificarBeneficiarioComponent } from '../modificar-beneficiario/modificar-beneficiario.component';
export enum TipoAlerta {
  Exito = 'success',
  Info = 'info',
  Precaucion = 'warning',
  Error = 'error'
}

@Component({
  selector: 'app-detalle-beneficiario',
  templateUrl: './detalle-beneficiario.component.html',
  styleUrls: ['./detalle-beneficiario.component.scss']
})
export class DetalleBeneficiarioComponent implements OnInit {

  @Input() beneficiarioSeleccionado!: Beneficiarios;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;

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
      this.beneficiarioSeleccionado = this.config.data.servicio;
      this.origen = this.config.data.origen;
      }
      }


      abrirModalModificarBeneficiario():void{
        this.creacionRef = this.dialogService.open(ModificarBeneficiarioComponent, {
          header:"Modificar servicio",
          width:"920px",
        })

        this.creacionRef.onClose.subscribe((estatus:boolean) => {
          if(estatus){
             this.alertaService.mostrar(TipoAlerta.Exito, 'Beneficiario modificado correctamente');
            this.ref.close();
          }
        })
      }

      regresar(): void{
        this.confirmacionAceptar.emit({estatus:true,origen:"regresar"});
      }

      cerrar(): void {
        this.ref.close();
      }

      aceptar():void {
        if(this.origen == "detalle"){
          this.ref.close();
        }
        if(this.origen == "agregar" || this.origen == "modificar" ){
          this.confirmacionAceptar.emit({estatus:true,origen:this.origen});
        }
        if(this.origen == "estatus"){
          this.ref.close(this.beneficiarioSeleccionado);
        }
      }

}
