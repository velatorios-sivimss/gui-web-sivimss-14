document.addEventListener('realizarPago', (event) => {

  let paymentCheckout = new PaymentCheckout.modal({
    client_app_code: event.detail.code, // Application Code de las credenciales CLIENT
    client_app_key: event.detail.key, // Application Key de las credenciales CLIENT
    locale: 'es', // Idioma preferido del usuario (es, en, pt). El inglés se usará por defecto
    env_mode: event.detail.mode, // `prod`, `stg`, `local` para cambiar de ambiente. Por defecto es `stg`
    onOpen: function () {
    },
    onResponse: function (response) { // Funcionalidad a invocar cuando se completa el proceso de pago
      const evento = new CustomEvent('datosRecibidos', {detail: response, contratante});
      document.dispatchEvent(evento);

      /*
        En caso de error, esta será la respuesta.
        response = {
          "error": {
            "type": "Server Error",
            "help": "Try Again Later",
            "description": "Sorry, there was a problem loading Checkout."
          }
        }

        Cual el usuario completa el flujo en el Checkout, esta será la respuesta
        response = {
          "transaction":{
              "status":"success", // Estado de la transacción
              "id":"PR-81011", // Id de la transacción de lado de la pasarela
              "status_detail":3 // Para más detalles de los detalles de estado: https://developers.gpvicomm.com/api/#detalle-de-los-estados
          }
        }
      */
      // document.getElementById('response').innerHTML = JSON.stringify(response);
    }
  });

  paymentCheckout.open({
    user_id: '1234',
    user_email: '', // Opcional
    user_phone: '', // Opcional
    order_description: event.detail.referencia,
    order_amount: event.detail.monto,
    order_vat: 0,
    order_reference: event.detail.folio,
    //order_installments_type: 2, // Opcional: 0 para permitir cuotas, -1 en caso contrario.
    //conf_exclusive_types: 'ak,ex', // Opcional: Tipos de tarjeta permitidos para esta operación. Opciones: https://developers.gpvicomm.com/api/#metodos-de-pago-tarjetas-marcas-de-tarjetas
    //conf_invalid_card_type_message: 'Tarjeta invalida para esta operación' // Opcional: Define un mensaje personalizado para mostrar para los tipos de tarjeta no válidos.
  });


// Cerrar el Checkout en la navegación de la página:
  window.addEventListener('popstate', function () {
    paymentCheckout.close();
  });

  document.addEventListener('closeModal', (event) => {
    paymentCheckout.close();
  });
})
