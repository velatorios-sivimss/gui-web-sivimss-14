import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AtaudDonado} from "../../../models/consulta-donaciones-interface";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {GestionarDonacionesService} from "../../../services/gestionar-donaciones.service";
import {AlertaService} from "../../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";

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
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    private readonly ref: DynamicDialogRef,
    private loaderService: LoaderService,
    private consultaDonacionesService: GestionarDonacionesService,
    public config: DynamicDialogConfig,
    private mensajesSistemaService: MensajesSistemaService,
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
    /*Valida si al cerrar ventana es el último ataúd donado*/
    if(this.ataud.length == 1){
      this.ref.close({ataud:this.ataudSeleccionado, existeStock: false});
    }else {
      this.ref.close({ataud:this.ataudSeleccionado, existeStock: true});

    }
  }

  consultarAtaudes(): void {
    this.loaderService.activar();
    this.consultaDonacionesService.consultaControlSalidaAtaudes().pipe(
      finalize(()=> this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.backlogAutaudes = respuesta.datos;
        this.ataud = mapearArregloTipoDropdown(respuesta.datos, "desModeloArticulo", "folioArticulo");
        this.config.data.forEach((elemento: AtaudDonado) => {
          this.ataud = this.ataud.filter(ataud => {
            return ataud.value != elemento.folioArticulo;
          });

        });
      },
      error: (error: HttpErrorResponse) => {
      }
    });
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
