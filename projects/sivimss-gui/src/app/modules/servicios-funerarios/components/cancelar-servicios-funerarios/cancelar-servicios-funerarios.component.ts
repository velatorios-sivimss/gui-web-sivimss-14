import { Component, OnInit } from '@angular/core';
import { SERVICIO_BREADCRUMB_CANCELAR, SERVICIO_BREADCRUMB_CLEAR } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { ServiciosFunerariosService } from '../../services/servicios-funerarios.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cancelar-servicios-funerarios',
  templateUrl: './cancelar-servicios-funerarios.component.html',
  styleUrls: ['./cancelar-servicios-funerarios.component.scss']
})
export class CancelarServiciosFunerariosComponent implements OnInit {

  idPlanSfpa!: number;
  numConvenio?: string;
  dirVelatorio?: string;
  fecha?: string;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.idPlanSfpa = Number(this.route.snapshot.queryParams.idPlanSfpa);
    this.consultarFormulario();
  }

  consultarFormulario(): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarPlanSFPA(this.idPlanSfpa).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        console.log(respuesta.datos);
        
        // this.folioConvenio = respuesta.datos.numFolioPlanSFPA;
        // this.nombreVelatorio = respuesta.datos.desIdVelatorio;
        // this.fecIngresa = respuesta.datos.fecIngreso;

        // this.obtenerPromotores();
        // this.inicializarFormPromotor();
        // this.inicializarFormDatosTitular(respuesta.datos);
        // this.inicializarFormDatosTitularSubstituto(respuesta.datos ? respuesta.datos : null);
        // this.inicializarFormDatosBeneficiario1(respuesta.datos ? respuesta.datos : null);
        // this.inicializarFormDatosBeneficiario2(respuesta.datos ? respuesta.datos : null);
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CANCELAR);
  }

  aceptar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA cancelardo correctamente');
    this.router.navigate(["servicios-funerarios"]);
  }

  cancelar(): void {
    this.router.navigate(["servicios-funerarios"]);
  }

}
