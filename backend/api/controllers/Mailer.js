import SMTP from '../../smtp.env.js';
import nodemailer from "nodemailer";
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve(path.dirname(''));

export const sendRegisterEmail = async (user) => {

  const { firstname, lastname, email, confirmationToken } = user;

  try {

    const filePath = path.join(__dirname + '/api/mails/RegisterMail.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      site_name: "kurlitrade",
      site_url: process.env.FRONTEND_URI,
      preview_text: "Confirmer votre inscription sur Kurlitrade",
      line_1: "Confirmer mon email",
      line_2: "Cliquez sur le lien pour valider votre email et finaliser votre inscription.",
      confirm_link: process.env.BACKEND_URI + "/email-confirm/" + confirmationToken,
      btn_label: "Valider mon email",
      footer: "Vous avez reçu ce message car votre adresse email à été utilisée pour s'incrire sur kurlitrade, si vous n'avez pas fait d'inscription veuillez ne pas tenir compte de cet email!"
    };

    const credentials = {
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.secure,
      service: 'gmail',
      auth: {
        user: SMTP.user,
        pass: SMTP.pass,
      },
    };

    let transporter = nodemailer.createTransport(credentials);

    let info = await transporter.sendMail({
      from: `Kurlitrade <kurlitrade@gmail.com>`,
      to: `${firstname} ${lastname} <${email}>`,
      subject: `[Kurlitrade] Welcome ${firstname} ${lastname}`,
      text: Object.values(replacements).map(val => val).join('\n'),
      html: template(replacements)
    });

    return info.envelope;

  } catch (error) {
    console.log("[sendRegisterEmail ERROR:]", error);
  }

}