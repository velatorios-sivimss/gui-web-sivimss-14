import {Component, OnInit} from '@angular/core';
import {SERVICIO_BREADCRUMB_CANCELAR, SERVICIO_BREADCRUMB_CLEAR} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {ServiciosFunerariosService} from '../../services/servicios-funerarios.service';
import {finalize} from 'rxjs';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Persona} from "../../models/servicios-funerarios.interface";
import {
  ResponseBeneficiarioServicios,
  ResponseContratanteServicios,
  ResponsePlanServicios
} from "../../models/response-detalle-servicios.interface";

@Component({
  selector: 'app-cancelar-servicios-funerarios',
  templateUrl: './cancelar-servicios-funerarios.component.html',
  styleUrls: ['./cancelar-servicios-funerarios.component.scss']
})
export class CancelarServiciosFunerariosComponent implements OnInit {

  idPlanSfpa!: number;
  folioConvenio: string = "";
  nombreVelatorio: string = "";
  fecIngresa: string = "";

  promotorForm!: FormGroup;

  datosBeneficiario1!: ResponseBeneficiarioServicios;
  datosBeneficiario2!: ResponseBeneficiarioServicios;
  datosPlan!: ResponsePlanServicios;
  datosContratante!: ResponseContratanteServicios;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private serviciosFunerariosService: ServiciosFunerariosService,
  ) {
  }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.idPlanSfpa = +this.route.snapshot.queryParams.idPlanSfpa;
    this.consultarFormulario();
  }

  consultarFormulario(): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService.consultarPlanSFPA(this.idPlanSfpa).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.datosPlan = respuesta.datos.plan;
        this.datosContratante = respuesta.datos.contratante;
        this.datosBeneficiario1 = respuesta.datos.beneficiario1;
        this.datosBeneficiario2 = respuesta.datos.beneficiario2
        this.inicializarFormPromotor();
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  inicializarFormPromotor(): void {
    this.promotorForm = this.formBuilder.group({
      gestionadoPorPromotor: [{value: null, disabled: false}, []],
      promotor: [{value: null, disabled: false}, []],
    });
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CANCELAR);
  }

  aceptar(): void {
    this.cargadorService.activar();
    this.serviciosFunerariosService
      .cancelarPlanSfpa(+this.idPlanSfpa)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: () => this.procesarRespuestaCorrecta(),
        error: (error: HttpErrorResponse) => this.procesarRespuestaErronea(error),
      });
  }

  procesarRespuestaCorrecta(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Plan SFPA cancelado correctamente');
    void this.router.navigate(["servicios-funerarios"]);
  }

  procesarRespuestaErronea(error: HttpErrorResponse): void {
    this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje)
    );
  }

  cancelar(): void {
    void this.router.navigate(["servicios-funerarios"]);
  }

}
