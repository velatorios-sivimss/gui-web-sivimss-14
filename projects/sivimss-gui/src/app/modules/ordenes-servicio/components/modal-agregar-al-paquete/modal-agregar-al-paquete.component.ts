import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';

import { finalize } from 'rxjs/operators';
import { HttpRespuesta } from '../../../../models/http-respuesta.interface';
import { ActivatedRoute } from '@angular/router';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { Dropdown } from 'primeng/dropdown';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
@Component({
  selector: 'app-modal-agregar-al-paquete',
  templateUrl: './modal-agregar-al-paquete.component.html',
  styleUrls: ['./modal-agregar-al-paquete.component.scss'],
})
export class ModalAgregarAlPaqueteComponent implements OnInit {
  tipoAsignacion: any[] = [];
  listaAtaudes: any[] = [];
  selectIdAsignacion: number | null = null;
  ataudSeleccionado: number | null = null;
  proveedorSeleccionado: number | null = null;
  listaProveedores: any[] = [];
  idVelatorio!: number;
  selectAtaudInventario: number | null = null;
  listaAtaudesInventario: any[] = [];
  salida: any = {};
  nombreProveedor: string = '';
  fila: number = 0;
  concepto: string = '';
  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private route: ActivatedRoute,
    private mensajesSistemaService: MensajesSistemaService,
  ) {}

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];

    this.idVelatorio = this.config.data.idVelatorio;
    this.fila = this.config.data.fila;
    this.incializarAsignacion(this.config.data.tipoAsignacion);
  }

  incializarAsignacion(asignacion: any): void {
    this.tipoAsignacion = asignacion;
    if (asignacion.length > 0) {
      this.selectIdAsignacion = asignacion[0];
      this.buscarAtaudes(
        Number(this.config.data.idVelatorio),
        Number(asignacion[0])
      );
    }
  }

  buscarAtaudes(idVelatorio: number, idAsignacion: number): void {
    this.loaderService.activar();
    const parametros = {
      idVelatorio: idVelatorio,
      idAsignacion: idAsignacion,
    };
    this.gestionarOrdenServicioService
      .consultarAtaudes(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.listaAtaudes = [];
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(respuesta.datos)
              )
            );
            return;
          }
          this.listaAtaudes = mapearArregloTipoDropdown(
            datos,
            'nombreArticulo',
            'idArticulo'
          );
          if (this.listaAtaudes.length == 0) {
            this.alertaService.mostrar(TipoAlerta.Precaucion, "Ya no hay stock de este artículo. " ||
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(15));
          }
        },
        error: (error: HttpErrorResponse) => {
          try {
            this.alertaService.mostrar(TipoAlerta.Error,
              // this.mensajesSistemaService.obtenerMensajeSistemaPorId(52));
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(52));
          } catch (error) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(187)
            );
          }
        }
      });
  }

  buscarProveedor(): void {
    this.loaderService.activar();
    const parametros = {
      idArticulo: this.ataudSeleccionado,
    };
    this.gestionarOrdenServicioService
      .consultarProveedorAtaudes(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.listaProveedores = [];
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(respuesta.datos)
              )
            );
            return;
          }
          this.listaProveedores = mapearArregloTipoDropdown(
            datos,
            'nombreProveedor',
            'idProveedor'
          );
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          try {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(error.error.datos)
              )
            );
          } catch (error) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(187)
            );
          }
        }
      });
  }

  limpiarSelects(): void {
    this.listaAtaudes = [];
    this.listaProveedores = [];

    this.buscarAtaudes(
      Number(this.idVelatorio),
      Number(this.selectIdAsignacion)
    );
  }

  onchangeInventario(dd: Dropdown): void {
    this.concepto = dd.selectedOption.label;
  }
  buscarAtaudInventario(dd: Dropdown) {
    this.nombreProveedor = dd.selectedOption.label;
    this.loaderService.activar();
    const parametros = {
      idArticulo: this.ataudSeleccionado,
      idAsignacion: this.selectIdAsignacion,
      idProveedor: this.proveedorSeleccionado,
      idVelatorio: this.idVelatorio,
    };
    this.gestionarOrdenServicioService
      .consultarAtaudInventario(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            this.listaAtaudesInventario = [];
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(respuesta.datos)
              )
            );
            return;
          }

          this.listaAtaudesInventario = mapearArregloTipoDropdown(
            datos,
            'idFolioArticulo',
            'idInventario'
          );
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          try {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(
                Number(error.error.datos)
              )
            );
          } catch (error) {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              this.gestionarOrdenServicioService.obtenerMensajeSistemaPorId(187)
            );
          }
        }
      });
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo

    this.ref.close(this.salida);
  }

  aceptarModal(): void {
    this.salida = {
      idAsignacion: this.selectIdAsignacion,
      idArticulo: this.ataudSeleccionado,
      idProveedor: this.proveedorSeleccionado,
      idInventario: this.selectAtaudInventario,
      nombreProveedor: this.nombreProveedor,
      concepto: this.concepto,
      fila: this.fila,
    };
    this.ref.close(this.salida);
  }
}
