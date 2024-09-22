import React, { useCallback, useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import NaverMap from "./NaverMap";
import { socket } from "./socket";
import { log } from "console";

interface Taxi {
  id: string;
  lat: number;
  lng: number;
}

interface BaechaResult {
  passengers: [number, number][];
  results: {
    taxi: Taxi;
    target: [number, number];
    distance: number;
  }[];
}

function App() {
  const mapRef = useRef<{ getMap: () => naver.maps.Map }>(null);

  const [connected, setConnected] = useState(socket.connected);
  const onClickBaecha = useCallback(() => {
    socket.emit("request_baecha");
  }, []);

  const [targets, setTargets] = useState<[number, number][]>([]);
  const [taxis, setTaxis] = useState<Taxi[]>([]);

  const [showBaechaSuccess, setShowBaechaSuccess] = useState(false);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onBaecha(data: any) {
      console.log("received baecha result");
      const results = data as BaechaResult;
      setTargets(results.passengers);
      setTaxis(results.results.map((r) => r.taxi));
      setShowBaechaSuccess(true);
    }

    socket
      .on("connect", onConnect)
      .on("disconnect", onDisconnect)
      .on("baecha", onBaecha);

    socket.connect();

    return () => {
      socket
        .off("connect", onConnect)
        .off("disconnect", onDisconnect)
        .off("baecha");
    };
  }, []);

  // target을 변경되면 지도 위에 circle로 표시
  useEffect(() => {
    if (mapRef.current == null) return;

    const circles = targets.map((target) => {
      console.log(`setting circle for ${[target[0], target[1]]}`);

      return new naver.maps.Circle({
        map: mapRef.current!.getMap(),
        center: new naver.maps.LatLng(...target),
        radius: 100,
        fillOpacity: 0.5,
        fillColor: "red",
      });
    });

    return () => {
      circles.forEach((circle) => circle.setMap(null));
    };
  }, [targets]);

  useEffect(() => {
    if (mapRef.current == null) return;

    const markers = taxis.map((taxi) => {
      console.log(`setting taxi for`, taxi);

      return new naver.maps.Marker({
        map: mapRef.current!.getMap(),
        position: new naver.maps.LatLng(taxi.lat, taxi.lng),
        icon: {
          content:
            '<div style="position: relative;">' +
            '<img src="/marker.svg" width="64px" height="64px" style=""></img>' +
            '<img src="/marker_taxi.svg" width="32px" height="32px" style="position: absolute; left: 0; top:8%; right: 0; margin: auto;"></img>' +
            "</div>",
          size: new naver.maps.Size(64, 64),
          scaledSize: new naver.maps.Size(64, 64),
          origin: new naver.maps.Point(0, 0),
        },
      });
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [taxis]);

  // 배차 성공 여부는 3초 후에 가림
  useEffect(() => {
    if (showBaechaSuccess) {
      setTimeout(() => {
        setShowBaechaSuccess(false);
      }, 3000);
    }
  }, [showBaechaSuccess]);

  return (
    <div className="App">
      <div style={{ position: "relative" }}>
        <NaverMap ref={mapRef}></NaverMap>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            position: "absolute",
            top: 0,
            right: 0,
            padding: "16px",
            backgroundColor: "white",
          }}
        >
          <span style={{ fontSize: "14pt" }}>
            Connected: {connected ? "true" : "false"}
          </span>
          <button onClick={onClickBaecha}>Request baecha</button>
          {showBaechaSuccess ? <span>Success!</span> : <></>}
        </div>
      </div>
    </div>
  );
}

export default App;
