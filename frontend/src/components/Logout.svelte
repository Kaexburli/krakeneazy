<script>
  import { onDestroy } from "svelte";
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
      duration: reload ? 300 : 5000,
      onpop: () => {
        reload ? location.reload() : false;
      },
    });
  };

  let current_user = false;
  let isLoggedIn;
  const unUser = User.subscribe((user) => {
    current_user = user;
    isLoggedIn = !user ? false : true;
  });

  const SingOut = async () => {
    if (isLoggedIn && current_user) {
      const logout = await userLogout(current_user.token);
      if (logout.hasOwnProperty("error")) {
        Notification(logout.message, "error");
      } else {
        User.signout();
        Notification(logout.status, "success", true);
      }
    }
  };

  onDestroy(unUser);
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
