'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export interface MapPost {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  description?: string;
  hasActiveGuard?: boolean;
}

interface LeafletMapProps {
  posts?: MapPost[];
  userLocation?: { latitude: number; longitude: number } | null;
  interactive?: boolean; // If true, clicking on map calls onLocationSelect
  selectedLocation?: { latitude: number; longitude: number; radius?: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function LeafletMap({
  posts = [],
  userLocation,
  interactive = false,
  selectedLocation,
  onLocationSelect,
  center,
  zoom = 16,
  height = '420px',
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamic import of Leaflet on client side
    let L: any;
    let map: any;

    async function initMap() {
      if (!mapContainerRef.current) return;
      L = (await import('leaflet')).default;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: First post, or user location, or default KL
      let defaultCenter: [number, number] = center || [3.139003, 101.686855];
      if (selectedLocation) {
        defaultCenter = [selectedLocation.latitude, selectedLocation.longitude];
      } else if (posts.length > 0) {
        defaultCenter = [posts[0].latitude, posts[0].longitude];
      } else if (userLocation) {
        defaultCenter = [userLocation.latitude, userLocation.longitude];
      }

      map = L.map(mapContainerRef.current).setView(defaultCenter, zoom);
      mapInstanceRef.current = map;

      // OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      if (interactive && onLocationSelect) {
        map.on('click', (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      renderLayers(L, map, markersGroup);
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when props change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      markersLayerRef.current.clearLayers();
      renderLayers(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [posts, userLocation, selectedLocation]);

  const renderLayers = (L: any, map: any, group: any) => {
    // 1. Render all Guard Posts with Geofence circles
    posts.forEach((post) => {
      const isSelected = selectedLocation && selectedLocation.latitude === post.latitude && selectedLocation.longitude === post.longitude;
      const circleColor = post.hasActiveGuard ? '#10b981' : '#0284c7'; // Emerald or Sky blue

      // Radial Geofence Circle
      L.circle([post.latitude, post.longitude], {
        radius: post.radius,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.15,
        weight: isSelected ? 3 : 2,
        dashArray: isSelected ? '4, 4' : undefined,
      }).addTo(group);

      // Custom HTML Pin Marker
      const iconHtml = `
        <div style="background-color: ${circleColor}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white; font-weight: bold; font-size: 14px;">
          🛡️
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-guard-post-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([post.latitude, post.longitude], { icon: customIcon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <b style="color: #0f172a; font-size: 14px;">${post.name}</b><br/>
          <span style="color: #475569;">Radius Geofence: <b>${post.radius} meter</b></span><br/>
          <span style="color: #64748b; font-size: 11px;">Lat: ${post.latitude.toFixed(6)}, Lng: ${post.longitude.toFixed(6)}</span><br/>
          <div style="margin-top: 6px; padding: 4px 8px; border-radius: 4px; background: ${post.hasActiveGuard ? '#dcfce7' : '#f1f5f9'}; color: ${post.hasActiveGuard ? '#15803d' : '#475569'}; font-weight: bold; font-size: 11px; display: inline-block;">
            ${post.hasActiveGuard ? '● Pengawal Bertugas' : '○ Tiada Pengawal Aktif'}
          </div>
        </div>
      `);
    });

    // 2. Render Selected Location marker (if adding/editing post)
    if (selectedLocation) {
      const radius = selectedLocation.radius || 30;
      L.circle([selectedLocation.latitude, selectedLocation.longitude], {
        radius: radius,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.25,
        weight: 2,
      }).addTo(group);

      const selectIcon = L.divIcon({
        html: `<div style="background-color: #f59e0b; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5); border: 2px solid white; font-size: 16px;">📍</div>`,
        className: 'custom-selected-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([selectedLocation.latitude, selectedLocation.longitude], { icon: selectIcon }).addTo(group);
    }

    // 3. Render Live Guard Current Location
    if (userLocation) {
      const guardIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background: #38bdf8; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; background: #0284c7; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
          </div>
        `,
        className: 'custom-user-dot',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const guardMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: guardIcon }).addTo(group);
      guardMarker.bindPopup(`<b>Lokasi Semasa Pengawal</b><br/>Lat: ${userLocation.latitude.toFixed(6)}, Lng: ${userLocation.longitude.toFixed(6)}`);
    }
  };

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner z-0"
    />
  );
}
