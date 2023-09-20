import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DIEZ_ELEMENTOS_POR_PAGINA, Accion} from "../../../../utils/constantes";
import {Panteon} from "../../models/panteones.interface";
import {LazyLoadEvent} from "primeng/api";
import {ActivatedRoute, Router} from '@angular/router';
import {VerDetallePanteonesComponent} from '../ver-detalle-panteones/ver-detalle-panteones.component';
import {AgregarPanteonesComponent} from '../agregar-panteones/agregar-panteones.component';
import {ModificarPanteonesComponent} from '../modificar-panteones/modificar-panteones.component';

interface HttpResponse {
  respuesta: string;
  panteon: Panteon;
}

@Component({
  selector: 'app-panteones',
  templateUrl: './panteones.component.html',
  styleUrls: ['./panteones.component.scss'],
  providers: [DialogService]
})
export class PanteonesComponent implements OnInit {

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

  panteonesServicio: any[] = [
    {
      label: 'Panteon Uno',
      value: 0,
    },
    {
      label: 'Panteon Dos',
      value: 1,
    },
    {
      label: 'Panteon Tres',
      value: 2,
    }
  ];

  panteones: Panteon[] = [];
  panteonSeleccionado!: Panteon;
  detalleRef!: DynamicDialogRef;
  filtroForm!: FormGroup;
  agregarPanteonForm!: FormGroup;
  modificarPanteonForm!: FormGroup;
  panteonesServicioFiltrados: any[] = [];

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
        titulo: 'Panteones'
      }
    ]);
    this.inicializarFiltroForm();
  }


  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.panteones = [
        {
          id: 1,
          nombrePanteon: 'Asocioacion mututalista de México',
          calle: 'Av, Miguel Angel de Quevedo Castillo',
          numExterior: '34',
          numInterior: '34',
          colonia: 'Desarrollo San Alberto',
          municipio: 'Santiago de Querétaro',
          cp: '00666',
          estado: 'Querétaro',
          contacto: 'Jimena López Acosta',
          numTelefono: '55 3452 6785',
          estatus: true,
        },
        {
          id: 2,
          nombrePanteon: 'Asocioacion mututalista de México',
          calle: 'Av, Miguel Angel de Quevedo Castillo',
          numExterior: '34',
          numInterior: '34',
          colonia: 'Desarrollo San Alberto',
          municipio: 'Santiago de Querétaro',
          cp: '00666',
          estado: 'Querétaro',
          contacto: 'Jimena López Acosta',
          numTelefono: '55 3452 6785',
          estatus: true,
        },
        {
          id: 3,
          nombrePanteon: 'Asocioacion mututalista de México',
          calle: 'Av, Miguel Angel de Quevedo Castillo',
          numExterior: '34',
          numInterior: '34',
          colonia: 'Desarrollo San Alberto',
          municipio: 'Santiago de Querétaro',
          cp: '00666',
          estado: 'Querétaro',
          contacto: 'Jimena López Acosta',
          numTelefono: '55 3452 6785',
          estatus: true,
        }
      ];
      this.totalElementos = this.panteones.length;
    }, 0);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      entidadFederativa: [{value: null, disabled: false}],
      nombrePanteon: [{value: null, disabled: false}],
    });
  }

  abrirModalAgregarPanteon(): void {
    this.detalleRef = this.dialogService.open(AgregarPanteonesComponent, {
      header: "Agregar panteón",
      width: "920px"
    });
  }

  abrirModalDetallePanteon(panteon: Panteon) {
    this.detalleRef = this.dialogService.open(VerDetallePanteonesComponent, {
      data: {panteon, modo: Accion.Detalle},
      header: "Ver detalle",
      width: "920px"
    });
  }

  abrirPanel(event: MouseEvent, panteonSeleccionado: Panteon): void {
    this.panteonSeleccionado = panteonSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalModificarPanteon() {
    this.detalleRef = this.dialogService.open(ModificarPanteonesComponent, {
      data: {panteon: this.panteonSeleccionado},
      header: "Modificar panteón",
      width: "920px"
    });
  }

  agregarPanteon(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiarFormBusqueda() {
    this.filtroForm.reset();
  }

  buscarPanteon() {
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

  cambiarEstatus(panteon: Panteon) {
    const modo = panteon.estatus ? Accion.Desactivar : Accion.Activar;
    this.detalleRef = this.dialogService.open(VerDetallePanteonesComponent, {
      data: {panteon, modo},
      header: "Ver detalle",
      width: "920px"
    });
    this.detalleRef.onClose.subscribe((res: HttpResponse) => {
      if (res && res.respuesta === 'Ok' && res.panteon) {
        const foundIndex = this.panteones.findIndex((item: Panteon) => item.id === panteon.id);
        this.panteones[foundIndex] = res.panteon;
      }
    });
  }

  filtrarPanteones(event: any) {
    // TO DO En una aplicación real, realice una solicitud a una URL remota con la consulta y devuelva los resultados filtrados
    let filtrado: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.panteonesServicio.length; i++) {
      let panteon = this.panteonesServicio[i];
      if (panteon.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(panteon);
      }
    }

    this.panteonesServicioFiltrados = filtrado;
  }

  get f() {
    return this.filtroForm.controls;
  }

  get fac() {
    return this.agregarPanteonForm.controls;
  }

  get fmc() {
    return this.modificarPanteonForm.controls;
  }

}
