import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AtaudDonado} from "../../models/consulta-donaciones-interface"
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AgregarAtaudDonadoComponent} from "../agregar-ataud-donado/agregar-ataud-donado.component";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";

@Component({
  selector: 'app-aceptacion-donacion',
  templateUrl: './aceptacion-donacion.component.html',
  styleUrls: ['./aceptacion-donacion.component.scss'],
  providers: [DialogService]
})
export class AceptacionDonacionComponent implements OnInit {

  ataudDonadoRef!: DynamicDialogRef;

  donacionForm!: FormGroup;

  ataudDonado: AtaudDonado[] = [];
  confirmacion : boolean = false;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarDonacionForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  inicializarDonacionForm(): void {
    this.donacionForm = this.formBuilder.group({
      folio: [{value: null, disabled: false}, [Validators.required]],
      nombreContratante: [{value: null, disabled: false}],
      nombreFinado: [{value: null, disabled: false}],
      responsableAlmacen: [{value: null, disabled: false}],
      matricula: [{value: null, disabled: false}, [Validators.required]]

    });
  }

  agregarAtaud(): void {
    this.ataudDonadoRef = this.dialogService.open(AgregarAtaudDonadoComponent, {
      header:"Agregar ataúd",
      width:"920px"
    });

    this.ataudDonadoRef.onClose.subscribe((ataud:AtaudDonado) => {
      this.ataudDonado.push(ataud);
    });
  }

  guardar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'El ataúd ya fue registrado como donado exitosamente');
    this.router.navigate(["consulta-donaciones"]);
  }

  abrirConfirmacion() : void {
    this.confirmacion = true;
  }

  get f() {
    return this.donacionForm.controls;
  }

}
