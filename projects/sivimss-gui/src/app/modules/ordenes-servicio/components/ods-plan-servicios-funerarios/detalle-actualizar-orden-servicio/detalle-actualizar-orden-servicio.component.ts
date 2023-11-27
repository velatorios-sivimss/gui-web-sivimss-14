import {Component, EventEmitter, OnInit, Output, Renderer2} from '@angular/core';
import {AltaODSSFInterface} from "../../../models/AltaODSSF.interface";
import {DropDownDetalleInterface} from "../../../models/drop-down-detalle.interface";
import {GenerarOrdenServicioService} from "../../../services/generar-orden-servicio.service";
import {AltaODSInterface} from "../../../models/AltaODS.interface";
import {GestionarEtapasActualizacionSFService} from "../../../services/gestionar-etapas-actualizacion-sf.service";
import * as moment from "moment/moment";
import {Etapa} from "../../../../../shared/etapas/models/etapa.interface";
import {EtapaEstado} from "../../../../../shared/etapas/models/etapa-estado.enum";
import {finalize} from "rxjs";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {ActualizarOrdenServicioService} from "../../../services/actualizar-orden-servicio.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {Router} from "@angular/router";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";

@Component({
  selector: 'app-detalle-actualizar-orden-servicio',
  templateUrl: './detalle-actualizar-orden-servicio.component.html',
  styleUrls: ['./detalle-actualizar-orden-servicio.component.scss'],
  providers: [DescargaArchivosService]
})
export class DetalleActualizarOrdenServicioComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<any> = new EventEmitter<any>();
  altaODS: AltaODSInterface = {} as AltaODSInterface;
  dropDownODS: DropDownDetalleInterface = JSON.parse(localStorage.getItem("drop_down") as string);
  tipoOrden: number = 0;
  constructor(
    private gestionarEtapasService: GestionarEtapasActualizacionSFService,
    private gestionarOrdenServicioService: ActualizarOrdenServicioService,
    private generarODSSF: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
    private router: Router,
    private renderer: Renderer2,
    private descargaArchivosService: DescargaArchivosService,
  ) { }

  ngOnInit(): void {
    this.gestionarEtapasService.altaODS$
      .asObservable()
      .subscribe((datodPrevios) => this.llenarAlta(datodPrevios));
    this.dropDownODS.tablaPaquete.map((valor:any) => {
      if(valor.utilizarArticulo == true){
        valor.utilizarArticulo = valor.utilizarArticulo.toString();
      }
    })
  }

  llenarAlta(datodPrevios: AltaODSInterface): void {
    this.altaODS = datodPrevios;
    this.tipoOrden = Number(this.altaODS.finado.idTipoOrden);
  }
  consultarNacionalidad(idPais: any): string {
    return idPais ? "Extranjera" : "Mexicana"
  }
  consultarSexo(sexo: any): string {
    const desSexo: string[] = ["Femenino","Masculino","Otro"];
    return desSexo[+sexo - 1]
  }
  consultarEdad(edad: any): string {
    return moment().diff(moment(edad),'years').toString()
  }
  consultaCaracPresupuesto(): any {
    return this.altaODS.caracteristicasPresupuesto.caracteristicasPaquete?.detallePaquete
  }
  regresar() {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: 'solid',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Completado,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Completado,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: true,
          estilo: 'dashed',
        },
      },
      {
        idEtapa: 3,
        estado: EtapaEstado.Activo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: 'dashed',
        },
        lineaDerecha: {
          mostrar: false,
          estilo: 'solid',
        },
      },
    ];
    window.scrollTo(0, 0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit({idEtapaSeleccionada:3, detalle_orden_servicio: true});
  }

  guardarODS(consumoTablas: number): void {
    let tipoServicio = this.gestionarOrdenServicioService.actualizarODS;
    this.loaderService.activar();
    this.generarODSSF.actualizarODSSF(this.altaODS)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe(
        {
          next: (respuesta: HttpRespuesta<any>) => {
            const datos = respuesta.datos;
            if (respuesta.error) {
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
            this.descargarEntradaDonaciones(respuesta.datos.idOrdenServicio, respuesta.datos.idEstatus);
            this.descargarControlSalidaDonaciones(respuesta.datos.idOrdenServicio, respuesta.datos.idEstatus);
            this.descargarOrdenServicio(
              respuesta.datos.idOrdenServicio,
              respuesta.datos.idEstatus
            );


            if (this.altaODS.idEstatus == 2) {
              const ExitoMsg: string =
                this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                  parseInt(respuesta.mensaje)
                );
              this.alertaService.mostrar(
                TipoAlerta.Exito,
                ExitoMsg || 'La Orden de Servicio se ha generado exitosamente.'
              );
            } else {
              this.alertaService.mostrar(
                TipoAlerta.Exito,
                'Se ha guardado exitosamente la pre-orden.El contratante debe acudir al Velatorio correspondiente para concluir con la contratación del servicio.'
              );
            }


            void this.router.navigate(['ordenes-de-servicio']);
          },
          error: (error: HttpErrorResponse) => {
            try {
              const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
              this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
            } catch (error) {
              const errorMsg: string =
                this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
              this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
            }
          }
        }
      );
  }
  descargarEntradaDonaciones(idODS: number, idEstatus: number): void {
    const configuracionArchivo: OpcionesArchivos = {ext: 'pdf'};
    this.gestionarOrdenServicioService.generarArchivoEntradaDonaciones(idODS,idEstatus).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download', 'documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      error:(error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    });

  }
  descargarControlSalidaDonaciones(idODS: number, idEstatus: number): void {
    const configuracionArchivo: OpcionesArchivos = {ext: 'pdf'};
    this.gestionarOrdenServicioService.generarArchivoSalidaDonaciones(idODS,idEstatus).subscribe({
      next:(respuesta: HttpRespuesta<any>) => {
        let link = this.renderer.createElement('a');

        const file = new Blob(
          [this.descargaArchivosService.base64_2Blob(
            respuesta.datos,
            this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
          {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
        const url = window.URL.createObjectURL(file);
        link.setAttribute('download', 'documento');
        link.setAttribute('href', url);
        link.click();
        link.remove();
      },
      error:(error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    });
  }
  descargarOrdenServicio(idOrdenServicio: number, idEstatus: number): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {ext: 'pdf'};
    this.gestionarOrdenServicioService
      .generarArchivoOrdenServicio(idOrdenServicio, idEstatus)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          let link = this.renderer.createElement('a');

          const file = new Blob(
            [
              this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(
                  configuracionArchivo
                )
              ),
            ],
            {
              type: this.descargaArchivosService.obtenerContentType(
                configuracionArchivo
              ),
            }
          );
          const url = window.URL.createObjectURL(file);
          link.setAttribute('download', 'documento');
          link.setAttribute('href', url);
          link.click();
          link.remove();
        },
        error: (error: HttpErrorResponse) => {
          const errorMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(error.error.mensaje)
            );
          this.alertaService.mostrar(
            TipoAlerta.Error,
            errorMsg || 'Error en la descarga del documento.Intenta nuevamente.'
          );
        }
      });
  }

  parseBooleanToString(valor: any): any {
    return valor.toLowerCase() === "true"
  }

}
