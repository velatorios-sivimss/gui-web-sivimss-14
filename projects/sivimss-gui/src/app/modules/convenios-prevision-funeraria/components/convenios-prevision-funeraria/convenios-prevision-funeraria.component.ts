import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {LazyLoadEvent} from "primeng/api";
import {ConveniosPrevisionFunerariaInterface} from "../../models/convenios-prevision-funeraria.interface";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import {AfiliadoInterface} from "../../models/afiliado.interface";
import {VigenciaConvenioInterface} from "../../models/vigencia-convenio.interface";
import {FacturaConvenioInterface} from "../../models/factura-convenio.interface";
import {SinisestroInterface} from "../../models/sinisestro.interface";
import {
  DetalleConvenioPrevisionFunerariaComponent
} from "../detalle-convenio-prevision-funeraria/detalle-convenio-prevision-funeraria.component";


@Component({
  selector: 'app-convenios-prevision-funeraria',
  templateUrl: './convenios-prevision-funeraria.component.html',
  styleUrls: ['./convenios-prevision-funeraria.component.scss'],
  providers: [DialogService]
})
export class ConsultaConveniosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;


  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  estatusConvenio: TipoDropdown[] = [
    {
      value: 1,
      label: 'Vigente'
    },
    {
      value: 2,
      label: 'Renovación'
    },
    {
      value: 3,
      label: 'Cerrado'
    },
  ]

  convenioPrevision: ConveniosPrevisionFunerariaInterface[] = [];
  datosAfiliado: AfiliadoInterface[] = [];
  vigenciaConvenio: VigenciaConvenioInterface[] = [];
  facturaConvenio: FacturaConvenioInterface[] = [];
  beneficiario: BeneficiarioInterface[] = [];
  siniestro: SinisestroInterface[] = [];

  convenioSeleccionado: ConveniosPrevisionFunerariaInterface = {};

  detalleRef!: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void{
    /*Cambiar la imagen de Administración de catálogos*/
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {

    this.filtroForm = this.formBuilder.group({
      folioConvenio: [{value: null, disabled:false}],
      rfc: [{value: null, disabled:false}],
      nombre: [{value: null, disabled:false}],
      curp: [{value: null, disabled:false}],
      estatusConvenio: [{value: null, disabled:false}]
    });
  }

  paginar(event: LazyLoadEvent): void {
    console.log(event);
    setTimeout(() => {
      this.convenioPrevision = [
        {
          folioConvenio: "DOC-0000001",
          fechaContratacion: "01/01/2021",
          fechaVigenciaInicio: "01/01/2021",
          fechaVigenciaFin: "01/01/2022",
          cantidadBeneficiarios: this.devolverBeneficiarios( [{nombre:"Juan"}]),
          situacion: "N/A",
          factura:"DOC-00001",
          importeConvenio: 50,
          estatus:0,
          beneficiario:[
            {
              nombre:"Juan"
            }
          ]
        },
        {
          folioConvenio: "DOC-0000001",
          fechaContratacion: "01/01/2021",
          fechaVigenciaInicio: "01/01/2021",
          fechaVigenciaFin: "01/01/2022",
          cantidadBeneficiarios: this.devolverBeneficiarios( [{nombre:"Juan"},{nombre:"Juan"}]),
          situacion: "N/A",
          factura:"DOC-00001",
          importeConvenio: 50,
          estatus:1,
          beneficiario:[
            {
              nombre:"Juan"
            },
            {
              nombre:"Juan"
            }
          ]
        },
        {
          folioConvenio: "DOC-0000001",
          fechaContratacion: "01/01/2021",
          fechaVigenciaInicio: "01/01/2021",
          fechaVigenciaFin: "01/01/2022",
          cantidadBeneficiarios: this.devolverBeneficiarios( [{nombre:"Juan"},{nombre:"Juan"},{nombre:"Juan"}]),
          situacion: "N/A",
          factura:"DOC-00001",
          importeConvenio: 50,
          estatus:2,
          beneficiario:[
            {
              nombre:"Juan"
            },
            {
              nombre:"Juan"
            },
            {
              nombre:"Juan"
            }
          ]
        }
      ];
      this.datosAfiliado = [
        {
          rfc:"VEVIAA84751T7",
          velatorio:1,
          descVelatorio:"No. 01 Doctores",
          afiliado: "Joel Durán Mendoza",
          rfcTitular: "DUMEJO8475T7",
          edad:34,
          fechaNacimiento:"01/01/2021",
          genero:"Masculuno",
          correoElectronico:"jodu87@gmail.com"
        },
        {
          rfc:"VEVIAA84751T7",
          velatorio:1,
          descVelatorio:"No. 01 Doctores",
          afiliado: "Joel Durán Mendoza",
          rfcTitular: "DUMEJO8475T7",
          fechaNacimiento:"01/01/2021",
          edad:34,
          genero:"Masculuno",
          correoElectronico:"jodu87@gmail.com"
        }
      ];
      this.vigenciaConvenio = [
        {
          convenio:"DOC-000001",
          fechaInicio:"01/01/2022",
          fechaFin:"01/01/2022",
          fechaRenovacion:"01/01/2022"
        },
        {
          convenio:"DOC-000001",
          fechaInicio:"01/01/2022",
          fechaFin:"01/01/2022",
          fechaRenovacion:"01/01/2022"
        }
      ];
      this.facturaConvenio = [
        {
          factura:"DOC-001",
          uuid:"ABC001",
          fecha:"01/01/2022",
          rfc:"ABC12345",
          cliente: "Genetics SA de CV",
          total: 220002,
          estatus: true
        },
        {
          factura:"DOC-001",
          uuid:"ABC001",
          fecha:"01/01/2022",
          rfc:"ABC12345",
          cliente: "Genetics SA de CV",
          total: 220002,
          estatus: false
        }
      ];
      this.beneficiario = [
        {
          nombre: "Sebastián",
          primerApellido: "Gómez",
          fecha:"01/01/2022",
          edad: 23,
          parentesco: 1,
          descParentesco: "Hijo"
        }
      ];
      this.siniestro = [
        {
          velatorio: 1,
          descVelatorio: "No. 01 Doctores",
          fechaSiniestro:"01/01/2022",
          folio:"DOC-0111",
          nota:"No existen notas previas",
          finado:"Angel",
          parentesco: 1,
          descPrentesco:"Abuelo",
          velatorioOringe: 2,
          descVelatorioOrigen: "No. 02 Malvin",
          importe: 6000
        }
      ];
      this.totalElementos = this.convenioPrevision.length;
    },0)


  }

  agregarConvenio(): void {

  }

  devolverBeneficiarios(beneficiario: BeneficiarioInterface[]): number {
    return beneficiario.length;
  }

  abrirModalDetalleConvenio(convenio: ConveniosPrevisionFunerariaInterface): void {
    this.detalleRef = this.dialogService.open( DetalleConvenioPrevisionFunerariaComponent,{
      header:"Detalle del convenio",
      width:"920px",
      data: convenio,
    })
  }

  buscar(): void {

  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  abrirPanel(event:MouseEvent,convenio:ConveniosPrevisionFunerariaInterface):void{
    this.convenioSeleccionado = convenio;
    this.overlayPanel.toggle(event);
  }

  get ff(){
    return this.filtroForm.controls;
  }


}
