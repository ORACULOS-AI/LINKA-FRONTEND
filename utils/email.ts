import nodemailer from 'nodemailer'

export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verifique seu email - Ambiente Digital de Conexões UFC',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Confirmação de Email</h2>
        <p>Olá,</p>
        <p>Obrigado por se cadastrar no Ambiente Digital de Conexões. Para confirmar seu endereço de email, por favor use o seguinte código de verificação:</p>
        <h3 style="font-size: 24px; background-color: #f0f0f0; padding: 10px; text-align: center;">${verificationCode}</h3>
        <p>Este código é válido por 10 minutos. Se você não solicitou esta verificação, por favor ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Ambiente Digital de Conexões</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
