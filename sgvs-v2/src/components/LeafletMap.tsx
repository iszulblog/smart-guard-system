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

export interface MapCheckpoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  sequence: number;
  isCompleted?: boolean;
  isActiveTarget?: boolean;
  requiredTasks?: string[];
}

interface LeafletMapProps {
  posts?: MapPost[];
  checkpoints?: MapCheckpoint[];
  showRouteLine?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  interactive?: boolean;
  selectedLocation?: { latitude: number; longitude: number; radius?: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function LeafletMap({
  posts = [],
  checkpoints = [],
  showRouteLine = true,
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
    let L: any;
    let map: any;

    async function initMap() {
      if (!mapContainerRef.current) return;
      L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      let defaultCenter: [number, number] = center || [3.139003, 101.686855];
      if (selectedLocation) {
        defaultCenter = [selectedLocation.latitude, selectedLocation.longitude];
      } else if (checkpoints.length > 0) {
        defaultCenter = [checkpoints[0].latitude, checkpoints[0].longitude];
      } else if (posts.length > 0) {
        defaultCenter = [posts[0].latitude, posts[0].longitude];
      } else if (userLocation) {
        defaultCenter = [userLocation.latitude, userLocation.longitude];
      }

      map = L.map(mapContainerRef.current).setView(defaultCenter, zoom);
      mapInstanceRef.current = map;

      // Clean Light Map Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
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

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    import('leaflet').then((LModule) => {
      const L = LModule.default;
      markersLayerRef.current.clearLayers();
      renderLayers(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [posts, checkpoints, userLocation, selectedLocation, showRouteLine]);

  const renderLayers = (L: any, map: any, group: any) => {
    // 1. Guard Posts with Geofence circles
    posts.forEach((post) => {
      const isSelected = selectedLocation && selectedLocation.latitude === post.latitude && selectedLocation.longitude === post.longitude;
      const circleColor = post.hasActiveGuard ? '#059669' : '#0284c7';

      L.circle([post.latitude, post.longitude], {
        radius: post.radius,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.12,
        weight: isSelected ? 3 : 2,
        dashArray: isSelected ? '4, 4' : undefined,
      }).addTo(group);

      const iconHtml = `
        <div style="background-color: ${circleColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 2px solid white; font-weight: bold; font-size: 13px;">
          🛡️
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-post-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([post.latitude, post.longitude], { icon: customIcon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 170px;">
          <b style="color: #0f172a; font-size: 13px;">${post.name}</b><br/>
          <span style="color: #64748b;">Perimeter Fence: <b>${post.radius}m</b></span><br/>
          <div style="margin-top: 6px; padding: 3px 8px; border-radius: 6px; background: ${post.hasActiveGuard ? '#dcfce7' : '#f1f5f9'}; color: ${post.hasActiveGuard ? '#166534' : '#475569'}; font-weight: bold; font-size: 10px; display: inline-block;">
            ${post.hasActiveGuard ? '● On-Duty Guard Active' : '○ Standby / Unstaffed'}
          </div>
        </div>
      `);
    });

    // 2. Patrol Checkpoints & Sequential Route Line
    if (checkpoints.length > 0) {
      const sorted = [...checkpoints].sort((a, b) => a.sequence - b.sequence);

      if (showRouteLine && sorted.length > 1) {
        const polylineCoords = sorted.map((cp) => [cp.latitude, cp.longitude]);
        L.polyline(polylineCoords, {
          color: '#0284c7',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.8,
        }).addTo(group);
      }

      sorted.forEach((cp) => {
        const isTarget = cp.isActiveTarget;
        const isDone = cp.isCompleted;
        const pinBg = isDone ? '#059669' : isTarget ? '#0284c7' : '#64748b';

        L.circle([cp.latitude, cp.longitude], {
          radius: cp.radius,
          color: pinBg,
          fillColor: pinBg,
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(group);

        const cpHtml = `
          <div style="background-color: ${pinBg}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2px solid white; font-weight: 800; font-size: 11px;">
            ${isDone ? '✓' : cp.sequence}
          </div>
        `;

        const cpIcon = L.divIcon({
          html: cpHtml,
          className: 'custom-cp-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const cpMarker = L.marker([cp.latitude, cp.longitude], { icon: cpIcon }).addTo(group);
        cpMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
            <span style="color: #0284c7; font-weight: bold; font-size: 10px; text-transform: uppercase;">Waypoint #${cp.sequence}</span>
            <b style="color: #0f172a; font-size: 13px; display: block; margin-top: 2px;">${cp.name}</b>
            <span style="color: #64748b; font-size: 11px;">Radius: ${cp.radius}m</span>
            ${
              cp.requiredTasks && cp.requiredTasks.length > 0
                ? `<div style="margin-top: 6px; font-size: 10px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 4px;">
                    <b>Inspections:</b>
                    <ul style="margin: 2px 0 0 12px; padding: 0;">
                      ${cp.requiredTasks.map((t) => `<li>${t}</li>`).join('')}
                    </ul>
                  </div>`
                : ''
            }
          </div>
        `);
      });
    }

    // 3. Selected Location marker (Interactive click / edit mode)
    if (selectedLocation) {
      const radius = selectedLocation.radius || 25;
      L.circle([selectedLocation.latitude, selectedLocation.longitude], {
        radius: radius,
        color: '#d97706',
        fillColor: '#d97706',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(group);

      const selectIcon = L.divIcon({
        html: `<div style="background-color: #d97706; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4); border: 2px solid white; font-size: 15px;">📍</div>`,
        className: 'custom-selected-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      L.marker([selectedLocation.latitude, selectedLocation.longitude], { icon: selectIcon }).addTo(group);
    }

    // 4. Live User Location Marker
    if (userLocation) {
      const guardIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="position: absolute; inset: -4px; border-radius: 50%; background: #0284c7; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; background: #0284c7; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        className: 'custom-user-dot',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const guardMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: guardIcon }).addTo(group);
      guardMarker.bindPopup(`<b>Current Device GPS</b><br/>Lat: ${userLocation.latitude.toFixed(6)}, Lng: ${userLocation.longitude.toFixed(6)}`);
    }
  };

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0"
    />
  );
}
