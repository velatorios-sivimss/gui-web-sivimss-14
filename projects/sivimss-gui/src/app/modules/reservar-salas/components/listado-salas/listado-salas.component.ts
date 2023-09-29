import {Component, OnDestroy, OnInit} from '@angular/core';
import {TipoDropdown} from '../../../../models/tipo-dropdown';
import {MENU_SALAS} from '../../constants/menu-salas';
import {SalaVelatorio} from '../../models/sala-velatorio.interface';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {RegistrarEntradaComponent} from "../registrar-entrada/registrar-entrada.component";
import {RegistrarSalidaComponent} from "../registrar-salida/registrar-salida.component";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {ReservarSalasService} from "../../services/reservar-salas.service";
import {VelatorioInterface} from "../../models/velatorio.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {FormBuilder, FormGroup} from '@angular/forms';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-listado-salas',
  templateUrl: './listado-salas.component.html',
  styleUrls: ['./listado-salas.component.scss'],
  providers: [DialogService]
})
export class ListadoSalasComponent implements OnInit, OnDestroy {

  readonly POSICION_CATALOGO_DELEGACION = 0;

  velatorios: TipoDropdown[] = [];
  delegaciones: TipoDropdown[] = [];

  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  menu: string[] = MENU_SALAS;
  numPaginaActual: number = 0;
  posicionPestania: number = 0;
  totalElementos: number = 0;

  salasCremacion: SalaVelatorio[] = [];
  salasEmbalsamamiento: SalaVelatorio[] = [];

  registrarEntradaRef!: DynamicDialogRef;
  registrarSalidaRef!: DynamicDialogRef;

  filtroForm!: FormGroup;
  rolLocalStorage = JSON.parse(localStorage.getItem('usuario') as string);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private readonly loaderService: LoaderService,
    private reservarSalasService: ReservarSalasService,
    private mensajesSistemaService: MensajesSistemaService) {
  }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    // this.velatorios = respuesta[this.POSICION_CATALOGO_VELATORIOS]!.datos.map((velatorio: VelatorioInterface) => (
    //   {label: velatorio.nomVelatorio, value: velatorio.idVelatorio} )) || [];

    this.delegaciones = respuesta[this.POSICION_CATALOGO_DELEGACION]!.map((delegacion: any) => (
      {label: delegacion.label, value: delegacion.value})) || [];

    this.inicializarFiltroForm();

    let tipoSala = JSON.parse(localStorage.getItem('reserva-sala') as string);
    localStorage.removeItem('reserva-sala');
    if (tipoSala) {
      this.registrarSalida(tipoSala);
    }
  }

  inicializarFiltroForm() {
    this.filtroForm = this.formBuilder.group({
      delegacion: [{value: +this.rolLocalStorage.idDelegacion || null, disabled: +this.rolLocalStorage.idOficina >= 2}],
      velatorio: [{value: null, disabled: +this.rolLocalStorage.idOficina === 3}],
    });
    if (this.f.delegacion.value != null) {
      this.cambiarDelegacion();
    }
  }

  registrarActividad(sala: SalaVelatorio): void {
    if (sala.estadoSala != "DISPONIBLE") {
      this.registrarSalida(sala);
      return;
    }
    this.registrarEntrada(sala);
  }

  registrarEntrada(sala: SalaVelatorio): void {
    this.registrarEntradaRef = this.dialogService.open(RegistrarEntradaComponent, {
      header: 'Registrar Entrada',
      width: '920px',
      data: {sala: sala, tipoSala: this.posicionPestania},
    });
    this.registrarEntradaRef.onClose.subscribe((respuesta) => {
      if (respuesta) {
        this.consultaSalasCremacion();
      }
    });
  }

  private registrarSalida(sala: SalaVelatorio): void {
    this.registrarSalidaRef = this.dialogService.open(RegistrarSalidaComponent, {
      header: 'Registrar Salida',
      width: '920px',
      data: {sala: sala, tipoSala: this.posicionPestania},
    });
    this.registrarSalidaRef.onClose.subscribe((respuesta) => {
      if (respuesta) {
        this.consultaSalasCremacion();
      }
    });
  }

  cambiarPestania(pestania: any): void {
    this.posicionPestania = pestania.index;
    this.consultaSalasCremacion();
  }


  consultaSalasCremacion(): void {
    if (this.f.velatorio.value && this.f.velatorio.value == 0) {
      return
    }
    this.loaderService.activar();
    this.reservarSalasService.consultarSalas(this.f.velatorio.value, this.posicionPestania).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (this.posicionPestania == 0) {
          this.salasCremacion = respuesta.datos;
        } else {
          this.salasEmbalsamamiento = respuesta.datos;
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    });
  }

  cambiarDelegacion(): void {
    this.loaderService.activar();
    this.reservarSalasService.obtenerCatalogoVelatoriosPorDelegacion(this.f.delegacion.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.velatorios = respuesta.datos.map((velatorio: VelatorioInterface) => (
          {label: velatorio.nomVelatorio, value: velatorio.idVelatorio})) || [];

        const item = this.velatorios.find((item: TipoDropdown) => item.value === +this.rolLocalStorage.idVelatorio);
        if (item) {
          this.filtroForm.get('velatorio')?.patchValue(+this.rolLocalStorage.idVelatorio);
          this.cambiarPestania({index: 0});
        } else {
          this.filtroForm.get('velatorio')?.patchValue(null);
          this.consultaSalasCremacion();
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Error, this.mensajesSistemaService.obtenerMensajeSistemaPorId(+error.error.mensaje));
      }
    })
  }

  retornarColor(estatus: string): string {
    if (estatus === "DISPONIBLE") {
      return "#83b727"
    }
    if (estatus === "OCUPADA") {
      return "#9d2449"
    }
    if (estatus === "MANTENIMIENTO") {
      return "#ffff00"
    }
    return "";
  }

  ngOnDestroy(): void {
    if (this.registrarEntradaRef) {
      this.registrarEntradaRef.destroy()
    }
    if (this.registrarSalidaRef) {
      this.registrarSalidaRef.destroy()
    }
  }

  get f() {
    return this.filtroForm?.controls;
  }
}
