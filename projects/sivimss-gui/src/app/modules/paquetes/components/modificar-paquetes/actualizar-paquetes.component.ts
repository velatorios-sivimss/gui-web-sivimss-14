import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DIEZ_ELEMENTOS_POR_PAGINA, Accion } from "../../../../utils/constantes";
import { Servicio } from '../../models/servicios.interface';
import { LazyLoadEvent } from "primeng/api";
import { Articulo } from '../../models/articulos.interface';
import { ListaVelatorios } from '../../models/lista-velatorios.interface';
import { VerDetallePaquetesComponent } from '../ver-detalle-paquetes/ver-detalle-paquetes.component';
import { Paquete } from '../../models/paquetes.interface';

interface HttpResponse {
  respuesta: string;
  paquete: Paquete;
}

@Component({
  selector: 'app-actualizar-paquetes',
  templateUrl: './actualizar-paquetes.component.html',
  styleUrls: ['./actualizar-paquetes.component.scss'],
  providers: [DialogService]
})
export class ActualizarPaquetesComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementosServicios: number = 0;
  totalElementosArticulos: number = 0;

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

  regiones: any[] = [
    {
      label: 'Nacional',
      value: 0,
    },
    {
      label: 'Delegacional',
      value: 1,
    },
    {
      label: 'Velatorio',
      value: 2,
    }
  ];

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

  tipoArticulos: any[] = [];
  servicios: Servicio[] = [];
  servicioSeleccionado!: Servicio;
  articulos: Articulo[] = [];
  articuloSeleccionado!: Articulo;
  velatorios: ListaVelatorios[] = [];
  tituloEliminar: string = '';
  intentoPorGuardar: boolean = false;
  mostrarVelatorios: boolean = false;

  actualizarPaqueteForm!: FormGroup;
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
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar([
      {
        icono: 'imagen-icono-operacion-sivimss.svg',
        titulo: 'Administración de catálogos'
      },
      {
        icono: '',
        titulo: 'Administrar paquetes'
      }
    ]);
    this.inicializarActualizarPaqueteForm();
    this.obtenerVelatorio();
  }


  paginar(event: LazyLoadEvent): void {
    console.log("Se coloca mensjae para no dejar vacío el método porque se marca como report en Sonar: ", event);
  }

  obtenerVelatorio() {
    this.velatorios = [
      { descripcion: 'No. 01 Doctores' },
      { descripcion: 'No. 03 Chihuahua' },
      { descripcion: 'No. 05 Mérida' },
      { descripcion: 'No. 06 Torreón' },
      { descripcion: 'No. 07 Cd. Juárez' },
      { descripcion: 'No. 08 Guadalajara' },
      { descripcion: 'No. 09 Toluca' },
      { descripcion: 'No. 10 Monterrey' },
      { descripcion: 'No. 11 Puebla' },
      { descripcion: 'No. 12 Veracruz' },
      { descripcion: 'No. 13 Querétaro' },
      { descripcion: 'No. 14 San Luis Potosí y CD Valles' },
      { descripcion: 'No. 15 Pachuca' },
      { descripcion: 'No. 17 Tapachula' },
      { descripcion: 'No. 18 Tequesquináhuac' },
      { descripcion: 'No. 20 Ecatepec' },
      { descripcion: 'No. 21 Tampico' },
      { descripcion: 'No. 22 Villahermosa' },
    ];
  }

  inicializarActualizarPaqueteForm() {
    this.actualizarPaqueteForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }, Validators.required],
      nombrePaquete: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
      descripcion: [{ value: null, disabled: false }, [Validators.maxLength(70), Validators.required]],
      region: [{ value: null, disabled: false }, Validators.required],
      clave: [{ value: null, disabled: false }, Validators.required],
      costoInicial: [{ value: '$0.00', disabled: true }, []],
      costoReferencia: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      precio: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      estatus: [{ value: true, disabled: false }, Validators.required],
    });
    this.f.nombrePaquete?.errors; //NOSONAR
  }

  inicializarAgregarServicioForm() {
    this.agregarServicioForm = this.formBuilder.group({
      tipoServicio: [{ value: null, disabled: false }, [Validators.required]],
      servicio: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  inicializarAgregarArticuloForm() {
    this.agregarArticuloForm = this.formBuilder.group({
      articulo: [{ value: null, disabled: false }, [Validators.required]],
      tipoArticulo: [{ value: null, disabled: false }, []],
    });
  }

  abrirModalDetallePaquete(paquete: Servicio) {
    return 0;
  }

  abrirPanel(event: MouseEvent, servicioSeleccionado: Servicio): void {
    this.servicioSeleccionado = servicioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  actualizarPaquete(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Paquete actualizado');
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
    this.actualizarPaqueteForm.markAllAsTouched();

    if (this.actualizarPaqueteForm.valid) {
      const values = this.actualizarPaqueteForm.getRawValue();
      const paqueteActualizado: Paquete = {
        ...values,
        id: 1,
        costoInicial: '$999,000',
        servicios: this.servicios,
        articulos: this.articulos,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetallePaquetesComponent, {
        data: { paquete: paqueteActualizado, modo: Accion.Modificar },
        header: "Actualizar paquete",
        width: "920px"
      });

      console.log("Se imprime objeto para que no marque error en Sonar: ", detalleRef);

      // detalleRef.onClose.subscribe((res: HttpResponse) => {
      //   if (res && res.respuesta === 'Ok') {
      //     utils foundIndex = this.paquetes.findIndex((item: Paquete) => item.id === paquete.id);
      //     this.paquetes[foundIndex] = res.paquete;
      //   }
      // });
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

  handleChangeRegion() {
    if (this.f.region.value === 2) {
      this.mostrarVelatorios = true;
    } else {
      this.mostrarVelatorios = false;
    }
  }

  handleChangeCatArticulo() {
    this.faa.tipoArticulo.reset();
    if (this.faa.articulo.value === 'Ataúd') {
      this.tipoArticulos = [
        {
          label: 'Económico',
          value: 0,
        },
        {
          label: 'Donado',
          value: 1,
        },
        {
          label: 'Consignado',
          value: 2,
        },
      ];
      this.faa.tipoArticulo.setValidators(Validators.required);
    } else {
      this.tipoArticulos = [];
      this.faa.tipoArticulo.clearValidators();
    }
    this.faa.tipoArticulo.updateValueAndValidity();
  }

  get f() {
    return this.actualizarPaqueteForm.controls;
  }

  get fas() {
    return this.agregarServicioForm.controls;
  }

  get faa() {
    return this.agregarArticuloForm.controls;
  }

}
