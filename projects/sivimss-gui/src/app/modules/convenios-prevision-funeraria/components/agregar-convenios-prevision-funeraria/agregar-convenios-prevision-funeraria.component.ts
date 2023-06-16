import { Component, OnInit } from '@angular/core';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {SERVICIO_BREADCRUMB_AGREGAR} from "../../constants/breadcrumb-agregar";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies"
import {PersonaInterface} from "../../models/persona.interface";
import {Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-agregar-convenios-prevision-funeraria',
  templateUrl: './agregar-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-convenios-prevision-funeraria.component.scss']
})
export class AgregarConveniosPrevisionFunerariaComponent implements OnInit {

  filtroForm!: FormGroup;
  convenioForm!: FormGroup;
  documentacionForm!: FormGroup;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  tipoContratacion:TipoDropdown[] = [{value:1,label:'Por Persona'},{value:2,label:'Por Grupo o por Empresa'}];
  pais: TipoDropdown[] = CATALOGOS_DUMMIES;
  estado: TipoDropdown[] = CATALOGOS_DUMMIES;
  personasConvenio: PersonaInterface[] = [];
  agregarPersona: boolean = false;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
    this.inicializarDocumentacionForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_AGREGAR);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      numeroConvenio: [{value: null, disabled: false}, [Validators.required]],
      tipoContratacion: [{value: null, disabled: false}, [Validators.required]],
      rfcCurp: [{value: null, disabled: false}, [Validators.required]],

    })
  }

  inicializarRegistrConvenioForm(): void{
    this.convenioForm = this.formBuilder.group({
      promotor:[{value:null, disabled:false}]
    })
  }

  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group( {
      ineAfiliado: [{value: null, disabled: false}, [Validators.required]],
      copiaCURP: [{value: null, disabled: false}, [Validators.required]],
      copiaRFC: [{value: null, disabled: false}, [Validators.required]],
      convenioAnterior: [{value: null, disabled: false}, [Validators.required]],
      copiaActaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      copiaINE: [{value: null, disabled: false}, [Validators.required]],
      comprobanteEstudios: [{value: null, disabled: false}, [Validators.required]],
      actaMatrimonio: [{value: null, disabled: false}, [Validators.required]],
      declaracionConcubinato: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  inicializarPersonaForm(): void {

  }



  mostrarPersonas( personas: PersonaInterface): void {
    this.agregarPersona = false;
    this.personasConvenio.push(personas);
  }

  abrirModalDetallePersona(personaDetalle: PersonaInterface) {
    console.log("Se comenta método para que no marque error en Sonar", personaDetalle);
  }

  abrirAgregarPersona(): void {
  this.agregarPersona = true;
  }

  aceptar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado correctamente');
    this.router.navigateByUrl('convenios-prevision-funeraria');
  }

  cancelar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  siguiente(): void {
    this.indice ++;
  }

  regresar(): void {
    this.indice --;
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
