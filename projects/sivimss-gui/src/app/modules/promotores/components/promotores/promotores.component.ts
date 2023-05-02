import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA, Accion } from "../../../../utils/constantes";
import { Promotor } from "../../models/promotores.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { VerDetallePromotoresComponent } from '../ver-detalle-promotores/ver-detalle-promotores.component';
import { AgregarPromotoresComponent } from '../agregar-promotores/agregar-promotores.component';
import { ModificarPromotoresComponent } from '../modificar-promotores/modificar-promotores.component';

interface HttpResponse {
  respuesta: string;
  promotor: Promotor;
}
@Component({
  selector: 'app-promotores',
  templateUrl: './promotores.component.html',
  styleUrls: ['./promotores.component.scss'],
  providers: [DialogService]
})
export class PromotoresComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

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

  promotoresServicio: any[] = [
    {
      label: 'Promotor Uno',
      value: 0,
    },
    {
      label: 'Promotor Dos',
      value: 1,
    },
    {
      label: 'Promotor Tres',
      value: 2,
    }
  ];

  promotores: Promotor[] = [];
  promotorSeleccionado!: Promotor;
  detalleRef!: DynamicDialogRef;
  filtroForm!: FormGroup;
  agregarPromotorForm!: FormGroup;
  modificarPromotorForm!: FormGroup;
  promotoresServicioFiltrados: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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
        titulo: 'Promotores'
      }
    ]);
    this.inicializarFiltroForm();
  }


  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.promotores = [
        {
          id: 1,
          numEmpleado: '11',
          curp: 'ALBI05041980',
          nombre: 'Alberto',
          primerApellido: 'Lima',
          segundoApellido: 'Dorantes',
          fechaNacimiento: '05/04/1980',
          fechaIngreso: '01/30/2000',
          sueldoBase: '$10,000.00',
          velatorio: 'No. 14 San Luis Potosí y CD Valles',
          categoria: '$3,000',
          antiguedad: '22 años',
          correo: 'jimetez@imss.gob.mx',
          puesto: 'Promotor',
          diasDescanso: '13/03/2023',
          nombrePromotor: 'Promotor siniestro de previsión funeraria con cremación',
          descripcion: 'Promotor todo incluido con cremación servicios completos',
          estatus: true,
        },
        {
          id: 2,
          numEmpleado: '11',
          curp: 'ALBI05041980',
          nombre: 'Alberto',
          primerApellido: 'Lima',
          segundoApellido: 'Dorantes',
          fechaNacimiento: '05/04/1980',
          fechaIngreso: '01/30/2000',
          sueldoBase: '$10,000.00',
          velatorio: 'No. 14 San Luis Potosí y CD Valles',
          categoria: '$3,000',
          antiguedad: '22 años',
          correo: 'jimetez@imss.gob.mx',
          puesto: 'Promotor',
          diasDescanso: '13/03/2023',
          nombrePromotor: 'Promotor siniestro de previsión funeraria con cremación',
          descripcion: 'Promotor todo incluido con cremación servicios completos',
          estatus: true,
        },
        {
          id: 3,
          numEmpleado: '11',
          curp: 'ALBI05041980',
          nombre: 'Alberto',
          primerApellido: 'Lima',
          segundoApellido: 'Dorantes',
          fechaNacimiento: '05/04/1980',
          fechaIngreso: '01/30/2000',
          sueldoBase: '$10,000.00',
          velatorio: 'No. 14 San Luis Potosí y CD Valles',
          categoria: '$3,000',
          antiguedad: '22 años',
          correo: 'jimetez@imss.gob.mx',
          puesto: 'Promotor',
          diasDescanso: '13/03/2023',
          nombrePromotor: 'Promotor siniestro de previsión funeraria con cremación',
          descripcion: 'Promotor todo incluido con cremación servicios completos',
          estatus: true,
        }
      ];
      this.totalElementos = this.promotores.length;
    }, 0);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: false }],
      delegacion: [{ value: null, disabled: false }],
      velatorio: [{ value: null, disabled: false }],
      nombrePromotor: [{ value: null, disabled: false }],
    });
  }

  abrirModalAgregarPromotor(): void {
    this.detalleRef = this.dialogService.open(AgregarPromotoresComponent, {
      header: "Agregar promotor",
      width: "920px"
    });
  }

  abrirModalDetallePromotor(promotor: Promotor) {
    this.detalleRef = this.dialogService.open(VerDetallePromotoresComponent, {
      data: { promotor, modo: Accion.Detalle },
      header: "Ver detalle",
      width: "920px"
    });
  }

  abrirPanel(event: MouseEvent, promotorSeleccionado: Promotor): void {
    this.promotorSeleccionado = promotorSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalModificarPromotor() {
    this.detalleRef = this.dialogService.open(ModificarPromotoresComponent, {
      data: { promotor: this.promotorSeleccionado },
      header: "Modificar promotor",
      width: "920px"
    });
  }

  agregarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiarFormBusqueda() {
    this.filtroForm.reset();
  }

  buscarPromotor() {
    // De acuerdo a CU al menos un campo con información a buscar
    if (this.validarAlMenosUnCampoConValor(this.filtroForm)) {
      // TO DO llamada a servicio para realizar búsqueda
      console.log('Datos a buscar', this.filtroForm.value);
    }
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  cambiarEstatus(promotor: Promotor) {
    const modo = promotor.estatus ? Accion.Desactivar : Accion.Activar;
    this.detalleRef = this.dialogService.open(VerDetallePromotoresComponent, {
      data: { promotor, modo },
      header: "Ver detalle",
      width: "920px"
    });
    this.detalleRef.onClose.subscribe((res: HttpResponse) => {
      if (res && res.respuesta === 'Ok' && res.promotor) {
        const foundIndex = this.promotores.findIndex((item: Promotor) => item.id === promotor.id);
        this.promotores[foundIndex] = res.promotor;
      }
    });
  }

  filtrarPromotores(event: any) {
    // TO DO En una aplicación real, realice una solicitud a una URL remota con la consulta y devuelva los resultados filtrados
    let filtrado: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.promotoresServicio.length; i++) {
      let promotor = this.promotoresServicio[i];
      if (promotor.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(promotor);
      }
    }

    this.promotoresServicioFiltrados = filtrado;
  }

  get f() {
    return this.filtroForm.controls;
  }

  get fac() {
    return this.agregarPromotorForm.controls;
  }

  get fmc() {
    return this.modificarPromotorForm.controls;
  }

}
