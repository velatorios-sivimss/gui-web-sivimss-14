import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Contrato } from '../../models/contratos.interface';
import { ModificarContratosComponent } from '../modificar-contratos/modificar-contratos.component';

@Component({
  selector: 'app-ver-detalle-contratos',
  templateUrl: './ver-detalle-contratos.component.html',
  styleUrls: ['./ver-detalle-contratos.component.scss'],
  providers: [DialogService]
})
export class VerDetalleContratosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly MENSAJE_CONTRATO_AGREGADO = 'Contrato PUTR agregado correctamente';
  readonly MENSAJE_CONTRATO_MODIFICADO = 'Contrato PUTR modificado correctamente';
  readonly MENSAJE_CONTRATO_ACTIVADO = 'Contrato activado correctamente';
  readonly MENSAJE_CONTRATO_DESACTIVADO = 'Contrato desactivado correctamente';
  readonly MENSAJE_CONTRATO_RENOVADO = 'Contrato renovado correctamente';

  detalleRef!: DynamicDialogRef;
  contratoSeleccionado!: Contrato;
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
    this.contratoSeleccionado = this.config.data?.contrato;
    this.accionEntrada = this.config.data?.modo;
  }

  ngOnInit(): void {
    this.inicializarModo();
  }

  inicializarModo() {
    switch (this.accionEntrada) {
      case Accion.Agregar:
        this.preguntaConfirmacion = '¿Estás seguro de agregar este nuevo contrato PUTR?';
        this.mensajeConfirmacion = this.MENSAJE_CONTRATO_AGREGADO;
        break;
      case Accion.Modificar:
        this.preguntaConfirmacion = '¿Estás seguro de modificar este contrato PUTR?';
        this.mensajeConfirmacion = this.MENSAJE_CONTRATO_MODIFICADO;
        break;
      case Accion.Activar:
        this.preguntaConfirmacion = '¿Estás seguro de activar este contrato PUTR?';
        this.mensajeConfirmacion = this.MENSAJE_CONTRATO_ACTIVADO;
        break;
      case Accion.Desactivar:
        this.preguntaConfirmacion = '¿Estás seguro de desactivar este contrato PUTR?';
        this.mensajeConfirmacion = this.MENSAJE_CONTRATO_DESACTIVADO;
        break;
      case Accion.Renovar:
        this.preguntaConfirmacion = '¿Estás seguro de renovar este contrato PUTR?';
        this.mensajeConfirmacion = this.MENSAJE_CONTRATO_RENOVADO;
        break;
      default:
        break;
    }
  }

  abrirPanel(event: MouseEvent): void {
    this.overlayPanel.toggle(event);
  }

  cerrarDialogo(contrato?: Contrato) {
    this.ref.close({
      respuesta: 'Ok',
      contrato,
    });
  }

  // Para activar o desactivar
  cambiarEstatusContrato() {
    const nuevoContrato: Contrato = {
      ...this.contratoSeleccionado,
      estatus: !this.contratoSeleccionado.estatus,
    }
    // TO DO Integrar servicio de back para Actualizar Estatus
    this.cerrarDialogo(nuevoContrato);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  agregarContrato() {
    const nuevoContrato: Contrato = { ...this.contratoSeleccionado }
    // TO DO Integrar servicio de back para Guardar
    this.cerrarDialogo(nuevoContrato);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  abrirModalModificarContrato() {
    this.cerrarDialogo();
    this.detalleRef = this.dialogService.open(ModificarContratosComponent, {
      data: { panteon: this.contratoSeleccionado },
      header: "Modificar contrato",
      width: "920px"
    });
  }
}
