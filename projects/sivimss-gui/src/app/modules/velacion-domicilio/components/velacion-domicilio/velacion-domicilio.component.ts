import { Component, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { OverlayPanel } from "primeng/overlaypanel";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LazyLoadEvent } from "primeng/api";
import { DIEZ_ELEMENTOS_POR_PAGINA } from "../../../../utils/constantes";
import { VelacionDomicilioInterface } from "../../models/velacion-domicilio.interface";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { RegistrarEntradaEquipoComponent } from "../registrar-entrada-equipo/registrar-entrada-equipo.component";
import { ActivatedRoute, Router } from "@angular/router";
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { VelacionDomicilioService } from '../../services/velacion-domicilio.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from "moment/moment";

@Component({
  selector: 'app-velacion-domicilio',
  templateUrl: './velacion-domicilio.component.html',
  styleUrls: ['./velacion-domicilio.component.scss'],
  providers: [DialogService]
})
export class VelacionDomicilioComponent implements OnInit {
  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;
  readonly POSICION_VELATORIOS: number = 2;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;

  vale: VelacionDomicilioInterface[] = [];
  valeSeleccionado: VelacionDomicilioInterface = {}

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  registrarEntradaEquipoRef!: DynamicDialogRef;

  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  foliosGenerados: TipoDropdown[] = [];

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private velacionDomicilioService: VelacionDomicilioService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
    this.obtenerFoliosGenerados();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const velatorios = respuesta[this.POSICION_VELATORIOS].datos;
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.catalogoVelatorios = mapearArregloTipoDropdown(velatorios, "desc", "id");
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: false }, [Validators.required]],
      delegacion: [{ value: null, disabled: false }, [Validators.required]],
      velatorio: [{ value: null, disabled: false }, [Validators.required]],
      folioODS: [{ value: null, disabled: false }, [Validators.required]],
      fechaInicio: [{ value: null, disabled: false }, [Validators.required]],
      fechaFinal: [{ value: null, disabled: false }, [Validators.required]]
    });
  }

  paginar(event?: LazyLoadEvent): void {
    if (event && event.first !== undefined && event.rows !== undefined) {
      this.numPaginaActual = Math.floor(event.first / event.rows);
    } else {
      this.numPaginaActual = 0;
    }
    this.velacionDomicilioService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta) => {
        this.vale = respuesta!.datos.content;
        this.totalElementos = respuesta!.datos.totalElements;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  // paginar(event: LazyLoadEvent): void {
  //   setTimeout(() => {
  //     this.vale = [
  //       {
  //         velatorio: 1,
  //         folioODS: "DOC-0001",
  //         nombreContratante: "Joel Gonzalo Marea Jojutla",
  //         fechaSalida: "01/01/2021",
  //         fechaEntrada: "01/01/2022",
  //         responsableInstalacion: "Betzabe",
  //         totalArticulos: 1,
  //       },
  //       {
  //         velatorio: 2,
  //         folioODS: "DOC-0002",
  //         nombreContratante: "Joel Gonzalo Marea Jojutla",
  //         fechaSalida: "02/01/2021",
  //         fechaEntrada: "02/01/2022",
  //         responsableInstalacion: "Betzabe",
  //         totalArticulos: 2,
  //       }
  //     ];
  //     this.totalElementos = this.vale.length;
  //   }, 0);
  // }

  abrirDetalleValeSalida(vale: VelacionDomicilioInterface): void {
    this.router.navigate(['reservar-capilla/velacion-en-domicilio/ver-detalle/1'])
  }

  abrirModalRegistroEntradaEquipo(): void {
    this.registrarEntradaEquipoRef = this.dialogService.open(RegistrarEntradaEquipoComponent, {
      header: 'Registro de entrada de equipo',
      width: '920px',
    });
  }

  abrirPanel(event: MouseEvent, vale: VelacionDomicilioInterface): void {
    this.valeSeleccionado = vale;
    this.overlayPanel.toggle(event);
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.buscarPorFiltros();
  }

  buscarPorFiltros(): void {
    this.velacionDomicilioService.buscarPorFiltros(this.obtenerObjetoParaFiltrado(), this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta) => {
        if (respuesta!.datos.content.length === 0) {
          this.vale = [];
          this.totalElementos = 0;
          this.alertaService.mostrar(TipoAlerta.Precaucion, 'No se encontró información relacionada a tu búsqueda.');
        } else {
          this.vale = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  obtenerObjetoParaFiltrado(): object {
    return {
      idNivel: +this.ff.nivel.value || null,
      idDelegacion: +this.ff.delegacion.value || null,
      idVelatorio: +this.ff.velatorio.value || null,
      folioOds: +this.ff.folioODS.value?.label,
      fechaInicio: this.ff.fechaInicio.value ? moment(this.ff.fechaInicio.value).format('DD/MM/YYYY') : null,
      fechaFinal:this.ff.fechaFinal.value ?  moment(this.ff.fechaFinal.value).format('DD/MM/YYYY') : null,
    }
  }

  limpiar(): void {
    this.alertaService.limpiar();
    this.filtroForm.reset();
    this.paginar();
  }

  obtenerFoliosGenerados() {
    this.velacionDomicilioService.buscarTodasOdsGeneradas().subscribe(
      (respuesta) => {
        let filtrado: TipoDropdown[] = [];
        if (respuesta!.datos.length > 0) {
          respuesta!.datos.forEach((e: any) => {
            filtrado.push({
              label: e.nombre,
              value: e.id,
            });
          });
          this.foliosGenerados = filtrado;
        } else {
          this.foliosGenerados = [];
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
