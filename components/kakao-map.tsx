// "use client";

// import { useEffect, useRef } from "react";

// declare global {
//   interface Window {
//     kakao: any;
//   }
// }

// interface KakaoMapProps {
//   latitude: number;
//   longitude: number;
//   placeName: string;
//   address: string;
// }

// export default function KakaoMap({
//   latitude,
//   longitude,
//   placeName,
//   address,
// }: KakaoMapProps) {
//   const mapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const loadKakaoMapScript = () => {
//       const script = document.createElement("script");
//       script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
//       script.async = true;
//       script.onload = () => {
//         window.kakao.maps.load(() => {
//           if (mapRef.current) {
//             const options = {
//               center: new window.kakao.maps.LatLng(latitude, longitude),
//               level: 3,
//             };
//             const map = new window.kakao.maps.Map(mapRef.current, options);

//             const markerPosition = new window.kakao.maps.LatLng(
//               latitude,
//               longitude
//             );
//             const marker = new window.kakao.maps.Marker({
//               position: markerPosition,
//             });
//             marker.setMap(map);

//             const iwContent = `
//               <div style="padding:5px; font-size:12px; width:250px;">
//                 <strong>${placeName}</strong><br>
//                 ${address}
//               </div>
//             `;
//             const infowindow = new window.kakao.maps.InfoWindow({
//               content: iwContent,
//             });
//             infowindow.open(map, marker);
//           }
//         });
//       };
//       document.head.appendChild(script);
//     };

//     if (!window.kakao) {
//       loadKakaoMapScript();
//     } else {
//       window.kakao.maps.load(() => {
//         if (mapRef.current) {
//           const options = {
//             center: new window.kakao.maps.LatLng(latitude, longitude),
//             level: 3,
//           };
//           const map = new window.kakao.maps.Map(mapRef.current, options);

//           const markerPosition = new window.kakao.maps.LatLng(
//             latitude,
//             longitude
//           );
//           const marker = new window.kakao.maps.Marker({
//             position: markerPosition,
//           });
//           marker.setMap(map);

//           const iwContent = `
//             <div style="padding:5px; font-size:12px; width:250px;">
//               <strong>${placeName}</strong><br>
//               ${address}
//             </div>
//           `;
//           const infowindow = new window.kakao.maps.InfoWindow({
//             content: iwContent,
//           });
//           infowindow.open(map, marker);
//         }
//       });
//     }
//   }, [latitude, longitude, placeName, address]);

//   return <div ref={mapRef} className="w-full h-64 rounded-lg" />;
// }
