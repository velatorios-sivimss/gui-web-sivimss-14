import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from '@angular/router';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {VerDetalleSalasComponent} from '../ver-detalle-salas/ver-detalle-salas.component';
import {Sala} from '../../models/salas.interface';
import {Accion} from 'projects/sivimss-gui/src/app/utils/constantes';

interface HttpResponse {
  respuesta: string;
  sala: Sala;
}

@Component({
  selector: 'app-modificar-salas',
  templateUrl: './modificar-salas.component.html',
  styleUrls: ['./modificar-salas.component.scss'],
  providers: [DialogService]
})
export class ModificarSalasComponent implements OnInit {

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
  salaSeleccionado!: Sala;
  modificarSalaForm!: FormGroup;

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
    this.salaSeleccionado = this.config.data?.sala;

    this.breadcrumbService.actualizar([
      {
        icono: 'imagen-icono-operacion-sivimss.svg',
        titulo: 'Administración de catálogos'
      },
      {
        icono: '',
        titulo: 'Salas'
      }
    ]);
    this.inicializarModificarSalaForm();
  }

  inicializarModificarSalaForm() {
    this.modificarSalaForm = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      nombreSala: [{value: null, disabled: false}, [Validators.maxLength(50), Validators.required]],
      tipoSala: [{value: null, disabled: false}, Validators.required],
      velatorio: [{value: null, disabled: false}, Validators.required],
      capacidad: [{value: null, disabled: false}, [Validators.maxLength(1), Validators.required]],
      disponibilidad: [{value: 0, disabled: true}, Validators.required],
      estatus: [{value: true, disabled: false}, []],
    });

    this.modificarSalaForm.patchValue({
      ...this.salaSeleccionado,
    })
  }

  abrirModalDetalleSala() {
    return 0;
  }

  modificarSala(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Sala guardada');
  }

  cerrarDialogo(sala?: Sala) {
    this.ref.close({
      respuesta: 'Ok',
      sala,
    });
  }

  verDetalleGuardarSala(): void {
    this.intentoPorGuardar = true;
    this.modificarSalaForm.markAllAsTouched();

    if (this.modificarSalaForm.valid) {
      const values = this.modificarSalaForm.getRawValue();
      const nuevoSala: Sala = {
        ...values,
        id: 1,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetalleSalasComponent, {
        data: {sala: nuevoSala, modo: Accion.Modificar},
        header: "Modificar sala",
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
    return this.modificarSalaForm.controls;
  }
}
