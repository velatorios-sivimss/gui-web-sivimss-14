import { InformacionServicioVelacionInterface } from "./InformacionServicioVelacion.interface";

export interface InformacionServicioInterface{
    fechaCortejo?:string | null;
    horaCortejo?:string | null;
    fechaRecoger?:string | null;
    horaRecoger?:string | null;
    idPanteon?:number | null;
    idSala?:number | null;
    fechaCremacion?:string | null;
    horaCremacion?:string | null;
    idPromotor?:number | null;
    informacionServicioVelacion:InformacionServicioVelacionInterface;

}
