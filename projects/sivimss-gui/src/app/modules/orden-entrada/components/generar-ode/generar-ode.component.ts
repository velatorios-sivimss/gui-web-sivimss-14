import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertaService} from "../../../../shared/alerta/services/alerta.service";
import {OrdenEntradaService} from "../../services/orden-entrada.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

@Component({
  selector: 'app-generar-ode',
  templateUrl: './generar-ode.component.html',
  styleUrls: ['./generar-ode.component.scss']
})
export class GenerarOdeComponent implements OnInit {

  formulario!: FormGroup;

  categorias: TipoDropdown[] = [];
  modelos: TipoDropdown[] = [];
  estatus: TipoDropdown[] = [{value:1, label: 'Activa'}];

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ordenEntradaService: OrdenEntradaService
  ) { }

  ngOnInit(): void {
    this. inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formulario = this.formBuilder.group(
{
                idOde: [{value:null, disabled: true}],
             folioOde: [{value:null, disabled: true}],
             contrato: [{value:null, disabled: false}, [Validators.required]],
            proveedor: [{value:null, disabled: false}],
       folioProveedor: [{value:null, disabled: false}],
            categoria: [{value:null, disabled: false}, [Validators.required]],
               modelo: [{value:null, disabled: false}],
            velatorio: [{value:null, disabled: true}],
                costo: [{value:null, disabled: true}],
               precio: [{value:null, disabled: true}],
      numeroArticulos: [{value:null, disabled: false}],
                fecha: [{value:null, disabled: true}],
              estatus: [{value:1, disabled: true}],
      }
    );
  }

  generarODE(): void {

  }

  get f(){
    return this.formulario.controls;
  }

}
