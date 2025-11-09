import React from "react";
import {
  LoadScript,
  GoogleMap,
  Polyline,
  Marker,
} from "@react-google-maps/api";

// THIS IS EXAMPLE OF HOW WE COULD SHOW A SAVED ROUTE
// FILE DOES NOT REALLY MATTER
// JUST WAS A HARD CODED TEST

function SavedRoute() {
  const testPolyline =
    "okhbFftajNJ@XJHAHETu@LKPD`@TRRFKLGXDbAn@\\VLh@P`BJVBBFQNi@BUGk@?k@T}@HyBP}ALo@d@wAp@_ELy@P]DEJ?HFBHFt@@JFDB?@KJqALqANaAJa@T_AHk@DgHBmG?_C@i@L_BT{AViBJk@XiAPm@Jc@F[AYD}@@}@AcAMgAKe@Y_AQkAG_AAaD?{ICaJBmBNmAZeARk@v@aDx@mDHu@FuBFmC@k@E_AEQBALEzCoApB{@vAi@lAe@bBq@G]z@]DAFG?KEu@LA?iBEACm@D?Du@HaBBa@H[HuAHgAC]D}@Fq@?aACaASiBOy@o@kB_B_Eg@sAPMNKM[Mg@m@aBo@{AU]Wy@Sq@WiCSgBAEHCLGHO`@_C`AqFfAcGNy@`@qA@KLSXm@B]ESq@cAo@cAq@oACEHOMQKL]a@_@e@oA_BcBiBsBeC{EaGbAyABKIeCc@kLCoAe@e@{@o@SQUc@Uy@AU?WDQtBsBb@m@DI][s@o@eCqBcAiAm@eAu@iBy@sB_A}BiDuIcHiQs@_Bo@y@yAcAu@o@o@o@U[e@y@c@sAOi@Ee@GaAIoE?yA@mDIkDOq@GMeAgAgAeAaAgAYYs@a@m@Qa@GYAM@]B?TFx@CRIPs@^a@Pm@HeBK{@Iq@Q[USc@_AyBk@kAq@m@m@]c@EqBD";
  const decodedPath =
    window.google?.maps?.geometry?.encoding?.decodePath(testPolyline) || [];

  const center = { lat: 37.2296, lng: -80.4139 };

  //Example of how we could load a map with a saved route
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={["geometry"]}
    >
      <GoogleMap
        mapContainerStyle={{ height: "100vh", width: "100%" }}
        center={center}
        zoom={10}
      >
        <Polyline
          path={decodedPath}
          options={{ strokeColor: "#2563eb", strokeWeight: 6 }}
        />
      </GoogleMap>
    </LoadScript>
  );
}

export default SavedRoute;
