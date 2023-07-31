import { HabilitarRenovacionComponent } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/components/habilitar-renovacion/habilitar-renovacion.component'
import { DetalleRenovacionComponent } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/components/detalle-renovacion/detalle-renovacion.component'
import { Component, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { LazyLoadEvent } from 'primeng/api'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { OverlayPanel } from 'primeng/overlaypanel'
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown'
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service'
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service'
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes'
import { CATALOGOS_DUMMIES } from 'projects/sivimss-gui/src/app/modules/proveedores/constants/dummies'
import { ConveniosPrevision } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/models/convenios-prevision.interface'
import { RenovacionExtemporaneaService } from '../../services/renovacion-extemporanea.service'
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface'
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones'
import { HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service'

@Component({
  selector: 'app-renovacion-extemporanea',
  templateUrl: './renovacion-extemporanea.component.html',
  styleUrls: ['./renovacion-extemporanea.component.scss'],
  providers: [DialogService],
})
export class RenovacionExtemporaneaComponent implements OnInit {
  readonly POSICION_CATALOGO_NIVELES = 0;
  readonly POSICION_CATALOGO_DELEGACION = 1;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  filtroForm!: FormGroup;
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  conveniosPrevicion: ConveniosPrevision[] = [];
  convenioSeleccionado: ConveniosPrevision = {};
  creacionRef!: DynamicDialogRef;
  habilitarRenovacionConvenio!: ConveniosPrevision;
  mostrarModaltitularFallecido: boolean = false;

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;

  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private renovacionExtemporaneaService: RenovacionExtemporaneaService,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION];
    this.inicializarFiltroForm();
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: new FormControl({ value: +this.rolLocalStorage.idOficina || null, disabled: +this.rolLocalStorage.idOficina >= 1 }, []),
      delegacion: new FormControl({ value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idOficina >= 2 }, []),
      velatorio: new FormControl({ value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idOficina === 3 }, []),
      numeroConvenio: new FormControl({ value: null, disabled: false }, []),
      folioConvenio: new FormControl({ value: null, disabled: false }, []),
      rfcAfiliado: new FormControl({ value: null, disabled: false }, [Validators.maxLength(13)]),
    });
    this.obtenerVelatorios();
  }

  obtenerVelatorios() {
    this.renovacionExtemporaneaService.obtenerVelatoriosPorDelegacion(this.ff.delegacion.value).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
        this.conveniosPrevicion = [];
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  abrirPanel(event: MouseEvent, convenioPrevisionSeleccionado: any): void {
    this.overlayPanel.toggle(event);
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.conveniosPrevicion = [
        {
          id: 1,
          folioConvenio: 'DOC-000001',
          rfc: 'Convenio de prueba ',
          nombre: 'Tamara',
          primerApellido: 'Sanchez',
          segundoApellido: 'Prado',
          velatorioOrigen: 'No. 18 Tequesquináhuac',
          tipoPrevencionFuneraria: 'Previsión funeraria plan anterior',
          tipoPaquete: 'Paquete básico ',
          fechaInicioVigencia: '01/01/2021 ',
          fechaFinVigencia: '01/01/2021 ',
          numeroINE: '1029384756 ',
          beneficiarios: 'Mercedes Zavaleta Beluga',
          telefonoContacto: '55 1423 7089  ',
          correoElectronico: 'tamara10298@gmail.com ',
          cuotaRecuperacion: '$ 54,000.00 ',
          estatus: true,
        },
        {
          id: 2,
          folioConvenio: 'DOC-000001',
          rfc: 'TASASL12107034Y',
          nombre: 'Tamara',
          primerApellido: 'Sanchez',
          segundoApellido: 'Prado',
          velatorioOrigen: 'No. 18 Tequesquináhuac',
          tipoPrevencionFuneraria: 'Previsión funeraria plan anterior',
          tipoPaquete: 'Paquete básico ',
          fechaInicioVigencia: '01/01/2021 ',
          fechaFinVigencia: '01/01/2021 ',
          numeroINE: '1029384756 ',
          beneficiarios: 'Mercedes Zavaleta Beluga',
          telefonoContacto: '55 1423 7089  ',
          correoElectronico: 'tamara10298@gmail.com ',
          cuotaRecuperacion: '$ 54,000.00 ',
          estatus: true,
        },
        {
          id: 3,
          folioConvenio: 'Convenio de prueba ',
          rfc: 'Convenio de prueba ',
          nombre: 'Convenio de prueba ',
          primerApellido: 'Convenio de prueba ',
          segundoApellido: 'Convenio de prueba ',
          velatorioOrigen: 'Convenio de prueba ',
          tipoPrevencionFuneraria: 'Convenio de prueba ',
          tipoPaquete: 'Convenio de prueba ',
          fechaInicioVigencia: 'Convenio de prueba ',
          fechaFinVigencia: 'Convenio de prueba ',
          numeroINE: 'Convenio de prueba ',
          beneficiarios: 'Convenio de prueba ',
          telefonoContacto: 'Convenio de prueba ',
          correoElectronico: 'Convenio de prueba ',
          cuotaRecuperacion: 'Convenio de prueba ',
          estatus: false,
        },
      ]
      this.totalElementos = this.conveniosPrevicion.length
    }, 0);
  }

  abrirModalDetalleRenovacion(servicio: ConveniosPrevision) {
    this.creacionRef = this.dialogService.open(DetalleRenovacionComponent, {
      header: 'Detalle',
      width: '920px',
      data: { servicio: servicio, origen: 'detalle' },
    });
  }

  enviarConvenioSeleccionado(convenio: ConveniosPrevision) {
    convenio = this.habilitarRenovacionConvenio;
  }

  abrirModalHabilitarRenovacion(): void {
    this.creacionRef = this.dialogService.open(HabilitarRenovacionComponent, {
      header: 'Convenio de Previsión Funeraria',
      width: '920px',
      data: { servicio: this.convenioSeleccionado, origen: 'agregar' },
    });

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.alertaService.mostrar(
          TipoAlerta.Exito,
          'Renovacion habilitada correctamente',
        );
      }
    });
  }

  mostrarModalTitularFallecido(): void {
    this.mostrarModaltitularFallecido = true;
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get ff() {
    return this.filtroForm?.controls;
  }
}
