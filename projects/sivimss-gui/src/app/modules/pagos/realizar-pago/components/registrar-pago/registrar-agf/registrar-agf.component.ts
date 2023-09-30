import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {RealizarPagoService} from '../../../services/realizar-pago.service';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {DetalleAyudaGastosFuneral} from '../../../modelos/ayudaGastosFuneral.interface';

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
    if (this.indice === 1) {
      this.ref.close();
      void this.router.navigate(['../agf-seleccion-beneficiarios'], {relativeTo: this.route})
      return;
    }
    this.indice++;
  }

  private inicializarAgfForm(): void {
    this.agfForm = this.formBuilder.group({
      ramo: [{value: null, disabled: false}],
      identificacionOficial: [{value: null, disabled: false}],
      numeroIdentificacion: [{value: null, disabled: false}],
      curp: [{value: null, disabled: false}],
      actaDefuncion: [{value: null, disabled: false}],
      cuentaGastos: [{value: null, disabled: false}],
      documentoNSS: [{value: null, disabled: false}],
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
    console.log("Se comenta método para que no marque error en Sonar");
  }
}
