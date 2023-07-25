import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GenerarOrdenServicioService } from '../../services/generar-orden-servicio.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { Dropdown } from 'primeng/dropdown';
@Component({
  selector: 'app-modal-agregar-ataud',
  templateUrl: './modal-agregar-ataud.component.html',
  styleUrls: ['./modal-agregar-ataud.component.scss'],
})
export class ModalAgregarAtaudComponent implements OnInit {
  form!: FormGroup;
  concepto: string = '';
  grupo: string = '';
  idCategoria: string = '';
  costo: number = 0;
  ataudesCompletos: any[] = [];
  ataudes: any[] = [];
  idVelatorio: number = 0;
  idProveedor: number = 0;
  idArticulo: number = 0;
  idInventario: number = 0;

  inventarioSeleccionado:number[] = [];
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService
  ) {}

  ngOnInit(): void {
    this.idVelatorio = this.config.data.idVelatorio;
    this.inventarioSeleccionado = this.config.data.idInventarios;
    this.inicializarForm();
    this.consultarAtaudes(this.config.data.idVelatorio);
  }

  consultarAtaudes(idVelatorio: number): void {
    const parametros = { idVelatorio: idVelatorio };
    let arregloAtaudTemporal:any;
    this.gestionarOrdenServicioService
      .consultarTodoslosAtaudes(parametros)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error) {
            this.ataudes = [];
            this.ataudesCompletos = [];
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
            return;
          }
          const datos = respuesta.datos;
          if (datos.length == 0) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );

            return;
          }

          arregloAtaudTemporal = datos;

          this.inventarioSeleccionado.forEach((elemento:any) => {
            arregloAtaudTemporal = arregloAtaudTemporal.filter((filtro:any) => {
              return filtro.idInventario != elemento;
            });
          });


          this.ataudesCompletos = arregloAtaudTemporal;
          if(this.ataudesCompletos.length == 0){
            const stockMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(15);
            this.alertaService.mostrar(TipoAlerta.Info,stockMsg || 'Ya no hay stock de este artículo.');
          }
          this.ataudes = mapearArregloTipoDropdown(
            arregloAtaudTemporal,
            'nombreArticulo',
            'idInventario'
          );
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          try {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(error.error.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          } catch (error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(187);
            this.alertaService.mostrar(
              TipoAlerta.Info,
              errorMsg || 'El servicio no responde, no permite más llamadas.'
            );
          }
        }
      );
  }

  selecionarAtaud(dd: Dropdown): void {
    this.concepto = dd.selectedOption.label;
    this.ataudesCompletos.forEach((datos: any) => {
      if (Number(datos.idInventario) == Number(dd.selectedOption.value)) {
        this.grupo = datos.grupo;
        this.costo = datos.precio;
        this.idArticulo = datos.idArticulo;
        this.idInventario = datos.idInventario;
        this.idCategoria = datos.idCategoria;
        this.idProveedor = datos.idProveedor;
      }
    });
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      ataud: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(null);
  }

  aceptarModal(): void {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    let salida = {
      cantidad: '1',
      concepto: this.concepto,
      coordOrigen: [],
      coordDestino: [],
      proveedor: null,
      fila: -1,
      grupo: this.grupo,
      idCategoria: this.idCategoria,
      idInventario: this.idInventario,
      idArticulo: this.idArticulo,
      idTipoServicio: null,
      idProveedor: this.idProveedor,
      totalPaquete: this.costo,
      importe: this.costo,
      esDonado: false,
      proviene: 'presupuesto',
    };

    console.log(salida);
    this.ref.close(salida);
  }

  get f() {
    return this.form.controls;
  }
}
