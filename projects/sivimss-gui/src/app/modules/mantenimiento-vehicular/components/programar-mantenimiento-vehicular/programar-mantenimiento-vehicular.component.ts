import {Component, OnInit, ViewChild} from '@angular/core'
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes'
import {Vehiculos} from '../../models/vehiculos.interface'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {CATALOGOS_DUMMIES} from '../../../inventario-vehicular/constants/dummies'
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown'
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service'
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service'
import {ActivatedRoute, Router} from '@angular/router'
import {NuevaVerificacionComponent} from '../nueva-verificacion/nueva-verificacion/nueva-verificacion.component'
import {
  RegistroMantenimientoComponent
} from '../registro-mantenimiento/registro-mantenimiento/registro-mantenimiento.component'
import {
  DetalleRegistroMantenimientoComponent
} from '../registro-mantenimiento/detalle-registro-mantenimiento/detalle-registro-mantenimiento.component'
import {
  SolicitudMantenimientoComponent
} from '../solicitud-mantenimiento/solicitud-mantenimiento/solicitud-mantenimiento.component'
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MantenimientoVehicularService} from "../../services/mantenimiento-vehicular.service";
import {MANTENIMIENTO_VEHICULAR_BREADCRUMB} from "../../constants/breadcrumb";
import {FiltrosMantenimientoVehicular} from "../../models/filtrosMantenimientoVehicular.interface";
import {VehiculoTemp} from "../../models/vehiculo-temp.interface";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {OverlayPanel} from "primeng/overlaypanel";
import {LazyLoadEvent} from "primeng/api";

@Component({
  selector: 'app-programar-mantenimiento-vehicular',
  templateUrl: './programar-mantenimiento-vehicular.component.html',
  styleUrls: ['./programar-mantenimiento-vehicular.component.scss'],
  providers: [DialogService]
})
export class ProgramarMantenimientoVehicularComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  numPaginaActual: number = 0
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA
  totalElementos: number = 0

  vehiculos: Vehiculos[] = []
  vehiculoSeleccionado!: VehiculoTemp;

  filtroForm!: FormGroup

  paginacionConFiltrado: boolean = false;

  creacionRef!: DynamicDialogRef
  detalleRef!: DynamicDialogRef
  modificacionRef!: DynamicDialogRef

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES

  modificarModal: boolean = false;

  readonly POSICION_CATALOGOS_NIVELES: number = 0;
  readonly POSICION_CATALOGOS_DELEGACIONES: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private mantenimientoVehicularService: MantenimientoVehicularService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(MANTENIMIENTO_VEHICULAR_BREADCRUMB);
    this.inicializarFiltroForm()
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGOS_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGOS_DELEGACIONES];
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: false}, [Validators.required]],
      delegacion: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      placa: [{value: null, disabled: false}, [Validators.required]],
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginar();
    }
  }

  paginar(): void {
    this.cargadorService.activar();
    this.mantenimientoVehicularService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        (respuesta) => {
          this.vehiculos = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
  }

  paginarConFiltros(): void {

  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosMantenimientoVehicular {
    return {}
  }

  consultaServicioEspecifico(): string {
    return "";
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get f() {
    return this.filtroForm?.controls;
  }

  abrirModalnuevaVerificacion(): void {
    this.detalleRef = this.dialogService.open(NuevaVerificacionComponent, {
      data: {vehiculo: this.vehiculoSeleccionado},
      header: "Nueva verificación",
      width: "920px"
    });
  }

  abrirModalSolicitudMantenimiento(): void {
    this.creacionRef = this.dialogService.open(SolicitudMantenimientoComponent, {
      header: "Solicitud de mantenimiento",
      width: "920px",
      data: {vehiculo: this.vehiculoSeleccionado},
    })
  }

  abrirModalRegistroMantenimiento(): void {
    this.creacionRef = this.dialogService.open(RegistroMantenimientoComponent, {
      header: "Registro de mantenimiento vehicular",
      width: "920px",
      data: {vehiculo: this.vehiculoSeleccionado},
    })
  }

  abrirModalModificar(): void {
    this.modificarModal = true;
  }

  abrirModalExportarPDF(): void {
  }

  abrirModalExportarExcel(): void {
  }

  abrirModalDetalleArticulo(articulo: Vehiculos) {
  }

  abrirPanel(event: MouseEvent, vehiculoSeleccionado: VehiculoTemp): void {
    this.vehiculoSeleccionado = vehiculoSeleccionado;
    this.overlayPanel.toggle(event);
  }


  abrirModalModificarServicio(): void {
    // this.creacionRef = this.dialogService.open(ModificarArticulosComponent, {
    //   header:"Modificar artículo",
    //   width:"920px",
    // })

    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo modificado correctamente');
    //   }
    // })
  }


}
