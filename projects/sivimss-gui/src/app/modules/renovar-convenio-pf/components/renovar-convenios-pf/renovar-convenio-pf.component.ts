import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {LazyLoadEvent, MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../../convenios-prevision-funeraria/constants/menu-steppers";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../convenios-prevision-funeraria/constants/dummies";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {ConvenioInterface} from "../../models/convenio.interface";
import {
  ConveniosPrevisionFunerariaInterface
} from "../../../convenios-prevision-funeraria/models/convenios-prevision-funeraria.interface";
import {OverlayPanel} from "primeng/overlaypanel";

@Component({
  selector: 'app-renovar-convenio-pf',
  templateUrl: './renovar-convenio-pf.component.html',
  styleUrls: ['./renovar-convenio-pf.component.scss']
})
export class RenovarConvenioPfComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  tipoConvenioForm!: FormGroup;
  documentacionForm!: FormGroup;

  tipoConvenio: TipoDropdown[] = [
    { label: 'Plan anterior', value: '0' },
    { label: 'Plan nuevo', value: '1' },
  ];

  tipoPrevisionFuneraria: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoPaquete: TipoDropdown[] = CATALOGOS_DUMMIES;

  convenios:ConvenioInterface[] = [];
  convenioSeleccionado!: ConveniosPrevisionFunerariaInterface;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFormPlanAnterior();
    this.inicializarDocumentacionForm();
  }

  actualizarBreadcrumb(): void{
    /*Cambiar la imagen de Administración de catálogos*/
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFormPlanAnterior(): void {
    this.tipoConvenioForm = this.formBuilder.group({
      tipoConvenio: [{value: null, disabled: false}, [Validators.required]],
      tipoContratacion: [{value: null, disabled: false}, [Validators.required]],
      noConvenio: [{value: null, disabled: false}, [Validators.required]],
      numeroContratante:[{value: null, disabled: false}, [Validators.required]],
      tipoPrevisionFuneraria:[{value: null, disabled: false}, [Validators.required]],
      tipoPaquete:[{value: null, disabled: false}, [Validators.required]],
      datosBancarios:[{value: null, disabled: false}, [Validators.required]],
      costoRenovacion:[{value: null, disabled: false}, [Validators.required]],
    });
  }

  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group( {
      ineAfiliado: [{value: null, disabled: false}, [Validators.required]],
      copiaCURP: [{value: null, disabled: false}, [Validators.required]],
      copiaRFC: [{value: null, disabled: false}, [Validators.required]],
      convenioAnterior: [{value: null, disabled: false}, [Validators.required]],
      copiaActaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      copiaINE: [{value: null, disabled: false}, [Validators.required]],
      comprobanteEstudios: [{value: null, disabled: false}, [Validators.required]],
      actaMatrimonio: [{value: null, disabled: false}, [Validators.required]],
      declaracionConcubinato: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.convenios = [
        {
          folioConvenio:"123456789",
          rfc:"12345678",
          numeroINE:123456789,
          matriculaIMSS:123456789,
          nombre:"Fransisco",
          primerApellido:"Napeles",
          segundoApellido:"Alucín",
          tipoPF: 1,
          descTipoPF:"Nuevo plan",
          tipoPaquete:1,
          descTipoPaquete:"Paquete económico",
          estatusConvenio:true,
          cuotaRecuperacion:5852.23,
          fechaInicioVigencia:"18/01/2023",
          fechaFinVigencia:"25/05/2023",
          calle:"Napoles",
          numeroInterior:"1",
          numeroExterior:"1",
          cp:55998,
          estado:1,
          descEstado:"Estado de México",
          municipio:"San Teodoro",
          telefonoContacto:5621568456,
          correoElectronico:"napa_alucin@gmail.com",
          beneficiarios:2,
        },
      ];
      this.totalElementos = this.convenios.length;
    },0)
  }
  abrirPanel(event: MouseEvent, convenio: ConveniosPrevisionFunerariaInterface): void {
    this.convenioSeleccionado = convenio;
    this.overlayPanel.toggle(event);
  }

  siguiente(): void {
    this.indice ++;
  }

  regresar(): void {
    this.indice --;
  }

  get tcf(){
    return this.tipoConvenioForm.controls;
  }
}
