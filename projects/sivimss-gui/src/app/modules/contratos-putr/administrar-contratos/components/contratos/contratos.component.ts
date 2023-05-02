import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA, Accion } from "../../../../../utils/constantes";
import { Contrato } from "../../models/contratos.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { VerDetalleContratosComponent } from '../ver-detalle-contratos/ver-detalle-contratos.component';
import { AgregarContratosComponent } from '../agregar-contratos/agregar-contratos.component';
import { ModificarContratosComponent } from '../modificar-contratos/modificar-contratos.component';

interface HttpResponse {
  respuesta: string;
  contrato: Contrato;
}
@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss'],
  providers: [DialogService]
})
export class ContratosComponent implements OnInit {

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

  contratosServicio: any[] = [
    {
      label: 'Contrato Uno',
      value: 0,
    },
    {
      label: 'Contrato Dos',
      value: 1,
    },
    {
      label: 'Contrato Tres',
      value: 2,
    }
  ];

  contratos: Contrato[] = [];
  contratoSeleccionado!: Contrato;
  detalleRef!: DynamicDialogRef;
  filtroForm!: FormGroup;
  agregarContratoForm!: FormGroup;
  modificarContratoForm!: FormGroup;
  contratosServicioFiltrados: any[] = [];

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
        titulo: 'Operación SIVIMSS'
      },
      {
        icono: '',
        titulo: 'Contratos PUTR'
      },
      {
        icono: '',
        titulo: 'Administración de contratos'
      }
    ]);
    this.inicializarFiltroForm();
  }


  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.contratos = [
        {
          id: 1,
          numeroPermiso: '6574839013',
          giro: 'Florería',
          nombrePermisionario: 'Maria Jimenez Dorado',
          vigenciaPermiso: 'De 01/01/2021 a 01/01/2022',
          cuotaRecuperacion: '$ 30,000.00',
          estatus: true,
        },
        {
          id: 2,
          numeroPermiso: '6574839013',
          giro: 'Florería',
          nombrePermisionario: 'Maria Jimenez Dorado',
          vigenciaPermiso: 'De 01/01/2021 a 01/01/2022',
          cuotaRecuperacion: '$ 30,000.00',
          estatus: true,
        },
        {
          id: 3,
          numeroPermiso: '6574839013',
          giro: 'Florería',
          nombrePermisionario: 'Maria Jimenez Dorado',
          vigenciaPermiso: 'De 01/01/2021 a 01/01/2022',
          cuotaRecuperacion: '$ 30,000.00',
          estatus: true,
        }
      ];
      this.totalElementos = this.contratos.length;
    }, 0);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: false }],
      delegacion: [{ value: null, disabled: false }],
      velatorio: [{ value: null, disabled: false }],
      numeroPermiso: [{ value: null, disabled: false }],
      nombrePermisionario: [{ value: null, disabled: false }],
    });
  }

  abrirModalAgregarContrato(): void {
    this.detalleRef = this.dialogService.open(AgregarContratosComponent, {
      header: "Agregar contrato PUTR",
      width: "920px"
    });
  }

  abrirModalDetalleContrato(contrato: Contrato) {
    this.detalleRef = this.dialogService.open(VerDetalleContratosComponent, {
      data: { contrato, modo: Accion.Detalle },
      header: "Ver detalle",
      width: "920px"
    });
  }

  abrirPanel(event: MouseEvent, contratoSeleccionado: Contrato): void {
    this.contratoSeleccionado = contratoSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalModificarContrato() {
    this.detalleRef = this.dialogService.open(ModificarContratosComponent, {
      data: { contrato: this.contratoSeleccionado },
      header: "Modificar contrato",
      width: "920px"
    });
  }

  agregarContrato(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Usuario guardado');
  }

  limpiarFormBusqueda() {
    this.filtroForm.reset();
    this.f.delegacion.clearValidators();
    this.f.delegacion.updateValueAndValidity();
    this.f.velatorio.clearValidators();
    this.f.velatorio.updateValueAndValidity();
    this.f.numeroPermiso.clearValidators();
    this.f.numeroPermiso.updateValueAndValidity();
    this.f.nombrePermisionario.clearValidators();
    this.f.nombrePermisionario.updateValueAndValidity();
  }

  buscarContrato() {
    // De acuerdo a CU al menos un campo con información a buscar
    if (this.validarAlMenosUnCampoConValor(this.filtroForm)) {
      // TO DO llamada a servicio para realizar búsqueda
      console.log('Datos a buscar', this.filtroForm.value);
    } else {
      this.f.delegacion.setValidators(Validators.required);
      this.f.delegacion.updateValueAndValidity();
      this.f.velatorio.setValidators(Validators.required);
      this.f.velatorio.updateValueAndValidity();
      this.f.numeroPermiso.setValidators(Validators.required);
      this.f.numeroPermiso.updateValueAndValidity();
      this.f.nombrePermisionario.setValidators(Validators.required);
      this.f.nombrePermisionario.updateValueAndValidity();
      this.filtroForm.markAllAsTouched();
    }
  }

  validarAlMenosUnCampoConValor(group: FormGroup) {
    if (!Object.values(group.value).find(value => value !== '' && value !== null)) {
      return false;
    }
    return true;
  }

  cambiarEstatus(contrato: Contrato) {
    const modo = contrato.estatus ? Accion.Desactivar : Accion.Activar;
    this.detalleRef = this.dialogService.open(VerDetalleContratosComponent, {
      data: { contrato, modo },
      header: "Ver detalle",
      width: "920px"
    });
    this.detalleRef.onClose.subscribe((res: HttpResponse) => {
      if (res && res.respuesta === 'Ok' && res.contrato) {
        const foundIndex = this.contratos.findIndex((item: Contrato) => item.id === contrato.id);
        this.contratos[foundIndex] = res.contrato;
      }
    });
  }

  filtrarContratos(event: any) {
    // TO DO En una aplicación real, realice una solicitud a una URL remota con la consulta y devuelva los resultados filtrados
    let filtrado: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.contratosServicio.length; i++) {
      let contrato = this.contratosServicio[i];
      if (contrato.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtrado.push(contrato);
      }
    }

    this.contratosServicioFiltrados = filtrado;
  }

  get f() {
    return this.filtroForm.controls;
  }

  get fac() {
    return this.agregarContratoForm.controls;
  }

  get fmc() {
    return this.modificarContratoForm.controls;
  }

}
