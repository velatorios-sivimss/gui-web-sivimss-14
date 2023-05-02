import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Sala } from '../../models/salas.interface';
import { ModificarSalasComponent } from '../modificar-salas/modificar-salas.component';

@Component({
  selector: 'app-ver-detalle-salas',
  templateUrl: './ver-detalle-salas.component.html',
  styleUrls: ['./ver-detalle-salas.component.scss'],
  providers: [DialogService]
})
export class VerDetalleSalasComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly MENSAJE_SALA_AGREGADA = 'Sala agregada correctamente';
  readonly MENSAJE_SALA_MODIFICADA = 'Sala modificada correctamente';
  readonly MENSAJE_SALA_ACTIVADA = 'Sala activada correctamente';
  readonly MENSAJE_SALA_DESACTIVADA = 'Sala desactivada correctamente';

  detalleRef!: DynamicDialogRef;
  salaSeleccionada!: Sala;
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
    this.salaSeleccionada = this.config.data?.sala;
    this.accionEntrada = this.config.data?.modo;
  }

  ngOnInit(): void {
    this.inicializarModo();
  }

  inicializarModo() {
    switch (this.accionEntrada) {
      case Accion.Agregar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas agregar esta sala?';
        this.mensajeConfirmacion = this.MENSAJE_SALA_AGREGADA;
        break;
      case Accion.Modificar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas modificar esta sala?';
        this.mensajeConfirmacion = this.MENSAJE_SALA_MODIFICADA;
        break;
      case Accion.Activar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas activar esta sala?';
        this.mensajeConfirmacion = this.MENSAJE_SALA_ACTIVADA;
        break;
      case Accion.Desactivar:
        this.preguntaConfirmacion = '¿Estás seguro que deseas desactivar esta sala?';
        this.mensajeConfirmacion = this.MENSAJE_SALA_DESACTIVADA;
        break;
      default:
        break;
    }
  }

  abrirPanel(event: MouseEvent): void {
    this.overlayPanel.toggle(event);
  }

  cerrarDialogo(sala?: Sala) {
    this.ref.close({
      respuesta: 'Ok',
      sala,
    });
  }

  // Para activar o desactivar
  cambiarEstatusSala() {
    const nuevoSala: Sala = {
      ...this.salaSeleccionada,
      estatus: !this.salaSeleccionada.estatus,
    }
    // TO DO Integrar servicio de back para Actualizar Estatus
    this.cerrarDialogo(nuevoSala);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  agregarSala() {
    const nuevoSala: Sala = { ...this.salaSeleccionada }
    // TO DO Integrar servicio de back para Guardar
    this.cerrarDialogo(nuevoSala);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  abrirModalModificarSala() {
    this.cerrarDialogo();
    this.detalleRef = this.dialogService.open(ModificarSalasComponent, {
      data: { panteon: this.salaSeleccionada },
      header: "Modificar sala",
      width: "920px"
    });
  }
}
