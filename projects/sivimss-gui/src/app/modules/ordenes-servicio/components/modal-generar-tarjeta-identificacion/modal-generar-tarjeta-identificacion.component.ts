import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { FormTarjetaIdentificacion } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/models/form-tarjeta-identificacion.enum";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {ConsultarOrdenServicioService} from "../../services/consultar-orden-servicio.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CatalogoOperadores} from "../../constants/catalogos.interface";
import {OrdenServicioPaginado} from "../../models/orden-servicio-paginado.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-modal-generar-tarjeta-identificacion',
  templateUrl: './modal-generar-tarjeta-identificacion.component.html',
  styleUrls: ['./modal-generar-tarjeta-identificacion.component.scss'],
  providers: [DescargaArchivosService]
})
export class ModalGenerarTarjetaIdentificacionComponent implements OnInit {
  readonly FormTarjetaIdentificacion = FormTarjetaIdentificacion;
  pasoForm: FormTarjetaIdentificacion = FormTarjetaIdentificacion.Seleccionar;
  dummy!: string;
  form!: FormGroup;

  operadores!: TipoDropdown[];
  ODSSeleccionada!:OrdenServicioPaginado;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private consultarOrdenServicioService: ConsultarOrdenServicioService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private descargaArchivosService: DescargaArchivosService,
  ) {
  }

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    // this.dummy = this.config.data.dummy;
    this.ODSSeleccionada = this.config.data.ods;
    this.consultarOperadores();
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      nombreOperador: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  consultarOperadores(): void {
    this.loaderService.activar();
    this.consultarOrdenServicioService.consultarOperadores().pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        this.operadores = respuesta.datos.map((operador:CatalogoOperadores) => (
          { label: operador.nombreOperador, value: operador.idOperador })) || [];
      },
      (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    )

  }

  mostrarConfirmacion() {
    this.pasoForm = FormTarjetaIdentificacion.Confirmar;
  }

  cancelarConfirmacion() {
    this.pasoForm = FormTarjetaIdentificacion.Seleccionar;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(false);
  }

  guardar() {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    const idODS:number = this.config.data.ods.idOrdenServicio
    this.consultarOrdenServicioService.generarArchivoTarjetaIdetificacion(this.f.nombreOperador.value.toString(),idODS).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, this.mensajesSistemaService.obtenerMensajeSistemaPorId(61));
        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          { type: this.descargaArchivosService.obtenerContentType(configuracionArchivo) });
        const url = window.URL.createObjectURL(file);
        window.open(url)


          this.ref.close(true);
      },
      (error:HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'El servicio no responde, no permite más llamadas.');
      }
    )
  }

  get f() {
    return this.form.controls;
  }

}
