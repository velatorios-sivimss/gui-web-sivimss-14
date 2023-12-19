import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {PATRON_CORREO} from "../../../../../utils/constantes";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {FacturacionService} from "../../services/facturacion.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";

interface ParamsEnviar {
  folioFactura: number,
  folioFiscal: string,
  folioRelacionado: string
}

interface SolicitudFactura {
  idFactura: number,
  correo: string
}

@Component({
  selector: 'app-enviar-factura',
  templateUrl: './enviar-factura.component.html',
  styleUrls: ['./enviar-factura.component.scss']
})
export class EnviarFacturaComponent implements OnInit {

  enviarForm!: FormGroup;
  mostrarDialogEnviar: boolean = false;
  registroEnviar!: ParamsEnviar;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private readonly router: Router,
    private facturacionService: FacturacionService,
    private mensajesSistemaService: MensajesSistemaService,
    private cargadorService: LoaderService,
    private alertaService: AlertaService,
  ) {
    this.obtenerParametrosEnviar();
  }

  ngOnInit(): void {
    this.inicializarEnviarForm();
  }

  obtenerParametrosEnviar(): void {
    this.activatedRoute.queryParams.pipe(
    ).subscribe(params => {
        const {datos_enviar} = params;
        this.registroEnviar = JSON.parse(window.atob(datos_enviar));
      }
    );
  }

  inicializarEnviarForm(): void {
    this.enviarForm = this.formBuilder.group({
      correoElectronico: [{
        value: null,
        disabled: false
      }, [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
    });
  }

  enviarFactura(): void {
    const solicitud: SolicitudFactura = this.crearSolicitudFactura();
    this.cargadorService.activar()
    this.facturacionService.enviarFactura(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Factura enviada correctamente');
        void this.router.navigate(['./..'], {relativeTo: this.activatedRoute});
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        const ERROR: string = 'Error en la descarga del documento. Intenta nuevamente.';
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
      }
    })
  }

  crearSolicitudFactura(): SolicitudFactura {
    return {
      idFactura: this.registroEnviar.folioFactura,
      correo: this.enviarForm.get('correoElectronico')?.value
    }
  }

  get fc() {
    return this.enviarForm.controls;
  }

}
