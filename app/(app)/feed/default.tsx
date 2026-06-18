// Slot children: na presença de rotas paralelas, o Next exige um default para
// estados sem correspondência em navegação direta. /feed tem page.tsx, então
// isto cobre apenas casos de fallback.
export default function Default() {
  return null
}
