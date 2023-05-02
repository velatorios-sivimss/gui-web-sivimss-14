import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService } from "../../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetalleCuotasComponent } from '../ver-detalle-cuotas/ver-detalle-cuotas.component';
import { Cuota } from '../../models/cuotas.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';

interface HttpResponse {
  respuesta: string;
  cuota: Cuota;
}

@Component({
  selector: 'app-agregar-cuotas',
  templateUrl: './agregar-cuotas.component.html',
  styleUrls: ['./agregar-cuotas.component.scss'],
  providers: [DialogService]
})
export class AgregarCuotasComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

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

  disponibilidad: any[] = [
    {
      label: 'Disponible',
      value: 0,
    },
    {
      label: 'Ocupada',
      value: 1,
    },
    {
      label: 'En mantenimiento',
      value: 2,
    }
  ];

  tipoArticulos: any[] = [];
  tituloEliminar: string = '';
  intentoPorGuardar: boolean = false;

  agregarCuotaForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
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
    this.inicializarAgregarCuotaForm();
  }

  inicializarAgregarCuotaForm() {
    this.agregarCuotaForm = this.formBuilder.group({
      numeroPermiso: [{ value: null, disabled: false }, [Validators.maxLength(50), Validators.required]],
      cuotaRecuperacion: [{ value: null, disabled: false }, [Validators.required]],
      folioAutorizacion: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      fecha: [{ value: null, disabled: false }, [Validators.required]],
      importe: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      totalPagar: [{ value: null, disabled: false }, [Validators.maxLength(10)]],
      pagoGarantia: [{ value: false, disabled: false }, []],
      nombrePermisionario: [{ value: null, disabled: false }, [Validators.maxLength(50)]],
      numeroCuenta: [{ value: null, disabled: false }, [Validators.maxLength(50)]],
      banco: [{ value: null, disabled: false }, [Validators.maxLength(50)]],
    });
  }

  abrirModalDetalleCuota() {
    return 0;
  }

  cerrarDialogo(cuota?: Cuota) {
    this.ref.close({
      respuesta: 'Ok',
      cuota,
    });
  }

  verDetalleGuardarCuota(): void {
    this.intentoPorGuardar = true;
    this.agregarCuotaForm.markAllAsTouched();

    if (this.agregarCuotaForm.valid) {
      const values = this.agregarCuotaForm.getRawValue();
      const nuevoCuota: Cuota = {
        ...values,
        id: 1,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetalleCuotasComponent, {
        data: { cuota: nuevoCuota, modo: Accion.Agregar },
        header: "Registrar datos de cuota de recuperación",
        width: "920px"
      });

      detalleRef.onClose.subscribe((res: HttpResponse) => {
        if (res && res.respuesta === 'Ok') {
          this.cerrarDialogo();
        }
      });
    }
  }

  handlePagoGarantia() {
    if (this.f.pagoGarantia.value) {
      this.f.banco.setValidators([Validators.maxLength(10), Validators.required]);
    } else {
      this.f.banco.clearValidators();
    }
    this.f.banco.updateValueAndValidity();
  }

  get f() {
    return this.agregarCuotaForm.controls;
  }
}
