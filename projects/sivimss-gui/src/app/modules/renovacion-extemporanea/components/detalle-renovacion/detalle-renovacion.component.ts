import {ConfirmacionServicio,ConveniosPrevision,} from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/models/convenios-prevision.interface'
import {Component,EventEmitter,Input,OnInit,Output,ViewChild,} from '@angular/core'
import {DialogService,DynamicDialogConfig,DynamicDialogRef,} from 'primeng/dynamicdialog'
import { OverlayPanel } from 'primeng/overlaypanel'
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service'

@Component({
  selector: 'app-detalle-renovacion',
  templateUrl: './detalle-renovacion.component.html',
  styleUrls: ['./detalle-renovacion.component.scss'],
})
export class DetalleRenovacionComponent implements OnInit {
  @Input() convenioSeleccionado!: ConveniosPrevision;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  abrirModificar: boolean = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private alertaService: AlertaService,
  ) {}

  ngOnInit(): void {
    //Escenario selección ícono 'ojo' detalle o cambio estatus vista rápida
    if (this.config?.data) {
      this.convenioSeleccionado = this.config.data.servicio;
      this.origen = this.config.data.origen;
    }
  }

  aceptar(): void {
    if (this.origen == 'detalle') {
      this.ref.close();
    }
    if (this.origen == 'agregar' || this.origen == 'modificar') {
      this.confirmacionAceptar.emit({ estatus: true, origen: this.origen });
    }
    if (this.origen == 'estatus') {
      this.ref.close(this.convenioSeleccionado);
    }
  }

  regresar(): void {
    this.confirmacionAceptar.emit({ estatus: true, origen: 'regresar' });
  }

  cerrar(): void {
    this.ref.close();
  }
}
