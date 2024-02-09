export interface TransaccionPago {
  transaction: {
    id: string,
    status: string,
    current_status: string,
    status_detail: number,
    payment_date: string,
    amount: number,
    installments: number,
    carrier_code: string,
    message: string,
    authorization_code: string,
    dev_reference: string,
    carrier: string,
    product_description: string,
    payment_method_type: string,
    installments_type: string
  },
  card: {
    number: string,
    bin: string,
    type: string,
    transaction_reference: string,
    status: string,
    token: string,
    expiry_year: string,
    expiry_month: string,
    origin: string,
    holder_name: string
  },
  '3ds': {
    authentication: {
      cavv: string,
      xid: string,
      eci: string,
      version: string,
      status: string,
      return_code: string,
      return_message: string,
      reference_id: string,
      service: string
    },
    browser_response: {
      challenge_request: string,
      hidden_iframe: string
    },
    sdk_response: {
      acs_trans_id: string,
      acs_signed_content: string,
      acs_reference_number: string
    }
  },
  error: any
}
