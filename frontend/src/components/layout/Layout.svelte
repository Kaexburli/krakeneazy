<script>
  import { onDestroy } from "svelte";
  import Sidebar from "components/layout/Sidebar.svelte";
  import Header from "components/layout/Header.svelte";
  import Main from "components/layout/Main.svelte";
  import Footer from "components/layout/Footer.svelte";
  import OnlineApi from "components/api/Online.svelte";
  import GetAssets from "components/api/GetAssets.svelte";
  import PriceAlert from "components/api/PriceAlert.svelte";
  import Authentification from "components/pages/auth/Authentification.svelte";
  import { Modals, closeModal } from "svelte-modals";
  import { User } from "store/userStore.js";
  import jwt_decode from "jwt-decode";

  const parseJwt = (token) => {
    try {
      const jwtTokenDetails = jwt_decode(token);
      const currentTimestamp = new Date().getTime() / 1000;
      const tokenIsNotExpired =
        jwtTokenDetails.exp > parseInt(currentTimestamp);
      const timerJWTRefresh = Number(
        parseInt(jwtTokenDetails.exp - parseInt(currentTimestamp)) * 1000
      );

      setTimeout(() => {
        parseJwt(token);
      }, timerJWTRefresh);

      if (!tokenIsNotExpired) {
        User.signout();
        location.reload();
      }

      return jwtTokenDetails;
    } catch (e) {
      return null;
    }
  };

  let current_user = false;
  let isLoggedIn = false;
  const unUser = User.subscribe((user) => {
    current_user = user;
    isLoggedIn = !user ? false : true;
  });

  $: {
    if (isLoggedIn) {
      const jwtTokenDetails = parseJwt(current_user.token);
      console.log("JWT Token Details: ", jwtTokenDetails);
    }
  }
  onDestroy(unUser);
</script>

{#if !isLoggedIn}
  <Authentification />
{:else}
  <div class="layout">
    <!-- // No displaying -->
    <OnlineApi display="header" />
    <GetAssets />
    <PriceAlert />
    <Modals>
      <div slot="backdrop" class="backdrop" on:click={closeModal} />
    </Modals>
    <!-- // No displaying -->

    <Header />
    <Sidebar />
    <Main />
    <Footer />
    <PriceAlert display="true" />
  </div>
{/if}

<style>
  .layout {
    width: 100%;
    min-height: 100%;
    margin-bottom: -50px;
    display: inline-block;
  }
  .backdrop {
    position: fixed;
    z-index: 888;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
  }
</style>
