import React, { useImperativeHandle, useMemo } from "react";
import { MutableRefObject, useEffect, useRef } from "react";

const NaverMap = React.forwardRef((props, ref: React.Ref<any>) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);

  const lat = useMemo(() => 36.33135064483598, []);
  const lng = useMemo(() => 127.43289957845893, []);

  useEffect(() => {
    console.log("ref changed for NaverMap");
    if (typeof ref === "function") return;

    const { naver } = window;
    if (mapRef.current && naver) {
      const location = new naver.maps.LatLng(lat, lng);
      mapInstanceRef.current = new naver.maps.Map(mapRef!.current, {
        center: location,
        zoom: 17,
      });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstanceRef.current,
  }));

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
});

export default React.memo(NaverMap);
