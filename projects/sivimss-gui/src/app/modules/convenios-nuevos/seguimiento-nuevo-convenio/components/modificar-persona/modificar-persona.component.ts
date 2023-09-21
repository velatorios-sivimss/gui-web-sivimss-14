import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { AlertaService } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { CATALOGOS_DUMMIES } from '../../../../inventario-vehicular/constants/dummies';
import { MENU_STEPPER } from '../../../../inventario-vehicular/constants/menu-stepper';
export enum TipoAlerta {
  Exito = 'success',
  Info = 'info',
  Precaucion = 'warning',
  Error = 'error'
}

@Component({
  selector: 'app-modificar-persona',
  templateUrl: './modificar-persona.component.html',
  styleUrls: ['./modificar-persona.component.scss'],
  providers: [DialogService]
})
export class ModificarPersonaComponent implements OnInit {
  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  direccionReferencia: boolean = false;

  responsables: TipoDropdown[] = CATALOGOS_DUMMIES;
  tiposProveedor: TipoDropdown[] = CATALOGOS_DUMMIES;
  usos: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;
  numerosSerie: TipoDropdown[] = CATALOGOS_DUMMIES;

  modificarPersonaForm!: FormGroup;
  creacionRef!: DynamicDialogRef;

  listadoPersonas: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    // public ref: DynamicDialogRef,
    public dialogService: DialogService,
    private alertaService: AlertaService,

  ) { }

  ngOnInit(): void {
    this.inicializarModificarPersonaForm();
  }

  inicializarModificarPersonaForm() {
    this.modificarPersonaForm = this.formBuilder.group({
      matricula: [{value: null, disabled: false}, [Validators.required]],
      rfc: [{value: null, disabled: false}, [Validators.required]],
      curp: [{value: null, disabled: false}, [Validators.required]],
      nss: [{value: null, disabled: false}, [Validators.required]],


      fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      sexo: [{value: null, disabled: false}, [Validators.required]],
      nacionalidad: [{value: null, disabled: false}, [Validators.required]],
      lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],


      calle: [{value: null, disabled: false}, [Validators.required]],
      noExterior: [{value: null, disabled: false}, [Validators.required]],
      noInterior: [{value: null, disabled: false}, [Validators.required]],


      cp: [{value: null, disabled: false}, [Validators.required]],
      colonia: [{value: null, disabled: false}, [Validators.required]],
      municipio: [{value: null, disabled: false}, [Validators.required]],
      estado: [{value: null, disabled: false}, [Validators.required]],


      tipoPaquete: [{value:true,disabled:false},[Validators.required]],
      enfermedadPrexistente: [{value:true,disabled:false},[Validators.required]],
    });
  }

  adelantarPagina(): void {
    this.indice++;
    if (this.indice === this.menuStep.length) {
      // this.crearResumenProveedor();
    }
  }


  crearResumenProveedor(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  cancelar(): void {
    // this.ref.close()
  }

  get mpf() {
    return this.modificarPersonaForm.controls;
  }

}
