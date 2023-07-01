import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ModeloGuardarPorPersona} from "../../models/modelo-guardar-por-persona.interface";
import {ModeloGuardarPorEmpresa} from "../../models/modelo-guardar-por-empresa.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGO_ENFERMEDAD_PREEXISTENTE} from "../../constants/catalogos-funcion";
import {AgregarConvenioPFService} from "../../services/agregar-convenio-pf.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {OpcionesArchivos} from "../../../../models/opciones-archivos.interface";
import {DescargaArchivosService} from "../../../../services/descarga-archivos.service";
import {PlantillaConvenioInterface} from "../../models/plantilla-convenio.interface";
import * as moment from "moment";

@Component({
  selector: 'app-detalle-guarda-convenio',
  templateUrl: './detalle-guarda-convenio.component.html',
  styleUrls: ['./detalle-guarda-convenio.component.scss'],
  providers: [DescargaArchivosService]
})
export class DetalleGuardaConvenioComponent implements OnInit, OnChanges {

  @Input() objetoDetalleEmpresa: ModeloGuardarPorEmpresa = {};
  @Input() objetoDetallePersona!: any;
  @Input() confirmarGuardarPersona!: boolean;
  @Input() confirmarGuardarEmpresa!: boolean;

  readonly POSICION_PAIES:number = 0;
  readonly POSICION_ESTADOS:number = 1;
  readonly POSICION_PAQUETES:number = 3;
  readonly POSICION_PROMOTORES:number = 4;

  paises!: TipoDropdown[];
  descripcionPais!: TipoDropdown[];
  tipoPaquete!: TipoDropdown[];
  promotores!: TipoDropdown[];
  descripcionPromotor!: TipoDropdown[];
  detalleTipoPaquete!:TipoDropdown[];
  detalleEnfermedad!:TipoDropdown[];
  velatorio!: TipoDropdown[] ;
  velatorioDescripcion!: string;


  constructor(
    private route: ActivatedRoute,
    private agregarConvenioPFService:AgregarConvenioPFService,
    private alertaService: AlertaService,
    private descargaArchivosService: DescargaArchivosService,
    private mensajesSistemaService: MensajesSistemaService,
    private loaderService: LoaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.paises = respuesta[this.POSICION_PAIES]!.map((pais:TipoDropdown) => ({label: pais.label, value: pais.value})) || []

    this.promotores = respuesta[this.POSICION_PROMOTORES]!.datos.map(
    (promotor: any) => ({label: promotor.nombrePromotor, value: promotor.idPromotor}))

    this.tipoPaquete = respuesta[this.POSICION_PAQUETES]!.datos.map(
      (paquete: any) => (
        {label: paquete.nomPaquete, value: paquete.idPaquete}
      )
    )

    if(this.objetoDetalleEmpresa.empresa){
      this.descripcionPais = this.paises.filter(pais =>{
        return pais.value == this.objetoDetalleEmpresa.empresa?.pais
      });
      this.descripcionPromotor = this.paises.filter(promotor =>{
        return promotor.value == this.objetoDetalleEmpresa.idPromotor
      });
    }

    if(this.objetoDetallePersona.indTipoContratacion != ""){
      this.descripcionPais = this.paises.filter(pais =>{
        return pais.value == this.objetoDetallePersona.persona?.pais
      });

      this.detalleTipoPaquete = this.tipoPaquete.filter(paquete => {
        return paquete.value == this.objetoDetallePersona.persona?.paquete;
      })
      this.detalleEnfermedad = CATALOGO_ENFERMEDAD_PREEXISTENTE.filter(enfermedad => {
        return enfermedad.value == this.objetoDetallePersona.persona?.enfermedadPreexistente;
      });

      this.descripcionPromotor = this.paises.filter(promotor =>{
        return promotor.value == this.objetoDetallePersona.idPromotor
      });
    }

    console.log(this.objetoDetalleEmpresa)
    console.log(this.objetoDetallePersona)

    this.consultaVelatorio();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.confirmarGuardarEmpresa)this.guardarEmpresa();
    if(this.confirmarGuardarPersona)this.guardarPersona();
  }

  guardarEmpresa(): void {
    this.loaderService.activar();
    this.agregarConvenioPFService.guardarConvenioPorGrupoEmpresa(this.objetoDetalleEmpresa).pipe
    (
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {
        this.generarArchivo(respuesta.datos.idConvenio);
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg);
        this.router.navigate(["convenios-prevision-funeraria"]);
      },
      (error:HttpErrorResponse) => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    )
  }

  guardarPersona(): void {
    this.loaderService.activar();
    this.agregarConvenioPFService.guardarConvenioPorPersona(this.objetoDetallePersona).pipe
    (
      finalize(()=>  this.loaderService.desactivar())
    ).subscribe(
      (respuesta: HttpRespuesta<any>)=> {
        this.generarArchivo(respuesta.datos.idConvenio);
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg);
        this.router.navigate(["convenios-prevision-funeraria"]);
      },
      (error:HttpErrorResponse) => {
        console.log(error);
        this.alertaService.mostrar(TipoAlerta.Precaucion, this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje)));
      }
    )
  }

  generarArchivo(idConvenio:string): void {
    this.loaderService.activar();
    const configuracionArchivo: OpcionesArchivos = {};
    const plantilla = this.generarDatosPlantilla(idConvenio);

    this.agregarConvenioPFService.generarPlantilla(plantilla).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta: any) => {
        const file = new Blob([respuesta], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(file);
        window.open(url);

      },(error:HttpErrorResponse) => {
        console.log(error)
      }
    )
  }

  generarDatosPlantilla(idConvenio:string): PlantillaConvenioInterface {
    let usuario = JSON.parse(localStorage.getItem('usuario') as string)
    return {
      rutaNombreReporte: "reportes/plantilla/ANEXO5_CONVENIO_PF_NUEVO.jrxml",
      tipoReporte: "pdf",
      ciudadExpedicion:this.velatorioDescripcion,
      fechaExpedicion: moment().format('DD/MM/yyyy'),
      idConvenio:idConvenio
    }
  }

  consultaVelatorio(): void {
    let usuario = JSON.parse(localStorage.getItem('usuario') as string);
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

        let velatorioSeleccionado = this.velatorio.filter(velatorio => {
          return velatorio.value == usuario.idVelatorio;
        })
        this.velatorioDescripcion =  velatorioSeleccionado[0].label;
      },
      (error: HttpErrorResponse)=> {
        console.log(error);
      }
    )
  }

}
