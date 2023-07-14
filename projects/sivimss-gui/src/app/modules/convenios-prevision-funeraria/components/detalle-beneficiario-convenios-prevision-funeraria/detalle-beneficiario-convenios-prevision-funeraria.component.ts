import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {BeneficiarioInterface} from "../../models/beneficiario.interface";
import * as moment from "moment";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ActivatedRoute} from "@angular/router";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";

@Component({
  selector: 'app-detalle-beneficiario-convenios-prevision-funeraria',
  templateUrl: './detalle-beneficiario-convenios-prevision-funeraria.component.html',
  styleUrls: ['./detalle-beneficiario-convenios-prevision-funeraria.component.scss']
})
export class DetalleBeneficiarioConveniosPrevisionFunerariaComponent implements OnInit {

  readonly POSICION_PARENTESCO   = 2;

  beneficiario!: BeneficiarioInterface;
  parentesco!: TipoDropdown[];
  parentescoDescripcion!: TipoDropdown[];
  velatorio!: TipoDropdown[] ;
  velatorioDescripcion: string = "";

  constructor(
    private route: ActivatedRoute,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private readonly loaderService: LoaderService,
    private agregarConvenioPFService: AgregarConvenioPFService,
  ) { }

  ngOnInit(): void {
    let respuesta = this.route.snapshot.data['respuesta'];
    this.beneficiario = this.config.data;
    this.parentesco = respuesta[this.POSICION_PARENTESCO]!.map((parentesco: TipoDropdown) => (
      {label: parentesco.label, value: parentesco.value} )) || [];
    this.parentescoDescripcion = this.parentesco.filter( (elemento) => {
      return elemento.value == this.beneficiario.parentesco;
    })
    this.consultaVelatorio();
  }

  consultaVelatorio(): void {
    let usuario = JSON.parse(localStorage.getItem('usuario') as string);
    let velatorioUsuario: any;
    this.loaderService.activar();
    this.agregarConvenioPFService.obtenerCatalogoVelatoriosPorDelegacion(usuario.idDelegacion).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        this.velatorio = respuesta.datos!.map(
          (velatorio: any) => (
            {label: velatorio.nomVelatorio, value: velatorio.idVelatorio}
          )
        )

        velatorioUsuario = this.velatorio.filter(velatorio => {
          return velatorio.value == usuario.idVelatorio;
        })
        this.velatorioDescripcion = velatorioUsuario[0].label;
        // this.f.velatorio.setValue(+usuario.idVelatorio);
      },
      (error: HttpErrorResponse)=> {
        console.log(error);
      }
    )
  }

  aceptar(): void {
    this.ref.close();
  }

}
