<script>
  import { User } from "store/userStore.js";
  const SingOut = () => {
    console.log("Logout!!!!");
    User.signout();
    location.reload();
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
