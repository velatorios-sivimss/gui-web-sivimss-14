import {Component, OnInit} from '@angular/core';
import {SERVICIO_BREADCRUMB_CANCELAR, SERVICIO_BREADCRUMB_CLEAR} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {ServiciosFunerariosService} from '../../services/servicios-funerarios.service';
import {finalize} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  ResponseBeneficiarioServicios, ResponseContratanteServicios,
  ResponsePlanServicios
} from "../../models/response-detalle-servicios.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

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
  datosSustituto!: any;

  readonly POSICION_CONSULTA: number = 0;
  readonly POSICION_ESTADOS: number = 1;
  readonly POSICION_PAISES: number = 2;

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
    this.inicializarFormPromotor();
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_CLEAR);
    this.idPlanSfpa = +this.route.snapshot.queryParams.idPlanSfpa;
    this.consultarFormulario();
  }

  consultarFormulario(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    const consulta = respuesta[this.POSICION_CONSULTA];
    this.datosPlan = consulta.datos.plan;
    this.datosContratante = consulta.datos.contratante;
    this.datosBeneficiario1 = consulta.datos.beneficiario1;
    this.datosBeneficiario2 = consulta.datos.beneficiario2
    this.datosSustituto = consulta.datos.sustituto ? consulta.datos.sustituto : consulta.datos.contratante;
    this.rellenarDatosLugarNacimiento();
    this.rellenarDatosPaisNacimiento();
  }

  rellenarDatosLugarNacimiento(): void {
    const estados: TipoDropdown[] = this.route.snapshot.data['respuesta'][this.POSICION_ESTADOS];
    const idEstadoContratante: number = this.datosContratante.idEstado;
    const idEstadoSustituto: number = this.datosSustituto.idEstado;
    const idBeneficiario1: number = this.datosBeneficiario1 ? this.datosBeneficiario1.idEstado : 0;
    const idBeneficiario2: number = this.datosBeneficiario2 ? this.datosBeneficiario2.idEstado : 0;
    if (idEstadoContratante !== 0) {
      this.datosContratante.estado = estados.find((estado) => estado.value === idEstadoContratante)?.label || '';
    }
    if (idEstadoSustituto !== 0) {
      this.datosSustituto.estado = estados.find((estado) => estado.value === idEstadoSustituto)?.label || '';
    }
    if (idBeneficiario1 !== 0) {
      this.datosBeneficiario1.estado = estados.find((estado) => estado.value === idBeneficiario1)?.label || '';
    }
    if (idBeneficiario2 !== 0) {
      this.datosBeneficiario2.estado = estados.find((estado) => estado.value === idBeneficiario2)?.label || '';
    }
  }

  rellenarDatosPaisNacimiento(): void {
    const paises: TipoDropdown[] = this.route.snapshot.data['respuesta'][this.POSICION_PAISES];
    const idPaisContratante: number = this.datosContratante.idPais;
    const idPaisSustituto: number = this.datosSustituto.idPais;
    const idBeneficiario1: number = this.datosBeneficiario1 ? this.datosBeneficiario1.idPais : 0;
    const idBeneficiario2: number = this.datosBeneficiario2 ? this.datosBeneficiario2.idPais : 0;
    if (idPaisContratante !== 0) {
      this.datosContratante.pais = paises.find((pais) => pais.value === idPaisContratante)?.label || '';
    }
    if (idPaisSustituto !== 0) {
      this.datosSustituto.pais = paises.find((pais) => pais.value === idPaisSustituto)?.label || '';
    }
    if (idBeneficiario1 !== 0) {
      this.datosBeneficiario1.pais = paises.find((pais) => pais.value === idBeneficiario1)?.label || '';
    }
    if (idBeneficiario2 !== 0) {
      this.datosBeneficiario2.pais = paises.find((pais) => pais.value === idBeneficiario2)?.label || '';
    }
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
