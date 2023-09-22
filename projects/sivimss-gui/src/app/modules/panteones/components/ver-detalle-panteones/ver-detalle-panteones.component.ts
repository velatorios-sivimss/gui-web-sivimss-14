import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OverlayPanel } from "primeng/overlaypanel";
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Panteon } from '../../models/panteones.interface';
import { ModificarPanteonesComponent } from '../modificar-panteones/modificar-panteones.component';

@Component({
  selector: 'app-ver-detalle-panteones',
  templateUrl: './ver-detalle-panteones.component.html',
  styleUrls: ['./ver-detalle-panteones.component.scss'],
  providers: [DialogService]
})
export class VerDetallePanteonesComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly MENSAJE_PANTEON_AGREGADO = 'Panteón agregado correctamente';
  readonly MENSAJE_PANTEON_MODIFICADO = 'Panteón modificado correctamente';
  readonly MENSAJE_PANTEON_ACTIVADO = 'Panteón activado correctamente';
  readonly MENSAJE_PANTEON_DESACTIVADO = 'Panteón desactivado correctamente';

  detalleRef!: DynamicDialogRef;
  panteonSeleccionado!: Panteon;
  preguntaConfirmacion: string = '';
  mensajeConfirmacion: string = '';
  Accion = Accion;
  accionEntrada: Accion;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.panteonSeleccionado = this.config.data?.panteon;
    this.accionEntrada = this.config.data?.modo;
  }

  ngOnInit(): void {
    this.inicializarModo();
  }

  inicializarModo() {
    switch (this.accionEntrada) {
      case Accion.Agregar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas agregar este nuevo panteón?';
        this.mensajeConfirmacion = this.MENSAJE_PANTEON_AGREGADO;
        break;
      case Accion.Modificar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas modificar este panteón?';
        this.mensajeConfirmacion = this.MENSAJE_PANTEON_MODIFICADO;
        break;
      case Accion.Activar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas activar este panteón?';
        this.mensajeConfirmacion = this.MENSAJE_PANTEON_ACTIVADO;
        break;
      case Accion.Desactivar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas desactivar este panteón?';
        this.mensajeConfirmacion = this.MENSAJE_PANTEON_DESACTIVADO;
        break;
      default:
        break;
    }
  }

  abrirPanel(event: MouseEvent): void {
    this.overlayPanel.toggle(event);
  }

  cerrarDialogo(panteon?: Panteon) {
    this.ref.close({
      respuesta: 'Ok',
      panteon,
    });
  }

  // Para activar o desactivar
  cambiarEstatusPanteon() {
    const nuevoPanteon: Panteon = {
      ...this.panteonSeleccionado,
      estatus: !this.panteonSeleccionado.estatus,
    }
    // TO DO Integrar servicio de back para Actualizar Estatus
    this.cerrarDialogo(nuevoPanteon);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  agregarPanteon() {
    const nuevoPanteon: Panteon = { ...this.panteonSeleccionado }
    // TO DO Integrar servicio de back para Guardar
    this.cerrarDialogo(nuevoPanteon);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  abrirModalModificarPanteon() {
    this.cerrarDialogo();
    this.detalleRef = this.dialogService.open(ModificarPanteonesComponent, {
      data: { panteon: this.panteonSeleccionado },
      header: "Modificar panteón",
      width: "920px"
    });
  }
}
