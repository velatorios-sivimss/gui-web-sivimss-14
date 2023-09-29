import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetallePanteonesComponent } from '../ver-detalle-panteones/ver-detalle-panteones.component';
import { Panteon } from '../../models/panteones.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';

interface HttpResponse {
  respuesta: string;
  panteon: Panteon;
}

@Component({
  selector: 'app-modificar-panteones',
  templateUrl: './modificar-panteones.component.html',
  styleUrls: ['./modificar-panteones.component.scss'],
  providers: [DialogService]
})
export class ModificarPanteonesComponent implements OnInit {

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

  tipoArticulos: any[] = [];
  tituloEliminar: string = '';
  intentoPorGuardar: boolean = false;
  panteonSeleccionado!: Panteon;
  modificarPanteonForm!: FormGroup;

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
    this.panteonSeleccionado = this.config.data?.panteon;

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
    this.inicializarModificarPanteonForm();
  }

  inicializarModificarPanteonForm() {
    this.modificarPanteonForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      nombrePanteon: [{ value: null, disabled: false }, [Validators.maxLength(50), Validators.required]],
      calle: [{ value: null, disabled: false }, [Validators.maxLength(30), Validators.required]],
      numExterior: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      numInterior: [{ value: null, disabled: false }, [Validators.maxLength(10)]],
      colonia: [{ value: null, disabled: true }, []],
      municipio: [{ value: null, disabled: true }, []],
      estado: [{ value: null, disabled: true }, []],
      contacto: [{ value: null, disabled: false }, [Validators.maxLength(30), Validators.required]],
      numTelefono: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      cp: [{ value: null, disabled: false }, [Validators.maxLength(5), Validators.minLength(5), Validators.required]],
      estatus: [{ value: true, disabled: false }, Validators.required],
    });

    this.modificarPanteonForm.patchValue({
      ...this.panteonSeleccionado,
    })
  }

  abrirModalDetallePanteon() {
    return 0;
  }

  modificarPanteon(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Panteon guardado');
  }

  cerrarDialogo(panteon?: Panteon) {
    this.ref.close({
      respuesta: 'Ok',
      panteon,
    });
  }

  verDetalleGuardarPanteon(): void {
    this.intentoPorGuardar = true;
    this.modificarPanteonForm.markAllAsTouched();

    if (this.modificarPanteonForm.valid) {
      const values = this.modificarPanteonForm.getRawValue();
      const nuevoPanteon: Panteon = {
        ...values,
        id: 1,
      };

      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetallePanteonesComponent, {
        data: { panteon: nuevoPanteon, modo: Accion.Modificar },
        header: "Modificar panteon",
        width: "920px"
      });

      detalleRef.onClose.subscribe((res: HttpResponse) => {
        if (res && res.respuesta === 'Ok') {
          this.cerrarDialogo();
        }
      });
    }
  }

  handleChangeCodigoPostal() {
    //TO DO consumo servicio para obtener Estado, Municipio y Colonia por CP
  }

  get f() {
    return this.modificarPanteonForm.controls;
  }
}
