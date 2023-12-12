import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {GenerarOrdenServicioService} from "../../services/generar-orden-servicio.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {Panteon} from "../../models/Panteon.interface";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";

@Component({
  selector: 'app-modal-agregar-panteon',
  templateUrl: './modal-agregar-panteon.component.html',
  styleUrls: ['./modal-agregar-panteon.component.scss']
})
export class ModalAgregarPanteonComponent implements OnInit {

  form!: FormGroup;
  panteonServicioFiltrados: string[] = [];
  colonias:TipoDropdown[] = [];

  constructor(
    private alertaService: AlertaService,
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private gestionarOrdenServicioService: GenerarOrdenServicioService,
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      nombrePanteon: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      calle: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      noExterior: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      noInterior: [
        {
          value: null,
          disabled: false
        },
      ],
      colonia: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      municipio: [
        {
          value: null,
          disabled: true
        },
        [
          Validators.required
        ]
      ],
      estado: [
        {
          value: null,
          disabled: true
        },
        [
          Validators.required
        ]
      ],
      cp: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      contacto: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      telefono: [
        {
          value: null,
          disabled: false
        },
        [
          Validators.required
        ]
      ]
    });
  }

  validarNombre(posicion: number): void {
    let formularios = [this.f.nombrePanteon];
    let value = formularios[posicion].value;
    let nuevoValor =  value.replace(/[^a-zA-Z0-9ñÑ\s]+/g, '');
    nuevoValor = nuevoValor.replace(/\s+/g, ' ');
    formularios[posicion].setValue(nuevoValor)


  }

  sinEspacioInicial(posicion:number): void {
    let formularios = [this.f.nombrePanteon]
    if(formularios[posicion].value.charAt(posicion).includes(' ')){
      formularios[posicion].setValue(formularios[posicion].value.trimStart());
    }
  }

  seleccionaPanteon(event:any){
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarDatosPanteon(event).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        respuesta.datos.forEach((datosPanteon: any) => {

          this.f.calle.setValue(respuesta.datos[0]?.desCalle)
          this.f.calle.disable();
          this.f.noExterior.setValue(respuesta.datos[0]?.numExterior)
          this.f.noExterior.disable();
          this.f.noInterior.setValue(respuesta.datos[0]?.numInterior)
          this.f.noInterior.disable();
          this.colonias = [{label: respuesta.datos[0]?.desColonia, value: respuesta.datos[0]?.desColonia}];
          this.f.colonia.setValue(respuesta.datos[0]?.desColonia)
          this.f.colonia.disable();
          this.f.municipio.setValue(respuesta.datos[0]?.desMunicipio)
          this.f.municipio.disable();
          this.f.estado.setValue(respuesta.datos[0]?.desEstado)
          this.f.estado.disable();
          this.f.cp.setValue(respuesta.datos[0]?.codigoPostal)
          this.f.cp.disable();
          this.f.contacto.setValue(respuesta.datos[0]?.nombreContacto)
          this.f.contacto.disable();
          this.f.telefono.setValue(respuesta.datos[0]?.numTelefono)
          this.f.telefono.disable();
        });
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    } )
  }



  guardarPanteon(): void {
    this.loaderService.activar();
    const objetoPanteon = this.generarObjetoPanteon();
    this.gestionarOrdenServicioService.guardarPanteon(objetoPanteon).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.ref.close(respuesta.datos[0].idPanteon);
      },
      error: (error: HttpErrorResponse) => {

        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(5));
      }
    })
  }

  generarObjetoPanteon(): Panteon {
    return {
      nombrePanteon: this.f.nombrePanteon.value,
      domicilio: {
        desCalle: this.f.calle.value,
        numExterior: this.f.noExterior.value,
        numInterior: this.f.noInterior.value,
        codigoPostal: this.f.cp.value,
        desColonia: this.f.colonia.value,
        desMunicipio: this.f.municipio.value,
        desEstado: this.f.estado.value,
        desCiudad:null
      },
      nombreContacto:this.f.contacto.value,
      numTelefono:this.f.telefono.value
    }
  }


  filtrarPateon(event : any): void {


    let query = event.query;
    this.loaderService.activar()
    this.gestionarOrdenServicioService.consultarDatosPanteon(query).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.datos.length > 0) {
          this.panteonServicioFiltrados = [];
          respuesta.datos.forEach((panteon: any) => {
            this.panteonServicioFiltrados.push(panteon.nombrePanteon);
          })
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      }
    })
  }

  consultarCP(): void {
    if (!this.f.cp.value) {
      return;
    }
    this.loaderService.activar();
    this.gestionarOrdenServicioService
      .consutaCP(this.f.cp.value)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta && +respuesta.mensaje != 185) {
            this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre')
            this.f.municipio.setValue(
              respuesta.datos[0].municipio.nombre
            );
            this.f.estado.setValue(
              respuesta.datos[0].municipio.entidadFederativa.nombre
            );
            return;
          }
          this.alertaService.mostrar(TipoAlerta.Precaucion,
            this.mensajesSistemaService.obtenerMensajeSistemaPorId(185));
          this.colonias = [];
          this.f.colonia.patchValue(null);
          this.f.municipio.patchValue(null);
          this.f.estado.patchValue(null);
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
        }
      });
  }

  seleccionarEstilos(): string {
    if(this.f.nombrePanteon?.errors?.required && (this.f.nombrePanteon?.dirty || this.f.nombrePanteon?.touched)){
      return 'input-autocomplete input-autocomplete-error'
    }
    return 'input-autocomplete'
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(false);
  }

  get f() {
    return this.form.controls;
  }
}
