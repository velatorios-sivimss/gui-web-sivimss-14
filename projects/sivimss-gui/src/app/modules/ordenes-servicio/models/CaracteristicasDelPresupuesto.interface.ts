import { DetallePresupuestoInterface } from "./DetallePresupuesto.interface";

export interface CaracteristicasDelPresupuestoInterface{

    idPaquete:number | null;
    totalPresupuesto:string | null;
    observaciones:string | null;
    notasServicio:string | null;
    detallePresupuesto:Array<DetallePresupuestoInterface>;
}