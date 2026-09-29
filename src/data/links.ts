export const EMAIL = 'murilocastilho67@gmail.com'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/murilocastilho67/'
export const GITHUB_PROJECTS_URL = 'https://github.com/murilocastilh0'
export const GITHUB_PERSONAL_URL = 'https://github.com/murilocastilho67'
/** Só dígitos, com DDI e DDD, no formato que o wa.me espera. */
const WHATSAPP_NUMBER = '5549999375167'

/** Link do WhatsApp com a mensagem inicial já preenchida (no idioma do site). */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
