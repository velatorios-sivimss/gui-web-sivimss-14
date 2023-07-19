export interface Panteon {
  nombrePanteon?: string,
  domicilio?: {
    desCalle?: string,
    numExterior?: string,
    numInterior?: string,
    codigoPostal?: string,
    desColonia?: string,
    desMunicipio?: string,
    desEstado?: string,
    desCiudad?:null
  },
  nombreContacto?:string,
  numTelefono?:string
}
