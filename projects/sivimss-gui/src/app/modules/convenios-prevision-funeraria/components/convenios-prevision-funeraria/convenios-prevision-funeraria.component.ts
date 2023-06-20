import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayPanel } from "primeng/overlaypanel";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { LazyLoadEvent } from "primeng/api";
import { ConveniosPrevisionFunerariaInterface } from "../../models/convenios-prevision-funeraria.interface";
import { BeneficiarioInterface } from "../../models/beneficiario.interface";
import { AfiliadoInterface } from "../../models/afiliado.interface";
import { VigenciaConvenioInterface } from "../../models/vigencia-convenio.interface";
import { FacturaConvenioInterface } from "../../models/factura-convenio.interface";
import { SinisestroInterface } from "../../models/sinisestro.interface";
import { finalize } from "rxjs/operators";
import { HttpErrorResponse } from "@angular/common/http";
import { ConsultaConveniosService } from '../../services/consulta-convenios.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { FiltrosConvenio } from '../../models/filtros-convenio.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {
  DetalleConvenioPrevisionFunerariaComponent
} from "../detalle-convenio-prevision-funeraria/detalle-convenio-prevision-funeraria.component";
import { Router } from '@angular/router';
import { validarAlMenosUnCampoConValor } from 'projects/sivimss-gui/src/app/utils/funciones';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';


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
  filtroSubForm!: FormGroup;

  numPaginaActual = {
    tablaConvenios: 0,
    tablaAfiliados: 0,
    tablaVigenciaConvenio: 0,
    tablaFacturaConvenio: 0,
    tablaBeneficiario: 0,
    tablaSiniestros: 0,
  };
  totalElementos = {
    tablaConvenios: 0,
    tablaAfiliados: 0,
    tablaVigenciaConvenio: 0,
    tablaFacturaConvenio: 0,
    tablaBeneficiario: 0,
    tablaSiniestros: 0,
  };
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;

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
  readonly ERROR_DESCARGA_ARCHIVO: string = "Error al guardar el archivo";

  detalleRef!: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private consultaConvenioService: ConsultaConveniosService,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    /*Cambiar la imagen de Administración de catálogos*/
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      folioConvenio: [{ value: null, disabled: false }, Validators.maxLength(12)],
      rfc: [{ value: null, disabled: false }, Validators.maxLength(13)],
      nombre: [{ value: null, disabled: false }, Validators.maxLength(75)],
      curp: [{ value: null, disabled: false }, Validators.maxLength(18)],
      estatusConvenio: [{ value: null, disabled: false }]
    });

    this.filtroSubForm = this.formBuilder.group({
      folioConvenio: [{ value: null, disabled: false }, Validators.maxLength(12)],
      rfc: [{ value: null, disabled: false }, Validators.maxLength(13)],
      folioConvenioVigencia: [{ value: null, disabled: false }, Validators.maxLength(12)],
      numeroFactura: [{ value: null, disabled: false }, Validators.maxLength(12)],
      nombreBeneficiario: [{ value: null, disabled: false }, Validators.maxLength(75)],
      folioSiniestro: [{ value: null, disabled: false }, Validators.maxLength(12)],
    })
  }

  paginarConvenios(): void {
    this.cargadorService.activar();
    // this.consultaConvenioService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
    this.consultaConvenioService.buscarPorPagina(0, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.convenioPrevision = respuesta.datos?.content;
          this.totalElementos.tablaConvenios = respuesta.datos?.totalElements;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  paginarConFiltros(): void {
    const filtros: FiltrosConvenio = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    // this.consultaConvenioService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
    this.consultaConvenioService.buscarPorFiltros(filtros, 0, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.convenioPrevision = respuesta.datos?.content;
          this.totalElementos.tablaConvenios = respuesta.datos?.totalElements;
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      });
  }

  crearSolicitudFiltros(): FiltrosConvenio {
    return {
      folioConvenio: this.filtroForm.get("folioConvenio")?.value,
      rfc: this.filtroForm.get("rfc")?.value,
      nombre: this.filtroForm.get("nombre")?.value,
      curp: this.filtroForm.get("curp")?.value,
      estatusConvenio: this.filtroForm.get("estatusConvenio")?.value
    }
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
          cantidadBeneficiarios: this.devolverBeneficiarios([{ nombre: "Juan" }]),
          situacion: "N/A",
          factura: "DOC-00001",
          importeConvenio: 50,
          estatus: 0,
          beneficiario: [
            {
              nombre: "Juan"
            }
          ]
        },
        {
          folioConvenio: "DOC-0000001",
          fechaContratacion: "01/01/2021",
          fechaVigenciaInicio: "01/01/2021",
          fechaVigenciaFin: "01/01/2022",
          cantidadBeneficiarios: this.devolverBeneficiarios([{ nombre: "Juan" }, { nombre: "Juan" }]),
          situacion: "N/A",
          factura: "DOC-00001",
          importeConvenio: 50,
          estatus: 1,
          beneficiario: [
            {
              nombre: "Juan"
            },
            {
              nombre: "Juan"
            }
          ]
        },
        {
          folioConvenio: "DOC-0000001",
          fechaContratacion: "01/01/2021",
          fechaVigenciaInicio: "01/01/2021",
          fechaVigenciaFin: "01/01/2022",
          cantidadBeneficiarios: this.devolverBeneficiarios([{ nombre: "Juan" }, { nombre: "Juan" }, { nombre: "Juan" }]),
          situacion: "N/A",
          factura: "DOC-00001",
          importeConvenio: 50,
          estatus: 2,
          beneficiario: [
            {
              nombre: "Juan"
            },
            {
              nombre: "Juan"
            },
            {
              nombre: "Juan"
            }
          ]
        }
      ];
      this.datosAfiliado = [
        {
          rfc: "VEVIAA84751T7",
          velatorio: 1,
          descVelatorio: "No. 01 Doctores",
          afiliado: "Joel Durán Mendoza",
          rfcTitular: "DUMEJO8475T7",
          edad: 34,
          fechaNacimiento: "01/01/2021",
          genero: "Masculuno",
          correoElectronico: "jodu87@gmail.com"
        },
        {
          rfc: "VEVIAA84751T7",
          velatorio: 1,
          descVelatorio: "No. 01 Doctores",
          afiliado: "Joel Durán Mendoza",
          rfcTitular: "DUMEJO8475T7",
          fechaNacimiento: "01/01/2021",
          edad: 34,
          genero: "Masculuno",
          correoElectronico: "jodu87@gmail.com"
        }
      ];
      this.vigenciaConvenio = [
        {
          convenio: "DOC-000001",
          fechaInicio: "01/01/2022",
          fechaFin: "01/01/2022",
          fechaRenovacion: "01/01/2022"
        },
        {
          convenio: "DOC-000001",
          fechaInicio: "01/01/2022",
          fechaFin: "01/01/2022",
          fechaRenovacion: "01/01/2022"
        }
      ];
      this.facturaConvenio = [
        {
          factura: "DOC-001",
          uuid: "ABC001",
          fecha: "01/01/2022",
          rfc: "ABC12345",
          cliente: "Genetics SA de CV",
          total: 220002,
          estatus: true
        },
        {
          factura: "DOC-001",
          uuid: "ABC001",
          fecha: "01/01/2022",
          rfc: "ABC12345",
          cliente: "Genetics SA de CV",
          total: 220002,
          estatus: false
        }
      ];
      this.beneficiario = [
        {
          nombre: "Sebastián",
          primerApellido: "Gómez",
          fecha: "01/01/2022",
          edad: 23,
          parentesco: 1,
          descParentesco: "Hijo"
        }
      ];
      this.siniestro = [
        {
          velatorio: 1,
          descVelatorio: "No. 01 Doctores",
          fechaSiniestro: "01/01/2022",
          folio: "DOC-0111",
          nota: "No existen notas previas",
          finado: "Angel",
          parentesco: 1,
          descPrentesco: "Abuelo",
          velatorioOringe: 2,
          descVelatorioOrigen: "No. 02 Malvin",
          importe: 6000
        }
      ];
      this.totalElementos.tablaConvenios = this.convenioPrevision.length;
    }, 0)


  }

  agregarConvenio(): void { }

  devolverBeneficiarios(beneficiario: BeneficiarioInterface[]): number {
    return beneficiario.length;
  }

  abrirModalDetalleConvenio(convenio: ConveniosPrevisionFunerariaInterface): void {
    this.detalleRef = this.dialogService.open(DetalleConvenioPrevisionFunerariaComponent, {
      header: "Detalle del convenio",
      width: "920px",
      data: convenio,
    })
  }

  buscar(): void {
    if (validarAlMenosUnCampoConValor(this.filtroForm.value)) {
      this.paginar_();
    } else {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Selecciona por favor un criterio de búsqueda.');
    }
  }

  paginar_(event?: LazyLoadEvent): void {
    if (event?.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual.tablaConvenios = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual.tablaConvenios = 0;
    }
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.consultaConvenioService.buscarPorFiltros(this.obtenerObjetoParaFiltrado(), this.numPaginaActual.tablaConvenios, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.convenioPrevision = respuesta.datos.content;
        this.totalElementos.tablaConvenios = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  obtenerObjetoParaFiltrado(): any {
    return {
      ...this.filtroForm.value,
    };
  }

  cancelar(): void {
    this.router.navigate(["/"]).then(() => { }).catch(() => { });
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  abrirPanel(event: MouseEvent, convenio: ConveniosPrevisionFunerariaInterface): void {
    this.convenioSeleccionado = convenio;
    this.overlayPanel.toggle(event);
  }

  get ff() {
    return this.filtroForm.controls;
  }

  get fsf() {
    return this.filtroSubForm.controls;
  }

  guardarListadoPagaresPDF() {
    this.cargadorService.activar();
    this.descargaArchivosService.descargarArchivo(this.consultaConvenioService.descargarListadoPagaresPDF()).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        console.log(respuesta)
      },
      error: (error: HttpErrorResponse) => {
        console.log(error)
      },
    });
  }

  guardarListadoPagaresExcel() {
    this.cargadorService.activar();
    const configuracionArchivo: OpcionesArchivos = { nombreArchivo: "reporte", ext: "xlsx" }
    this.descargaArchivosService.descargarArchivo(this.consultaConvenioService.descargarListadoPagaresExcel(),
      configuracionArchivo).pipe(
        finalize(() => this.cargadorService.desactivar())).subscribe({
          next: (respuesta: any) => {
            console.log(respuesta)
          },
          error: (error): void => {
            this.mensajesSistemaService.mostrarMensajeError(error.message, this.ERROR_DESCARGA_ARCHIVO);
            console.log(error)
          },
        })
  }

  realizarBusquedaSubForm(controlName: string) {
    this.fsf[controlName].patchValue(this.fsf[controlName].value.trim());
    if (this.fsf[controlName].value && this.fsf[controlName].value !== '') {
      switch (controlName) {
        case 'folioConvenio':
          break;
        case 'rfc':
          break;
        case 'folioConvenioVigencia':
          break;
        case 'numeroFactura':
          break;
        case 'nombreBeneficiario':
          break;
        case 'folioSiniestro':
          break;
        default:
          break;
      }
    }
  }

}
