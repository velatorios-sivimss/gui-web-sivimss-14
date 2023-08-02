import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from '@angular/router';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA, Accion} from "../../../../utils/constantes";
import {Servicio} from '../../models/servicios.interface';
import {LazyLoadEvent} from "primeng/api";
import {Articulo} from '../../models/articulos.interface';
import {ListaVelatorios} from '../../models/lista-velatorios.interface';
import {VerDetallePaquetesComponent} from '../ver-detalle-paquetes/ver-detalle-paquetes.component';
import {Paquete} from '../../models/paquetes.interface';
import {PAQUETES_BREADCRUMB} from "../../constants/breadcrumb";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {
  CATALOGO_REGIONES,
  CATALOGO_VELATORIOS,
  CATALOGOS_CLAVES_SAT,
  CATALOGOS_TIPO_ARTICULOS
} from "../../constants/catalogos";

interface Catalogo {
  nombre: string,
  id: number
}

@Component({
  selector: 'app-agregar-paquetes',
  templateUrl: './agregar-paquetes.component.html',
  styleUrls: ['./agregar-paquetes.component.scss'],
  providers: [DialogService]
})
export class AgregarPaquetesComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementosServicios: number = 0;
  totalElementosArticulos: number = 0;

  POSICION_ARTICULOS = 0;
  POSICION_SERVICIOS = 1;

  opciones: any[] = [
    {
      label: 'Opción 1',
      value: 0,
    },
    {
      label: 'Opción 2',
      value: 1,
    },
    {
      label: 'Opción 3',
      value: 2,
    }
  ];
  tipoServicios: TipoDropdown[] = [];

  tipoArticulos: TipoDropdown[] = [];
  regiones: TipoDropdown[] = CATALOGO_REGIONES;
  clavesSat: TipoDropdown[] = CATALOGOS_CLAVES_SAT;

  catalogoArticulos: any[] = [
    {
      label: 'Ataúd',
      value: 0,
    },
    {
      label: 'Urna',
      value: 1,
    },
    {
      label: 'Cartucho',
      value: 2,
    },
    {
      label: 'Empaques traslado aéreo',
      value: 3,
    },
    {
      label: 'Bolsa para cadáver',
      value: 4,
    },
    {
      label: 'Otro',
      value: 5,
    },
  ];

  servicios: Servicio[] = [];
  servicioSeleccionado!: Servicio;
  articulos: Articulo[] = [];
  articuloSeleccionado!: Articulo;
  velatorios: ListaVelatorios[] = [];
  tituloEliminar: string = '';
  intentoPorGuardar: boolean = false;
  mostrarVelatorios: boolean = false;

  agregarPaqueteForm!: FormGroup;
  agregarServicioForm!: FormGroup;
  agregarArticuloForm!: FormGroup;

  mostrarModalAgregarServicio: boolean = false;
  mostrarModalAgregarArticulo: boolean = false;
  mostrarModalEliminarServicio: boolean = false;
  mostrarModalEliminarArticulo: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
  ) {
    const respuesta = this.route.snapshot.data["respuesta"];
    const servicios = respuesta[this.POSICION_SERVICIOS].datos;
    this.tipoServicios = servicios.map((servicio: Catalogo) => ({label: servicio.nombre, value: servicio.id}));
    const articulos = respuesta[this.POSICION_ARTICULOS].datos;
    this.tipoArticulos = articulos.map((articulo: Catalogo) => ({label: articulo.nombre, value: articulo.id}));
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(PAQUETES_BREADCRUMB);
    this.inicializarAgregarPaqueteForm();
    this.obtenerVelatorio();
  }


  paginar(event: LazyLoadEvent): void {
    console.log("Se comenta metodo para que no marque error en Sonar", event);
  }

  obtenerVelatorio(): void {
    this.velatorios = CATALOGO_VELATORIOS;
  }

  inicializarAgregarPaqueteForm(): void {
    this.agregarPaqueteForm = this.formBuilder.group({
      id: [{value: null, disabled: true}, Validators.required],
      nombrePaquete: [{value: null, disabled: false}, [Validators.maxLength(70), Validators.required]],
      descripcion: [{value: null, disabled: false}, [Validators.maxLength(70), Validators.required]],
      region: [{value: null, disabled: false}, Validators.required],
      clave: [{value: null, disabled: false}, Validators.required],
      costoInicial: [{value: '$0.00', disabled: true}, []],
      costoReferencia: [{value: null, disabled: false}, [Validators.maxLength(10), Validators.required]],
      precio: [{value: null, disabled: false}, [Validators.maxLength(10), Validators.required]],
      estatus: [{value: true, disabled: false}, Validators.required],
    });
  }

  inicializarAgregarServicioForm(): void {
    this.agregarServicioForm = this.formBuilder.group({
      tipoServicio: [{value: null, disabled: false}, [Validators.required]],
      servicio: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  inicializarAgregarArticuloForm(): void {
    this.agregarArticuloForm = this.formBuilder.group({
      articulo: [{value: null, disabled: false}, [Validators.required]],
      tipoArticulo: [{value: null, disabled: false}, []],
    });
  }

  abrirPanel(event: MouseEvent, servicioSeleccionado: Servicio): void {
    this.servicioSeleccionado = servicioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  agregarServicio(): void {
    // TO DO Aplicar logica para no repetir Items y aplicar sumatoria para el campo Costo inicial
    this.servicios.push({
      id: 1,
      idServicio: 1,
      idTipoServicio: 1,
      tipoServicio: this.fas.tipoServicio.value,
      servicio: this.fas.servicio.value,
      costo: '$10,000',
      precio: '$10,100',
    });
    this.totalElementosServicios = this.servicios.length;
    this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio agregado al paquete');
    this.mostrarModalAgregarServicio = false;
  }

  agregarArticulo(): void {
    // TO DO Aplicar logica para no repetir Items y aplicar sumatoria para el campo Costo inicial
    this.articulos.push({
      id: 1,
      idArticulo: 1,
      idTipoArticulo: 1,
      tipoArticulo: this.faa.tipoArticulo.value,
      articulo: this.faa.articulo.value,
    });
    this.totalElementosArticulos = this.articulos.length;
    this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado al paquete');
    this.mostrarModalAgregarArticulo = false;
  }

  verDetalleGuardarPaquete(): void {
    this.intentoPorGuardar = true;
    this.agregarPaqueteForm.markAllAsTouched();

    if (this.agregarPaqueteForm.valid) {
      const values = this.agregarPaqueteForm.getRawValue();
      const nuevoPaquete: Paquete = {
        ...values,
        id: 1,
        costoInicial: '$999,000',
        servicios: this.servicios,
        articulos: this.articulos,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetallePaquetesComponent, {
        data: {paquete: nuevoPaquete, modo: Accion.Agregar},
        header: "Agregar paquete",
        width: "920px"
      });
    }
  }

  abrirModalAgregarServicio(): void {
    this.inicializarAgregarServicioForm();
    this.mostrarModalAgregarServicio = true;
  }

  abrirModalAgregarArticulo(): void {
    this.inicializarAgregarArticuloForm();
    this.mostrarModalAgregarArticulo = true;
  }

  abrirModalEliminarServicio(servicio: Servicio): void {
    this.servicioSeleccionado = servicio;
    this.mostrarModalEliminarServicio = true;
    this.tituloEliminar = 'Eliminar servicio al paquete';
  }

  abrirModalEliminarArticulo(articulo: Articulo): void {
    this.articuloSeleccionado = articulo;
    this.mostrarModalEliminarArticulo = true;
    this.tituloEliminar = 'Eliminar artículo al paquete';
  }

  eliminarServicio(): void {
    const foundIndex = this.servicios.findIndex((item: Servicio) => item.id === this.servicioSeleccionado.id);
    this.servicios.splice(foundIndex, 1);
    this.mostrarModalEliminarServicio = false;
  }

  eliminarArticulo(): void {
    const foundIndex = this.articulos.findIndex((item: Servicio) => item.id === this.articuloSeleccionado.id);
    this.articulos.splice(foundIndex, 1);
    this.mostrarModalEliminarArticulo = false;
  }

  handleChangeRegion(): void {
    this.mostrarVelatorios = (this.f.region.value === 2)
  }

  handleChangeCatArticulo() {
    this.faa.tipoArticulo.reset();
    if (this.faa.articulo.value === 'Ataúd') {
      this.tipoArticulos = CATALOGOS_TIPO_ARTICULOS;
      this.faa.tipoArticulo.setValidators(Validators.required);
    } else {
      this.tipoArticulos = [];
      this.faa.tipoArticulo.clearValidators();
    }
    this.faa.tipoArticulo.updateValueAndValidity();
  }

  get f() {
    return this.agregarPaqueteForm.controls;
  }

  get fas() {
    return this.agregarServicioForm.controls;
  }

  get faa() {
    return this.agregarArticuloForm.controls;
  }

}
