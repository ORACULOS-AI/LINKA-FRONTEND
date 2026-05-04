import { FacebookIcon, Linkedin, TwitterIcon } from 'lucide-react'

const social = [
  { name: 'Twitter', href: '/', icon: TwitterIcon },
  { name: 'Linkedin', href: '/', icon: Linkedin },
  { name: 'Facebook', href: '/', icon: FacebookIcon },
]

const legal = [
  { name: 'Termos' },
  { name: 'Privacidade' },
  { name: 'Cookies' },
  { name: 'Licenças' },
]
const links = [
  { name: 'Home', href: '/', expand: null },
  { name: 'Sobre', href: '/#sobre-escritorio', expand: null },
  { name: 'Vitrines', href: '/#vitrines', expand: null },
  {
    name: 'Comitê de Uniformização',
    href: '/#comite',
    // expand: [
    //   { name: 'Sobre', href: '/sobre' },
    //   { name: 'Conferir', href: '/conferir' },
    // ],
  },
  {
    name: 'Fluxos e Checklists',
    href: '/',
    expand: [
      {
        name: 'Fluxos e Checklists de Acordos de Parceria e Serviços Técnicos Especializados',
        href: '/fluxos_e_checklists/acordo_e_parceria_de_pdi',
      },
      {
        name: 'Termo de Confidencialidade (NDA)',
        href: '/fluxos_e_checklists/termo_de_confidenciabilidade',
      },
      {
        name: 'Fluxo agência de fomento',
        href: '/fluxos_e_checklists/fluxo_agencia_de_fomento',
      },
      { name: 'Legislação', href: '/fluxos_e_checklists/legislacao' },
      {
        name: 'Fluxos de Processos',
        href: '/fluxos_e_checklists/fluxos_de_processos',
      },
      { name: 'Fluxos visuais', href: '/fluxos_e_checklists/fluxos_visuais' },
    ],
  },
  { name: 'Contato', href: '/contato', expand: null },
  { name: 'Rede', href: '/rede', expand: null },
  { name: 'Eventos', href: '/eventos', expand: null },
  {
    name: 'Início',
    href: '/negocios',
    expand: null,
    special: true,
  },
]

export { social, legal, links }
