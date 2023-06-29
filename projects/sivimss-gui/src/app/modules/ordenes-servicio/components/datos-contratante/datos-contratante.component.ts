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
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';

@Component({
  selector: 'app-datos-contratante',
  templateUrl: './datos-contratante.component.html',
  styleUrls: ['./datos-contratante.component.scss']
})
export class DatosContratanteComponent implements OnInit {

  @Output() 
  confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();
  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

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
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarEtapasService: GestionarEtapasService
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
    this.gestionarEtapasService.datosEtapaContratante$.asObservable().subscribe(
     (datosEtapaContratante) => this.inicializarForm(datosEtapaContratante)
    )
  }

  inicializarForm(datosEtapaContratante: any): void {
    this.form = this.formBuilder.group({
      datosContratante: this.formBuilder.group({
        matricula: [{value: datosEtapaContratante.datosContratante.matricula, disabled: false}, [Validators.required]],
        matriculaCheck: [{value: datosEtapaContratante.datosContratante.matriculaCheck, disabled: false}],
        rfc: [{value: datosEtapaContratante.datosContratante.rfc, disabled: false}, [Validators.pattern(PATRON_RFC)]],
        curp: [{value: datosEtapaContratante.datosContratante.curp, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
        nombre: [{value: datosEtapaContratante.datosContratante.nombre, disabled: false}, [Validators.required]],
        primerApellido: [{value: datosEtapaContratante.datosContratante.primerApellido, disabled: false}, [Validators.required]],
        segundoApellido: [{value: datosEtapaContratante.datosContratante.segundoApellido, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: datosEtapaContratante.datosContratante.fechaNacimiento, disabled: false}, [Validators.required]],
        sexo: [{value: datosEtapaContratante.datosContratante.sexo, disabled: false}, [Validators.required]],
        otroTipoSexo: [{value: datosEtapaContratante.datosContratante.otroTipoSexo, disabled: false}],
        nacionalidad: [{value: datosEtapaContratante.datosContratante.nacionalidad, disabled: false}, [Validators.required]],
        lugarNacimiento: [{value: datosEtapaContratante.datosContratante.lugarNacimiento, disabled: false}, [Validators.required]],
        paisNacimiento: [{value: datosEtapaContratante.datosContratante.paisNacimiento, disabled: false}],
        telefono: [{value: datosEtapaContratante.datosContratante.telefono, disabled: false}, [Validators.required]],
        correoElectronico: [{value: datosEtapaContratante.datosContratante.correoElectronico, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
        parentesco: [{value: datosEtapaContratante.datosContratante.parentesco, disabled: false}, [Validators.required]]
      }),
      direccion: this.formBuilder.group({
        calle: [{value: datosEtapaContratante.datosContratante.calle, disabled: false}, [Validators.required]],
        noExterior: [{value: datosEtapaContratante.datosContratante.noExterior, disabled: false}, [Validators.required]],
        noInterior: [{value: datosEtapaContratante.datosContratante.noInterior, disabled: false}, []],
        cp: [{value: datosEtapaContratante.datosContratante.cp, disabled: false}, [Validators.required]],
        colonia: [{value: datosEtapaContratante.datosContratante.colonia, disabled: true}, [Validators.required]],
        municipio: [{value: datosEtapaContratante.datosContratante.municipio, disabled: true}, [Validators.required]],
        estado: [{value: datosEtapaContratante.datosContratante.estado, disabled: true}, [Validators.required]]
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

  continuar() {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "dashed"
        }
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Activo,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "solid"
        }
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Inactivo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "solid"
        }
      },
      {
        idEtapa: 3,
        estado: EtapaEstado.Inactivo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: false,
          estilo: "solid"
        }
      }
    ];
    window.scrollTo(0,0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit(1);

    let datosEtapaContratante = {
      datosContratante: {
        matricula: this.form.value.datosContratante.matricula,
        matriculaCheck: this.form.value.datosContratante.matriculaCheck,
        rfc: this.form.value.datosContratante.rfc,
        curp: this.form.value.datosContratante.curp,
        nombre: this.form.value.datosContratante.nombre,
        primerApellido: this.form.value.datosContratante.primerApellido,
        segundoApellido: this.form.value.datosContratante.segundoApellido,
        fechaNacimiento: this.form.value.datosContratante.fechaNacimiento,
        sexo: this.form.value.datosContratante.sexo,
        otroTipoSexo: this.form.value.datosContratante.otroTipoSexo,
        nacionalidad: this.form.value.datosContratante.nacionalidad,
        lugarNacimiento: this.form.value.datosContratante.lugarNacimiento,
        paisNacimiento: this.form.value.datosContratante.paisNacimiento,
        telefono: this.form.value.datosContratante.telefono,
        correoElectronico: this.form.value.datosContratante.correoElectronico,
        parentesco: this.form.value.datosContratante.parentesco
      },
      direccion: {
        calle: this.form.value.direccion.calle,
        noExterior: this.form.value.direccion.noExterior,
        noInterior: this.form.value.direccion.noInterior,
        cp: this.form.value.direccion.cp,
        colonia: this.form.value.direccion.colonia,
        municipio: this.form.value.direccion.municipio,
        estado: this.form.value.direccion.estado
      }
    }
    this.gestionarEtapasService.datosEtapaContratante$.next(datosEtapaContratante);
    console.log("INFO A GUARDAR: ", datosEtapaContratante);
  }

  get datosContratante() {
    return (this.form.controls['datosContratante'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

}
