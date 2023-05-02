import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetallePromotoresComponent } from '../ver-detalle-promotores/ver-detalle-promotores.component';
import { Promotor } from '../../models/promotores.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { EMAIL } from 'projects/sivimss-gui/src/app/utils/regex';

interface HttpResponse {
  respuesta: string;
  promotor: Promotor;
}

@Component({
  selector: 'app-modificar-promotores',
  templateUrl: './modificar-promotores.component.html',
  styleUrls: ['./modificar-promotores.component.scss'],
  providers: [DialogService]
})
export class ModificarPromotoresComponent implements OnInit {

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
  tituloEliminar: string = '';
  intentoPorGuardar: boolean = false;
  promotorSeleccionado!: Promotor;
  modificarPromotorForm!: FormGroup;

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
    this.promotorSeleccionado = this.config.data?.promotor;

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
    this.inicializarModificarPromotorForm();
  }

  inicializarModificarPromotorForm() {
    this.modificarPromotorForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }, Validators.required],
      numEmpleado: [{ value: null, disabled: true }],
      curp: [{ value: null, disabled: true }],
      nombre: [{ value: null, disabled: true }],
      primerApellido: [{ value: null, disabled: true }],
      segundoApellido: [{ value: null, disabled: true }],
      fechaNacimiento: [{ value: null, disabled: true }],
      fechaIngreso: [{ value: null, disabled: false }, Validators.required],
      fechaBaja: [{ value: null, disabled: true }],
      sueldoBase: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      velatorio: [{ value: null, disabled: false }, Validators.required],
      categoria: [{ value: null, disabled: false }, [Validators.maxLength(20), Validators.required]],
      antiguedad: [{ value: null, disabled: true }, [Validators.maxLength(50)]],
      correo: [{ value: null, disabled: false }, [Validators.maxLength(30), Validators.required,
      Validators.email, Validators.pattern(EMAIL)]],
      puesto: [{ value: null, disabled: false }, [Validators.maxLength(20), Validators.required]],
      diasDescanso: [{ value: null, disabled: false }, Validators.required],
      estatus: [{ value: true, disabled: true }],
    });

    this.modificarPromotorForm.patchValue({
      ...this.promotorSeleccionado,
    })
  }

  abrirModalDetallePromotor() {
    return 0;
  }

  modificarPromotor(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Promotor guardado');
  }

  cerrarDialogo(promotor?: Promotor) {
    this.ref.close({
      respuesta: 'Ok',
      promotor,
    });
  }

  verDetalleGuardarPromotor(): void {
    this.intentoPorGuardar = true;
    this.modificarPromotorForm.markAllAsTouched();

    if (this.modificarPromotorForm.valid) {
      const values = this.modificarPromotorForm.getRawValue();
      const nuevoPromotor: Promotor = {
        ...values,
        id: 1,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetallePromotoresComponent, {
        data: { promotor: nuevoPromotor, modo: Accion.Modificar },
        header: "Modificar promotor",
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
    return this.modificarPromotorForm.controls;
  }
}
