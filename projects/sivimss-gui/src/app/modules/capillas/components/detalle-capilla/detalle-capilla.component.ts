import {CapillaService} from '../../services/capilla.service';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {ConfirmacionServicio} from '../../../servicios/models/servicio.interface';
import {Capilla} from '../../models/capilla.interface';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

@Component({
  selector: 'app-detalle-capilla',
  templateUrl: './detalle-capilla.component.html',
  styleUrls: ['./detalle-capilla.component.scss']
})
export class DetalleCapillaComponent implements OnInit {

  @Input() capillaSeleccionada!: Capilla;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();
  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  abrirModificar: boolean = false;
  areaTotal: any;
  alt: any;
  anch: any;

  constructor(public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              public dialogService: DialogService,
              private alertaService: AlertaService,
              private capillaService: CapillaService,
  ) {
  }

  ngOnInit(): void {

    if (this.config?.data) {
      this.origen = this.config.data.origen;
      if (this.origen !== 'modificar') {
        this.capillaSeleccionada = this.config.data.capilla;
      }
      this.alt = this.capillaSeleccionada.alto
      this.anch = this.capillaSeleccionada.largo
      this.areaTotal = this.alt * this.anch
    }
  }

  regresar(): void {
    this.confirmacionAceptar.emit({estatus: true, origen: "regresar"});
  }

  cerrar(): void {
    this.ref.close();
  }

  abrirModalModificarCapilla(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }


  aceptar(): void {
    if (this.origen == "detalle") {
      this.ref.close();
    }
    if (this.origen == "agregar" || this.origen == "modificar") {
      this.confirmacionAceptar.emit({estatus: true, origen: this.origen});
    }
    if (this.origen == "estatus") {
      this.cambiarEstatus();
    }
  }

  cambiarEstatus(): void {
    this.capillaService.cambiarEstatus({idCapilla: this.capillaSeleccionada.idCapilla}).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.codigo === 200) {
          if (this.capillaSeleccionada.estatus) {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Capilla activada correctamente');
          } else {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Capilla desactivada correctamente');
          }
          this.ref.close(this.capillaSeleccionada);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }


}
