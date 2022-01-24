<script>
  import { afterUpdate } from "svelte";

  let isError = false;
  let isLoginFom = true;
  let isForgotFom = false;
  let formClass = isLoginFom ? "loginForm" : "registerForm";

  /**
   * setError
   * @description Change la couleur des bordures et du background en cas d'erreur
   * @returns { Void } void
   */
  const setError = (selector) => {
    let elem = document.querySelector(`input[name="${selector}"]`);
    elem.style.border = "2px solid red";
    elem.style.background = "#662f2f";
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
      });
      el.addEventListener("blur", (e) => {
        const icon = el.previousElementSibling;
        icon.style.color = "#ffffff";
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
    isError = false;
    const formData = new FormData(evt.target);
    const data = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }

    if (isFormValid(data)) {
      console.log("isValid", data);
    } else {
      console.log("Invalid Form");
    }
  };

  /**
   * Method afterUpdate
   */
  afterUpdate(() => {
    toogleColorIcon();
  });
</script>

<form on:submit|preventDefault={onSubmit} class={formClass}>
  <div class="logo">
    <h1>WallTrade</h1>
  </div>

  {#if isError}
    <span class="error">{@html isError}</span>
  {/if}

  {#if isLoginFom}
    {#if !isForgotFom}
      <h2>
        <span class="entypo-login">
          <i class="fa fa-sign-in" />
        </span>&nbsp; Login
      </h2>
      <div class="forminput login clearfix">
        <button class="submit">
          <span class="entypo-lock">
            <i class="fa fa-lock" />
          </span>
        </button>
        <span class="entypo-user inputUserIcon">
          <i class="fa fa-user" />
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
      </h2>
      <div class="forminput forgot clearfix">
        <button class="submit">
          <span class="entypo-refresh">
            <i class="fa fa-refresh" />
          </span>
        </button>
        <span class="entypo-user inputUserIcon">
          <i class="fa fa-user" />
        </span>
        <input
          type="email"
          class="input"
          placeholder="Email"
          name="forg_email"
          required
        />
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
    </h2>
    <div class="forminput register clearfix">
      <button class="submit">
        <span class="entypo-plus">
          <i class="fa fa-plus" />
        </span>
      </button>
      <input
        type="text"
        class="input"
        placeholder="Firstname"
        name="reg_firstname"
        required
      />
      <input
        type="text"
        class="input"
        placeholder="Lastname"
        name="reg_lastname"
        required
      />
      <span class="entypo-user inputUserIcon">
        <i class="fa fa-user" />
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
      <a href="/" on:click|preventDefault={toogleForm}>
        Login&nbsp;
        <i class="fa fa-sign-in" />
      </a>
    </div>
  {/if}
</form>

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
    padding: 16px;
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

  .register .inputUserIcon {
    top: 143px;
  }

  .register .inputPassIcon {
    top: 203px;
  }

  .register .inputPassConfirmIcon {
    position: absolute;
    top: 263px;
    right: 90px;
    color: white;
  }

  .inputUserIcon {
    position: absolute;
    top: 22px;
    right: 90px;
    color: white;
  }

  .inputPassIcon {
    position: absolute;
    top: 84px;
    right: 90px;
    color: white;
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
</style>
