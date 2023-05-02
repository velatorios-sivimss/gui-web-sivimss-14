import { ModificarArticulosComponent } from './../modificar-articulos/modificar-articulos.component';
import { Articulo, ConfirmacionServicio } from './../../models/articulos.interface';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ArticulosService } from '../../services/articulos.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-detalle-articulos',
  templateUrl: './detalle-articulos.component.html',
  styleUrls: ['./detalle-articulos.component.scss']
})
export class DetalleArticulosComponent implements OnInit {

  @Input() articuloSeleccionado!: Articulo;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  abrirModificar: boolean = false;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private articulosService: ArticulosService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.origen = this.config.data.origen;
      if (this.origen !== 'modificar') {
        this.articuloSeleccionado = this.config.data.articulo;
      }
    }
  }

  abrirModalModificarServicio(): void {
    this.creacionRef = this.dialogService.open(ModificarArticulosComponent, {
      header: "Modificar artículo",
      width: "920px",
      data: { articulo: this.articuloSeleccionado, origen: "modificar" },
    });

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo modificado correctamente');
        this.ref.close();
      }
    });
  }

  aceptar(): void {
    if (this.origen == "detalle") {
      this.ref.close();
    }
    if (this.origen == "agregar" || this.origen == "modificar") {
      this.confirmacionAceptar.emit({ estatus: true, origen: this.origen });
    }
    if (this.origen == "estatus") {
      this.cambiarEstatus();
    }
  }

  cambiarEstatus() {
    this.articulosService.cambiarEstatus({ idArticulo: this.articuloSeleccionado.idArticulo }).subscribe(
      (respuesta) => {
        if (respuesta.codigo === 200) {
          if (this.articuloSeleccionado.estatus) {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo desactivado correctamente');
          } else {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo activado correctamente');
          }
          this.ref.close(this.articuloSeleccionado);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  regresar(): void {
    this.confirmacionAceptar.emit({ estatus: true, origen: "regresar" });
  }

  cerrar(): void {
    this.ref.close();
  }

}
