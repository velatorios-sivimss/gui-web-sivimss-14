import { Component, OnInit } from '@angular/core';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { Router } from '@angular/router';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';

import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { BusquedaOrdenes } from './models/BusquedaOrdenes';
import { BusquedaEstatusOrdenesService } from './services/busqueda-estatus-ordenes.service';
import { LazyLoadEvent } from 'primeng/api';

@Component({
  selector: 'app-consulta-estatus-orden-servicio',
  templateUrl: './consulta-estatus-orden-servicio.component.html',
  styleUrls: ['./consulta-estatus-orden-servicio.component.scss'],
})
export class ConsultaEstatusOrdenServicioComponent implements OnInit {
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  ordenesServicios:BusquedaOrdenes[]=[];
  itemsOrdenes!:BusquedaOrdenes;
  errorSolicitud: string =
    'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.';
  totalElementos: number = this.ordenesServicios.length;
  mostrarModalFaltaOrdenes: boolean = false;
  constructor(
    private consultarOrdenesService:BusquedaEstatusOrdenesService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private router: Router) { }

  ngOnInit(): void {
    this.busqueda();
  }

  busqueda():void{
    const valores = {
      pagina: this.numPaginaActual,
      tamanio: this.cantElementosPorPagina,
    };

    this.consultarOrdenesService.consultarOrdenes(valores)
    .pipe(finalize(()=>this.loaderService.desactivar()))
    .subscribe({
      next:(respuesta:HttpRespuesta<any>)=>{
        console.log(respuesta);
        if (respuesta.error!==false && respuesta.mensaje!=="Exito") {
          this.alertaService.mostrar(TipoAlerta.Error,this.errorSolicitud);
          return;
        }

        let total=respuesta.datos.length;

        if (total==0 || respuesta.datos.length===null) {
          this.mostrarModalFaltaOrdenes=true;
          return;
        }

        this.ordenesServicios=respuesta.datos.content || [];
        this.totalElementos= respuesta.datos.totalElements || 0;
      },
      error:(error:HttpErrorResponse)=>{
        this.alertaService.mostrar(TipoAlerta.Error,this.errorSolicitud);
      }
    })
  }

  verDetalleOrden(idOrden:number): void {
    void this.router.navigate(
      [
        'externo-privado/consultar-el-estatus-de-mi-orden-de-servicio/mi-orden-de-servicio',
      ],
      {
        queryParams: { idOds: idOrden },
      }
    );
  }

  paginar(event?: LazyLoadEvent): void{
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1))
    } else {
      this.numPaginaActual = 0;
    }
    this.busqueda();
  }

}
