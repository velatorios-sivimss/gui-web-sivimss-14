import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetalleContratosComponent } from '../ver-detalle-contratos/ver-detalle-contratos.component';
import { Contrato } from '../../models/contratos.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { EMAIL } from 'projects/sivimss-gui/src/app/utils/regex';

interface HttpResponse {
  respuesta: string;
  contrato: Contrato;
}

@Component({
  selector: 'app-modificar-contratos',
  templateUrl: './modificar-contratos.component.html',
  styleUrls: ['./modificar-contratos.component.scss'],
  providers: [DialogService]
})
export class ModificarContratosComponent implements OnInit {

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
  contratoSeleccionado!: Contrato;
  modificarContratoForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
    this.contratoSeleccionado = this.config.data?.contrato;

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
    this.inicializarModificarContratoForm();
  }

  inicializarModificarContratoForm() {
    this.modificarContratoForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      nombreContrato: [{ value: null, disabled: false }, [Validators.maxLength(50), Validators.required]],
      tipoContrato: [{ value: null, disabled: false }, Validators.required],
      velatorio: [{ value: null, disabled: false }, Validators.required],
      capacidad: [{ value: null, disabled: false }, [Validators.maxLength(1), Validators.required]],
      disponibilidad: [{ value: 0, disabled: true }, Validators.required],
      estatus: [{ value: true, disabled: false }, []],
    });

    this.modificarContratoForm.patchValue({
      ...this.contratoSeleccionado,
    })
  }

  abrirModalDetalleContrato() {
    return 0;
  }

  modificarContrato(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Contrato guardada');
  }

  cerrarDialogo(contrato?: Contrato) {
    this.ref.close({
      respuesta: 'Ok',
      contrato,
    });
  }

  verDetalleGuardarContrato(): void {
    this.intentoPorGuardar = true;
    this.modificarContratoForm.markAllAsTouched();

    if (this.modificarContratoForm.valid) {
      const values = this.modificarContratoForm.getRawValue();
      const nuevoContrato: Contrato = {
        ...values,
        id: 1,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetalleContratosComponent, {
        data: {contrato: nuevoContrato, modo: Accion.Modificar},
        header: "Modificar contrato",
        width: "920px"
      });

      detalleRef.onClose.subscribe((res: HttpResponse) => {
        if (res && res.respuesta === 'Ok') {
          this.cerrarDialogo();
        }
      });
    }
  }

  get f() {
    return this.modificarContratoForm.controls;
  }
}
