import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { MenuItem } from "primeng/api";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { CATALOGOS_DUMMIES } from "../../../convenios-prevision-funeraria/constants/dummies";
import {
  BuscarConvenioPlanAnterior,
  BuscarConvenioPlanNuevo,
  BusquedaConvenio,
  ObtenerCatalogo,
  RenovarPlan,
  VerificarDocumentacion
} from "../../models/convenio.interface";
import { MENU_STEPPER } from '../../constants/menu-steppers';
import { Router } from '@angular/router';
import { RenovarConvenioPfService } from '../../services/renovar-convenio-pf.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import * as moment from 'moment';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';

@Component({
  selector: 'app-renovar-convenio-pf',
  templateUrl: './renovar-convenio-pf.component.html',
  styleUrls: ['./renovar-convenio-pf.component.scss']
})
export class RenovarConvenioPfComponent implements OnInit {
  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  idValidacionDoc: number = 0;
  busquedaTipoConvenioForm!: FormGroup;
  resultadoBusquedaForm!: FormGroup;
  documentacionForm!: FormGroup;
  habilitarRenovacion: boolean = true;
  mostrarModalConfirmacion: boolean = false;
  mensajeBusqueda: string = "";

  tipoConvenio: TipoDropdown[] = [
    { label: 'Plan anterior', value: '0' },
    { label: 'Plan nuevo', value: '1' },
  ];

  estatusConvenio = ['Facturado', 'Facturado', 'Vigente'];

  tipoPrevisionFuneraria: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoPaquete: TipoDropdown[] = CATALOGOS_DUMMIES;
  convenio!: BusquedaConvenio | null;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private renovarConvenioPfService: RenovarConvenioPfService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFormBusquedaTipoConvenio();
    this.inicializarFormPlanAnterior();
    this.inicializarDocumentacionForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFormBusquedaTipoConvenio(): void {
    this.busquedaTipoConvenioForm = this.formBuilder.group({
      tipoConvenio: [{ value: true, disabled: false }, []],
      numConvenio: [{ value: null, disabled: false }, []],
      nombreContratante: [{ value: null, disabled: false }, []],
      folio: [{ value: null, disabled: false }, []],
      rfc: [{ value: null, disabled: false }, []],
    });
  }

  inicializarFormPlanAnterior(): void {
    this.resultadoBusquedaForm = this.formBuilder.group({
      tipoPrevision: [{ value: null, disabled: true }, []],
      tipoPaquete: [{ value: null, disabled: true }, []],
      datosBancarios: [{ value: null, disabled: false }, [Validators.maxLength(30)]],
      costoRenovacion: [{ value: null, disabled: true }, []],
    });
  }

  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group({
      ineAfiliado: [{ value: null, disabled: false }, []],
      curp: [{ value: null, disabled: false }, []],
      rfc: [{ value: null, disabled: false }, []],
      convenioAnterior: [{ value: null, disabled: false }, []],
      cartaPoder: [{ value: null, disabled: false }, []],
      ineTestigo: [{ value: null, disabled: false }, []],
    });
  }

  siguiente(): void {
    this.obtenerCatalogoDatosGrales();
  }

  aceptar(): void {
    void this.router.navigate([`/renovar-convenio-pf/beneficiarios/${this.convenio?.idConvenio}`],
      { queryParams: { folio: this.convenio?.folio } });
  }

  limpiar(): void {
    this.busquedaTipoConvenioForm.reset();
    this.btcf.tipoConvenio.setValue(true);
    this.convenio = null;
    this.resultadoBusquedaForm.reset();
  }

  regresar(): void {
    this.indice--;
  }

  guardar() {
    this.verificarDocumentacion();
  }

  verificarDocumentacion() {
    this.renovarConvenioPfService.verificarDocumentacion(this.datosVerificarDocumentacion()).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          this.renovarPlan();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.procesarErrorResponse(error);
      }
    });
  }

  renovarPlan() {
    this.renovarConvenioPfService.renovarPlan(this.datosRenovarPlan()).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos) { }
      },
      error: (error: HttpErrorResponse) => {
        this.procesarErrorResponse(error);
      }
    });
  }

  procesarErrorResponse(error: HttpErrorResponse) {
    console.error(error);
    let folio: string = '';
    if (this.convenio) {
      folio = this.convenio.tipoConvenioDesc === 'ConvenioNuevo' ? this.btcf.folio.value : this.btcf.numConvenio.value;
    }
    this.mensajesSistemaService.mostrarMensajeError(error, `Error al guardar la información. Intenta nuevamente del convenio con folio ${folio}`);
  }

  obtenerCatalogoDatosGrales() {
    if (this.convenio && this.convenio?.idConvenio) {
      this.renovarConvenioPfService.obtenerCatalogo(this.datosObtenerCatalogo(1, +this.convenio.idConvenio)).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos?.length > 0 && this.convenio) {
            this.convenio.velatorio = respuesta.datos[0].velatorio;
            this.idValidacionDoc = respuesta.datos[0].idValidacionDoc;
            this.convenio.fecha = moment().format('DD-MM-YYYY');
            this.convenio.datosBancarios = this.rbf.datosBancarios.value;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      }).add(() => {
        this.indice++;
        window.scrollTo(0, 0);
      });
    }
  }

  buscar(): void {
    if (this.btcf.tipoConvenio.value) {
      let datosPlanAnterior = this.datosPlanAnterior();
      if (validarAlMenosUnCampoConValor(datosPlanAnterior)) {
        this.buscarPlanAnterior(datosPlanAnterior);
      } else {
        this.mensajeBusqueda = `Selecciona por favor un criterio de búsqueda.`;
        this.mostrarModalConfirmacion = true;
      }
    } else {
      let datosPlanNuevo = this.datosPlanNuevo();
      if (validarAlMenosUnCampoConValor(datosPlanNuevo)) {
        this.buscarPlanNuevo(datosPlanNuevo);
      } else {
        this.mensajeBusqueda = `Selecciona por favor un criterio de búsqueda.`;
        this.mostrarModalConfirmacion = true;
      }
    }
  }

  buscarPlanNuevo(datosPlanNuevo: BuscarConvenioPlanNuevo) {
    this.loaderService.activar();
    this.renovarConvenioPfService.buscarConvenioPlanNuevo(datosPlanNuevo).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.loaderService.desactivar();
        this.convenio = null;
        if (respuesta.datos) {
          this.convenio = respuesta.datos;
          if (this.convenio) this.convenio.tipoConvenioDesc = 'ConvenioNuevo';
          this.resultadoBusquedaForm.patchValue({
            ...this.convenio
          });
        } else {
          if (respuesta.mensaje === '39' || respuesta.mensaje === '36') {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
            this.habilitarRenovacion = false;
          } else {
            this.mensajeBusqueda = `No se encontró información relacionada a tu búsqueda del convenio con folio ${datosPlanNuevo.folio || ''}`;
            this.mostrarModalConfirmacion = true;
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        // this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  buscarPlanAnterior(datosPlanAnterior: BuscarConvenioPlanAnterior) {
    this.loaderService.activar();
    this.renovarConvenioPfService.buscarConvenioPlanAnterior(datosPlanAnterior).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.loaderService.desactivar();
        this.convenio = null;
        if (respuesta.datos) {
          this.convenio = respuesta.datos;
          if (this.convenio) this.convenio.tipoConvenioDesc = 'ConvenioAnterior';
          this.resultadoBusquedaForm.patchValue({
            ...this.convenio
          });
        } else {
          if (respuesta.mensaje === '39' || respuesta.mensaje === '36') {
            const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
            this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
            this.habilitarRenovacion = false;
          } else {
            this.mensajeBusqueda = `No se encontró información relacionada a tu búsqueda del convenio con folio ${datosPlanAnterior.numeroConvenio || ''}`;
            this.mostrarModalConfirmacion = true;
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        // this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  datosRenovarPlan(): RenovarPlan {
    return {
      datosBancarios: this.convenio?.datosBancarios,
      idConvenioPf: this.convenio?.idConvenio,
      folio: this.convenio?.folio,
      vigencia: this.convenio?.fecVigencia,
      indRenovacion: this.convenio?.tipoConvenioDesc === 'ConvenioAnterior' ? 1 : 0,
    }
  }

  datosVerificarDocumentacion(): VerificarDocumentacion {
    return {
      idValidacionDoc: this.idValidacionDoc,
      ineAfiliado: this.df.ineAfiliado.value ? 1 : null,
      curp: this.df.curp.value ? 1 : null,
      rfc: this.df.rfc.value ? 1 : null,
      renovarDoc: {
        convenioAnterior: this.df.convenioAnterior.value ? 1 : null,
        cartaPoder: this.df.cartaPoder.value ? 1 : null,
        ineTestigo: this.df.ineTestigo.value ? 1 : null,
        ineTestigoDos: null,
      }
    }
  }

  datosObtenerCatalogo(idCatalogo: number, idConvenio: number): ObtenerCatalogo {
    return {
      idCatalogo,
      idConvenio,
    }
  }

  datosPlanNuevo(): BuscarConvenioPlanNuevo {
    return {
      folio: this.btcf.folio.value ? this.btcf.folio.value : null,
      rfc: this.btcf.rfc.value ? this.btcf.rfc.value : null,
    }
  }


  datosPlanAnterior(): BuscarConvenioPlanAnterior {
    return {
      numeroContratante: this.btcf.nombreContratante.value ? this.btcf.nombreContratante.value : null,
      numeroConvenio: this.btcf.numConvenio.value ? this.btcf.numConvenio.value : null,
    }
  }

  get btcf() {
    return this.busquedaTipoConvenioForm.controls;
  }

  get rbf() {
    return this.resultadoBusquedaForm.controls;
  }

  get df() {
    return this.documentacionForm.controls;
  }
}
