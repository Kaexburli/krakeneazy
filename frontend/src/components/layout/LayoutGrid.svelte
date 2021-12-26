<script>
  import Sidebar from "components/layout/Sidebar.svelte";
  import Header from "components/layout/Header.svelte";
  import Main from "components/layout/Main.svelte";
  import Footer from "components/layout/Footer.svelte";
  import OnlineApi from "components/api/Online.svelte";
</script>

<section id="page">
  <OnlineApi display="header" />
  <header>
    <Header />
  </header>
  <nav>
    <Sidebar />
  </nav>
  <main>
    <Main />
  </main>
  <footer>
    <Footer />
  </footer>
</section>

<style>
  :global(html) {
    height: 100%;
    box-sizing: border-box;
  }

  :global(body) {
    height: 100%;
    background-color: #fff;
    color: #333;
    font: 1.2em / 1.5 Helvetica Neue, Helvetica, Arial, sans-serif;
    padding: 0;
    margin: 0;
  }

  * {
    box-sizing: inherit;
  }
  #page {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template:
      [header-left] "head head" 30px [header-right]
      [main-left] "nav  main" 1fr [main-right]
      [footer-left] "nav  foot" 30px [footer-right]
      / 120px 1fr;
  }

  header {
    grid-area: head;
    position: fixed;
    height: 50px;
    width: 100%;

    width: calc(100% - 175px);
    transition: all 0.5s ease;
    z-index: 2;
  }

  nav {
    background-color: lightblue;
    grid-area: nav;
    position: fixed;
    width: 120px;
    height: 100%;
    top: 50px;
  }

  main {
    background-color: yellow;
    grid-area: main;
    position: fixed;
    top: 50px;
    left: 120px;
    overflow: scroll;
    bottom: 20px;
    margin: 0;
    padding: 20px;
  }

  footer {
    background-color: red;
    grid-column: foot;
    position: fixed;
    bottom: 0;
    left: 120px;
    right: 0;
    height: 30px;
  }
</style>
