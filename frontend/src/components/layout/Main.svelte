<script>
  import { _ } from "svelte-i18n";
  import { onMount, onDestroy } from "svelte";
  import { page } from "store/store.js";
  import Home from "components/pages/Home/MainHome.svelte";
  import Account from "components/pages/account/MainAccount.svelte";
  import Trading from "components/pages/trading/MainTrading.svelte";
  import Statistic from "components/pages/statistics/MainStatistics.svelte";
  import Settings from "components/pages/settings/MainSettings.svelte";
  import Reports from "components/pages/reports/MainReports.svelte";
  import { acceptCgv } from "utils/userApi.js";
  import { hasApikeysStore } from "store/userStore.js";

  import Dialog, { Header, Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";

  // Open Dialog
  let open = false;

  // User
  export let User;
  let userProfile;
  const getProfile = async () => {
    return await User.getProfile();
  };

  onMount(async () => {
    userProfile = await getProfile();
  });

  $: if (userProfile) open = !userProfile.user.cgvConfirmed ? true : false;

  const closeHandler = async (e) => {
    switch (e.detail.action) {
      case "reject":
        User.signout();
        location.reload();
        break;
      case "accept":
        open = false;
        await acceptCgv(userProfile.token);
        userProfile = await getProfile();
        break;
    }
  };
</script>

<div class="main">
  {#if $page === "home"}
    <div class:hidden={$page !== "home"}><Home {User} /></div>
  {:else if $page === "account" && $hasApikeysStore}
    <div class:hidden={$page !== "account"}><Account /></div>
  {:else if $page === "trading" && $hasApikeysStore}
    <div class:hidden={$page !== "trading"}><Trading /></div>
  {:else if $page === "statistic" && $hasApikeysStore}
    <div class:hidden={$page !== "statistic"}><Statistic /></div>
  {:else if $page === "settings"}
    <div class:hidden={$page !== "settings"}><Settings /></div>
  {:else if $page === "reports" && $hasApikeysStore}
    <div class:hidden={$page !== "reports"}><Reports /></div>
  {/if}
</div>

<Dialog
  bind:open
  fullscreen
  aria-labelledby="fullscreen-title"
  aria-describedby="fullscreen-content"
  on:SMUIDialog:closed={closeHandler}
>
  <Header>
    <Title id="fullscreen-title">{$_("main.dialog.title")}</Title>
  </Header>
  <Content id="fullscreen-content">
    <p>
      <strong>Welcome to Website Name!</strong>
    </p>
    <br />

    <p>
      These terms and conditions outline the rules and regulations for the use
      of Compagny Name's Website, located at Website Name.
    </p>

    <p>
      By accessing this website we assume you accept these terms and conditions.
      Do not continue to use Website Name if you do not agree to take all of the
      terms and conditions stated on this page.
    </p>

    <p>
      The following terminology applies to these Terms and Conditions, Privacy
      Statement and Disclaimer Notice and all Agreements: "Client", "You" and
      "Your" refers to you, the person log on this website and compliant to the
      Company’s terms and conditions. "The Company", "Ourselves", "We", "Our"
      and "Us", refers to our Company. "Party", "Parties", or "Us", refers to
      both the Client and ourselves. All terms refer to the offer, acceptance
      and consideration of payment necessary to undertake the process of our
      assistance to the Client in the most appropriate manner for the express
      purpose of meeting the Client’s needs in respect of provision of the
      Company’s stated services, in accordance with and subject to, prevailing
      law of Netherlands. Any use of the above terminology or other words in the
      singular, plural, capitalization and/or he/she or they, are taken as
      interchangeable and therefore as referring to same.
    </p>
    <br />

    <h3><strong>Cookies</strong></h3>

    <p>
      We employ the use of cookies. By accessing Website Name, you agreed to use
      cookies in agreement with the Compagny Name's Privacy Policy.
    </p>

    <p>
      Most interactive websites use cookies to let us retrieve the user’s
      details for each visit. Cookies are used by our website to enable the
      functionality of certain areas to make it easier for people visiting our
      website. Some of our affiliate/advertising partners may also use cookies.
    </p>
    <br />

    <h3><strong>License</strong></h3>

    <p>
      Unless otherwise stated, Compagny Name and/or its licensors own the
      intellectual property rights for all material on Website Name. All
      intellectual property rights are reserved. You may access this from
      Website Name for your own personal use subjected to restrictions set in
      these terms and conditions.
    </p>

    <p>You must not:</p>
    <ul>
      <li>Republish material from Website Name</li>
      <li>Sell, rent or sub-license material from Website Name</li>
      <li>Reproduce, duplicate or copy material from Website Name</li>
      <li>Redistribute content from Website Name</li>
    </ul>

    <p>
      Parts of this website offer an opportunity for users to post and exchange
      opinions and information in certain areas of the website. Compagny Name
      does not filter, edit, publish or review Comments prior to their presence
      on the website. Comments do not reflect the views and opinions of Compagny
      Name,its agents and/or affiliates. Comments reflect the views and opinions
      of the person who post their views and opinions. To the extent permitted
      by applicable laws, Compagny Name shall not be liable for the Comments or
      for any liability, damages or expenses caused and/or suffered as a result
      of any use of and/or posting of and/or appearance of the Comments on this
      website.
    </p>

    <p>
      Compagny Name reserves the right to monitor all Comments and to remove any
      Comments which can be considered inappropriate, offensive or causes breach
      of these Terms and Conditions.
    </p>

    <p>You warrant and represent that:</p>

    <ul>
      <li>
        You are entitled to post the Comments on our website and have all
        necessary licenses and consents to do so;
      </li>
      <li>
        The Comments do not invade any intellectual property right, including
        without limitation copyright, patent or trademark of any third party;
      </li>
      <li>
        The Comments do not contain any defamatory, libelous, offensive,
        indecent or otherwise unlawful material which is an invasion of privacy
      </li>
      <li>
        The Comments will not be used to solicit or promote business or custom
        or present commercial activities or unlawful activity.
      </li>
    </ul>

    <p>
      You hereby grant Compagny Name a non-exclusive license to use, reproduce,
      edit and authorize others to use, reproduce and edit any of your Comments
      in any and all forms, formats or media.
    </p>
    <br />

    <h3><strong>Hyperlinking to our Content</strong></h3>

    <p>
      The following organizations may link to our Website without prior written
      approval:
    </p>

    <ul>
      <li>Government agencies;</li>
      <li>Search engines;</li>
      <li>News organizations;</li>
      <li>
        Online directory distributors may link to our Website in the same manner
        as they hyperlink to the Websites of other listed businesses; and
      </li>
      <li>
        System wide Accredited Businesses except soliciting non-profit
        organizations, charity shopping malls, and charity fundraising groups
        which may not hyperlink to our Web site.
      </li>
    </ul>

    <p>
      These organizations may link to our home page, to publications or to other
      Website information so long as the link: (a) is not in any way deceptive;
      (b) does not falsely imply sponsorship, endorsement or approval of the
      linking party and its products and/or services; and (c) fits within the
      context of the linking party’s site.
    </p>

    <p>
      We may consider and approve other link requests from the following types
      of organizations:
    </p>

    <ul>
      <li>commonly-known consumer and/or business information sources;</li>
      <li>dot.com community sites;</li>
      <li>associations or other groups representing charities;</li>
      <li>online directory distributors;</li>
      <li>internet portals;</li>
      <li>accounting, law and consulting firms; and</li>
      <li>educational institutions and trade associations.</li>
    </ul>

    <p>
      We will approve link requests from these organizations if we decide that:
      (a) the link would not make us look unfavorably to ourselves or to our
      accredited businesses; (b) the organization does not have any negative
      records with us; (c) the benefit to us from the visibility of the
      hyperlink compensates the absence of Compagny Name; and (d) the link is in
      the context of general resource information.
    </p>

    <p>
      These organizations may link to our home page so long as the link: (a) is
      not in any way deceptive; (b) does not falsely imply sponsorship,
      endorsement or approval of the linking party and its products or services;
      and (c) fits within the context of the linking party’s site.
    </p>

    <p>
      If you are one of the organizations listed in paragraph 2 above and are
      interested in linking to our website, you must inform us by sending an
      e-mail to Compagny Name. Please include your name, your organization name,
      contact information as well as the URL of your site, a list of any URLs
      from which you intend to link to our Website, and a list of the URLs on
      our site to which you would like to link. Wait 2-3 weeks for a response.
    </p>

    <p>Approved organizations may hyperlink to our Website as follows:</p>

    <ul>
      <li>By use of our corporate name; or</li>
      <li>By use of the uniform resource locator being linked to; or</li>
      <li>
        By use of any other description of our Website being linked to that
        makes sense within the context and format of content on the linking
        party’s site.
      </li>
    </ul>

    <p>
      No use of Compagny Name's logo or other artwork will be allowed for
      linking absent a trademark license agreement.
    </p>
    <br />

    <h3><strong>iFrames</strong></h3>

    <p>
      Without prior approval and written permission, you may not create frames
      around our Webpages that alter in any way the visual presentation or
      appearance of our Website.
    </p>
    <br />

    <h3><strong>Content Liability</strong></h3>

    <p>
      We shall not be hold responsible for any content that appears on your
      Website. You agree to protect and defend us against all claims that is
      rising on your Website. No link(s) should appear on any Website that may
      be interpreted as libelous, obscene or criminal, or which infringes,
      otherwise violates, or advocates the infringement or other violation of,
      any third party rights.
    </p>
    <br />

    <h3><strong>Your Privacy</strong></h3>

    <p>Please read Privacy Policy</p>
    <br />

    <h3><strong>Reservation of Rights</strong></h3>

    <p>
      We reserve the right to request that you remove all links or any
      particular link to our Website. You approve to immediately remove all
      links to our Website upon request. We also reserve the right to amen these
      terms and conditions and it’s linking policy at any time. By continuously
      linking to our Website, you agree to be bound to and follow these linking
      terms and conditions.
    </p>
    <br />

    <h3><strong>Removal of links from our website</strong></h3>

    <p>
      If you find any link on our Website that is offensive for any reason, you
      are free to contact and inform us any moment. We will consider requests to
      remove links but we are not obligated to or so or to respond to you
      directly.
    </p>

    <p>
      We do not ensure that the information on this website is correct, we do
      not warrant its completeness or accuracy; nor do we promise to ensure that
      the website remains available or that the material on the website is kept
      up to date.
    </p>
    <br />

    <h3><strong>Disclaimer</strong></h3>

    <p>
      To the maximum extent permitted by applicable law, we exclude all
      representations, warranties and conditions relating to our website and the
      use of this website. Nothing in this disclaimer will:
    </p>

    <ul>
      <li>
        limit or exclude our or your liability for death or personal injury;
      </li>
      <li>
        limit or exclude our or your liability for fraud or fraudulent
        misrepresentation;
      </li>
      <li>
        limit any of our or your liabilities in any way that is not permitted
        under applicable law; or
      </li>
      <li>
        exclude any of our or your liabilities that may not be excluded under
        applicable law.
      </li>
    </ul>

    <p>
      The limitations and prohibitions of liability set in this Section and
      elsewhere in this disclaimer: (a) are subject to the preceding paragraph;
      and (b) govern all liabilities arising under the disclaimer, including
      liabilities arising in contract, in tort and for breach of statutory duty.
    </p>

    <p>
      As long as the website and the information and services on the website are
      provided free of charge, we will not be liable for any loss or damage of
      any nature.
    </p>
  </Content>
  <Actions style="border-color: rgba(255, 255, 255, 0.12);">
    <Button action="reject">
      <Label>{$_("main.dialog.reject")}</Label>
    </Button>
    <Button action="accept" defaultAction>
      <Label>{$_("main.dialog.accept")}</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .main {
    background: #1e1e1e;
    color: #cdcdcd;

    width: calc(100% - 175px);
    margin-left: 175px;
    transition: all 0.5s ease;
    padding: 60px 10px;
    width: auto;
    min-height: 100%;
    flex: 1 0 auto;
  }

  .main .hidden {
    display: none;
  }

  :global(.main h1) {
    background-color: #1c1c1c;
    padding: 5px 10px;
    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;
    text-shadow: 2px 3px #0a0a0a;
    font-size: 1.6em;
  }

  :global(.main h2) {
    background-color: #1c1c1c;
    padding: 5px 10px;
    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;
    text-shadow: 2px 3px #0a0a0a;
    font-size: 1.2em;
  }

  /* :global(.main h3) {
    background-color: #1c1c1c;
    padding: 5px 10px;
    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;
    text-shadow: 2px 3px #0a0a0a;
    font-size: 1.4em;
  } */

  :global(.main .main-info) {
    background-color: darkcyan;
    padding: 10px;
    border: 2px solid #414141;
    border-radius: 10px;

    font-weight: bold;
    color: #222222;
    margin-top: 10px;
  }

  :global(.main .main-warning) {
    background-color: rgb(139, 118, 0);
    padding: 10px;
    border: 2px solid #85834a;
    border-radius: 10px;

    font-weight: bold;
    color: #222222;
    margin-top: 10px;
  }
</style>
