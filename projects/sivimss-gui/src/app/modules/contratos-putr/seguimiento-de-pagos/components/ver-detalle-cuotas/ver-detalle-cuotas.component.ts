import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Cuota } from '../../models/cuotas.interface';

@Component({
  selector: 'app-ver-detalle-cuotas',
  templateUrl: './ver-detalle-cuotas.component.html',
  styleUrls: ['./ver-detalle-cuotas.component.scss'],
  providers: [DialogService]
})
export class VerDetalleCuotasComponent implements OnInit {
  readonly MENSAJE_CUOTA_AGREGADA = 'Se ha guardado exitosamente el registro de la cuota de recuperación';

  detalleRef!: DynamicDialogRef;
  cuotaSeleccionada!: Cuota;
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
    this.cuotaSeleccionada = this.config.data?.cuota;
    this.accionEntrada = this.config.data?.modo;
  }

  ngOnInit(): void {
    this.inicializarModo();
  }

  inicializarModo() {
    switch (this.accionEntrada) {
      case Accion.Agregar:
        this.preguntaConfirmacion = '¿Estás seguro de registrar esta cuota?';
        this.mensajeConfirmacion = this.MENSAJE_CUOTA_AGREGADA;
        break;
      default:
        break;
    }
  }

  cerrarDialogo(cuota?: Cuota) {
    this.ref.close({
      respuesta: 'Ok',
      cuota,
    });
  }

  // Para activar o desactivar
  cambiarEstatusCuota() {
    const nuevaCuota: Cuota = {
      ...this.cuotaSeleccionada,
      // estatus: !this.cuotaSeleccionada.estatus,
    }
    // TO DO Integrar servicio de back para Actualizar Estatus
    this.cerrarDialogo(nuevaCuota);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  agregarCuota() {
    const nuevaCuota: Cuota = { ...this.cuotaSeleccionada }
    // TO DO Integrar servicio de back para Guardar
    this.cerrarDialogo(nuevaCuota);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }
}
