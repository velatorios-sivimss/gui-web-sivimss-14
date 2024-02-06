let paymentCheckout = new PaymentCheckout.modal({
  client_app_code: 'VCM-FIBESOIMSS-STG-MXN-CLIENT', // Application Code de las credenciales CLIENT
  client_app_key: '3zLfJvt653sSiLdcW9RMdS05yLCOHH', // Application Key de las credenciales CLIENT
  locale: 'es', // Idioma preferido del usuario (es, en, pt). El inglés se usará por defecto
  env_mode: 'stg', // `prod`, `stg`, `local` para cambiar de ambiente. Por defecto es `stg`
  onOpen: function () {
    console.log('Modal abierto');
  },
  onClose: function () {
    console.log('Modal cerrado');
  },
  onResponse: function (response) { // Funcionalidad a invocar cuando se completa el proceso de pago

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
    console.log('Respuesta de modal');
    console.log(JSON.stringify(response));
    // document.getElementById('response').innerHTML = JSON.stringify(response);
  }
});


let btnOpenCheckout = document.querySelector('.realizar-pago');
btnOpenCheckout.addEventListener('click', function () {
  console.log('Click')
  // Accede al objeto pasado como atributo del script
  const dataObj = JSON.parse(btnOpenCheckout.getAttribute('data-objeto'));

  // Ahora puedes utilizar dataObj como desees en tu lógica de JavaScript
  console.log(dataObj);

  // Open Checkout with further options:
  paymentCheckout.open({
    user_id: '1234',
    user_email: '', // Opcional
    user_phone: '', // Opcional
    order_description: dataObj.referencia,
    order_amount: dataObj.monto,
    order_vat: 0,
    order_reference: '#234323411',
    //order_installments_type: 2, // Opcional: 0 para permitir cuotas, -1 en caso contrario.
    //conf_exclusive_types: 'ak,ex', // Opcional: Tipos de tarjeta permitidos para esta operación. Opciones: https://developers.gpvicomm.com/api/#metodos-de-pago-tarjetas-marcas-de-tarjetas
    //conf_invalid_card_type_message: 'Tarjeta invalida para esta operación' // Opcional: Define un mensaje personalizado para mostrar para los tipos de tarjeta no válidos.
  });
});

// Cerrar el Checkout en la navegación de la página:
window.addEventListener('popstate', function () {
  paymentCheckout.close();
});
