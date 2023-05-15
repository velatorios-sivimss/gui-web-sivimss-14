import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AtaudDonado} from "../../../models/consulta-donaciones-interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../../articulos/constants/dummies";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {ConsultaDonacionesService} from "../../../services/consulta-donaciones.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {GestionarDonacionesService} from "../../../services/gestionar-donaciones.service";

@Component({
  selector: 'app-agregar-ataud',
  templateUrl: './agregar-ataud.component.html',
  styleUrls: ['./agregar-ataud.component.scss']
})
export class AgregarAtaudComponent implements OnInit {

  formAtaud!: FormGroup;

  ataud!: TipoDropdown[];

  ataudSeleccionado: any;
  backlogAutaudes!: AtaudDonado[];
  folioAtaudSeleccionado: string = "";


  constructor(
    private formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private loaderService: LoaderService,
    private consultaDonacionesService: GestionarDonacionesService,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit(): void {
    this.consultarAtaudes();
    this.inicializarAtaudForm();
  }

  inicializarAtaudForm(): void {
    this.formAtaud = this.formBuilder.group({
      ataud: [{value:null, disabled: false}, [Validators.required]]
    });
  }

  agregar(): void {
    this.ataudSeleccionado = this.backlogAutaudes.filter( (ataud:AtaudDonado) => {
      return ataud.folioArticulo == this.folioAtaudSeleccionado;
    })
    this.ref.close(...this.ataudSeleccionado);
  }

  consultarAtaudes(): void {
    this.loaderService.activar();
    this.consultaDonacionesService.consultaControlSalidaAtaudes().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {
        this.backlogAutaudes = respuesta.datos;
        this.ataud = mapearArregloTipoDropdown(respuesta.datos,"desModeloArticulo","folioArticulo");
        this.config.data.forEach((elemento:AtaudDonado) => {
          this.ataud = this.ataud.filter(ataud => {
            return ataud.value != elemento.folioArticulo;
          });
        });
      },
      (error: HttpErrorResponse) => {
      }
    )
  }

  tomarFolioAtaudDonado(): void {
    this.backlogAutaudes.forEach((elemento: any)  => {
      if(this.f.ataud.value == elemento.folioArticulo){
        this.folioAtaudSeleccionado = elemento.folioArticulo;

      }
    })
  }

  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.formAtaud.controls;
  }

}
