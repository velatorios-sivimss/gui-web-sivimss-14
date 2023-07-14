import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {ActivatedRoute} from "@angular/router";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {PATRON_CORREO, PATRON_CURP, PATRON_RFC} from "../../../../utils/constantes";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import * as moment from "moment/moment";

@Component({
  selector: 'app-modificar-beneficiario-convenios-prevision-funeraria',
  templateUrl: './modificar-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./modificar-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class ModificarBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiarioForm!: FormGroup;

  // TODO se tiene la interfaz pero marca posibles datos indefinidos, validar cómo quitar ese error de compilación
  datosBeneficiario!: any;

  velatorio: TipoDropdown[] = [];
  parentesco!: TipoDropdown[];
  fechaNacimientoFormateada!: any;

  hoy = new Date();

  constructor(
    private route: ActivatedRoute,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    private agregarConvenioPFService: AgregarConvenioPFService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    this.datosBeneficiario = this.config.data;
    let fecha;
    if(typeof this.datosBeneficiario.fechaNacimiento == "string"){
      let [anio,mes,dia] = this.datosBeneficiario.fechaNacimiento.split('-');
      dia = dia.substr(0,2);
      fecha = new Date(anio+"/"+mes+"/"+dia);
    }else{
      fecha = this.datosBeneficiario.fechaNacimiento
    }

    let respuesta = this.route.snapshot.data['respuesta'];
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.inicializarBeneficiarioForm(fecha);
    this.consultaVelatorio();
    if(+this.f.edad.value < 18){
      this.f.validaActaNacimientoBeneficiario.enable();
      this.f.validaIneBeneficiario.disable();
    }else{
      this.f.validaActaNacimientoBeneficiario.disable();
      this.f.validaIneBeneficiario.disable();
    }
    this.validarEdad()
  }

  inicializarBeneficiarioForm(fecha: Date): void {
    let ineCheck: boolean = false;
    let actaCheck: boolean = false;


    if(typeof this.datosBeneficiario?.documentacion.validaActaNacimientoBeneficiario == "string"){
        this.datosBeneficiario?.documentacion.validaActaNacimientoBeneficiario.includes('true') ? actaCheck = true : actaCheck = false;
    }else{
      actaCheck = this.datosBeneficiario?.documentacion.validaActaNacimientoBeneficiario;
    }


    if(typeof this.datosBeneficiario?.documentacion.validaIneBeneficiario == "string"){
        this.datosBeneficiario?.documentacion.validaIneBeneficiario.includes('true') ? ineCheck = true : ineCheck = false;
    }else{
      ineCheck = this.datosBeneficiario?.documentacion.validaIneBeneficiario
    }

    this.beneficiarioForm = this.formBuilder.group({
                             velatorio: [{value: this.datosBeneficiario.velatorio, disabled: true}, [Validators.required]],
                       fechaNacimiento: [{value: fecha, disabled: false}, [Validators.required]],
                                  edad: [{value: this.datosBeneficiario.edad, disabled: false}, [Validators.required]],
                                nombre: [{value: this.datosBeneficiario.nombre, disabled: false}, [Validators.required]],
                        primerApellido: [{value: this.datosBeneficiario.primerApellido, disabled: false}, [Validators.required]],
                       segundoApellido: [{value: this.datosBeneficiario.segundoApellido, disabled: false}, [Validators.required]],
                            parentesco: [{value: +this.datosBeneficiario.parentesco, disabled: false}, [Validators.required]],
                                  curp: [{value: this.datosBeneficiario.curp, disabled: false}, [Validators.required, Validators.pattern(PATRON_CURP)]],
                                   rfc: [{value: this.datosBeneficiario.rfc, disabled: false}, [Validators.pattern(PATRON_RFC)]],
                        actaNacimiento: [{value: this.datosBeneficiario.actaNacimiento, disabled: false}, [Validators.required]],
                     correoElectronico: [{value: this.datosBeneficiario.correoElectronico, disabled: false}, [Validators.required, Validators.pattern(PATRON_CORREO)]],
                              telefono: [{value: this.datosBeneficiario.telefono, disabled: false}, [Validators.required]],
      validaActaNacimientoBeneficiario: [{value: actaCheck, disabled: false}],
                 validaIneBeneficiario: [{value: ineCheck, disabled: true}],

      matricula:[{value:'',disabled:true}],
      nss:[{value:'',disabled:true}],
      numIne:[{value:'',disabled:true}],
      sexo:[{value:'',disabled:true}],
      otroSexo:[{value:'',disabled:true}],
      tipoPersona:[{value:'',disabled:true}],
      calle:[{value:'',disabled:true}],
      numeroExterior:[{value:'',disabled:true}],
      numeroInterior:[{value:'',disabled:true}],
      cp:[{value:'',disabled:true}],
      colonia:[{value:'',disabled:true}],
      municipio:[{value:'',disabled:true}],
      estado:[{value:'',disabled:true}],
      pais:[{value:'',disabled:true}],
      enfermedadPreexistente:[{value:'',disabled:true}],
      otraEnfermedad:[{value:'',disabled:true}],


    });
  }

  consultaVelatorio(): void {
    let usuario = JSON.parse(localStorage.getItem('usuario') as string);
    this.loaderService.activar();
    this.agregarConvenioPFService.obtenerCatalogoVelatoriosPorDelegacion(usuario.idDelegacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.velatorio = respuesta.datos!.map(
          (velatorio: any) => (
            {label: velatorio.nomVelatorio, value: velatorio.idVelatorio}
          )
        )
        this.f.velatorio.setValue(+usuario.idVelatorio);
      },
      (error: HttpErrorResponse)=> {
        console.log(error);
      }
    )
  }

  validarEdad(): void {
    if(+this.f.edad.value < 18){
      this.f.validaActaNacimientoBeneficiario.enable();
      this.f.validaIneBeneficiario.disable();
      this.f.validaIneBeneficiario.patchValue(null);
    }else{
      this.f.validaIneBeneficiario.enable();
      this.f.validaActaNacimientoBeneficiario.disable();
      this.f.validaActaNacimientoBeneficiario.patchValue(null);
    }
  }

  aceptar(): void {
    const beneficiarioGuardar: BeneficiarioInterface = {
      velatorio: this.f.velatorio.value.toString(),
      fechaNacimiento: moment(this.f.fechaNacimiento.value).format('yyyy-MM-DD'),
      edad: this.f.edad.value.toString(),
      nombre: this.f.nombre.value.toString(),
      primerApellido: this.f.primerApellido.value.toString(),
      segundoApellido: this.f.segundoApellido.value.toString(),
      parentesco: this.f.parentesco.value.toString(),
      curp: this.f.curp.value.toString(),
      rfc: this.f.rfc.value.toString(),
      actaNacimiento: this.f.actaNacimiento.value.toString(),
      correoElectronico: this.f.correoElectronico.value.toString(),
      telefono: this.f.telefono.value.toString(),
      documentacion:{
        validaActaNacimientoBeneficiario: this.f.validaActaNacimientoBeneficiario?.value ?? false,
        validaIneBeneficiario: this.f.validaIneBeneficiario?.value ?? false,
      },
      nss: this.f.nss.value.toString(),
      numIne: this.f.numIne.value.toString(),
      sexo: this.f.sexo.value.toString(),
      otroSexo: this.f.otroSexo.value.toString(),
      tipoPersona: this.f.tipoPersona.value.toString(),
      calle: this.f.calle.value.toString(),
      numeroExterior: this.f.numeroExterior.value.toString(),
      numeroInterior: this.f.numeroInterior.value.toString(),
      cp: this.f.cp.value.toString(),
      colonia: this.f.colonia.value.toString(),
      municipio: this.f.municipio.value.toString(),
      estado: this.f.estado.value.toString(),
      pais: this.f.pais.value.toString(),
      enfermedadPreexistente: this.f.enfermedadPreexistente.value.toString(),
      otraEnfermedad: this.f.otraEnfermedad.value.toString(),
    }
    this.ref.close(beneficiarioGuardar);
  }

  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.beneficiarioForm.controls;
  }
}
