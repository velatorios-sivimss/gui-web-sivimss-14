import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../convenios-prevision-funeraria/constants/dummies";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {AtaudDonado, ConsultaAtaudesDonados} from "../../models/consulta-donaciones-interface";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {ConsultaDonacionesService} from "../../services/consulta-donaciones.service";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";

@Component({
  selector: 'app-agregar-ataud-donado',
  templateUrl: './agregar-ataud-donado.component.html',
  styleUrls: ['./agregar-ataud-donado.component.scss']
})
export class AgregarAtaudDonadoComponent implements OnInit {

  agregarAtaudForm!: FormGroup;
  ataudDonado!: TipoDropdown[];
  backlogAutaudes!: AtaudDonado[];
  ataudSeleccionado: any;


  cargaInfoInicial!: ConsultaAtaudesDonados;

  constructor(
    private readonly ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    private loaderService: LoaderService,
    private consultaDonacionesService: ConsultaDonacionesService,
  ) { }

  ngOnInit(): void {
    this.cargaInfoInicial = this.config.data;
    this.inicializarAgregarAtaudForm();
    this.ataudesDonados();
  }

  inicializarAgregarAtaudForm(): void {
    this.agregarAtaudForm = this.formBuilder.group({
      ataudDonado: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  agregar(): void {
    this.ataudSeleccionado = this.backlogAutaudes.filter( (ataud:AtaudDonado) => {
      return ataud.idArticulo == this.f.ataudDonado.value;
    })
    this.ref.close(...this.ataudSeleccionado);
  }

  ataudesDonados(){
    if(!this.config.data.folio){return}
    this.loaderService.activar();
    this.consultaDonacionesService.consultaAceptacionAtaudDonado(this.cargaInfoInicial.folio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta:HttpRespuesta<any>)=> {
        if(respuesta.datos.length > 0){
          this.backlogAutaudes = respuesta.datos;
          this.ataudDonado = mapearArregloTipoDropdown(respuesta.datos,"desModeloArticulo","idArticulo");
          this.config.data.ataudes.forEach( (elemento:any) => {
            this.ataudDonado = this.ataudDonado.filter( ataud => {
              return ataud.value != elemento.idArticulo;
            })
          })
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  cancelar(): void {
    this.ref.close();
  }

  get f() {
    return this.agregarAtaudForm.controls;
  }

}