import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import styles from './privacy.module.css'
import BackButton from './back-button'

export const metadata: Metadata = {
  title: 'Aviso de Privacidade',
  description: 'Saiba como a SeLinka trata dados pessoais e como exercer seus direitos.',
}

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`secao-${number}`} className="space-y-4">
      <h2 id={`secao-${number}`} className="text-xl font-semibold sm:text-2xl">{number}. {title}</h2>
      {children}
    </section>
  )
}

function Table({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200" role="region" aria-label={caption} tabIndex={0}>
      <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-relaxed">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-white">
          <tr>{headers.map((header) => <th key={header} scope="col" className="border-b border-slate-200 p-4 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody>{rows.map(([label, ...cells]) => (
          <tr key={label} className="border-b border-slate-200 last:border-0">
            <th scope="row" className="p-4 align-top font-medium">{label}</th>
            {cells.map((cell, index) => <td key={index} className="p-4 align-top">{cell}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function Email({ children }: { children: string }) {
  return <a href={`mailto:${children}`} className="break-words underline underline-offset-4">{children}</a>
}

export default function PrivacyPage() {
  return (
    <main className={`${styles.page} min-h-screen`}>
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      <BackButton />
      <article className="mt-8 space-y-10 text-base leading-relaxed">
        <header className="space-y-3 border-b border-slate-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Aviso de Privacidade — SeLinka</h1>
          <p>Última atualização: [data de publicação]</p>
        </header>

        <Section number={1} title="Sobre este Aviso">
          <p>A SeLinka é uma plataforma de inovação, conexão e colaboração acadêmica desenvolvida e operada no âmbito da UFC Inova, da Universidade Federal do Ceará — UFC.</p>
          <p>Este Aviso explica, de forma clara e transparente, como a SeLinka trata dados pessoais de usuários, visitantes, participantes de eventos, representantes de negócios, laboratórios e demais pessoas que utilizam a plataforma, em conformidade com a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).</p>
          <p>A controladora dos dados pessoais tratados pela SeLinka é a Universidade Federal do Ceará — UFC, autarquia federal de regime especial, inscrita no CNPJ sob o nº 07.272.636/0001-31. A UFC Inova atua como unidade responsável pela gestão operacional da plataforma.</p>
          <p>Para dúvidas operacionais sobre a SeLinka, entre em contato pelo e-mail <Email>ufcinova@ufc.br</Email>.</p>
          <p>O Encarregado pelo Tratamento de Dados Pessoais da UFC poderá ser contatado pelo e-mail <Email>encarregadodp@ufc.br</Email>.</p>
        </Section>

        <Section number={2} title="Dados pessoais tratados">
          <p>A SeLinka trata os dados necessários para disponibilizar, administrar, proteger e aprimorar suas funcionalidades.</p>
          <Table caption="Categorias de dados pessoais tratados" headers={['Categoria', 'Dados tratados']} rows={[
            ['Cadastro e identificação', 'Nome, e-mail, tipo de usuário, identificador de conta, data de cadastro e situação de verificação.'],
            ['Autenticação e segurança', 'Senha protegida por hash, tokens e identificadores de sessão, endereço IP, navegador, dispositivo e registros de acesso.'],
            ['Perfil acadêmico e profissional', 'Campus, curso, matrícula, semestre, currículo Lattes, SIAPE, setor, cargo, empresa, palavras-chave, interesses, biografia e redes sociais.'],
            ['Comunicação e interação', 'Telefone, ramal, mensagens, notificações, comentários, curtidas, seguidores, conexões, favoritos e compartilhamentos.'],
            ['Conteúdo enviado pelo usuário', 'Textos, imagens, vídeos, fotos de perfil e capa, informações de eventos, negócios, laboratórios e iniciativas.'],
            ['Eventos e reuniões', 'Inscrições, presença, certificados, QR codes, reuniões e links de acesso.'],
            ['Solicitações administrativas', 'Pedidos de vínculo ou reivindicação, justificativas, aprovações, recusas e registros de auditoria.'],
            ['Dados técnicos', 'Data, hora, rota acessada, status da requisição, tempo de resposta e identificador de requisição.'],
          ]} />
          <p>A senha é utilizada exclusivamente para autenticação e é armazenada de forma protegida por hash. A SeLinka não armazena senhas em texto legível.</p>
          <p>A plataforma não solicita intencionalmente dados pessoais sensíveis. Recomendamos que os usuários não publiquem dados de saúde, religião, opinião política, origem racial ou étnica, orientação sexual ou outros dados sensíveis em perfis, mensagens, imagens ou publicações, salvo quando houver necessidade legítima e orientação específica.</p>
          <p>Caso o tratamento de dados sensíveis se torne necessário, a UFC deverá observar as hipóteses específicas previstas no art. 11 da LGPD.</p>
        </Section>

        <Section number={3} title="Finalidades e bases legais do tratamento">
          <p>A SeLinka trata dados pessoais somente quando necessários às finalidades abaixo e com fundamento em uma das hipóteses previstas na LGPD.</p>
          <Table caption="Finalidades e bases legais do tratamento" headers={['Atividade de tratamento', 'Finalidade', 'Base legal']} rows={[
            ['Cadastro, identificação, autenticação e administração de contas', 'Permitir acesso seguro à plataforma e às funcionalidades institucionais.', 'Execução de política pública e de atribuições institucionais da UFC — art. 7º, III, da LGPD, observadas as regras aplicáveis ao Poder Público.'],
            ['Uso das funcionalidades da plataforma', 'Viabilizar conexões acadêmicas, divulgação de perfis, oportunidades, eventos, comunidades e demais recursos oferecidos pela SeLinka.', 'Execução de política pública e de atribuições institucionais da UFC — art. 7º, III, da LGPD.'],
            ['Visibilidade de perfis entre usuários autenticados', 'Permitir identificação e contato no contexto de conexão acadêmica, profissional e institucional promovido pela plataforma.', 'Execução de política pública e de atribuições institucionais da UFC — art. 7º, III, da LGPD, limitada aos dados necessários para essa finalidade.'],
            ['Comunicações operacionais', 'Enviar confirmações de cadastro, avisos de segurança, alterações relevantes e informações necessárias ao uso da plataforma.', 'Execução de política pública e de atribuições institucionais da UFC — art. 7º, III, da LGPD.'],
            ['Segurança, prevenção a fraudes e registros técnicos', 'Proteger contas, prevenir acessos indevidos, investigar incidentes e preservar a segurança da plataforma.', 'Legítimo interesse — art. 7º, IX, da LGPD, com medidas de segurança e avaliação de necessidade, proporcionalidade e impacto aos titulares.'],
            ['Eventos, inscrições, presença e certificados', 'Gerenciar inscrições, participação, emissão de certificados e comunicações relacionadas a atividades promovidas ou apoiadas pela UFC.', 'Execução de política pública e de atribuições institucionais da UFC — art. 7º, III, da LGPD.'],
            ['Cumprimento de obrigações e defesa de direitos', 'Atender obrigações legais, regulatórias, administrativas ou ordens de autoridades competentes, bem como exercer ou defender direitos.', 'Cumprimento de obrigação legal ou regulatória — art. 7º, II — e exercício regular de direitos — art. 7º, VI, da LGPD, conforme o caso.'],
            ['Comunicações não essenciais', 'Enviar informativos, resumos ou comunicações que não sejam indispensáveis ao funcionamento da conta.', 'Consentimento — art. 7º, I, da LGPD, obtido de forma livre, informada, específica e revogável a qualquer momento.'],
            ['Cookies e tecnologias não essenciais', 'Utilizar tecnologias analíticas, publicitárias ou equivalentes que não sejam estritamente necessárias ao funcionamento da plataforma.', 'Consentimento — art. 7º, I, da LGPD, obtido antes da ativação da tecnologia.'],
          ]} />
        </Section>

        <Section number={4} title="Visibilidade de perfis e conteúdos">
          <p>A SeLinka é uma plataforma de conexão acadêmica e profissional. Por isso, determinadas informações de perfil e conteúdos podem ser disponibilizados a outros usuários autenticados, de acordo com as funcionalidades utilizadas.</p>
          <p>No contexto atual da plataforma, outros usuários autenticados podem acessar informações como nome, foto de perfil, campus, curso ou cargo, empresa ou setor, currículo Lattes, áreas de interesse, palavras-chave, conteúdos publicados, vínculos com iniciativas, negócios, laboratórios ou eventos e, quando disponibilizados no perfil, dados de contato como endereço de e-mail.</p>
          <p>A visibilidade dessas informações tem a finalidade de permitir identificação, conexão e comunicação no âmbito das atividades acadêmicas, profissionais e institucionais da SeLinka. A UFC deverá limitar a exibição ao mínimo necessário para essa finalidade.</p>
          <p>A plataforma registra preferências relacionadas à pesquisabilidade do perfil e ao recebimento de comunicações. Contudo, no estado atual, essas preferências não constituem um controle individual e completo sobre todos os campos exibidos no perfil. Portanto, o usuário não deve considerá-las uma garantia de ocultação do endereço de e-mail ou de outros dados acessíveis a usuários autenticados.</p>
          <p>Dados de autenticação, senhas, matrícula, SIAPE, ramal, endereço IP, sessões, logs e informações administrativas não são disponibilizados em perfis de outros usuários.</p>
          <p>Perfis e dados pessoais não são destinados à indexação pública por mecanismos de busca nem à consulta anônima por visitantes, salvo se a plataforma vier a disponibilizar funcionalidade específica para isso, com informação prévia ao titular e base legal aplicável.</p>
        </Section>

        <Section number={5} title="Cookies, armazenamento local e cache">
          <p>A SeLinka utiliza cookies estritamente necessários para autenticação e segurança.</p>
          <Table caption="Cookies, armazenamento local e cache" headers={['Tecnologia', 'Finalidade', 'Duração']} rows={[
            ['selinka_access', 'Manter a sessão autenticada.', 'Até 30 minutos.'],
            ['selinka_refresh', 'Renovar a sessão autenticada.', 'Até 7 dias, quando selecionada a opção “Manter conectada neste dispositivo”.'],
            ['Armazenamento local', 'Guardar a preferência visual de tema.', 'Até alteração ou limpeza pelo usuário.'],
            ['Cache do navegador', 'Armazenar temporariamente arquivos e, em determinadas situações, respostas de páginas para melhorar carregamento e funcionamento da aplicação.', 'Conforme configuração do navegador e atualização da aplicação.'],
          ]} />
          <p>Os cookies de autenticação são de primeira parte, possuem proteção HttpOnly, utilizam SameSite=Lax e, em produção, são transmitidos apenas por conexão segura.</p>
          <p>A SeLinka não utiliza cookies para publicidade comportamental. Caso sejam incluídas tecnologias analíticas, publicitárias ou de terceiros que não sejam estritamente necessárias, será apresentado aviso específico e mecanismo adequado de gerenciamento de consentimento antes de sua ativação.</p>
          <p>Em dispositivos compartilhados, recomendamos encerrar a sessão após o uso e limpar os dados de navegação quando necessário.</p>
        </Section>

        <Section number={6} title="Como obtemos os dados">
          <p>Os dados pessoais podem ser obtidos:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>diretamente do titular, no cadastro, edição de perfil, envio de mensagens, publicação de conteúdo, participação em eventos e utilização das funcionalidades;</li>
            <li>automaticamente, por meio de dados técnicos necessários à segurança, autenticação, sessão e funcionamento da plataforma;</li>
            <li>de instituições parceiras ou fontes públicas, quando houver finalidade legítima, base legal aplicável e informação adequada ao titular.</li>
          </ul>
        </Section>

        <Section number={7} title="Armazenamento e retenção">
          <p>Os dados são armazenados em infraestrutura compatível com as finalidades desta Política, incluindo banco de dados, cache, armazenamento de arquivos, serviços de e-mail, videoconferência e monitoramento técnico.</p>
          <p>A SeLinka mantém os dados pelo tempo necessário para:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>fornecer e administrar a conta e as funcionalidades solicitadas;</li>
            <li>cumprir finalidades acadêmicas, institucionais, administrativas ou de segurança;</li>
            <li>atender obrigações legais e regulatórias;</li>
            <li>prevenir fraudes, resolver incidentes e exercer direitos em processos administrativos, judiciais ou arbitrais.</li>
          </ul>
          <p>Após o término da finalidade, os dados serão eliminados, anonimizados ou mantidos apenas nas hipóteses permitidas pela LGPD, inclusive para cumprimento de obrigação legal, transferência a terceiro nos termos da lei ou uso exclusivo da controladora, desde que anonimizados.</p>
          <p>Os prazos operacionais específicos devem constar em tabela de retenção de dados e em regras de backup e segurança aprovadas pela UFC.</p>
        </Section>

        <Section number={8} title="Compartilhamento de dados">
          <p>A SeLinka poderá compartilhar somente os dados necessários com operadores e parceiros envolvidos na prestação do serviço, tais como:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>provedores de infraestrutura, banco de dados, hospedagem, cache e segurança;</li>
            <li>Cloudflare R2, para armazenamento de imagens, vídeos e certificados;</li>
            <li>provedores de e-mail, para envio de verificação, recuperação de acesso, notificações e convites;</li>
            <li>Jitsi ou outro serviço de videoconferência configurado para reuniões on-line;</li>
            <li>Sentry, quando habilitado, para monitoramento técnico, identificação e correção de erros;</li>
            <li>instituições parceiras envolvidas em eventos, iniciativas ou emissão de certificados;</li>
            <li>autoridades públicas, judiciais, administrativas ou regulatórias, quando exigido por lei ou decisão válida.</li>
          </ul>
          <p>No uso de ferramentas de monitoramento de erros, a SeLinka deverá limitar a coleta ao contexto técnico necessário e adotar filtros para evitar o envio de senhas, dados sensíveis e informações excessivas.</p>
          <p>Quando o compartilhamento envolver transferência internacional de dados, a SeLinka adotará as salvaguardas e os mecanismos previstos na LGPD e na regulamentação da Autoridade Nacional de Proteção de Dados — ANPD.</p>
          <p>A SeLinka exige que operadores tratem os dados somente para as finalidades contratadas, com confidencialidade, segurança e observância da legislação aplicável.</p>
        </Section>

        <Section number={9} title="Segurança">
          <p>A SeLinka adota medidas técnicas e administrativas para proteger dados pessoais contra acessos não autorizados, perda, alteração, destruição, divulgação ou tratamento inadequado.</p>
          <p>Entre essas medidas estão controle de acesso, autenticação, proteção de senhas, limitação de requisições, validação de arquivos enviados, monitoramento de erros, registro de ações relevantes e uso de conexões seguras.</p>
          <p>Se ocorrer incidente de segurança que possa gerar risco ou dano relevante aos titulares, a UFC adotará medidas de contenção, investigação e comunicação à ANPD e aos titulares, quando aplicável, nos termos da legislação.</p>
        </Section>

        <Section number={10} title="Direitos do titular">
          <p>O titular pode solicitar:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>confirmação da existência de tratamento;</li>
            <li>acesso aos dados pessoais;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;</li>
            <li>portabilidade, quando aplicável;</li>
            <li>eliminação de dados tratados com consentimento, observadas as hipóteses legais de conservação;</li>
            <li>informação sobre entidades públicas ou privadas com as quais os dados foram compartilhados;</li>
            <li>informação sobre a possibilidade de não fornecer consentimento e sobre suas consequências, quando aplicável;</li>
            <li>revogação do consentimento;</li>
            <li>oposição a tratamento irregular;</li>
            <li>revisão de decisões tomadas exclusivamente com base em tratamento automatizado, quando aplicável.</li>
          </ul>
          <p>Para exercer direitos ou esclarecer dúvidas sobre este Aviso, entre em contato com o Encarregado pelo Tratamento de Dados Pessoais da UFC pelo e-mail <Email>encarregadodp@ufc.br</Email>.</p>
          <p>Para dúvidas operacionais sobre a SeLinka, o usuário também pode contatar a UFC Inova pelo e-mail <Email>ufcinova@ufc.br</Email>.</p>
        </Section>

        <Section number={11} title="Crianças e adolescentes">
          <p>A SeLinka é voltada principalmente à comunidade acadêmica, profissionais, instituições e parceiros.</p>
          <p>Caso sejam tratados dados de crianças, a UFC observará o seu melhor interesse e obterá consentimento específico e em destaque de pelo menos um dos pais ou responsável legal, salvo hipótese legal aplicável.</p>
          <p>No tratamento de dados de adolescentes, a UFC observará o melhor interesse desse público e as demais exigências legais aplicáveis.</p>
        </Section>

        <Section number={12} title="Contato">
          <p><strong>Controladora:</strong> Universidade Federal do Ceará — UFC<br />
            <strong>CNPJ:</strong> 07.272.636/0001-31<br />
            <strong>Endereço da controladora:</strong> Avenida da Universidade, 2853, Benfica, Fortaleza/CE, CEP 60020-181</p>
          <p><strong>Unidade responsável pela operação da SeLinka:</strong> Agência de Inovação UFC Inova — Pró-Reitoria de Inovação e Relações Interinstitucionais<br />
            <strong>Endereço da unidade operacional:</strong> Bloco 334, Condomínio de Empreendedorismo e Inovação, 5º andar, Campus do Pici, s/n, Pici, Fortaleza/CE, CEP 60355-636</p>
          <p><strong>Canal de suporte da SeLinka:</strong> <Email>ufcinova@ufc.br</Email><br />
            <strong>Encarregado pelo Tratamento de Dados Pessoais:</strong> Prof. Júlio Francisco Barros Neto<br />
            <strong>Contato do encarregado:</strong> <Email>encarregadodp@ufc.br</Email></p>
        </Section>

        <Section number={13} title="Atualizações deste Aviso">
          <p>Este Aviso poderá ser atualizado para refletir alterações legais, técnicas, operacionais ou nas funcionalidades da SeLinka.</p>
          <p>Quando a alteração for relevante, a nova versão será divulgada com destaque na plataforma. Quando uma nova finalidade depender de consentimento, ele será solicitado antes do início do respectivo tratamento.</p>
        </Section>
      </article>
      </div>
    </main>
  )
}
