import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {RealizarPagoService} from '../../../services/realizar-pago.service';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {DetalleAyudaGastosFuneral} from '../../../modelos/ayudaGastosFuneral.interface';

interface RegistroAGF {
  idFinado: number,
  cveNSS: number,
  cveCURP: string,
  fecDefuncion: string,
  idVelatorio: number,
  idRamo: number,
  idTipoId: number,
  numIdentificacion: number,
  casillaCurp: boolean,
  casillaActDef: boolean,
  casillaCogf: boolean,
  casillaNssi: boolean,
}

interface RegistroPago {
  descBanco: null,
  fechaPago: null,
  fechaValeAGF: string,
  idFlujoPago: string,
  idMetodoPago: string,
  idPagoBitacora: number,
  idRegistro: string,
  importePago: number,
  importeRegistro: number,
  numAutorizacion: string
}

@Component({
  selector: 'app-registrar-agf',
  templateUrl: './registrar-agf.component.html',
  styleUrls: ['./registrar-agf.component.scss']
})
export class RegistrarAgfComponent implements OnInit {
  agfForm!: FormGroup;
  detalleAGF!: DetalleAyudaGastosFuneral;
  ramos: TipoDropdown[] = [];
  identificaciones: TipoDropdown[] = [];
  indice: number = 0;
  idFinado!: number;
  idPagoBitacora!: number;

  readonly CAPTURA_DE_AGF: number = 1;
  readonly VALIDACION_DE_AGF: number = 2;
  pasoRegistrarAGF: number = 1;

  constructor(
    private formBuilder: FormBuilder,
    private realizarPagoService: RealizarPagoService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private router: Router,
    private route: ActivatedRoute) {
    this.idFinado = this.config.data.idFinado;
    this.idPagoBitacora = this.config.data.idPagoBitacora;
  }

  ngOnInit(): void {
    this.obtenerRamos();
    this.obtenerDetalleAGF();
    this.obtenerIdentificaciones();
    this.inicializarAgfForm();
  }

  aceptar(): void {
    this.ref.close();
    const registroAGF: RegistroAGF = this.crearRegistroAGF();
    const datos_agf: string = btoa(JSON.stringify(registroAGF));
    const registroPago: RegistroPago = this.crearRegistroPago();
    const datos_pago: string = btoa(JSON.stringify(registroPago))
    void this.router.navigate(['../agf-seleccion-beneficiarios', this.detalleAGF.cveNss],
      {relativeTo: this.route, queryParams: {datos_agf, datos_pago}})
  }

  private inicializarAgfForm(): void {
    this.agfForm = this.formBuilder.group({
      ramo: [{value: null, disabled: false}, [Validators.required]],
      identificacionOficial: [{value: null, disabled: false}, [Validators.required]],
      numeroIdentificacion: [{value: null, disabled: false}, [Validators.required]],
      curp: [{value: false, disabled: false}],
      actaDefuncion: [{value: false, disabled: false}],
      cuentaGastos: [{value: false, disabled: false}],
      documentoNSS: [{value: false, disabled: false}],
    })
  }

  obtenerRamos(): void {
    this.ramos = [];
    this.realizarPagoService.obtenerRamos().subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.ramos = mapearArregloTipoDropdown(respuesta.datos, "desRamo", "idRamo");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    })
  }

  obtenerDetalleAGF(): void {
    this.realizarPagoService.obtenerDetalleAGF(this.idFinado).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.detalleAGF = respuesta.datos[0];
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    })
  }

  crearRegistroAGF(): RegistroAGF {
    return {
      casillaActDef: this.agfForm.get('actaDefuncion')?.value,
      casillaCogf: this.agfForm.get('cuentaGastos')?.value,
      casillaCurp: this.agfForm.get('curp')?.value,
      casillaNssi: this.agfForm.get('documentoNSS')?.value,
      cveCURP: this.detalleAGF.cveCurp,
      cveNSS: this.detalleAGF.cveNss,
      fecDefuncion: this.detalleAGF.fecDeceso,
      idFinado: this.idFinado,
      idRamo: this.agfForm.get('ramo')?.value,
      idTipoId: this.agfForm.get('identificacionOficial')?.value,
      idVelatorio: 0,
      numIdentificacion: this.agfForm.get('numeroIdentificacion')?.value
    }
  }

  crearRegistroPago(): RegistroPago {
    return {
      descBanco: null,
      fechaPago: null,
      fechaValeAGF: "",
      idFlujoPago: "",
      idMetodoPago: "",
      idPagoBitacora: this.idPagoBitacora,
      idRegistro: "",
      importePago: 0,
      importeRegistro: 0,
      numAutorizacion: ""
    }
  }

  obtenerIdentificaciones(): void {
    this.identificaciones = [];
    this.realizarPagoService.obtenerIdentificaciones().subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.identificaciones = mapearArregloTipoDropdown(respuesta.datos, "desTipoId", "idTipoId");
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
      }
    })
  }

  cancelar(): void {
    this.ref.close();
  }

  get fagf() {
    return this.agfForm.controls
  }
}
