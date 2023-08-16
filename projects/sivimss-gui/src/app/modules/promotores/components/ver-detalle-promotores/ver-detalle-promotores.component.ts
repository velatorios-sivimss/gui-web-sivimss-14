import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { Promotor, PromotorDetalle } from '../../models/promotores.interface';

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

  promotorSeleccionado!: PromotorDetalle;
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
  ) {
    this.promotorSeleccionado = this.config.data?.promotor;
    this.accionEntrada = this.config.data?.modo;
  }

  ngOnInit(): void {
    this.inicializarModo();
  }

  inicializarModo() {
    switch (this.accionEntrada) {
      case Accion.Agregar:
        this.preguntaConfirmacion = '¿Estás seguro de agregar este nuevo promotor?';
        this.mensajeConfirmacion = this.MENSAJE_PROMOTOR_AGREGADO;
        break;
      case Accion.Modificar:
        this.preguntaConfirmacion = '¿Estás seguro de modificar este promotor?';
        this.mensajeConfirmacion = this.MENSAJE_PROMOTOR_MODIFICADO;
        break;
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

  cerrarDialogo(promotor?: PromotorDetalle) {
    this.ref.close({
      respuesta: 'Ok',
      promotor,
    });
  }

  // Para activar o desactivar
  cambiarEstatusPromotor() {
    const nuevoPromotor: PromotorDetalle = {
      ...this.promotorSeleccionado,
      estatus: !this.promotorSeleccionado.estatus,
    }
    // TO DO Integrar servicio de back para Actualizar Estatus
    this.cerrarDialogo(nuevoPromotor);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }

  agregarPromotor() {
    const nuevoPromotor: PromotorDetalle = { ...this.promotorSeleccionado }
    // TO DO Integrar servicio de back para Guardar
    this.cerrarDialogo(nuevoPromotor);
    this.alertaService.mostrar(TipoAlerta.Exito, this.mensajeConfirmacion);
  }
}
