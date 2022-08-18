<script>
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";
  import { userLogout } from "utils/userApi.js";
  import { toast } from "@zerodevx/svelte-toast";

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

  const SingOut = async () => {
    if (User.isLogged()) {
      const logout = await userLogout($User.id);

      Notification(
        $_(`auth.msg.${logout.status}`),
        logout.ok ? "success" : "error",
        true
      );

      User.signout();
    }
  };
</script>

<span class="logout-btn" on:click={SingOut}>
  <i class="fa fa-sign-out" />
</span>

<style>
  .logout-btn {
    display: inline-block;
    background-color: brown;
    border: 1px solid firebrick;
    margin-left: 1px;
    padding: 3px;
    cursor: pointer;
  }
</style>
