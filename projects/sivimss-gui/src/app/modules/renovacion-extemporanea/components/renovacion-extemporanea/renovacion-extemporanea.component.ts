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
import { ConveniosPrevision, FiltrosConveniosPrevision } from 'projects/sivimss-gui/src/app/modules/renovacion-extemporanea/models/convenios-prevision.interface'
import { RenovacionExtemporaneaService } from '../../services/renovacion-extemporanea.service'
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface'
import { mapearArregloTipoDropdown, validarUsuarioLogueado } from 'projects/sivimss-gui/src/app/utils/funciones'
import { HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service'
import { UsuarioEnSesion } from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface'
import { finalize } from 'rxjs'
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service'

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
    private mensajesSistemaService: MensajesSistemaService,
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
      idDelegacion: new FormControl({ value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idOficina >= 2 }, []),
      idVelatorio: new FormControl({ value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idOficina === 3 }, []),
      numConvenio: new FormControl({ value: null, disabled: false }, []),
      folio: new FormControl({ value: null, disabled: false }, []),
      rfc: new FormControl({ value: null, disabled: false }, [Validators.maxLength(13)]),
    });
    this.obtenerVelatorios();
  }

  obtenerVelatorios() {
    this.renovacionExtemporaneaService.obtenerVelatoriosPorDelegacion(this.ff.idDelegacion.value).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
        this.conveniosPrevicion = [];
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginarConFiltros();
  }

  paginar(event: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
  }

  paginarConFiltros(): void {
    const filtros: FiltrosConveniosPrevision = this.crearSolicitudFiltrosPorNivel();
    if (filtros) {
      if (!Object.values(filtros).some(v => (v))) {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(22);
        this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
        return;
      }
      this.loaderService.activar();
      this.renovacionExtemporaneaService.buscarPorFiltros(this.numPaginaActual, this.cantElementosPorPagina, filtros)
        .pipe(finalize(() => this.loaderService.desactivar())).subscribe({
          next: (respuesta: HttpRespuesta<any>): void => {
            if (respuesta?.datos.length > 0) {
              this.conveniosPrevicion = respuesta.datos.content;
              this.totalElementos = respuesta.datos.totalElements;
            } else {
              const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(45);
              this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
            }
          },
          error: (error: HttpErrorResponse): void => {
            console.error(error);
          }
        });
    }
  }

  crearSolicitudFiltrosPorNivel(): FiltrosConveniosPrevision {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    switch (+usuario.idOficina) {
      case 1:
        return {
          idDelegacion: this.ff.idDelegacion.getRawValue() === '' ? null : this.ff.idDelegacion.getRawValue(),
          idVelatorio: this.ff.idVelatorio.getRawValue() === '' ? null : this.ff.idVelatorio.getRawValue(),
          numConvenio: this.ff.numConvenio.getRawValue() === '' ? null : this.ff.numConvenio.getRawValue(),
          folio: this.ff.folio.getRawValue() === '' ? null : this.ff.folio.getRawValue(),
          rfc: this.ff.rfc.getRawValue() === '' ? null : this.ff.rfc.getRawValue(),
        }
      case 2:
        return {
          idVelatorio: this.ff.idVelatorio.getRawValue() === '' ? null : this.ff.idVelatorio.getRawValue(),
          numConvenio: this.ff.numConvenio.getRawValue() === '' ? null : this.ff.numConvenio.getRawValue(),
          folio: this.ff.folio.getRawValue() === '' ? null : this.ff.folio.getRawValue(),
          rfc: this.ff.rfc.getRawValue() === '' ? null : this.ff.rfc.getRawValue(),
        }
      default:
        return {
          numConvenio: this.ff.numConvenio.getRawValue() === '' ? null : this.ff.numConvenio.getRawValue(),
          folio: this.ff.folio.getRawValue() === '' ? null : this.ff.folio.getRawValue(),
          rfc: this.ff.rfc.getRawValue() === '' ? null : this.ff.rfc.getRawValue(),
        }
    }
  }

  abrirModalDetalleRenovacion(servicio: ConveniosPrevision) {
    this.creacionRef = this.dialogService.open(DetalleRenovacionComponent, {
      header: 'Detalle',
      width: '920px',
      data: { servicio: servicio, origen: 'detalle' },
    });
  }

  abrirPanel(event: MouseEvent, convenioPrevisionSeleccionado: ConveniosPrevision): void {
    this.convenioSeleccionado = convenioPrevisionSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalHabilitarRenovacion(): void {
    if (!this.convenioSeleccionado.fallecido) {
      this.creacionRef = this.dialogService.open(HabilitarRenovacionComponent, {
        header: 'Convenio de Previsión Funeraria',
        width: '920px',
        data: { convenio: this.convenioSeleccionado, origen: 'agregar' },
      });

      this.creacionRef.onClose.subscribe((estatus: boolean) => {
        if (estatus) {
          this.paginarConFiltros();
        }
      });
    } else {
      this.mostrarModalTitularFallecido();
    }
  }

  mostrarModalTitularFallecido(): void {
    this.mostrarModaltitularFallecido = true;
  }

  limpiar(): void {
    this.filtroForm.reset();
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.filtroForm.get('nivel')?.patchValue(+usuario.idOficina);

    if (+usuario.idOficina >= 2) {
      this.filtroForm.get('idDelegacion')?.patchValue(+usuario.idDelegacion);
    }

    if (+usuario.idOficina === 3) {
      this.filtroForm.get('idVelatorio')?.patchValue(+usuario.idVelatorio);
    } else {
      this.catalogoVelatorios = [];
    }

    this.conveniosPrevicion = [];
    this.totalElementos = 0;
    this.numPaginaActual = 0;
  }

  get ff() {
    return this.filtroForm?.controls;
  }
}
