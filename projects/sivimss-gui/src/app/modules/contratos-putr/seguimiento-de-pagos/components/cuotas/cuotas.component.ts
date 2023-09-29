import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../../shared/alerta/services/alerta.service";
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DIEZ_ELEMENTOS_POR_PAGINA, Accion } from "../../../../../utils/constantes";
import { Cuota } from "../../models/cuotas.interface";
import { LazyLoadEvent } from "primeng/api";
import { ActivatedRoute, Router } from '@angular/router';
import { VerDetalleCuotasComponent } from '../ver-detalle-cuotas/ver-detalle-cuotas.component';
import { AgregarCuotasComponent } from '../agregar-cuotas/agregar-cuotas.component';

interface HttpResponse {
  respuesta: string;
  cuota: Cuota;
}
@Component({
  selector: 'app-cuotas',
  templateUrl: './cuotas.component.html',
  styleUrls: ['./cuotas.component.scss'],
  providers: [DialogService]
})
export class CuotasComponent implements OnInit {

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

  cuotasServicio: any[] = [
    {
      label: 'Permisionario Uno',
      value: 0,
    },
    {
      label: 'Permisionario Dos',
      value: 1,
    },
    {
      label: 'Permisionario Tres',
      value: 2,
    }
  ];

  cuotas: Cuota[] = [];
  detalleRef!: DynamicDialogRef;
  filtroForm!: FormGroup;
  agregarCuotasForm!: FormGroup;
  cuotasServicioFiltrados: any[] = [];

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
        titulo: 'Seguimiento de pagos'
      }
    ]);
    this.inicializarFiltroForm();
  }


  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.cuotas = [
        {
          numeroPermiso: '6574839013',
          giro: 'Venta al mayoreo',
          nombrePermisionario: 'Maria Jimenez Dorado',
          vigenciaPermiso: 'De 01/01/2021 a 01/01/2022',
          cuotaRecuperacion: '$ 30,000.00',
          cumplimientoCuotas: 'verde',
          penaConvencional: '$ 450.00',
        },
        {
          numeroPermiso: '6574839013',
          giro: 'Venta al mayoreo',
          nombrePermisionario: 'Maria Jimenez Dorado',
          vigenciaPermiso: 'De 01/01/2021 a 01/01/2022',
          cuotaRecuperacion: '$ 30,000.00',
          cumplimientoCuotas: 'rojo',
          penaConvencional: '$ 450.00',
        },
        {
          numeroPermiso: '987654321',
          giro: 'Venta al mayoreo',
          nombrePermisionario: 'Maria Jimenez Dorado',
          vigenciaPermiso: 'De 01/01/2021 a 01/01/2022',
          cuotaRecuperacion: '$ 30,000.00',
          cumplimientoCuotas: 'verde',
          penaConvencional: '$ 450.00',
        }
      ];
      this.totalElementos = this.cuotas.length;
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

  abrirModalAgregarCuota(): void {
    this.detalleRef = this.dialogService.open(AgregarCuotasComponent, {
      header: "Registrar datos de cuota de recuperación",
      width: "920px"
    });
  }

  abrirModalDetalleCuota(cuota: Cuota) {
    this.detalleRef = this.dialogService.open(VerDetalleCuotasComponent, {
      data: { cuota, modo: Accion.Detalle },
      header: "Historial de cuotas",
      width: "920px"
    });
  }

  agregarCuota(): void {
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

  buscarCuota() {
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

  filtrarCuotas(event: any) {
    // TO DO En una aplicación real, realice una solicitud a una URL remota con la consulta y devuelva los resultados filtrados
    let filtrado: any[] = [];
    let query = event.query;
    for (let cuota of  this.cuotasServicio) {
      if (cuota.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtrado.push(cuota);
      }
    }

    this.cuotasServicioFiltrados = filtrado;
  }

  get f() {
    return this.filtroForm.controls;
  }

  get fac() {
    return this.agregarCuotasForm.controls;
  }

}
