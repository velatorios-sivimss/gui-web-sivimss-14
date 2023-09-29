import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetalleSalasComponent } from '../ver-detalle-salas/ver-detalle-salas.component';
import { Sala } from '../../models/salas.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';

interface HttpResponse {
  respuesta: string;
  sala: Sala;
}

@Component({
  selector: 'app-agregar-salas',
  templateUrl: './agregar-salas.component.html',
  styleUrls: ['./agregar-salas.component.scss'],
  providers: [DialogService]
})
export class AgregarSalasComponent implements OnInit {

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

  agregarSalaForm!: FormGroup;

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
        titulo: 'Administración de catálogos'
      },
      {
        icono: '',
        titulo: 'Administrar salas'
      }
    ]);
    this.inicializarAgregarSalaForm();
  }

  inicializarAgregarSalaForm() {
    this.agregarSalaForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      nombreSala: [{ value: null, disabled: false }, [Validators.maxLength(50), Validators.required]],
      tipoSala: [{ value: null, disabled: false }, Validators.required],
      velatorio: [{ value: null, disabled: false }, Validators.required],
      capacidad: [{ value: null, disabled: false }, [Validators.maxLength(1), Validators.required]],
      disponibilidad: [{ value: 0, disabled: true }, Validators.required],
      estatus: [{ value: true, disabled: false }, []],
    });
  }

  abrirModalDetalleSala() {
    return 0;
  }

  agregarSala(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Sala guardado');
  }

  cerrarDialogo(sala?: Sala) {
    this.ref.close({
      respuesta: 'Ok',
      sala,
    });
  }

  verDetalleGuardarSala(): void {
    this.intentoPorGuardar = true;
    this.agregarSalaForm.markAllAsTouched();

    if (this.agregarSalaForm.valid) {
      const values = this.agregarSalaForm.getRawValue();
      const nuevoSala: Sala = {
        ...values,
        id: 1,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetalleSalasComponent, {
        data: { sala: nuevoSala, modo: Accion.Agregar },
        header: "Agregar sala",
        width: "920px"
      });

      detalleRef.onClose.subscribe((res: HttpResponse) => {
        if (res && res.respuesta === 'Ok') {
          this.cerrarDialogo();
        }
      });
    }
  }

  consultarRenapo() {
    //TO DO Realizar consulta a RENAPO cuando campos de nombre y fecha nacimiento tengan datos
    if (this.validarPreconsultaRenapo()) {
      //CURP Dommy para prueba
      this.f.curp.setValue('OEAF771012HMCRGR09');
      //En caso de no existir CURP mostrar msj
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'No se encontró información relacionada a tu búsqueda.');
    }
  }

  validarPreconsultaRenapo(): boolean {
    if (this.agregarSalaForm.get('nombre')?.valid &&
      this.agregarSalaForm.get('primerApellido')?.valid &&
      this.agregarSalaForm.get('segundoApellido')?.valid &&
      this.agregarSalaForm.get('fechaNacimiento')?.valid) {
      return true;
    }
    return false;
  }

  handleFechaIngreso() {
    //TO DO Calcular Antigüedad
    console.log(this.f.fechaIngreso.value);
  }

  get f() {
    return this.agregarSalaForm.controls;
  }
}
