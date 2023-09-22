import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DIEZ_ELEMENTOS_POR_PAGINA, Accion} from "../../../../utils/constantes";
import {Paquete} from "../../models/paquetes.interface";
import {LazyLoadEvent} from "primeng/api";
import {ActivatedRoute, Router} from '@angular/router';
import {VerDetallePaquetesComponent} from '../ver-detalle-paquetes/ver-detalle-paquetes.component';
import {Servicio} from '../../models/servicios.interface';
import {Articulo} from '../../models/articulos.interface';
import {PaquetesService} from "../../services/paquetes.service";
import {HttpErrorResponse} from "@angular/common/http";
import {PAQUETES_BREADCRUMB} from "../../constants/breadcrumb";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {VALORES_DUMMIES} from "../../constants/dummies";
import {FiltrosPaquetes} from "../../models/filtro-paquetes.interface";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

interface HttpResponse {
  respuesta: string;
  paquete: Paquete;
}

@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.scss'],
  providers: [DialogService]
})
export class PaquetesComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  opciones: TipoDropdown[] = VALORES_DUMMIES;

  paquetesServicio: any[] = [
    {
      label: 'Paquete Uno',
      value: 0,
    },
    {
      label: 'Paquete Dos',
      value: 1,
    },
    {
      label: 'Paquete Tres',
      value: 2,
    }
  ];

  servicios: Servicio[] = [
    {
      servicio: 'Traslado a nivel nacional',
      costo: '$25,100.00',
      precio: '$25,100.00'
    },
    {
      servicio: 'Cremación',
      costo: '$3,200.00',
      precio: '$3,200.00'
    },
  ];

  articulos: Articulo[] = [
    {
      articulo: 'Traslado a nivel nacional',
      tipoArticulo: '',
    },
    {
      articulo: 'Ataúd',
      tipoArticulo: 'Donado',
    },
  ];

  paquetes: Paquete[] = [];
  paqueteSeleccionado!: Paquete;
  detalleRef!: DynamicDialogRef;
  filtroForm!: FormGroup;
  agregarPaqueteForm!: FormGroup;
  modificarPaqueteForm!: FormGroup;
  paquetesServicioFiltrados: any[] = [];

  mostrarModalAgregarPaquete: boolean = false;
  mostrarModalModificarPaquete: boolean = false;
  paginacionConFiltrado: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paquetesService: PaquetesService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(PAQUETES_BREADCRUMB);
    this.inicializarFiltroForm();
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginar();
    }
  }

  paginar(): void {
    this.paquetesService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.paquetes = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  private paginarConFiltros(): void {
    const filtros = this.crearSolicitudFiltros();
    this.paquetesService.buscarPorFiltros(filtros, this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.paquetes = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  crearSolicitudFiltros(): FiltrosPaquetes {
    return {
      idOficina: this.filtroForm.get("nivel")?.value,
      idVelatorio: this.filtroForm.get("velatorio")?.value,
      idDelegacion: this.filtroForm.get("delegacion")?.value,
      nombre: this.filtroForm.get("nombrePaquete")?.value,
    };
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: false}],
      delegacion: [{value: null, disabled: false}],
      velatorio: [{value: null, disabled: false}],
      nombrePaquete: [{value: null, disabled: false}],
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.filtroForm.reset();
    this.numPaginaActual = 0;
    this.paginar();
  }

  abrirModalAgregarPaquete(): void {
    this.router.navigate(['agregar-paquete'], {relativeTo: this.activatedRoute});
  }

  abrirModalDetallePaquete(paquete: Paquete) {
    this.detalleRef = this.dialogService.open(VerDetallePaquetesComponent, {
      data: {paquete, modo: Accion.Detalle},
      header: "Ver detalle",
      width: "920px"
    });
  }

  abrirPanel(event: MouseEvent, paqueteSeleccionado: Paquete): void {
    this.paqueteSeleccionado = paqueteSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalModificarPaquete() {
    this.mostrarModalModificarPaquete = true;
    void this.router.navigate(['modificar-paquete', this.paqueteSeleccionado.id], {relativeTo: this.activatedRoute});
  }

  agregarPaquete(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiarFormBusqueda() {
    this.filtroForm.reset();
  }

  buscarPaquete() {
    // De acuerdo a CU al menos un campo con información a buscar
    if (this.validarAlMenosUnCampoConValor(this.filtroForm)) {
      // TO DO llamada a servicio para realizar búsqueda
    }
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  cambiarEstatus(paquete: Paquete) {
    const modo: number = paquete.estatus ? Accion.Desactivar : Accion.Activar;
    this.detalleRef = this.dialogService.open(VerDetallePaquetesComponent, {
      data: {paquete, modo},
      header: "Ver detalle",
      width: "920px"
    });
    this.detalleRef.onClose.subscribe((res: HttpResponse) => {
      if (res && res.respuesta === 'Ok' && res.paquete) {
        const foundIndex = this.paquetes.findIndex((item: Paquete) => item.id === paquete.id);
        this.paquetes[foundIndex] = res.paquete;
      }
    });
  }

  filtrarPaquetes(event: any) {
    // TO DO En una aplicación real, realice una solicitud a una URL remota con la consulta y devuelva los resultados filtrados
    let filtrado: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.paquetesServicio.length; i++) {
      let paquete = this.paquetesServicio[i];
      if (paquete.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(paquete);
      }
    }

    this.paquetesServicioFiltrados = filtrado;
  }

  get f() {
    return this.filtroForm.controls;
  }

  get fac() {
    return this.agregarPaqueteForm.controls;
  }

  get fmc() {
    return this.modificarPaqueteForm.controls;
  }


}
