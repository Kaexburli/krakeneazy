<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import Fetch from "utils/Runfetch.js";
  import { User } from "store/userStore.js";
  import { pair, assetpair, assetpairs } from "store/store.js";
  import { DoubleBounce } from "svelte-loading-spinners";
  import { BrowserTabTracker } from "browser-session-tabs";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  const token = $User.token || false;

  let fetchUrl = "/api/assetpairs",
    assetpairVal,
    spinner = false,
    isFocused = false,
    searchbox = null,
    searchboxresult = null,
    domLoaded = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const bootstrap = (readyState) => {
    if (["interactive", "complete"].includes(readyState)) {
      searchbox = document.getElementById("search-box");
      searchboxresult = document.getElementById("search-box-result");
      domLoaded = true;
    }
  };

  const onFocus = () => (isFocused = true);

  const onBlur = () => {
    assetpairVal.value = "";
    isFocused = false;
    spinner = false;

    setTimeout(() => {
      if (searchboxresult) searchboxresult.style.display = "none";
      else console.error("[ERROR] searchboxresult");
    }, 1000);
  };

  const getAssetPairs = async () => {
    try {
      let res = await Fetch({ url: fetchUrl, endpoint: "assetpairs", token });
      if (typeof res !== "undefined") {
        if (res.error) console.error(res);
        else assetpairs.set(res);
      } else {
        console.error("getAssetPairs", res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const putInSessionStorage = (choice) => {
    const sessionId = BrowserTabTracker.sessionId;

    if (sessionId) {
      let newSessionStorage = JSON.stringify({
        pair: choice,
        assetpair: $assetpairs[choice],
      });
      localStorage.setItem(`${sessionId}_lastSearchPair`, newSessionStorage);
    }
  };

  const changeAssetPair = (choice) => {
    if ($assetpairs[choice] !== undefined) {
      pair.update((n) => choice);
      assetpair.update((n) => $assetpairs[choice]);
      putInSessionStorage(choice);
      assetpairVal.value = "";
      spinner = false;
    }
  };

  const getSearchAssetPairs = (filterText) => {
    if (!$assetpairs) {
      getAssetPairs();
      return false;
    }

    spinner = true;
    filterText = filterText.toUpperCase();
    let search = Object.fromEntries(
      Object.entries($assetpairs).filter(([key]) => key.includes(filterText))
    );
    createSearchBox(Object.entries(search));
  };

  const createSearchBox = (searchValues) => {
    if (!searchbox || !searchboxresult)
      console.debug("[ERROR] createSearchBox");
    else {
      while (searchbox.firstChild) {
        searchbox.firstChild.remove();
      }

      searchValues.forEach((v) => {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(v[1]["wsname"]));
        li.setAttribute("id", v[0]);
        searchbox.appendChild(li);
        li.addEventListener("click", function (e) {
          changeAssetPair(e.target.id);
          searchboxresult.style.display = "none";
        });
      });
      searchboxresult.style.display = "block";
    }
  };

  onMount(() => {
    bootstrap(document.readyState);
    if (!$assetpairs) getAssetPairs();
  });
</script>

<div class="assetpairs-search">
  {#if spinner && isFocused}
    <div class="assetpair-search-spinner">
      <DoubleBounce size="20" color="#e8e8e8" unit="px" duration="1s" />
    </div>
  {/if}
  <div class="assetpair-search-input">
    <input
      id="inputsearchassetpair"
      type="text"
      placeholder={$_("header.assetPairSearch.placeholder")}
      bind:this={assetpairVal}
      on:blur={onBlur}
      on:focus={onFocus}
      on:keyup={({ target: { value } }) => getSearchAssetPairs(value)}
    />
    <div id="search-box-result">
      <ul id="search-box" tabindex="-1" />
    </div>
  </div>
</div>

<style>
  #search-box-result {
    position: absolute;
    top: 30px;
    left: 0;
    background: #282828;
    padding: 0;
    width: 168px;
    color: white;
    display: none;
    max-height: 136px;
    overflow: auto;
  }
  #search-box-result ul {
    display: inline;
  }
  :global(#search-box-result ul li) {
    border: 1px solid #1e1e1e;
    cursor: pointer;
    padding: 5px 10px;
  }
  :global(#search-box-result ul li:hover) {
    background-color: brown;
  }
  .assetpair-search-spinner {
    display: inline-block;
  }
  .assetpairs-search {
    margin-left: auto;
    display: inline-block;
  }
  .assetpair-search-input {
    position: relative;
    display: inline-block;
  }
  .assetpairs-search input {
    height: 30px;
    width: auto;
    background-color: #222222;
    border: 1px solid #222222;
    padding: 5px;
  }
  .assetpairs-search input:hover,
  .assetpairs-search input:focus,
  .assetpairs-search input:active {
    color: white;
    border: 1px solid #1a1a1a;
    outline: none;
  }
</style>
