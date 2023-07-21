import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { LazyLoadEvent, MenuItem } from "primeng/api";

import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { CATALOGOS_DUMMIES } from "../../../convenios-prevision-funeraria/constants/dummies";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { Convenio } from "../../models/convenio.interface";
import {
  ConveniosPrevisionFunerariaInterface
} from "../../../convenios-prevision-funeraria/models/convenios-prevision-funeraria.interface";
import { OverlayPanel } from "primeng/overlaypanel";
import { MENU_STEPPER } from '../../constants/menu-steppers';

@Component({
  selector: 'app-renovar-convenio-beneficiarios',
  templateUrl: './renovar-convenio-beneficiarios.component.html',
  styleUrls: ['./renovar-convenio-beneficiarios.component.scss']
})
export class RenovarConvenioBeneficiariosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  busquedaTipoConvenioForm!: FormGroup;
  resultadoBusquedaForm!: FormGroup;
  documentacionForm!: FormGroup;

  tipoConvenio: TipoDropdown[] = [
    { label: 'Plan anterior', value: '0' },
    { label: 'Plan nuevo', value: '1' },
  ];

  tipoPrevisionFuneraria: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoPaquete: TipoDropdown[] = CATALOGOS_DUMMIES;

  convenios: Convenio[] = [];
  convenio: Convenio = {};
  convenioSeleccionado!: ConveniosPrevisionFunerariaInterface;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFormBusquedaTipoConvenio();
    this.inicializarFormPlanAnterior();
    // this.inicializarDocumentacionForm();
  }

  actualizarBreadcrumb(): void {
    /*Cambiar la imagen de Administración de catálogos*/
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFormBusquedaTipoConvenio(): void {
    this.busquedaTipoConvenioForm = this.formBuilder.group({
      tipoConvenio: [{ value: true, disabled: false }, []],
      numConvenio: [{ value: null, disabled: false }, []],
      nombreContratante: [{ value: null, disabled: false }, []],
    });
  }

  inicializarFormPlanAnterior(): void {
    this.resultadoBusquedaForm = this.formBuilder.group({
      tipoPrevisionFuneraria: [{ value: null, disabled: true }, []],
      tipoPaquete: [{ value: null, disabled: true }, []],
      datosBancarios: [{ value: null, disabled: false }, []],
      costoRenovacion: [{ value: null, disabled: true }, []],
    });
  }

  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group({
      ineAfiliado: [{ value: null, disabled: false }, [Validators.required]],
      copiaCURP: [{ value: null, disabled: false }, [Validators.required]],
      copiaRFC: [{ value: null, disabled: false }, [Validators.required]],
      convenioAnterior: [{ value: null, disabled: false }, [Validators.required]],
      copiaActaNacimiento: [{ value: null, disabled: false }, [Validators.required]],
      copiaINE: [{ value: null, disabled: false }, [Validators.required]],
      comprobanteEstudios: [{ value: null, disabled: false }, [Validators.required]],
      actaMatrimonio: [{ value: null, disabled: false }, [Validators.required]],
      declaracionConcubinato: [{ value: null, disabled: false }, [Validators.required]]
    });
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.convenios = [
        {
          folioConvenio: "123456789",
          rfc: "12345678",
          numeroINE: 123456789,
          matriculaIMSS: 123456789,
          nombre: "Fransisco",
          primerApellido: "Napeles",
          segundoApellido: "Alucín",
          tipoPF: 1,
          descTipoPF: "Nuevo plan",
          tipoPaquete: 1,
          descTipoPaquete: "Paquete económico",
          estatusConvenio: true,
          cuotaRecuperacion: 5852.23,
          fechaInicioVigencia: "18/01/2023",
          fechaFinVigencia: "25/05/2023",
          calle: "Napoles",
          numeroInterior: "1",
          numeroExterior: "1",
          cp: 55998,
          estado: 1,
          descEstado: "Estado de México",
          municipio: "San Teodoro",
          telefonoContacto: 5621568456,
          correoElectronico: "napa_alucin@gmail.com",
          beneficiarios: 2,
        },
      ];
      this.totalElementos = this.convenios.length;
    }, 0)
  }
  abrirPanel(event: MouseEvent, convenio: ConveniosPrevisionFunerariaInterface): void {
    this.convenioSeleccionado = convenio;
    this.overlayPanel.toggle(event);
  }

  siguiente(): void {
    this.indice++;
  }

  regresar(): void {
    this.indice--;
  }

  get btcf() {
    return this.busquedaTipoConvenioForm.controls;
  }

  get rbf() {
    return this.resultadoBusquedaForm.controls;
  }
}
