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
  // eslint-disable-next-line no-undef, dot-notation
  const backendUri =
    __App["env"].BACKEND_URI || [location.protocol, location.host].join("//");
  const fetchUrl = backendUri + "/api/assets";
  const token = $User.token || false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const getAssets = async () => {
    let res = await Fetch({ url: fetchUrl, endpoint: "assets", token });

    if (
      typeof res !== "undefined" &&
      Object.prototype.hasOwnProperty.call(res, "error")
    )
      console.error("[ERROR] : " + res.statusCode + " " + res.message);

    assets.set(res);
  };

  if (!$assets) getAssets();
</script>
