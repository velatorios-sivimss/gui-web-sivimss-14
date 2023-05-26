import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {nacionalidad, sexo} from "../../constants/catalogos-complementarios";
import {ActivatedRoute} from "@angular/router";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {GestionarDonacionesService} from "../../../consulta-donaciones/services/gestionar-donaciones.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {GenerarOrdenServicioService} from "../../services/generar-orden-servicio.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {ConfirmacionServicio} from "../../../renovacion-extemporanea/models/convenios-prevision.interface";

@Component({
  selector: 'app-datos-contratante',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.scss']
})
export class DatosContratanteComponent implements OnInit {

  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();

  readonly POSICION_PAIS = 0;
  readonly POSICION_ESTADO = 1;
  readonly POSICION_PARENTESCO = 2;

  form!: FormGroup;

  tipoSexo: TipoDropdown[] = sexo;
  nacionalidad: TipoDropdown[] = nacionalidad;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  parentesco!: TipoDropdown[];

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.pais = respuesta[this.POSICION_PAIS]!.map((pais: any) => (
      {label: pais.label, value: pais.value} )) || [];
    this.estado = respuesta[this.POSICION_ESTADO]!.map((estado: any) => (
      {label: estado.label, value: estado.value} )) || [];
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: any) => (
      {label: parentesco.label, value: parentesco.value} )) || [];

    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [{value: null, disabled: false}, [Validators.required]],
        matriculaCheck: [{value: true, disabled: false}],
        rfc: [{value: null, disabled: false}, [Validators.pattern(PATRON_RFC)]],
        curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
        nombre: [{value: null, disabled: false}, [Validators.required]],
        primerApellido: [{value: null, disabled: false}, [Validators.required]],
        segundoApellido: [{value: null, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
        sexo: [{value: null, disabled: false}, [Validators.required]],
        otroTipoSexo: [{value: null, disabled: false}],
        nacionalidad: [{value: null, disabled: false}, [Validators.required]],
        lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],
        paisNacimiento: [{value: null, disabled: false}],
        telefono: [{value: null, disabled: false}, [Validators.required]],
        correoElectronico: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
        parentesco: [{value: null, disabled: false}, [Validators.required]]
      }),
      direccion: this.formBuilder.group({
        calle: [{value: null, disabled: false}, [Validators.required]],
        noExterior: [{value: null, disabled: false}, [Validators.required]],
        noInterior: [{value: null, disabled: false}, []],
        cp: [{value: null, disabled: false}, [Validators.required]],
        colonia: [{value: null, disabled: true}, [Validators.required]],
        municipio: [{value: null, disabled: true}, [Validators.required]],
        estado: [{value: null, disabled: true}, [Validators.required]]
      })
    });
  }

  noEspaciosAlPrincipio(posicion:number) {
    const formName = [this.datosContratante.nombre, this.datosContratante.primerApellido, this.datosContratante.segundoApellido];
   formName[posicion].setValue(
     formName[posicion].value.trimStart()
   );
  }

  consultarCURP(): void {
    if(!this.datosContratante.curp.value){return}
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarCURP(this.datosContratante.curp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          if(respuesta.mensaje.includes("Externo")){
            const [dia,mes,anio]= respuesta.datos.fechNac.split('/');
            const fecha = new Date(anio+"/"+mes+"/"+dia);
            this.datosContratante.nombre.setValue(respuesta.datos.nombre);
            this.datosContratante.primerApellido.setValue(respuesta.datos.apellido1);
            this.datosContratante.segundoApellido.setValue(respuesta.datos.apellido2);
            this.datosContratante.fechaNacimiento.setValue(fecha);
            if(respuesta.datos.sexo.includes("HOMBRE")){this.datosContratante.sexo.setValue(2)}
            if(respuesta.datos.sexo.includes("MUJER")){this.datosContratante.sexo.setValue(1)}
            if(respuesta.datos.desEntidadNac.includes("MEXICO") ||
              respuesta.datos.desEntidadNac.includes("MEX")) {this.datosContratante.nacionalidad.setValue(1)}
            else{this.datosContratante.nacionalidad.setValue(2)}
          }else{
            let [anio,mes,dia]= respuesta.datos[0].fechaNac.split('-');
            dia = dia.substr(0,2);
            const fecha = new Date(anio+"/"+mes+"/"+dia);
            this.datosContratante.nombre.setValue(respuesta.datos[0].nombre);
            this.datosContratante.primerApellido.setValue(respuesta.datos[0].primerApellido);
            this.datosContratante.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
            this.datosContratante.fechaNacimiento.setValue(fecha);
            this.datosContratante.sexo.setValue(+respuesta.datos[0].sexo);
            if(+respuesta.datos[0].idPais == 119){this.datosContratante.nacionalidad.setValue(1)}
            else{this.datosContratante.nacionalidad.setValue(2)}
          }
          return;
        }
        this.limpiarConsultaDatosPersonales();
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje)));
      },
      (error:HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultarRFC(): void {
    if(!this.datosContratante.rfc.value){return}
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarRFC(this.datosContratante.rfc.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos.length > 0){
          let [anio,mes,dia]= respuesta.datos[0].fechaNac.split('-');
          dia = dia.substr(0,2);
          const fecha = new Date(anio+"/"+mes+"/"+dia);
          this.datosContratante.nombre.setValue(respuesta.datos[0].nombre);
          this.datosContratante.primerApellido.setValue(respuesta.datos[0].primerApellido);
          this.datosContratante.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
          this.datosContratante.fechaNacimiento.setValue(fecha);
          this.datosContratante.sexo.setValue(+respuesta.datos[0].sexo);
          if(+respuesta.datos[0].idPais == 119){this.datosContratante.nacionalidad.setValue(1)}
          else{this.datosContratante.nacionalidad.setValue(2)}
          return;
        }
        this.limpiarConsultaDatosPersonales();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  consultaCP(): void {
    this.loaderService.activar();
    if(!this.direccion.cp.value){return}
    this.gestionarOrdenServicioService.consutaCP(this.direccion.cp.value).pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta){
          this.direccion.colonia.setValue(respuesta.datos[11].nombre);
          this.direccion.municipio.setValue(respuesta.datos[0].localidad.municipio.nombre);
          this.direccion.estado.setValue(respuesta.datos[0].localidad.municipio.entidadFederativa.nombre);
          return;
        }
        this.direccion.colonia.patchValue(null);
        this.direccion.municipio.patchValue(null);
        this.direccion.estado.patchValue(null);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  cambiarValidacion(): void {
    if(!this.datosContratante.matriculaCheck.value){
      this.datosContratante.matricula.clearValidators();
      this.datosContratante.matricula.patchValue(this.datosContratante.matricula.value);
      return;
    }
    this.datosContratante.matricula.setValidators(Validators.required);
    this.datosContratante.matricula.patchValue(this.datosContratante.matricula.value);
  }

  cambiarTipoSexo(): void {
    if(this.datosContratante.sexo.value == 3){
      this.datosContratante.otroTipoSexo.enabled;
      this.datosContratante.otroTipoSexo.setValidators(Validators.required);
      return;
    }
    this.datosContratante.otroTipoSexo.disabled;
    this.datosContratante.otroTipoSexo.clearValidators();
    this.datosContratante.otroTipoSexo.setValue(null);
  }

  cambiarNacionalidad(): void {
    if(this.datosContratante.nacionalidad.value == 1) {
      this.datosContratante.paisNacimiento.disabled;
      this.datosContratante.paisNacimiento.clearValidators();
      this.datosContratante.paisNacimiento.reset();
      this.datosContratante.lugarNacimiento.enabled;
      this.datosContratante.lugarNacimiento.setValidators(Validators.required);
      return;
    }
    this.datosContratante.lugarNacimiento.disabled;
    this.datosContratante.lugarNacimiento.clearValidators();
    this.datosContratante.lugarNacimiento.reset();
    this.datosContratante.paisNacimiento.enabled;
    this.datosContratante.paisNacimiento.setValidators(Validators.required);
  }

  limpiarConsultaDatosPersonales(): void {
    this.datosContratante.nombre.patchValue(null);
    this.datosContratante.primerApellido.patchValue(null);
    this.datosContratante.segundoApellido.patchValue(null);
    this.datosContratante.fechaNacimiento.patchValue(null);
    this.datosContratante.sexo.reset();
    this.datosContratante.nacionalidad.reset();
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

}
