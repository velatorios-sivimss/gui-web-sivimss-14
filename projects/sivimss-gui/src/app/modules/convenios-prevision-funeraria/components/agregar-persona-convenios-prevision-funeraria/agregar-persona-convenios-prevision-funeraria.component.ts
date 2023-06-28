import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { MenuItem } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";


import { MENU_STEPPER_AGREGAR_PERSONA } from "../../constants/menu-steppers-agregar-persona";
import { CATALOGOS_DUMMIES } from "../../constants/dummies";
import { TipoDropdown } from "../../../../models/tipo-dropdown";

import { BeneficiarioInterface } from "../../models/beneficiario.interface";
import { PersonaInterface } from "../../models/persona.interface";

import {
  AgregarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../agregar-beneficiario-convenios-prevision-funeraria/agregar-beneficiario-convenios-prevision-funeraria.component";
import {
  DetalleBeneficiarioConveniosPrevisionFunerariaComponent
} from "../detalle-beneficiario-convenios-prevision-funeraria/detalle-beneficiario-convenios-prevision-funeraria.component";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {
  ModificarBeneficiarioComponent
} from "../../../convenios-nuevos/seguimiento-nuevo-convenio/components/modificar-beneficiario/modificar-beneficiario.component";
import {
  ModificarBeneficiarioConveniosPrevisionFunerariaComponent
} from "../modificar-beneficiario-convenios-prevision-funeraria/modificar-beneficiario-convenios-prevision-funeraria.component";
import {CATALOGO_ENFERMEDAD_PREEXISTENTE, CATALOGO_TIPO_PAQUETE} from "../../constants/catalogos-funcion";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoPaquete} from "../../models/tipo-paquete.interface";

@Component({
  selector: 'app-agregar-persona-convenios-prevision-funeraria',
  templateUrl: './agregar-persona-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-persona-convenios-prevision-funeraria.component.scss'],
  providers: [DialogService]
})
export class AgregarPersonaConveniosPrevisionFunerariaComponent implements OnInit {

  @Output() personaConvenio = new EventEmitter<PersonaInterface>();

  readonly POSICION_PAISES = 0;
  readonly POSICION_ESTADOS = 1;
  readonly POSICION_PAQUETES = 3;

  personaForm!: FormGroup;
  documentacionForm!: FormGroup;

  beneficiarioRef!: DynamicDialogRef;
  detalleBeneficiarioRef!: DynamicDialogRef;
  modificarBeneficiarioRef!: DynamicDialogRef;

  menuStep: MenuItem[] = MENU_STEPPER_AGREGAR_PERSONA;
  indice: number = 0;

  tipoPaquete!: TipoDropdown[];
  enfermedadPrexistente: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;
  estado!: TipoDropdown[];
  pais!: TipoDropdown[];

  objectoConfirmacion!: PersonaInterface;
  beneficiario: BeneficiarioInterface[] = [];

  otroTipoEnferemdad: boolean = false;
  mostrarModalConfirmacion: boolean = false;
  infoTipoPaquete!: any[];
  detallePais!: any;
  detalleEnfermedad!: any;
  detalleTipoPaquete!: any;
  infoPaqueteSeleccionado!: any;
  respuesta: any;


  constructor(
    private alertaService: AlertaService,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.respuesta = this.route.snapshot.data['respuesta'];
    this.estado = this.respuesta[this.POSICION_ESTADOS]!.map(
      (estado: TipoDropdown) => (
        {label: estado.label, value: estado.value}
      )
    ) || [];
    this.pais = this.respuesta[this.POSICION_PAISES]!.map(
      (pais: TipoDropdown) => (
        {label: pais.label, value: pais.value}
      )
    ) || [];
    this.tipoPaquete = this.respuesta[this.POSICION_PAQUETES]!.datos.map(
      (paquete: any) => (
        {label: paquete.nomPaquete, value: paquete.idPaquete}
      )
    )
    this.infoTipoPaquete = this.respuesta[this.POSICION_PAQUETES].datos;
    this.inicializarFormPersona();
    this.inicializarDocumentacionForm();
  }

  inicializarFormPersona(): void {
    this.personaForm = this.formBuilder.group({
                       curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                        rfc: [{value: null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
                  matricula: [{value: null, disabled: false}],
                     nombre: [{value: null, disabled: true},  [Validators.required]],
             primerApellido: [{value: null, disabled: true},  [Validators.required]],
            segundoApellido: [{value: null, disabled: true},  [Validators.required]],
          correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
                   telefono: [{value: null, disabled: false}, [Validators.required]],
                      calle: [{value: null, disabled: false}, [Validators.required]],
                 noExterior: [{value: null, disabled: false}, [Validators.required]],
                 noInterior: [{value: null, disabled: false}],
                         cp: [{value: null, disabled: false}, [Validators.required]],
                    colonia: [{value: null, disabled: false}, [Validators.required]],
                  municipio: [{value: null, disabled: true}, [Validators.required]],
                     estado: [{value: null, disabled: true}, [Validators.required]],
                tipoPaquete: [{value: null, disabled: false}, [Validators.required]],
      enfermedadPrexistente: [{value: null, disabled: false}, [Validators.required]],
                       pais: [{value: null, disabled: false}, [Validators.required]],
             otraEnferdedad: [{value: null, disabled: false}],
    });
  }

  inicializarDocumentacionForm(): void {
    this.documentacionForm = this.formBuilder.group( {
      ineAfiliado: [{value: null, disabled: false}],
        copiaCURP: [{value: null, disabled: false}],
         copiaRFC: [{value: null, disabled: false}],
      // copiaActaNacimiento: [{value: null, disabled: false}],
      //            copiaINE: [{value: null, disabled: false}],
    });
  }

  abrirModalAgregarBeneficiario(): void {
    this.beneficiarioRef = this.dialogService.open(AgregarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header: "Agregar beneficiario",
      width: "920px",
    });

    this.beneficiarioRef.onClose.subscribe((beneficiarioModal: BeneficiarioInterface) => {
      if (beneficiarioModal) {
        this.beneficiario.push(beneficiarioModal);
      }
    });
  }

  abrirModalDetalleBeneficiario(detalleBeneficiario: BeneficiarioInterface): void {
    this.detalleBeneficiarioRef = this.dialogService.open(DetalleBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Detalle de beneficiario",
      width:"920px",
      data: detalleBeneficiario,
    });
  }

  abrirModalModificarBeneficiario(modificarBeneficiario: BeneficiarioInterface): void {
    this.modificarBeneficiarioRef = this.dialogService.open(ModificarBeneficiarioConveniosPrevisionFunerariaComponent, {
      header:"Modificar beneficiario",
      width:"920px",
      data: modificarBeneficiario,
    })
    this.modificarBeneficiarioRef.onClose.subscribe((beneficiario: BeneficiarioInterface) => {
      if(beneficiario){
        const index = this.beneficiario.findIndex((item: BeneficiarioInterface) => item.curp === beneficiario.curp);
        this.beneficiario[index] = beneficiario;
      }
    })
  }

  abrirModalEliminarBeneficiario(eliminarBeneficiario: BeneficiarioInterface): void {
    this.beneficiario = this.beneficiario.filter((element) => {
      return eliminarBeneficiario.curp != element.curp;
    })
  }

  consultarCP(): void {
    if(!this.fp.cp.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consutaCP(+this.fp.cp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.fp.estado.setValue(respuesta.datos[0]?.estado);
        this.fp.municipio.setValue(respuesta.datos[0]?.municipio);
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  guardar(): void {
    let personasAgregadas: PersonaInterface[] = JSON.parse(localStorage.getItem('persona') as string) || [];
    personasAgregadas.push(this.objectoConfirmacion);
    localStorage.setItem('persona',JSON.stringify(personasAgregadas));
    this.router.navigate(['convenios-prevision-funeraria/ingresar-nuevo-convenio']);
  }

  cambioEnfermedadPrexistente(): void {
    this.otroTipoEnferemdad = false;
    if(this.fp.enfermedadPrexistente.value == 4){
      this.otroTipoEnferemdad = true
      this.fp.otraEnferdedad.setValidators(Validators.required);
      this.fp.otraEnferdedad.patchValue(null);
    }else{
      this.fp.otraEnferdedad.clearValidators();
    }
  }

  mostrarModalTipoPaquete(): void {
    this.infoTipoPaquete.forEach((paquete: TipoPaquete) => {
      if(paquete.idPaquete == this.fp.tipoPaquete.value){
        this.infoPaqueteSeleccionado = paquete.descPaquete
      }
    })
    this.mostrarModalConfirmacion = true;
  }

  consultaCURP(): void{
    if(!this.fp.curp.value)return;
    if (this.personaForm.controls.curp?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(34));
      this.limpiarCampos("curp");
      return;
    }
    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC("",this.fp.curp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.fp.nombre.setValue(respuesta.datos[0].nomPersona);
        this.fp.primerApellido.setValue(respuesta.datos[0].primerApellido);
        this.fp.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultaRFC(): void {
    if(!this.fp.rfc.value){return}
    if (this.personaForm.controls.rfc?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(33));
      this.limpiarCampos("rfc");
      return;
    }

    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC(this.fp.rfc.value,"").pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.fp.nombre.setValue(respuesta.datos[0].nomPersona);
        this.fp.primerApellido.setValue(respuesta.datos[0].primerApellido);
        this.fp.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultarMatricula(): void {
    if(!this.fp.matricula.value){return}
    this.loaderService.activar();
    this.agregarConvenioPFService.consultarMatriculaSiap(this.fp.matricula.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(!respuesta.datos){
          this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(70));
        }
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  validarCorreoElectornico(): void {
    if(!this.fp.correoElectronico.value){return}
    if (this.personaForm.controls.correoElectronico?.errors?.pattern) {
      this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(50));
    }
  }

  limpiarCampos(origen: string): void {
    if(origen.includes("curp") || origen.includes("rfc")){
      this.fp.nombre.patchValue(null);
      this.fp.primerApellido.patchValue(null);
      this.fp.segundoApellido.patchValue(null);
    }
  }


  siguiente(): void {
    this.indice++;
    if(this.indice == 3){
      debugger
      this.objectoConfirmacion = {
          curp: this.personaForm.get('curp')?.value ? this.personaForm.get('curp')?.value : "",
          rfc: this.personaForm.get('rfc')?.value ? this.personaForm.get('rfc')?.value : "",
          matricula: this.personaForm.get('matricula')?.value ? this.personaForm.get('matricula')?.value : "",
          nombre: this.personaForm.get('nombre')?.value ? this.personaForm.get('nombre')?.value : "",
          primerApellido: this.personaForm.get('primerApellido')?.value ? this.personaForm.get('primerApellido')?.value : "",
          segundoApellido: this.personaForm.get('segundoApellido')?.value ? this.personaForm.get('segundoApellido')?.value : "",
          correoElectronico: this.personaForm.get('correoElectronico')?.value ? this.personaForm.get('correoElectronico')?.value : "",
          telefono: this.personaForm.get('telefono')?.value ? this.personaForm.get('telefono')?.value : "",
          calle: this.personaForm.get('calle')?.value ? this.personaForm.get('calle')?.value : "",
          numeroExterior: this.personaForm.get('noExterior')?.value ? this.personaForm.get('noExterior')?.value : "",
          numeroInterior: this.personaForm.get('noInterior')?.value ? this.personaForm.get('noInterior')?.value : "",
          cp: this.personaForm.get('cp')?.value ? this.personaForm.get('cp')?.value : "",
          colonia: this.personaForm.get('colonia')?.value ? this.personaForm.get('colonia')?.value : "",
          municipio: this.personaForm.get('municipio')?.value ? this.personaForm.get('municipio')?.value : "",
          estado: this.personaForm.get('estado')?.value ? this.personaForm.get('estado')?.value : "",
          paquete: this.personaForm.get('tipoPaquete')?.value ? this.personaForm.get('tipoPaquete')?.value : "",
          enfermedadPreexistente: this.personaForm.get('enfermedadPrexistente')?.value ? this.personaForm.get('enfermedadPrexistente')?.value : "",
          ineAfiliado: this.documentacionForm.get('ineAfiliado')?.value ? this.documentacionForm.get('ineAfiliado')?.value : false,
          copiaCURP: this.documentacionForm.get('copiaCURP')?.value ? this.documentacionForm.get('copiaCURP')?.value : false,
          copiaRFC: this.documentacionForm.get('copiaRFC')?.value ? this.documentacionForm.get('copiaRFC')?.value : false,
          beneficiarios: this.beneficiario,
          nss:"",
          numIne:"",
          sexo:"",
          otroSexo:"",
          fechaNacimiento:"",
          tipoPersona:"",
          otraEnfermedad:"",
      }
      this.detallePais = this.pais.filter(pais => {
        return pais.value == this.fp.pais.value;
      });
      this.detalleTipoPaquete = this.tipoPaquete.filter(paquete => {
        return paquete.value == this.fp.tipoPaquete.value;
      })
      this.detalleEnfermedad = CATALOGO_ENFERMEDAD_PREEXISTENTE.filter(enfermedad => {
        return enfermedad.value == this.fp.enfermedadPrexistente.value;
      });
    }
  }

  regresar(): void {
    this.indice--;
  }

  cancelar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  get fp() {
    return this.personaForm.controls;
  }

  get fd(){
    return this.documentacionForm.controls;
  }
}
