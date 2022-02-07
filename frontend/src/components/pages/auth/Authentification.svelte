<script>
  import { afterUpdate } from "svelte";
  import {
    userRegister,
    userLogin,
    userForgotPassword,
  } from "utils/userApi.js";
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";
  import { Moon } from "svelte-loading-spinners";

  import { User } from "store/userStore.js";

  let isLoading = false;
  let isError = false;
  let isSuccess = false;
  let isLoginFom = true;
  let isForgotFom = false;
  let formClass = isLoginFom ? "loginForm" : "registerForm";

  /**
   * resetForm
   * @description Réinitialise le formulaire
   */
  const resetForm = () => {
    document.getElementById("authForm").reset();
  };

  /**
   * Notification
   * @description Envoi une alert message
   * @param { String } message Message a afficher
   * @param { String } theme Thème (default, success, error)
   */
  const Notification = (message, theme = "default", reload = false) => {
    if (!message) return;

    const themes = {
      default: {},
      success: {
        "--toastBackground": "darkgreen",
        "--toastBarBackground": "#1f4a22",
      },
      error: {
        "--toastBackground": "brown",
        "--toastBarBackground": "#4a1f1f",
      },
    };
    theme = themes[theme];

    toast.push(message, {
      initial: 0,
      next: 1,
      pausable: true,
      dismissable: true,
      target: "new",
      theme,
      duration: reload ? 500 : 5000,
      onpop: () => {
        reload ? location.reload() : false;
      },
    });
  };

  /**
   * setError
   * @description Change la couleur des bordures et du background en cas d'erreur
   * @param { String } selector Nom du champ en erreur
   * @returns { Void } void
   */
  const setError = (selector) => {
    let input = document.querySelector(`input[name="${selector}"]`);
    input.style.border = "2px solid red";
    input.style.background = "#662f2f";
  };

  /**
   * unsetError
   * @description Remet la couleur de background et des bordure a l'état intial
   * @returns { Void } void
   */
  const unsetError = () => {
    let inputs = document.querySelectorAll(
      `input[type="text"], input[type="email"], input[type="password"]`
    );
    for (const input of inputs) {
      input.style.border = "0px";
    }
  };

  /**
   * toogleForm
   * @description Affiche le forumulaire login ou register
   * @returns { Void } void
   */
  const toogleForm = () => {
    isLoginFom = !isLoginFom;
    formClass = isLoginFom ? "loginForm" : "registerForm";
  };

  /**
   * toogleForgotForm
   * @description Affiche le forumulaire login ou forgot password
   * @returns { Void } void
   */
  const toogleForgotForm = () => {
    isForgotFom = !isForgotFom;
    formClass = "forgotForm";
  };

  /**
   * toogleColorIcon
   * @description Change la couleur de l'icone onFocus et remet à l'état intial onBlur
   * @returns { Void } void
   */
  const toogleColorIcon = () => {
    const inputs = document.querySelectorAll(".input");
    for (const el of inputs) {
      el.addEventListener("focus", (e) => {
        const icon = el.previousElementSibling;
        icon.style.color = "firebrick";
        icon.style.background = "#cdcdcd";
      });
      el.addEventListener("blur", (e) => {
        const icon = el.previousElementSibling;
        icon.style.color = "#ffffff";
        icon.style.background = "#3b3b3b";
      });
    }
  };

  /**
   * isFormValid
   * @param { Object } data Object formData
   * @description Valide les données du formualaire soumis
   * @returns { boolean }  Return true si valide et false en cas d'erreur
   */
  const isFormValid = (data) => {
    if (isRequiredFieldValid(data)) {
      isError = `All fields is required!`;
      return false;
    }

    if (isValidEmail(data)) {
      isError = `Your email is not valid!`;
      return false;
    }

    if (isValidPassword(data)) {
      isError = `Your password is not valid! <br />Minimum 8 caractères contenant une majuscules et un caractère spécial`;
      return false;
    }

    if (isValidPswdConfirmation(data)) {
      isError = `Your password is not corresponding with your password confirmation`;
      return false;
    }

    return true;
  };

  /**
   * isRequiredFieldValid
   * @description Vérifie si le contenu d'un champs est vide
   * @param { Object } data Object formData
   * @returns { boolean } Return true en cas d'erreur
   */
  const isRequiredFieldValid = (data) => {
    return Object.keys(data)
      .map((key) => {
        if (data[key] === null || data[key] === "") {
          setError(key);
          return false;
        } else return true;
      })
      .includes(false);
  };

  /**
   * isValidEmail
   * @description Vérifie si le contenu d'un champs est un email valide
   * @param { Object } data Object formData
   * @returns { boolean } Return true en cas d'erreur
   */
  const isValidEmail = (data) => {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let regex = new RegExp(mailformat);
    return Object.keys(data)
      .map((key) => {
        if (key.endsWith("_email")) {
          let test = regex.test(data[key]);
          if (!test) setError(key);
          return test;
        }
        return true;
      })
      .includes(false);
  };

  /**
   * isValidPassword
   * @description Vérifie si le contenu d'un champs est un password valide
   * @param { Object } data Object formData
   * @returns { boolean }  Return true en cas d'erreur
   */
  const isValidPassword = (data) => {
    let regex = new RegExp(
      "^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$",
      "g"
    );
    return Object.keys(data)
      .map((key) => {
        if (key.endsWith("_password")) {
          let test = regex.test(data[key]);
          if (!test) setError(key);
          return test;
        }
        return true;
      })
      .includes(false);
  };

  /**
   * isValidPswdConfirmation
   * @description Vérifie si le password correspond au password confirmation
   * @param { Object } data Object formData
   * @returns { boolean }  Return true en cas d'erreur
   */
  const isValidPswdConfirmation = (data) => {
    return Object.keys(data)
      .map((key) => {
        if (key === "reg_password_confirm") {
          let test = data["reg_password_confirm"] === data["reg_password"];
          if (!test) setError("reg_password_confirm");
          return test;
        }
        return true;
      })
      .includes(false);
  };

  /**
   * onSubmit
   * @description Receptionne la soumission du formulaire
   * @param { Object } event Object event
   * @returns { boolean } boolean
   */
  const onSubmit = (evt) => {
    unsetError();
    isLoading = true;
    isError = false;

    let data = {};
    const formData = new FormData(evt.target);
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    if (isFormValid(data)) {
      switch (data["action"]) {
        case "login":
          processLogin(data);
          break;
        case "register":
          processRegister(data);
          break;
        case "forgotpasswd":
          processForgotPassword(data);
          break;
      }
    } else {
      isError = "Invalid Form";
    }
  };

  /**
   * processForgotPassword
   * @description Traitement du mot de passe oublié
   * @param { Object } event Object FormData
   * @returns { boolean } boolean
   */
  const processForgotPassword = async (data) => {
    console.log("processForgotPassword", data);
    const forgot = await userForgotPassword(data);
    console.log("FORGOT:", forgot);
    if (forgot.hasOwnProperty("error")) {
      isLoading = false;
      isError = forgot.message;
      Notification(isError, "error");
      resetForm();
    } else {
      console.log("Traitement des données cookie + localstorage");
      isLoading = false;
      isSuccess = `Un email a ete envoyé!`;
      Notification(isSuccess, "success");
    }
  };

  /**
   * processLogin
   * @description Traitement de la connexion
   * @param { Object } event Object FormData
   * @returns { boolean } boolean
   */
  const processLogin = async (data) => {
    const login = await userLogin(data);
    if (login.hasOwnProperty("error")) {
      isLoading = false;
      isError = login.message;
      Notification(isError, "error");
      resetForm();
    } else {
      isLoading = false;
      isSuccess = `Bienvenue ${login.user.firstname}! encore un petit instant...`;
      Notification(isSuccess, "success", true);
      resetForm();

      User.signin({ token: login.token });
    }
  };

  /**
   * processRegister
   * @description Traitement de l'inscription utilisateur
   * @param { Object } data Object FormData
   * @returns { boolean } boolean
   */
  const processRegister = async (data) => {
    const register = await userRegister(data);

    if (register.hasOwnProperty("error")) {
      isLoading = false;
      isError = register.message;
      Notification(isError, "error");
    } else {
      isLoading = false;
      isSuccess = `Bienvenue ${register.user.firstname}! Votre compte a bien été créé! <br /> Veuillez confirmer votre adresse email (${register.user.email}).`;
      Notification(isSuccess, "success");
      resetForm();
      toogleForm();
    }
  };

  /**
   * Method afterUpdate
   */
  afterUpdate(async () => {
    toogleColorIcon();
  });

  const params = new URLSearchParams(window.location.search);
  if (params.has("confirmation")) {
    const confirmation = params.get("confirmation");
    if (confirmation === "ok")
      Notification("Votre email à bien été confirmé!", "success");
    else if (confirmation === "notok")
      Notification("Cette email a déja été confirmé!", "error");
  }
</script>

<form on:submit|preventDefault={onSubmit} class={formClass} id="authForm">
  <div class="logo">
    <h1>WallTrade</h1>
  </div>

  {#if isError}
    <span class="error">{@html isError}</span>
  {/if}

  {#if isSuccess}
    <span class="success">{@html isSuccess}</span>
  {/if}

  {#if isLoginFom}
    {#if !isForgotFom}
      <h2>
        <span class="entypo-login">
          <i class="fa fa-sign-in" />
        </span>&nbsp; Login
        <div id="clockloader">
          {#if isLoading}
            <Moon size="30" color="#e8e8e8" unit="px" duration="1s" />
          {/if}
        </div>
      </h2>
      <div class="forminput login clearfix">
        <button class="submit">
          <span class="entypo-lock">
            <i class="fa fa-lock" />
          </span>
        </button>
        <span class="entypo-user inputMailIcon">
          <i class="fa fa-at" />
        </span>
        <input
          type="email"
          class="input"
          placeholder="Email"
          name="log_email"
          required
        />
        <span class="entypo-key inputPassIcon">
          <i class="fa fa-key" />
        </span>
        <input
          type="password"
          class="input"
          placeholder="Password"
          name="log_password"
          required
        />
        <input type="checkbox" id="remember_me" name="remember_me" />
        <input type="hidden" name="action" value="login" />
        <label for="remember_me">Remember me</label>
        <a href="/" on:click|preventDefault={toogleForm}>
          Register&nbsp;
          <i class="fa fa-user-plus" />
        </a>
        <a
          href="/"
          style="margin-right: 10px;"
          on:click|preventDefault={toogleForgotForm}
        >
          Forgot password&nbsp;
          <i class="fa fa-refresh" />
        </a>
      </div>
    {:else}
      <h2>
        <span class="entypo-login">
          <i class="fa fa-sign-in" />
        </span>&nbsp; Forgot password
        <div id="clockloader">
          {#if isLoading}
            <Moon size="30" color="#e8e8e8" unit="px" duration="1s" />
          {/if}
        </div>
      </h2>
      <div class="forminput forgot clearfix">
        <button class="submit">
          <span class="entypo-refresh">
            <i class="fa fa-refresh" />
          </span>
        </button>
        <span class="entypo-user inputMailIcon">
          <i class="fa fa-at" />
        </span>
        <input
          type="email"
          class="input"
          placeholder="Email"
          name="forgot_email"
          required
        />
        <input type="hidden" name="action" value="forgotpasswd" />
        <a href="/" on:click|preventDefault={toogleForgotForm}>
          Login&nbsp;
          <i class="fa fa-sign-in" />
        </a>
      </div>
    {/if}
  {:else}
    <h2>
      <span class="entypo-register">
        <i class="fa fa-user-plus" />
      </span>&nbsp; Register
      <div id="clockloader">
        {#if isLoading}
          <Moon size="30" color="#e8e8e8" unit="px" duration="1s" />
        {/if}
      </div>
    </h2>
    <div class="forminput register clearfix">
      <button class="submit">
        <span class="entypo-plus">
          <i class="fa fa-plus" />
        </span>
      </button>
      <span class="entypo-user inputUserFirstIcon">
        <i class="fa fa-user" />
      </span>
      <input
        type="text"
        class="input"
        placeholder="Firstname"
        name="reg_firstname"
        required
      />
      <span class="entypo-user inputUserLastIcon">
        <i class="fa fa-user" />
      </span>
      <input
        type="text"
        class="input"
        placeholder="Lastname"
        name="reg_lastname"
        required
      />
      <span class="entypo-user inputMailIcon">
        <i class="fa fa-at" />
      </span>
      <input
        type="email"
        class="input"
        placeholder="Email"
        name="reg_email"
        required
      />
      <span class="entypo-key inputPassIcon">
        <i class="fa fa-key" />
      </span>
      <input
        type="password"
        class="input"
        placeholder="Password"
        name="reg_password"
        required
      />
      <span class="entypo-key inputPassConfirmIcon">
        <i class="fa fa-key" />
      </span>
      <input
        type="password"
        class="input"
        placeholder="Confirm password"
        name="reg_password_confirm"
        required
      />
      <input type="hidden" name="action" value="register" />
      <a href="/" on:click|preventDefault={toogleForm}>
        Login&nbsp;
        <i class="fa fa-sign-in" />
      </a>
    </div>
  {/if}
</form>

<SvelteToast />
<div class="wrap">
  <SvelteToast target="new" />
</div>

<style>
  @import url(http://weloveiconfonts.com/api/?family=entypo) all;
  @import url(https://fonts.googleapis.com/css?family=Roboto) all;

  /* zocial */
  [class*="entypo-"]:before {
    font-family: "entypo", sans-serif;
  }

  *,
  *:before,
  *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .clearfix:after {
    content: "";
    display: block;
    clear: both;
  }

  .logo {
    background-color: firebrick;
  }

  .logo h1 {
    text-align: center;
    color: white;
    text-transform: uppercase;
  }

  h2 {
    font-size: 1em;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    padding: 10px;
    background-color: #212121;
    border-bottom: 1px dotted #333;
    border-left: 1px dotted #333;
    border-right: 1px dotted #333;
    border-top: 1px solid #313131;
  }

  :global(body) {
    background: #1b1b1b;
    font-family: "Roboto", sans-serif;
  }

  form {
    position: relative;
    margin: 230px auto;
    width: 25em;
    height: auto;
    background-color: #252525;
    border: 1px solid #222222;
    overflow: hidden;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
  }

  form.loginForm {
    margin: 230px auto;
  }

  form.registerForm {
    margin: 130px auto;
  }

  .forminput {
    padding: 10px;
    margin-top: 5px;
    position: relative;
    border-left: 1px dotted #333;
    border-right: 1px dotted #333;
    border-bottom: 1px dotted #333;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"] {
    padding: 16px 16px 16px 45px;
    border: 0px;
    background: #575757;
    display: block;
    margin: 0 15px 15px 0;
    width: 315px;
    color: white;
    font-size: 18px;
    height: 45px;
    -webkit-border-radius: 7px;
    -moz-border-radius: 7px;
    border-radius: 7px;
  }

  input:focus {
    outline-color: rgba(0, 0, 0, 0);
    background: #dadada;
    color: firebrick;
  }

  .submit {
    float: right;
    height: 106px;
    width: 50px;
    border: 0px;
    background: brown;
    padding: 10px;
    color: white;
    font-size: 22px;
    cursor: pointer;
    -webkit-border-radius: 7px;
    -moz-border-radius: 7px;
    border-radius: 7px;
  }
  .submit:hover {
    background: firebrick;
  }

  .register .submit {
    height: 285px;
  }

  .forgot .submit {
    height: 45px;
    font-size: 18px;
  }

  .register .inputUserFirstIcon {
    position: absolute;
    top: 10px;
    left: 8px;
    color: white;
    width: 35px;
    height: 45px;
    background-color: #3b3b3b;
    text-align: center;
    vertical-align: middle;
    padding-top: 12px;
    -webkit-border-top-left-radius: 7px;
    -webkit-border-bottom-left-radius: 7px;
    -moz-border-radius-topleft: 7px;
    -moz-border-radius-bottomleft: 7px;
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
  }

  .register .inputUserLastIcon {
    position: absolute;
    top: 70px;
    left: 8px;
    color: white;
    width: 35px;
    height: 45px;
    background-color: #3b3b3b;
    text-align: center;
    vertical-align: middle;
    padding-top: 12px;
    -webkit-border-top-left-radius: 7px;
    -webkit-border-bottom-left-radius: 7px;
    -moz-border-radius-topleft: 7px;
    -moz-border-radius-bottomleft: 7px;
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
  }

  .register .inputMailIcon {
    top: 130px;
  }

  .register .inputPassIcon {
    top: 190px;
  }

  .register .inputPassConfirmIcon {
    position: absolute;
    top: 250px;
    left: 8px;
    color: white;
    width: 35px;
    height: 45px;
    background-color: #3b3b3b;
    text-align: center;
    vertical-align: middle;
    padding-top: 12px;
    -webkit-border-top-left-radius: 7px;
    -webkit-border-bottom-left-radius: 7px;
    -moz-border-radius-topleft: 7px;
    -moz-border-radius-bottomleft: 7px;
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
  }

  .inputMailIcon {
    position: absolute;
    top: 10px;
    left: 8px;
    color: white;
    width: 35px;
    height: 45px;
    background-color: #3b3b3b;
    text-align: center;
    vertical-align: middle;
    padding-top: 12px;
    -webkit-border-top-left-radius: 7px;
    -webkit-border-bottom-left-radius: 7px;
    -moz-border-radius-topleft: 7px;
    -moz-border-radius-bottomleft: 7px;
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
  }

  .inputPassIcon {
    position: absolute;
    top: 70px;
    left: 8px;
    color: white;
    width: 35px;
    height: 45px;
    background-color: #3b3b3b;
    text-align: center;
    vertical-align: middle;
    padding-top: 12px;
    -webkit-border-top-left-radius: 7px;
    -webkit-border-bottom-left-radius: 7px;
    -moz-border-radius-topleft: 7px;
    -moz-border-radius-bottomleft: 7px;
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
  }

  input::-webkit-input-placeholder {
    color: white;
  }

  input:focus::-webkit-input-placeholder {
    color: brown;
  }

  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    top: -5px;
    left: -3px;
    outline: none;
    cursor: pointer;
    margin-right: 5px;
  }
  input[type="checkbox"]:after {
    width: 15px;
    height: 15px;
    top: -1px;
    left: -1px;
    background: #575757;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="checkbox"]:checked:after {
    width: 15px;
    height: 15px;
    top: -1px;
    left: -1px;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  label {
    position: absolute;
    color: darkgray;
    vertical-align: middle;
    cursor: pointer;
    font-size: 0.8em;
  }
  a {
    color: darkgoldenrod;
    float: right;
    font-style: italic;
    margin-right: 5px;
    font-size: 0.9em;
  }
  .input-error {
    border: 2px solid red;
  }

  /* Toast alert */
  .wrap {
    --toastContainerTop: 0.2rem;
    --toastContainerRight: 0.5rem;
    --toastContainerBottom: auto;
    --toastContainerLeft: 0.5rem;
    --toastWidth: 50%;
    --toastMinHeight: 2rem;
    --toastPadding: 0 0.5rem;
    font-size: 0.875rem;
  }
  @media (min-width: 40rem) {
    .wrap {
      --toastContainerRight: auto;
      --toastContainerLeft: calc(50vw - 20rem);
      --toastWidth: 40rem;
    }
  }
  #clockloader {
    float: right;
    margin-top: -5px;
  }
</style>