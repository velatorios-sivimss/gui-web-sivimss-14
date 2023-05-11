import {FormatoPagare} from '../../models/formato-pagare.interface';
import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {CATALOGOS_DUMMIES} from '../../constants/dummies';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LazyLoadEvent} from 'primeng/api';
import {SERVICIO_BREADCRUMB} from '../../constants/breadcrumb';
import {GenerarFormatoPagareService} from '../../services/generar-formato-pagare.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FiltrosFormatoPagare} from "../../models/filtrosFormatoPagare.interface";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {DescargaArchivosService} from "../../../../../services/descarga-archivos.service";

type ListadoFormato = Required<FormatoPagare> & { idPagoBit: string }

@Component({
  selector: 'app-generar-formato-pagare',
  templateUrl: './generar-formato-pagare.component.html',
  styleUrls: ['./generar-formato-pagare.component.scss'],
  providers: [DialogService, DescargaArchivosService]
})
export class GenerarFormatoPagareComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  formatoPagare: FormatoPagare[] = [];
  formatoPagareSeleccionado!: ListadoFormato;
  filtroForm!: FormGroup;
  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catatalogoDelegaciones: TipoDropdown[] = [];
  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;

  paginacionConFiltrado: boolean = false;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private generarFormatoService: GenerarFormatoPagareService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cargadorService: LoaderService,
    private descargaArchivosService: DescargaArchivosService
  ) {
  }


  ngOnInit(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarFiltroForm();
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catatalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
  }

  abrirPanel(event: MouseEvent, formatoPagareSeleccionado: ListadoFormato): void {
    this.formatoPagareSeleccionado = formatoPagareSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalformatoPagareTramites(): void {
    this.router.navigate(['generar-formato-pagare'], {
      relativeTo: this.activatedRoute,
      queryParams: {idPagare: this.formatoPagareSeleccionado.id}
    });
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: false}],
      delegacion: [{value: null, disabled: false}],
      velatorio: [{value: null, disabled: false}],
      folioODS: [{value: null, disabled: false}],
      nombreContratante: [{value: null, disabled: false}],
      fechaInicial: [{value: null, disabled: false}],
      fechaFinal: [{value: null, disabled: false}],
    });
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
    this.generarFormatoService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        (respuesta) => {
          this.formatoPagare = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
  }

  paginarConFiltros(): void {
    const filtros: FiltrosFormatoPagare = this.crearSolicitudFiltros();
    this.cargadorService.activar();
    this.generarFormatoService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        (respuesta) => {
          this.formatoPagare = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(TipoAlerta.Error, error.message);
        }
      );
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosFormatoPagare {
    return {
      idOficina: this.filtroForm.get("oficina")?.value,
      idNivel: this.filtroForm.get("nivel")?.value,
      idDelegacion: this.filtroForm.get("delegacion")?.value,
      idVelatorio: this.filtroForm.get("velatorio")?.value,
      folioODS: this.filtroForm.get("folioODS")?.value,
      nomContratante: this.filtroForm.get("nomContratante")?.value,
      fecIniODS: this.filtroForm.get("fechaInicial")?.value,
      fecFinODS: this.filtroForm.get("fechaFinal")?.value,
      tipoReporte: "pdf",
    }
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.paginar();
  }

  get f() {
    return this.filtroForm?.controls;
  }


  guardarListadoPagaresPDF() {
    this.cargadorService.activar();
    const filtros: FiltrosFormatoPagare = this.crearSolicitudFiltros();
    this.descargaArchivosService.descargarArchivo(this.generarFormatoService.descargarListadoPagares(filtros)).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta)
      },
      (error) => {
        console.log(error)
      },
    )
  }

}
