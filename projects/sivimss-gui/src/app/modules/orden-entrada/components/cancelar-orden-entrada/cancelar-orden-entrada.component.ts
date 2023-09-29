import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { OrdenEntradaService } from '../../services/orden-entrada.service';
import { finalize } from "rxjs/operators";

@Component({
  selector: 'app-cancelar-orden-entrada',
  templateUrl: './cancelar-orden-entrada.component.html',
  styleUrls: ['./cancelar-orden-entrada.component.scss']
})
export class CancelarOrdenEntradaComponent implements OnInit {

  readonly ORDEN_ENTRADA_ESTATUS_CANCELADA: number = 2;
  mostrarModalCancelarODE: boolean = false;
  idOde: number = 0;
  ordenEntrada: any;

  constructor(
    private route: ActivatedRoute,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    public ordenEntradaService: OrdenEntradaService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idOde = +params['id'];
    });
    this.consultarDetalleOrdenEntrada();
  }

  consultarDetalleOrdenEntrada() {
    this.loaderService.activar();
    this.ordenEntradaService.consultarDetalleOrdenEntrada(this.idOde).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.ordenEntrada = respuesta.datos[0];
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  consultarRelacionOrdenEntrada() {
    this.loaderService.activar();
    this.ordenEntradaService.consultarRelacionOrdenEntrada(this.idOde).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos[0].cantidadInventarioArticulo === 0) {
          //Se cancela la orden de entrada
          this.cancelarOrdenEntrada();
        } else {
          //Se muestra el MSG184 de la RN3232
          this.mostrarModalCancelarODE = false;
          this.alertaService.mostrar(TipoAlerta.Error, "No es posible cancelar, ya que existen artículos de esta Orden de entrada utilizados en una Orden de Servicio.");
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  cancelarOrdenEntrada() {
    this.loaderService.activar();
    this.ordenEntradaService.actualizarOrdenEntrada(this.idOde, this.ORDEN_ENTRADA_ESTATUS_CANCELADA).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.mostrarModalCancelarODE = false;
        this.alertaService.mostrar(TipoAlerta.Exito, "Orden de entrada cancelada correctamente.");
        void this.router.navigate(["../.."], {relativeTo: this.activatedRoute});
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

}
