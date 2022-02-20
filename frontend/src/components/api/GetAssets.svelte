<script>
  import Fetch from "utils/Runfetch.js";
  import { User } from "store/userStore.js";
  import { fetchurl, assets } from "store/store.js";

  let fetchUrl = $fetchurl + "/api/assets";
  const token = $User.token || false;

  const getAssets = async () => {
    let res = await Fetch(fetchUrl, "assets", token);

    if (typeof res !== "undefined" && res.hasOwnProperty("error"))
      console.error("[ERROR] : " + res.statusCode + " " + res.message);

    assets.set(res);
  };

  if (!$assets) getAssets();
</script>
