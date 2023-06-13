import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {ActivatedRoute} from "@angular/router";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import {
  AgregarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../agregar-beneficiario-convenios-prevision-funeraria/agregar-beneficiario-convenios-prevision-funeraria.component";
import {CATALOGO_ENFERMEDAD_PREEXISTENTE} from "../../constants/catalogos-funcion";
import {
  DetalleBeneficiarioConveniosPrevisionFunerariaComponent
} from "../detalle-beneficiario-convenios-prevision-funeraria/detalle-beneficiario-convenios-prevision-funeraria.component";
import {
  ModificarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../modificar-beneficiario-convenios-prevision-funeraria/modificar-beneficiario-convenios-prevision-funeraria.component";

@Component({
  selector: 'app-por-persona',
  templateUrl: './por-persona.component.html',
  styleUrls: ['./por-persona.component.scss'],
  providers: [DialogService]
})
export class PorPersonaComponent implements OnInit {

  readonly POSICION_PAISES = 0;
  readonly POSICION_ESTADOS = 1;

  personaForm!: FormGroup;

  modificarBeneficiarioRef!: DynamicDialogRef;
  detalleBeneficiarioRef!: DynamicDialogRef;
  beneficiarioRef!: DynamicDialogRef;
  beneficiarios: BeneficiarioInterface[] = [];

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  tipoPaquete!: TipoDropdown[];
  enfermedadPrexistente: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;

  otroTipoEnferemdad: boolean = false;

  constructor(
    private alertaService: AlertaService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.estado = respuesta[this.POSICION_ESTADOS]!.map(
      (estado: TipoDropdown) => (
        {label: estado.label, value: estado.value}
      )
    ) || [];
    this.pais = respuesta[this.POSICION_PAISES]!.map(
      (pais: TipoDropdown) => (
        {label: pais.label, value: pais.value}
      )
    ) || [];
    this.inicializarPersonaForm();
  }

  inicializarPersonaForm(): void {
    this.personaForm= this.formBuilder.group({
                  matricula: [{value:null, disabled: false}],
                        rfc: [{value:null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
                       curp: [{value:null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                     nombre: [{value:null, disabled: false}, [Validators.required]],
             primerApellido: [{value:null, disabled: false}, [Validators.required]],
            segundoApellido: [{value:null, disabled: false}, [Validators.required]],
                      calle: [{value:null, disabled: false}, [Validators.required]],
             numeroExterior: [{value:null, disabled: false}, [Validators.required]],
             numeroInterior: [{value:null, disabled: false}, [Validators.required]],
                         cp: [{value:null, disabled: false}, [Validators.required]],
                    colonia: [{value:null, disabled: false}, [Validators.required]],
                  municipio: [{value:null, disabled: false}, [Validators.required]],
                     estado: [{value:null, disabled: false}, [Validators.required]],
                       pais: [{value:null, disabled: false}, [Validators.required]],
          correoElectronico: [{value:null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
                   telefono: [{value:null, disabled: false}, [Validators.required]],
      enfermedadPrexistente: [{value:null, disabled: false}, [Validators.required]],
             otraEnferdedad: [{value:null, disabled: false}, [Validators.required]],
                tipoPaquete: [{value:null, disabled: false}, [Validators.required]],
    })
  }

  abrirModalAgregarBeneficiarios(): void {
    this.beneficiarioRef = this.dialogService.open(AgregarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header: "Agregar beneficiario",
      width: "920px",
    });
    this.beneficiarioRef.onClose.subscribe((beneficiario: BeneficiarioInterface) => {
      if(beneficiario){
        this.beneficiarios.push(beneficiario);
      }
    });
  }

  abrirModalEliminarBeneficiario(eliminarBeneficiario: BeneficiarioInterface): void {
    this.beneficiarios = this.beneficiarios.filter((element) => {
      return eliminarBeneficiario.curp != element.curp;
    })
  }

  cambioEnfermedadPrexistente(): void {
    this.otroTipoEnferemdad = false;
    if(this.fp.enfermedadPrexistente.value == 4){this.otroTipoEnferemdad = true}
  }

  abrirModalDetalleBeneficario(beneficiario: BeneficiarioInterface): void {
    this.detalleBeneficiarioRef = this.dialogService.open(DetalleBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Detalle de beneficiario",
      width:"920px",
      data: beneficiario,
    });
  }
  abrirModalModificarBeneficiario(beneficiario: BeneficiarioInterface): void {
    this.modificarBeneficiarioRef = this.dialogService.open(ModificarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Modificar beneficiario",
      width:"920px",
      data: beneficiario,
    })

    this.modificarBeneficiarioRef.onClose.subscribe((beneficiario: BeneficiarioInterface) => {
      if(beneficiario){
        const index = this.beneficiarios.findIndex((item: BeneficiarioInterface) => item.curp === beneficiario.curp);
        this.beneficiarios[index] = beneficiario;
      }
    })
  }

  get fp() {
    return this.personaForm.controls;
  }
}
