import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { BusquedaEstatusOrdenesService } from '../../services/busqueda-estatus-ordenes.service';
import { DatosGeneralesOrden } from '../../models/DatosGeneralesOrden';
import { ServiciosOrdenes } from '../../models/ServiciosOrdenes';


@Component({
  selector: 'app-mi-orden-servicio',
  templateUrl: './mi-orden-servicio.component.html',
  styleUrls: ['./mi-orden-servicio.component.scss'],
})
export class MiOrdenServicioComponent implements OnInit {
  idOds:number=0;
  datosGenerales:DatosGeneralesOrden={} as DatosGeneralesOrden;

  errorSolicitud: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';
  servicios: ServiciosOrdenes [] = [];
  constructor(
    private readonly activatedRoute: ActivatedRoute, 
    private consultarDetalleService:BusquedaEstatusOrdenesService,
    private alertaService: AlertaService,
    private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.idOds= this.activatedRoute.snapshot.queryParams.idOds;
    console.log(this.idOds)
    this.detalleConvenio();
  }

  detalleConvenio():void {
    this.consultarDetalleService
    .detalleOrden(this.idOds)
    .pipe(finalize(() => this.loaderService.desactivar()))
    .subscribe({
      next:(respuesta:HttpRespuesta<any>) => {
        if (respuesta.error!==false && respuesta.mensaje!=="Exito") {
          this.alertaService.mostrar(TipoAlerta.Error,this.errorSolicitud);
          return;
        }
        try {
          this.datosGenerales= respuesta.datos[0] || {};
          this.servicios= respuesta.datos[0].historialDetalle || [];
         
        } catch (error) {
          console.error(error);
        }
      },error:(error:HttpErrorResponse)=>{
        this.alertaService.mostrar(TipoAlerta.Error,this.errorSolicitud);
      }
    });
  }
}
