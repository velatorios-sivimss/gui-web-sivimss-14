import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpRespuesta} from '../../../../models/http-respuesta.interface';
import {AlertaService, TipoAlerta} from '../../../../shared/alerta/services/alerta.service';
import {LoaderService} from '../../../../shared/loader/services/loader.service';
import {OrdenEntradaService} from '../../services/orden-entrada.service';
import {finalize} from "rxjs/operators";

@Component({
  selector: 'app-devolver-articulo',
  templateUrl: './devolver-articulo.component.html',
  styleUrls: ['./devolver-articulo.component.scss']
})
export class DevolverArticuloComponent implements OnInit {

  formulario!: FormGroup;
  detalleArticulo: any;
  mostrarModalDevolucion: boolean = false;

  constructor(
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ordenEntradaService: OrdenEntradaService,
    private readonly loaderService: LoaderService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.consultarFolioArticulo(params.folio);
    });
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      devolucionMotivo: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  consultarFolioArticulo(folio: any) {
    this.loaderService.activar();
    this.ordenEntradaService.consultarFolioArticulo(folio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.detalleArticulo = respuesta.datos[0];
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  devolver() {
    let articulo = this.mapearArticulo();
    this.loaderService.activar();
    this.ordenEntradaService.actualizarInventarioArticulo(articulo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200) {
          this.alertaService.mostrar(TipoAlerta.Exito, "Se realizó el registro de devolución correctamente.");
          void this.router.navigate(["../.."], {relativeTo: this.activatedRoute});
        }
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, error.error.mensaje);
      }
    });
  }

  mapearArticulo(): any {
    return {
      idOrdenEntrada: this.detalleArticulo.ID_ODE,
      idInventarioArticulo: this.detalleArticulo.ID_INVE_ARTICULO,
      desMotivoDevolucion: this.formulario.get('devolucionMotivo')?.value,
    }
  }

  get f() {
    return this.formulario.controls;
  }

}
