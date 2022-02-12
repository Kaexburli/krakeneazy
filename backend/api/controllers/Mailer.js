import SMTP from '../../smtp.env.js';
import nodemailer from "nodemailer";
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve(path.dirname(''));

const credentials = {
  host: SMTP.host,
  port: SMTP.port,
  secure: SMTP.secure,
  service: SMTP.service,
  auth: {
    user: SMTP.user,
    pass: SMTP.pass,
  },
};

let transporter = nodemailer.createTransport(credentials);

export const sendRegisterEmail = async (user) => {

  const { firstname, lastname, email, confirmationToken } = user;

  try {

    const filePath = path.join(__dirname + '/api/mails/RegisterMail.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      site_name: process.env.SITE_NAME,
      site_url: process.env.FRONTEND_URI,
      preview_text: "Confirmer votre inscription sur Kurlitrade",
      line_1: "Confirmer mon email",
      line_2: "Cliquez sur le lien pour valider votre email et finaliser votre inscription.",
      confirm_link: process.env.BACKEND_URI + "/email-confirm/" + confirmationToken,
      btn_label: "Valider mon email",
      footer: "Vous avez reçu ce message car votre adresse email à été utilisée pour s'incrire sur kurlitrade, si vous n'avez pas fait d'inscription veuillez ne pas tenir compte de cet email!"
    };

    let info = await transporter.sendMail({
      from: `${process.env.SITE_NAME} <${process.env.SITE_EMAIL}>`,
      to: `${firstname} ${lastname} <${email}>`,
      subject: `[${process.env.SITE_NAME}] Welcome ${firstname} ${lastname}`,
      text: Object.values(replacements).map(val => val).join('\n'),
      html: template(replacements)
    });

    return info.envelope;

  } catch (error) {
    console.log("[sendRegisterEmail ERROR:]", error);
  }

}

export const sendForgotPasswordEmail = async (user) => {

  const { firstname, lastname, email, resetPasswordToken } = user;

  try {

    const filePath = path.join(__dirname + '/api/mails/ForgotPasswordMail.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      site_name: process.env.SITE_NAME,
      site_url: process.env.FRONTEND_URI,
      preview_text: "Mot de passe oublié | " + process.env.SITE_NAME,
      line_1: "Réinitialisez votre mot de passe",
      line_2: "Pour pouvoir réinitialiser votre mot de passe veuillez cliquer sur le lien suivant:",
      forgot_link: process.env.BACKEND_URI + "/forgot-password-confirm/" + resetPasswordToken,
      btn_label: "Réinitialiser mon mot de passe",
      footer: "Vous avez reçu ce message car votre adresse email à été utilisée pour faire une demande de réinitialisation de mot de passe sur kurlitrade, si vous n'avez pas fait cette demande veuillez ne pas tenir compte de cet email!"
    };

    let info = await transporter.sendMail({
      from: `${process.env.SITE_NAME} <${process.env.SITE_EMAIL}>`,
      to: `${firstname} ${lastname} <${email}>`,
      subject: `[${process.env.SITE_NAME}] Mot de passe oublié`,
      text: Object.values(replacements).map(val => val).join('\n'),
      html: template(replacements)
    });

    return info.envelope;

  } catch (error) {
    console.log("[sendForgotPasswordEmail ERROR:]", error);
  }

}

export const sendNewPasswordEmail = async (data) => {
  const { firstname, lastname, email } = data.user;
  const newPassword = data.newPassword;

  try {

    const filePath = path.join(__dirname + '/api/mails/NewPasswordMail.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      site_name: process.env.SITE_NAME,
      site_url: process.env.FRONTEND_URI,
      preview_text: "Nouveau mot de passe | " + process.env.SITE_NAME,
      line_1: "Votre mot de passe a été réinitialisé! ",
      line_2: "Veuillez vous connecter avec ce mot de passe et le modifier une fois connecté.",
      line_3: "Voici votre nouveau mot de passe:",
      newPassword,
      footer: "Vous avez reçu ce message car votre mot de passe à été réinitialisé sur kurlitrade, si vous n'avez pas fait cette demande veuillez nous contacter et changer votre mot de passe dans les plus bref délais"
    };

    let info = await transporter.sendMail({
      from: `${process.env.SITE_NAME} <${process.env.SITE_EMAIL}>`,
      to: `${firstname} ${lastname} <${email}>`,
      subject: `[${process.env.SITE_NAME}] Nouveau mot de passe`,
      text: Object.values(replacements).map(val => val).join('\n'),
      html: template(replacements)
    });

    return info.envelope;

  } catch (error) {
    console.log("[sendNewPasswordEmail ERROR:]", error);
  }

}