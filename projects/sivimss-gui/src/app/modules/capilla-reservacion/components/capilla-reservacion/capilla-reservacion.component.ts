import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { SERVICIO_BREADCRUMB } from "../../constants/breadcrumb";
import { SelectButtonModule } from "primeng/selectbutton";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { RegistrarEntradaComponent } from "../registrar-entrada/registrar-entrada.component";
import { RegistrarSalidaComponent } from "../registrar-salida/registrar-salida.component";
import { ActivatedRoute } from '@angular/router';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { CapillaReservacionService } from '../../services/capilla-reservacion.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from "rxjs/operators";
import { HttpRespuesta } from "../../../../models/http-respuesta.interface";
import { HttpErrorResponse } from '@angular/common/http';
import { mensajes } from "../../../reservar-salas/constants/mensajes";
import { VelatorioInterface } from "../../../reservar-salas/models/velatorio.interface";

@Component({
  selector: 'app-capilla-reservacion',
  templateUrl: './capilla-reservacion.component.html',
  styleUrls: ['./capilla-reservacion.component.scss'],
  providers: [DialogService]
})
export class CapillaReservacionComponent implements OnInit, OnDestroy {

  fechaEntrada: any
  horaEntrada: any
  fechaSalida: any
  horaSalida: any

  filtroForm!: FormGroup;
  registrarEntradaForm!: FormGroup;
  registrarSalidaForm!: FormGroup;
  calendarioForm!: FormGroup;

  creacionRef!: DynamicDialogRef
  agregarSalidaRef!: DynamicDialogRef;

  posicionPestania: number = 0;
  // delegacion: number = 0;
  velatorioPosicion!: number;
  respuesta: any;

  capilla: any[] = [];
  delegaciones: TipoDropdown[] = [];

  opciones: SelectButtonModule[] = [
    { icon: 'fs fs-barras-horizontales', justify: 'Center', value: '0' },
    { icon: 'fs fs-calendario', justify: 'Center', value: '1' }
  ];

  value: number = 0;

  velatorios: TipoDropdown[] = [];
  // velatorioListado!: number;

  alertas = JSON.parse(localStorage.getItem('mensajes') as string);
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private route: ActivatedRoute,
    private capillaReservacionService: CapillaReservacionService,
    private readonly loaderService: LoaderService,
  ) { }



  ngOnInit(): void {


    localStorage.setItem("mensajes", JSON.stringify(mensajes));
    this.actualizarBreadcrumb();
    this.inicializarRegistroEntradaForm();
    this.inicializarRegistroSalidaForm();
    this.inicializarCalendarioForm();
    this.respuesta = this.route.snapshot.data['respuesta']


    this.delegaciones = this.respuesta[1]!.map((delegacion: any) => (
      { label: delegacion.label, value: delegacion.value })) || [];

    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      delegacion: [{ value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idOficina >= 2 }],
      velatorio: [{ value: +this.rolLocalStorage.idVelatorio || null, disabled: +this.rolLocalStorage.idOficina === 3 }],
    });

    this.cambiarDelegacion();
    this.obtenerCapillaPorIdVelatorio();
  }

  inicializarRegistroEntradaForm(): void {
    this.registrarEntradaForm = this.formBuilder.group({

      fechaEntrada: [{ value: null, disabled: false }, [Validators.required]],
      horaEntrada: [{ value: null, disabled: false }, [Validators.required]],
    })
  }

  inicializarRegistroSalidaForm(): void {
    this.registrarSalidaForm = this.formBuilder.group({
      capilla: [{ value: null, disabled: false }],
      fechaSalida: [{ value: null, disabled: false }, [Validators.required]],
      horaSalida: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  inicializarCalendarioForm(): void {
    this.calendarioForm = this.formBuilder.group({
      velatorio: [{ value: null, disabled: false }],
    });
  }

  obtenerObjetoParaRegistrarEntrada() {
    return {
      idVelatorio: this.f.velatorio.value || null,
      fechaEntrada: this.fe.fechaEntrada.value,
      horaEntrada: this.fe.horaEntrada.value,
      registroEntrada: this.fe.horaEntrada.value
    }
  }

  obtenerObjetoParaRegistrarSalida() {
    return this.capilla.filter((capillaSeleccionada) => {
      let idCapilla = this.registrarSalidaForm.get('capilla')?.value;
      return capillaSeleccionada.value == idCapilla

    })
  }

  abrirModalAgregarSalida(): void {
    let objParaRegistrarSalida = this.obtenerObjetoParaRegistrarSalida();
    this.agregarSalidaRef = this.dialogService.open(RegistrarSalidaComponent, {
      data: {
        idCapilla: this.registrarSalidaForm.get('capilla')?.value,
        idVelatorio: +this.f.velatorio.value,
        fecha: {
          fecha: this.registrarSalidaForm.get('fechaSalida')?.value,
          hora: this.registrarSalidaForm.get('horaSalida')?.value
        }
      },
      header: 'Registrar salida de capilla',
      width: "920px",
    });

    this.agregarSalidaRef.onClose.subscribe((respuesta: boolean) => {
      if (respuesta) {
        this.f.delegacion.patchValue(0);
        this.f.velatorio.patchValue(0);
        this.velatorios = [];
        this.delegaciones = this.respuesta[1]!.map((delegacion: any) => (
          { label: delegacion.label, value: delegacion.value })) || [];
        this.registrarEntradaForm.reset();
        this.registrarSalidaForm.reset();
      }
    });
  }

  verificarCapillasDisponibles() {
    this.capillaReservacionService.buscarPorIdVelatorio(+this.f.velatorio.value).subscribe({
      next: (respuesta: any) => {
        if (respuesta.datos.length > 0) {
          this.abrirModalAgregarEntrada();
        } else {
          this.alertaService.mostrar(TipoAlerta.Precaucion,
            "No contamos con capillas disponibles por el momento. Intenta más tarde.");
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  abrirModalAgregarEntrada(): void {
    let objParaRegistrarEntrada = this.obtenerObjetoParaRegistrarEntrada();
    this.creacionRef = this.dialogService.open(RegistrarEntradaComponent, {
      data: objParaRegistrarEntrada,
      header: "Registrar entrada a capilla",
      width: "920px",
    })

    this.creacionRef.onClose.subscribe((estatus: boolean) => {
      if (estatus) {
        this.f.delegacion.patchValue(0);
        this.f.velatorio.patchValue(0);
        this.velatorios = mapearArregloTipoDropdown(this.respuesta[0]?.datos, 'velatorio', 'id');
        this.delegaciones = this.respuesta[1]!.map((delegacion: any) => (
          { label: delegacion.label, value: delegacion.value })) || [];
        this.registrarEntradaForm.reset();
        this.registrarSalidaForm.reset();
      }
    })
  }

  obtenerCapillaPorIdVelatorio() {
    let idVelatorio = +this.f.velatorio.value;
    this.capillaReservacionService.capillaOcupadaPorIdVelatorio(idVelatorio).subscribe(
      (respuesta) => {
        if (respuesta.datos) {
          this.capilla = respuesta.datos.map((capilla: any) => {
            return { label: capilla.nomCapilla, value: capilla.idCapilla };
          });
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }


  cambiarDelegacion(): void {
    this.loaderService.activar();
    this.capillaReservacionService.obtenerCatalogoVelatoriosPorDelegacion(this.f.delegacion.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.velatorios = respuesta.datos.map((velatorio: VelatorioInterface) => (
          { label: velatorio.nomVelatorio, value: velatorio.idVelatorio })) || [];
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }


  get fe() {
    return this.registrarEntradaForm.controls;
  }

  get fs() {
    return this.registrarSalidaForm.controls;
  }

  get f() {
    return this.filtroForm?.controls;
  }

  ngOnDestroy(): void {
    if (this.creacionRef) {
      this.creacionRef.destroy();
    }
    if (this.agregarSalidaRef) {
      this.agregarSalidaRef.destroy();
    }
  }

}
