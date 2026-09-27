const assert = require('assert');

// Haversine implementation test
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

console.log('--- UJIAN UNIT FORMULA HAVERSINE SGVS ---');

// Test 1: Identical coordinates must be 0 meters
const d1 = calculateDistance(3.139003, 101.686855, 3.139003, 101.686855);
assert.strictEqual(d1, 0, 'Distance between identical points should be 0');
console.log('✓ Ujian 1: Titik sama menghasilkan 0 meter');

// Test 2: Point approx 12.5 meters away (inside 30m radius)
const d2 = calculateDistance(3.139003, 101.686855, 3.139080, 101.686910);
assert.ok(d2 < 30, `Distance ${d2}m should be within 30m radius`);
console.log(`✓ Ujian 2: Titik dalam pos dikesan tepat (${d2}m < 30m radius)`);

// Test 3: Point approx 85 meters away (outside 30m radius)
const d3 = calculateDistance(3.139003, 101.686855, 3.139600, 101.687500);
assert.ok(d3 > 30, `Distance ${d3}m should be flagged outside 30m radius`);
console.log(`✓ Ujian 3: Titik luar sempadan dikesan tepat (${d3}m > 30m radius)`);

console.log('--- SEMUA UJIAN LOGIK GEOFENCING BERJAYA! ---');
