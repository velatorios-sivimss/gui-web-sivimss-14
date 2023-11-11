import {Component, EventEmitter, OnInit, Output, Renderer2} from '@angular/core';
import {GenerarOrdenServicioService} from "../../../services/generar-orden-servicio.service";
import {GestionarEtapasServiceSF} from "../../../services/gestionar-etapas.service-sf";
import {AltaODSSFInterface} from "../../../models/AltaODSSF.interface";
import {DropDownDetalleInterface} from "../../../models/drop-down-detalle.interface";
import * as moment from 'moment';
import {Etapa} from "../../../../../shared/etapas/models/etapa.interface";
import {EtapaEstado} from "../../../../../shared/etapas/models/etapa-estado.enum";
import {finalize} from "rxjs";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {OpcionesArchivos} from "../../../../../models/opciones-archivos.interface";
import {Router} from "@angular/router";

@Component({
  selector: 'app-detalle-orden-servicio',
  templateUrl: './detalle-orden-servicio.component.html',
  styleUrls: ['./detalle-orden-servicio.component.scss'],
  providers: [DescargaArchivosService]
})
export class DetalleOrdenServicioComponent implements OnInit {
  @Output()
  seleccionarEtapa: EventEmitter<any> = new EventEmitter<any>();
  altaODS: AltaODSSFInterface = {} as AltaODSSFInterface;
  dropDownODS: DropDownDetalleInterface = JSON.parse(localStorage.getItem("drop_down") as string)
  constructor(
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private gestionarEtapasService: GestionarEtapasServiceSF,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService,
    private renderer: Renderer2,
    private router: Router,
    private descargaArchivosService: DescargaArchivosService,
  ) { }

  ngOnInit(): void {
    this.gestionarEtapasService.altaODS$.asObservable().subscribe(
      (datodPrevios) => this.llenarAlta(datodPrevios)
    );
  }

  generada(): void {

  }

  preorden(): void{

  }

  guardarODS(): void {
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .generarODSSF(this.altaODS)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const datos = respuesta.datos;
          if (respuesta.error) {
            const errorMsg: string =
              this.mensajesSistemaService.obtenerMensajeSistemaPorId(
                parseInt(respuesta.mensaje)
              );
            this.alertaService.mostrar(
              TipoAlerta.Error,
              errorMsg || 'Error al guardar la información. Intenta nuevamente.'
            );

            return;
          }
          this.descargarOrdenServicio(respuesta.datos.idOrdenServicio, respuesta.datos.idEstatus);
          this.descargarEntradaDonaciones(respuesta.datos.idOrdenServicio, respuesta.datos.idEstatus);
          this.descargarControlSalidaDonaciones(respuesta.datos.idOrdenServicio, respuesta.datos.idEstatus);

          const ExitoMsg: string =
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(
              parseInt(respuesta.mensaje)
            );
          if (this.altaODS.idEstatus == 2) {
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
          this.router.navigate(["ordenes-de-servicio"]);
        },
        error: (error: HttpErrorResponse) => {
          try {
            const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
            this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
          } catch (error) {
            const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(5);
            this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
          }
        }
      });
  }

  descargarOrdenServicio(idOrdenServicio: number, idEstatus: number): void {
    this.loaderService.activar()
    const configuracionArchivo: OpcionesArchivos = {ext: 'pdf'};
    this.gestionarOrdenServicioService.generarArchivoOrdenServicio(
      idOrdenServicio, idEstatus
    ).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
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
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    } )
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
  regresar(): void {
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

  llenarAlta(datodPrevios: AltaODSSFInterface): void {
    this.altaODS = datodPrevios;
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
    console.log(this.altaODS.caracteristicasPresupuesto.caracteristicasPaquete?.detallePaquete)
    return this.altaODS.caracteristicasPresupuesto.caracteristicasPaquete?.detallePaquete
  }

}
