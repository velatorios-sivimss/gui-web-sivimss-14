import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {GenerarOrdenServicioService} from "../../services/generar-orden-servicio.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {Panteon} from "../../models/Panteon.interface";

@Component({
  selector: 'app-modal-agregar-panteon',
  templateUrl: './modal-agregar-panteon.component.html',
  styleUrls: ['./modal-agregar-panteon.component.scss']
})
export class ModalAgregarPanteonComponent implements OnInit {

  form!: FormGroup;
  panteonServicioFiltrados: string[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private loaderService: LoaderService,
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
        [
          Validators.required
        ]
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
          disabled: false
        },
        [
          Validators.required
        ]
      ],
      estado: [
        {
          value: null,
          disabled: false
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

  sinEspacioInicial(): void {
    this.f.nombrePanteon.setValue(
      this.f.nombrePanteon.value.trimStart()
    )
  }

  seleccionaPanteon(event:any){
    this.loaderService.activar();
    this.gestionarOrdenServicioService.consultarDatosPanteon(event).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        respuesta.datos.forEach((datosPanteon: any) => {
          this.f.calle.setValue(respuesta.datos[0]?.desCalle)
          this.f.noExterior.setValue(respuesta.datos[0]?.numExterior)
          this.f.noInterior.setValue(respuesta.datos[0]?.numInterior)
          this.f.colonia.setValue(respuesta.datos[0]?.desColonia)
          this.f.municipio.setValue(respuesta.datos[0]?.desMunicipio)
          this.f.estado.setValue(respuesta.datos[0]?.desEstado)
          this.f.cp.setValue(respuesta.datos[0]?.codigoPostal)
          this.f.contacto.setValue(respuesta.datos[0]?.nombreContacto)
          this.f.telefono.setValue(respuesta.datos[0]?.numTelefono)
        });
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  guardarPanteon(): void {
    this.loaderService.activar();
    const objetoPanteon = this.generarObjetoPanteon();
    this.gestionarOrdenServicioService.guardarPanteon(objetoPanteon).pipe(
      finalize(()=>this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.ref.close(respuesta.datos[0].idPanteon);
      },
      (error:HttpErrorResponse) => {
        console.log(error)
      }
    )
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
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        if(respuesta.datos.length>0){
          this.panteonServicioFiltrados = [];
          respuesta.datos.forEach((panteon:any) => {
            this.panteonServicioFiltrados.push(panteon.nombrePanteon);
          })
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }


  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(false);
  }

  get f() {
    return this.form.controls;
  }
}
