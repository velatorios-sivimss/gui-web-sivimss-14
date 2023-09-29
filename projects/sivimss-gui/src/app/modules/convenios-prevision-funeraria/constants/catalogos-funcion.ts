import {TipoDropdown} from "../../../models/tipo-dropdown";

export const CATALOGO_ENFERMEDAD_PREEXISTENTE: TipoDropdown[] =[
  {
    label: 'Ninguno',
    value: 1
  },
  {
    label: 'Diabetes',
    value: 2
  },
  {
    label: 'Hipertensión',
    value: 3
  },
  {
    label: 'Otro',
    value: 4
  }
]

export const CATALOGO_TIPO_PAQUETE: TipoDropdown[] = [
  {
    label: 'Paquete Económico',
    value: 1
  },
  {
    label: 'Paquete Básico',
    value: 2
  },
  {
    label: 'Paquete con Cremación',
    value: 3
  },
]

export const CATALOGO_SEXO: TipoDropdown[] = [
  {
    label: "Mujer",
    value: 1
  },
  {
    label: "Hombre",
    value: 2
  },
  {
    label: "Otro",
    value: 3
  }
];

export const INFO_TIPO_PAQUETE: string[] = [
  "Paquete Económico: incluye la recolección y traslado del cuerpo (hasta 100 km en la misma entidad federativa), capilla en velatorio o en domicilio (hasta 24 horas), apoyo para trámites, arreglo estético del cuerpo y embalsamamiento (en caso de ser necesario), no se incluye ataúd.",
  "Paquete Básico: incluye la recolección y traslado del cuerpo (hasta 100 km en la misma entidad federativa), capilla en velatorio o en domicilio (hasta 24 horas), apoyo para trámites, arreglo estético del cuerpo y embalsamamiento (en caso de ser necesario), ataúd nuevo básico; lo anterior, de acuerdo con la normatividad vigente que aplique para los Velatorios IMSS para el otorgamiento de servicios funerarios.",
  "Paquete con Cremación: incluye la recolección y traslado del cuerpo (hasta 100 km en la misma entidad federativa), capilla en velatorio o en domicilio (hasta 24 horas), apoyo para trámites, arreglo estético del cuerpo y embalsamamiento (en caso de ser necesario), ataúd de donación (de acuerdo con la normatividad vigente que aplique para los Velatorios IMSS para el otorgamiento de servicios funerarios) y la cremación únicamente aplica para los velatorios indicados en el “ANEXO C”. En dicho paquete no se incluye la urna para cenizas."

]
