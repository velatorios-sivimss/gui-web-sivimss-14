export interface DetalleServicios {
                 idPlan: null | string,
               numFolio: null | string,
         desNumeroPagos: null | string,
          nombrePaquete: null | string,
  contratanteSubstituto: null | string,
                 correo: null | string,
                 estado: null | string,
              velatorio: null | string,
            estatusPlan: null | string,
                  total: null | string,
               restante: null | number,
            totalPagado: null | number
}

export interface PagosRealizados {
               pagos:  null | string,
           fechaPago:  null | string,
          metodoPago:  null | string,
  numeroAutorizacion:  null | string,
   folioAutorizacion:  null | string,
         estatusPago:  null | string,
      idBitacoraPago:  null | number,
         nombreBanco:  null | string,
           velatorio:  null | string,
               monto:  null | string,
        noReciboPago:  null | string,
}
