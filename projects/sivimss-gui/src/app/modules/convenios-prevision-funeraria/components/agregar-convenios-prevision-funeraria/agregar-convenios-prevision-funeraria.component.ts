import { Component, OnInit } from '@angular/core';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {SERVICIO_BREADCRUMB_AGREGAR} from "../../constants/breadcrumb-agregar";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies"
import {PersonaInterface} from "../../models/persona.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {Promotor} from "../../models/promotor.interface";
import {Empresa} from "../../models/empresa.interface";

@Component({
  selector: 'app-agregar-convenios-prevision-funeraria',
  templateUrl: './agregar-convenios-prevision-funeraria.component.html',
  styleUrls: ['./agregar-convenios-prevision-funeraria.component.scss']
})
export class AgregarConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PROMOTOR:number = 4;


  filtroForm!: FormGroup;
  convenioForm!: FormGroup;
  documentacionForm!: FormGroup;

  personasAgregadas!:PersonaInterface[];

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  tipoContratacion:TipoDropdown[] = [{value:1,label:'Por Persona'},{value:2,label:'Por Grupo o por Empresa'}];
  pais: TipoDropdown[] = CATALOGOS_DUMMIES;
  estado: TipoDropdown[] = CATALOGOS_DUMMIES;
  //TODO Verificar si cambiar variable por personasAgregadas
  personasConvenio: PersonaInterface[] = [];
  promotores: Promotor[] = [];
  agregarPersona: boolean = false;
  agregarPromotor: boolean = false;

  existePersona: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private agregarConvenioPFService:AgregarConvenioPFService,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.personasAgregadas = JSON.parse(localStorage.getItem('persona') as string) || [];
    if(this.personasAgregadas.length > 0){
      // localStorage.removeItem('persona')
      this.existePersona = true;
    }


    const respuesta = this.route.snapshot.data['respuesta'];
    this.promotores = respuesta[this.POSICION_PROMOTOR]!.datos.map(
      (promotor: any) => (
        {label: promotor.nombrePromotor, value: promotor.idPromotor}
      )
    )
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
    this.inicializarDocumentacionForm();
    this.validarEscenarioPorEmpresa();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB_AGREGAR);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
        numeroConvenio: [{value: null, disabled: false}, [Validators.required]],
      tipoContratacion: [{value: null, disabled: false}, [Validators.required]],
               rfcCurp: [{value: null, disabled: false}, [Validators.required]],
              promotor: [{value: null, disabled: false}, [Validators.required]],
    })
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

  consultaRFCCURP(): void {
    if(!this.ff.rfcCurp.value){return}
    const tipo = this.ff.rfcCurp.value;
    let rfc = "";
    let curp = "";
    tipo.length <= 13 ? rfc = tipo : curp = tipo;
    this.loaderService.activar();
    this.agregarConvenioPFService.consultaCURPRFC(rfc,curp).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {

      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    )
  }

  validarTipoContratacion(): void{
    localStorage.removeItem('persona');
    localStorage.removeItem('personasAgregadas');
  }

  validarEscenarioPorEmpresa(): void {
    if(this.personasAgregadas.length > 0){
      this.ff.tipoContratacion.setValue(2);
    }
  }

  existePromotor(existePromotor: boolean): void {
    this.agregarPromotor = existePromotor;
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

  guardar(): void {

  }



  get ff() {
    return this.filtroForm.controls;
  }

}
