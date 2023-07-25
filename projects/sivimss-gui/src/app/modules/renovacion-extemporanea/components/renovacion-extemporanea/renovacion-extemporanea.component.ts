import { HabilitarRenovacionComponent } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/components/habilitar-renovacion/habilitar-renovacion.component'
import { DetalleRenovacionComponent } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/components/detalle-renovacion/detalle-renovacion.component'
import { Component, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
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

@Component({
  selector: 'app-renovacion-extemporanea',
  templateUrl: './renovacion-extemporanea.component.html',
  styleUrls: ['./renovacion-extemporanea.component.scss'],
  providers: [DialogService],
})
export class RenovacionExtemporaneaComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  filtroForm!: FormGroup;
  conveniosPrevicion: ConveniosPrevision[] = [];
  convenioSeleccionado: ConveniosPrevision = {};
  creacionRef!: DynamicDialogRef;
  habilitarRenovacionConvenio!: ConveniosPrevision;
  mostrarModaltitularFallecido: boolean = false;

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;
  niveles: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.inicializarFiltroForm();
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      velatorio: [{ value: null, disabled: false }, [Validators.required]],
      numeroConvenio: [{ value: null, disabled: false }, [Validators.required]],
      folioConvenio: [{ value: null, disabled: false }, [Validators.required]],
      rfcAfiliado: [{ value: null, disabled: false }, [Validators.required]],
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

  consultaServicioEspecifico(): string {
    return '';
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get f() {
    return this.filtroForm?.controls;
  }
}
