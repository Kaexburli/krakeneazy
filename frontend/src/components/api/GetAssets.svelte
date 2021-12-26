<script>
  import Fetch from "utils/Runfetch.js";
  import { fetchurl, assets } from "store/store.js";

  let fetchUrl = $fetchurl + "/api/assets";

  const getAssets = async () => {
    let res = await Fetch(fetchUrl, "assets");

    if (typeof res !== "undefined" && res.hasOwnProperty("error"))
      console.error(
        "[GET ASSETS] ERROR: " + res.statusCode + " " + res.message
      );

    assets.set(res);
  };

  if (!$assets) getAssets();
</script>
