import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService } from "primeng/dynamicdialog";
import { ModalGenerarTarjetaIdentificacionComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-generar-tarjeta-identificacion/modal-generar-tarjeta-identificacion.component";
import { ModalSeleccionarBeneficiarioComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {sexo, tipoOrden,nacionalidad} from "../../constants/catalogos-complementarios";
import {PATRON_CURP} from "../../../../utils/constantes";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {GenerarOrdenServicioService} from "../../services/generar-orden-servicio.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {ActivatedRoute} from "@angular/router";
import * as moment from 'moment';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';

@Component({
  selector: 'app-datos-finado',
  templateUrl: './datos-finado.component.html',
  styleUrls: ['./datos-finado.component.scss']
})
export class DatosFinadoComponent implements OnInit {

  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();

  readonly POSICION_PAIS = 0;
  readonly POSICION_ESTADO = 1;
  readonly POSICION_UNIDADES_MEDICAS = 3;

  form!: FormGroup;
  tipoOrden: TipoDropdown[] = tipoOrden;

  tipoSexo: TipoDropdown[] = sexo;
  nacionalidad: TipoDropdown[] = nacionalidad;

  estado!: TipoDropdown[];
  pais!: TipoDropdown[];
  unidadesMedicas!: TipoDropdown[];


  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarEtapasService: GestionarEtapasService
  ) {
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
    this.pais = respuesta[this.POSICION_PAIS]!.map((pais: any) => (
      {label: pais.label, value: pais.value} )) || [];
    this.estado = respuesta[this.POSICION_ESTADO]!.map((estado: any) => (
      {label: estado.label, value: estado.value} )) || []
    // this.unidadesMedicas = respuesta[this.POSICION_UNIDADES_MEDICAS]!.map((unidad: any) => (
    //   {label: unidad.label, value: unidad.value} )) || [];
    this.inicializarForm();
    this.inicializarCalcularEdad();
  }

  inicializarForm(): void {

    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [{value: null, disabled: false}, [Validators.required]],
        noContrato: [{value: null, disabled: false}, [Validators.required]],
        velatorioPrevision: [{value: null, disabled: false}, [Validators.required]],
        esObito: [{value: null, disabled: false}, [Validators.required]],
        esParaExtremidad: [{value: null, disabled: false}, [Validators.required]],
        matricula: [{value: null, disabled: false}, [Validators.required]],
        matriculaCheck: [{value: true, disabled: false}],
        curp: [{value: null, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
        nss: [{value: null, disabled: false}, [Validators.required]],
        nombre: [{value: null, disabled: false}, [Validators.required]],
        primerApellido: [{value: null, disabled: false}, [Validators.required]],
        segundoApellido: [{value: null, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
        edad: [{value: null, disabled: false}, [Validators.required]],
        sexo: [{value: null, disabled: false}, [Validators.required]],
        otroTipoSexo: [{value: null, disabled: false}],
        nacionalidad: [{value: null, disabled: false}, [Validators.required]],
        lugarNacimiento: [{value: null, disabled: false}, [Validators.required]],
        paisNacimiento: [{value: null, disabled: false}],
        fechaDefuncion: [{value: null, disabled: false}, [Validators.required]],
        causaDeceso: [{value: null, disabled: false}, [Validators.required]],
        lugarDeceso: [{value: null, disabled: false}, [Validators.required]],
        horaDeceso: [{value: null, disabled: false}, [Validators.required]],
        clinicaAdscripcion: [{value: null, disabled: false}, [Validators.required]],
        unidadProcedencia: [{value: null, disabled: false}, [Validators.required]],
        procedenciaFinado: [{value: null, disabled: false}, [Validators.required]],
        tipoPension: [{value: null, disabled: false}, [Validators.required]]
      }),
      direccion: this.formBuilder.group({
        calle: [{value: null, disabled: false}, [Validators.required]],
        noExterior: [{value: null, disabled: false}, [Validators.required]],
        noInterior: [{value: null, disabled: false}, [Validators.required]],
        cp: [{value: null, disabled: false}, [Validators.required]],
        colonia: [{value: null, disabled: false}, [Validators.required]],
        municipio: [{value: null, disabled: false}, [Validators.required]],
        estado: [{value: null, disabled: false}, [Validators.required]]
      })
    });
  }

  abrirModalSeleccionBeneficiarios():void{
    const ref = this.dialogService.open(ModalSeleccionarBeneficiarioComponent, {
      header: 'Seleccionar beneficiario',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalSeleccionarBeneficiarioComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalSeleccionarBeneficiarioComponent
      }
    });
  }

  consultarCURP(): void {
    if(!this.datosFinado.curp.value){return}
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarCURP(this.datosFinado.curp.value).pipe(
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos) {
          if(respuesta.mensaje.includes("Externo")){
            const [dia,mes,anio]= respuesta.datos.fechNac.split('/');
            const fecha = new Date(anio+"/"+mes+"/"+dia);
            this.datosFinado.nombre.setValue(respuesta.datos.nombre);
            this.datosFinado.primerApellido.setValue(respuesta.datos.apellido1);
            this.datosFinado.segundoApellido.setValue(respuesta.datos.apellido2);
            this.datosFinado.fechaNacimiento.setValue(fecha);
            if(respuesta.datos.sexo.includes("HOMBRE")){this.datosFinado.sexo.setValue(2)}
            if(respuesta.datos.sexo.includes("MUJER")){this.datosFinado.sexo.setValue(1)}
            if(respuesta.datos.desEntidadNac.includes("MEXICO") ||
              respuesta.datos.desEntidadNac.includes("MEX")) {this.datosFinado.nacionalidad.setValue(1)}
            else{this.datosFinado.nacionalidad.setValue(2)}
          }else{
            let [anio,mes,dia]= respuesta.datos[0].fechaNac.split('-');
            dia = dia.substr(0,2);
            const fecha = new Date(anio+"/"+mes+"/"+dia);
            this.datosFinado.nombre.setValue(respuesta.datos[0].nombre);
            this.datosFinado.primerApellido.setValue(respuesta.datos[0].primerApellido);
            this.datosFinado.segundoApellido.setValue(respuesta.datos[0].segundoApellido);
            this.datosFinado.fechaNacimiento.setValue(fecha);
            this.datosFinado.sexo.setValue(+respuesta.datos[0].sexo);
            if(+respuesta.datos[0].idPais == 119){this.datosFinado.nacionalidad.setValue(1)}
            else{this.datosFinado.nacionalidad.setValue(2)}
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

  inicializarCalcularEdad(): void {

    this.datosFinado.fechaNacimiento.valueChanges.subscribe(()=> {

      // let hoy = moment();
      // let fechaComparar = moment(this.datosFinado.fechaNacimiento.value);
      // let fechaDiferencia = hoy.diff(fechaComparar,"years");
      // console.log(fechaDiferencia);
      this.datosFinado.edad.setValue(moment().diff(moment(this.datosFinado.fechaNacimiento.value), "years"));
    })
  }

  cambiarValidacion(): void {
    if(!this.datosFinado.matriculaCheck.value){
      this.datosFinado.matricula.clearValidators();
      this.datosFinado.matricula.patchValue(this.datosFinado.matricula.value);
      return;
    }
    this.datosFinado.matricula.setValidators(Validators.required);
    this.datosFinado.matricula.patchValue(this.datosFinado.matricula.value);
  }

  cambiarTipoSexo(): void {
    if(this.datosFinado.sexo.value == 3){
      this.datosFinado.otroTipoSexo.enabled;
      this.datosFinado.otroTipoSexo.setValidators(Validators.required);
      return;
    }
    this.datosFinado.otroTipoSexo.disabled;
    this.datosFinado.otroTipoSexo.clearValidators();
    this.datosFinado.otroTipoSexo.setValue(null);
  }
  cambiarNacionalidad(): void {
    if(this.datosFinado.nacionalidad.value == 1) {
      this.datosFinado.paisNacimiento.disabled;
      this.datosFinado.paisNacimiento.clearValidators();
      this.datosFinado.paisNacimiento.reset();
      this.datosFinado.lugarNacimiento.enabled;
      this.datosFinado.lugarNacimiento.setValidators(Validators.required);
      return;
    }
    this.datosFinado.lugarNacimiento.disabled;
    this.datosFinado.lugarNacimiento.clearValidators();
    this.datosFinado.lugarNacimiento.reset();
    this.datosFinado.paisNacimiento.enabled;
    this.datosFinado.paisNacimiento.setValidators(Validators.required);
  }

  limpiarConsultaDatosPersonales(): void {
    this.datosFinado.nombre.patchValue(null);
    this.datosFinado.primerApellido.patchValue(null);
    this.datosFinado.segundoApellido.patchValue(null);
    this.datosFinado.fechaNacimiento.patchValue(null);
    this.datosFinado.sexo.reset();
    this.datosFinado.nacionalidad.reset();
  }

  regresar() {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Activo,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "solid"
        }
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Inactivo,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
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
    this.seleccionarEtapa.emit(0);
    console.log("INFO A GUARDAR STEP 2: ", this.form.value);
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
        estado: EtapaEstado.Completado,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "dashed"
        }
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Activo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
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
    this.seleccionarEtapa.emit(2);
    console.log("INFO A GUARDAR STEP 2: ", this.form.value);
  }

  get datosFinado() {
    return (this.form.controls['datosFinado'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

}
