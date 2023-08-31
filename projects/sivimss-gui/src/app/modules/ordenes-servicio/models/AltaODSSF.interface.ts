import {ContratanteInterface} from "./Contratante.interface";
import {FinadoSFInterface} from "./Finado.interface";
import {CaracteristicasPresupuestoInterface} from "./CaracteristicasPresupuesto,interface";
import {InformacionServicioInterface} from "./InformacionServicio.interface";

export interface AltaODSSFInterface {
  idOrdenServicio?: number;
  idVelatorio: null;
  idEstatus: number | null;
  idOperador: number | null;
  idParentesco: number | null;
  idContratantePf: number | null;
  contratante: ContratanteInterface
  finado: FinadoSFInterface
  caracteristicasPresupuesto: CaracteristicasPresupuestoInterface
  informacionServicio: InformacionServicioInterface;
}
