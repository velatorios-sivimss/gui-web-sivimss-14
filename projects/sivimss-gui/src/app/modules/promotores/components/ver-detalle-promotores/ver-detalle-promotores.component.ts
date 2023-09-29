import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Promotor } from '../../models/promotores.interface';
import { PromotoresService } from '../../services/promotores.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ver-detalle-promotores',
  templateUrl: './ver-detalle-promotores.component.html',
  styleUrls: ['./ver-detalle-promotores.component.scss']
})
export class VerDetallePromotoresComponent implements OnInit {
  readonly MENSAJE_PROMOTOR_AGREGADO = 'Promotor agregado correctamente';
  readonly MENSAJE_PROMOTOR_MODIFICADO = 'Promotor modificado correctamente';
  readonly MENSAJE_PROMOTOR_ACTIVADO = 'Promotor activado correctamente';
  readonly MENSAJE_PROMOTOR_DESACTIVADO = 'Promotor desactivado correctamente';

  promotorSeleccionado!: Promotor;
  preguntaConfirmacion: string = '';
  mensajeConfirmacion: string = '';
  Accion = Accion;
  accionEntrada: Accion;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private promotoresService: PromotoresService,
  ) {
    this.promotorSeleccionado = this.config.data?.promotor;
    this.accionEntrada = this.config.data?.modo;
  }

  ngOnInit(): void {
    this.buscarPorFiltros();
    this.inicializarModo();
  }

  inicializarModo() {
    switch (this.accionEntrada) {
      case Accion.Activar:
        this.preguntaConfirmacion = '¿Estás seguro de activar este promotor?';
        this.mensajeConfirmacion = this.MENSAJE_PROMOTOR_ACTIVADO;
        break;
      case Accion.Desactivar:
        this.preguntaConfirmacion = '¿Estás seguro de desactivar este promotor?';
        this.mensajeConfirmacion = this.MENSAJE_PROMOTOR_DESACTIVADO;
        break;
      default:
        break;
    }
  }

  buscarPorFiltros(): void {
    if (this.promotorSeleccionado.idPromotor) {
      this.promotoresService.obtenerDetallePromotor(this.promotorSeleccionado.idPromotor).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          console.log(respuesta.datos);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
    }
  }

  cerrarDialogo(promotor?: Promotor) {
    this.ref.close({
      respuesta: 'Ok',
      promotor,
    });
  }

  // Para activar o desactivar
  cambiarEstatusPromotor() {
    const nuevoPromotor: Promotor = {
      ...this.promotorSeleccionado,
      estatus: !this.promotorSeleccionado.estatus,
    }
    // TO DO Integrar servicio de back para Actualizar Estatus
    this.cerrarDialogo(nuevoPromotor);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  agregarPromotor() {
    const nuevoPromotor: Promotor = { ...this.promotorSeleccionado }
    // TO DO Integrar servicio de back para Guardar
    this.cerrarDialogo(nuevoPromotor);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }
}
