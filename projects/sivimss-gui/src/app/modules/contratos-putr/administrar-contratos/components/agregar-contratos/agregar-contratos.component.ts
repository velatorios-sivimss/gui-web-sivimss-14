import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetalleContratosComponent } from '../ver-detalle-contratos/ver-detalle-contratos.component';
import { Contrato } from '../../models/contratos.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { MENU_STEPPER } from '../../constants/menu-stepper';
import { MenuItem } from 'primeng/api';


interface HttpResponse {
  respuesta: string;
  contrato: Contrato;
}

@Component({
  selector: 'app-agregar-contratos',
  templateUrl: './agregar-contratos.component.html',
  styleUrls: ['./agregar-contratos.component.scss'],
  providers: [DialogService]
})
export class AgregarContratosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

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

  agregarContratoForm!: FormGroup;

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
        titulo: 'Administración de contratos'
      }
    ]);
    this.inicializarAgregarContratoForm();
  }

  inicializarAgregarContratoForm() {
    this.agregarContratoForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      numeroPermiso: [{ value: null, disabled: false }, Validators.required],
      giro: [{ value: null, disabled: false }, Validators.required],
      nombrePermisionario: [{ value: null, disabled: false }, Validators.required],
      cuotaRecuperacion: [{ value: null, disabled: false }, Validators.required],
      rfc: [{ value: null, disabled: false }, Validators.required],
      curp: [{ value: null, disabled: false }, Validators.required],
      primerApellido: [{ value: null, disabled: false }, Validators.required],
      segundoApellido: [{ value: null, disabled: false }, Validators.required],
      sexo: [{ value: null, disabled: false }, Validators.required],
      nacionalidad: [{ value: null, disabled: false }, Validators.required],
      lugarNacimiento: [{ value: null, disabled: false }, Validators.required],
      telefono: [{ value: null, disabled: false }, Validators.required],
      correo: [{ value: null, disabled: false }, Validators.required],
      fechaNacimiento: [{ value: null, disabled: false }, Validators.required],
      codigoPostal: [{ value: null, disabled: false }, Validators.required],
      calle: [{ value: null, disabled: false }, Validators.required],
      numeroExterior: [{ value: null, disabled: false }, Validators.required],
      numeroInterior: [{ value: null, disabled: false }, Validators.required],
      colonia: [{ value: null, disabled: false }, Validators.required],
      municipio: [{ value: null, disabled: false }, Validators.required],
      estado: [{ value: null, disabled: false }, Validators.required],
      usoSuperficie: [{ value: null, disabled: false }, Validators.required],
      formaPago: [{ value: null, disabled: false }, Validators.required],
      numeroCuotasRecuperacion: [{ value: null, disabled: false }, Validators.required],
      banco: [{ value: null, disabled: false }, Validators.required],
      numeroCuenta: [{ value: null, disabled: false }, Validators.required],
      vigenciaPermiso: [{ value: null, disabled: false }, Validators.required],
      fechaInicialPermiso: [{ value: null, disabled: false }, Validators.required],
      fechaFinalPermiso: [{ value: null, disabled: false }, Validators.required],
      nombreAdministrador: [{ value: null, disabled: false }, Validators.required],
      observaciones: [{ value: null, disabled: false }, Validators.required],
      claveArticulo: [{ value: null, disabled: false }, Validators.required],
      fechaContrato: [{ value: null, disabled: false }, Validators.required],
      estatus: [{ value: true, disabled: false }, []],
    });
  }

  abrirModalDetalleContrato() {
    return 0;
  }

  agregarContrato(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Contrato guardado');
  }

  cerrarDialogo(contrato?: Contrato) {
    this.ref.close({
      respuesta: 'Ok',
      contrato,
    });
  }

  verDetalleGuardarContrato(): void {
    this.intentoPorGuardar = true;
    this.agregarContratoForm.markAllAsTouched();

    if (this.agregarContratoForm.valid) {
      const values = this.agregarContratoForm.getRawValue();
      const nuevoContrato: Contrato = {
        ...values,
        id: 1,
      };
      const detalleRef: DynamicDialogRef = this.dialogService.open(VerDetalleContratosComponent, {
        data: { contrato: nuevoContrato, modo: Accion.Agregar },
        header: "Agregar contrato",
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
    if (this.agregarContratoForm.get('nombre')?.valid &&
      this.agregarContratoForm.get('primerApellido')?.valid &&
      this.agregarContratoForm.get('segundoApellido')?.valid &&
      this.agregarContratoForm.get('fechaNacimiento')?.valid) {
      return true;
    }
    return false;
  }

  handleFechaIngreso() {
    //TO DO Calcular Antigüedad
    console.log(this.f.fechaIngreso.value);
  }

  get f() {
    return this.agregarContratoForm.controls;
  }
}
