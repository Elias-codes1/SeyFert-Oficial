// Número de WhatsApp que recibe los pedidos, con código de país y sin "+" ni espacios.
// Número de prueba por ahora; cambiar por el de Sandra cuando lo tengamos.
export const WHATSAPP_NUMERO = '50237466747';

// El navegador usa el proxy de Angular; el render del servidor llama a la API directamente.
export const API_BASE_URL =
  typeof window === 'undefined' ? 'http://localhost:4001/api' : '/api';
