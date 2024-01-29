import { Contratante } from "./contratante.interface";
import { Domicilio } from "./domicilio.interface";

export interface IRegistrarContratante {
    idUsuario?: number | null;
    nombre?: string;
    paterno?: string;
    materno?: string;
    rfc?: string | null;
    nss?: string | null;
    curp?: string;
    numSexo?: number;
    otroSexo?: string | null,
    fecNacimiento?: string | null,
    idPais?: number | null;
    idLugarNac?: number | null;
    tel?: string;
    telFijo?: string | null;
    correo?: string;
    idNacionalidad?: number;
    domicilio?: Domicilio;
    contratante?: Contratante;
}

export interface IContratanteRegistrado {
    nss?: string | null;
    estado?: string;
    nomPersona?: string;
    paterno?: string;
    numInterior?: string;
    lugarNac?: string;
    municipio?: string;
    calle?: string;
    idUsuario?: number | null;
    cp?: string;
    rfc?: string;
    nacionalidad?: string;
    pais?: string;
    colonia?: string;
    materno?: string;
    idContratante?: number | null;
    estatus?: boolean;
    usr?: string;
    correo?: string;
    fecNacimiento?: string;
    tel?: string;
    sexo?: string;
    otroSexo?: string | null;
    idPersona?: number | null;
    idSexo?: number;
    idPais?: number;
    idLugarNac?: number;
    numInt?: string;
    numExt?: string;
    curp?: string;
}