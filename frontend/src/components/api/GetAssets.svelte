<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import Fetch from "utils/Runfetch.js";
  import { User } from "store/userStore.js";
  import { assets } from "store/store.js";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  let fetchUrl = [location.protocol, location.host].join("//") + "/api/assets";
  const token = $User.token || false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const getAssets = async () => {
    let res = await Fetch({ url: fetchUrl, endpoint: "assets", token });

    if (typeof res !== "undefined" && res.hasOwnProperty("error"))
      console.error("[ERROR] : " + res.statusCode + " " + res.message);

    assets.set(res);
  };

  if (!$assets) getAssets();
</script>
