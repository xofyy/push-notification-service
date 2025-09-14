#!/usr/bin/env node
/*
  Minimal smoke test for the Push Notification Service.
  Usage:
    node scripts/smoke.mjs            # defaults to http://localhost:3000/api/v1
    node scripts/smoke.mjs http://localhost:3001/api/v1
*/

const base = process.argv[2] || 'http://localhost:3000/api/v1';

async function main() {
  const headersJson = { 'Content-Type': 'application/json' };

  // 1) Health
  logStep('Health');
  let res = await fetch(`${base}/health`);
  const health = await res.json();
  logJson(health);

  // 2) Create Project (public)
  logStep('Create Project');
  res = await fetch(`${base}/projects`, {
    method: 'POST',
    headers: headersJson,
    body: JSON.stringify({ name: 'Smoke Test Project', description: 'smoke' }),
  });
  const project = await res.json();
  if (!res.ok) throw new Error(`Create project failed: ${res.status} ${JSON.stringify(project)}`);
  logJson(project);
  const apiKey = project.apiKey;
  const projectId = project._id;
  if (!apiKey || !projectId) throw new Error('Missing apiKey or projectId');

  const authHeaders = { 'X-API-Key': apiKey };

  // 3) Get Project
  logStep('Get Project (auth)');
  res = await fetch(`${base}/projects`, { headers: authHeaders });
  const projList = await res.json();
  logJson(projList);

  // 4) Register Device
  logStep('Register Device');
  // Use a realistic-looking token for validation. You can override via env DEVICE_TOKEN.
  const deviceToken = process.env.DEVICE_TOKEN || (
    // 160+ URL-safe characters typical for FCM tokens
    'A'.repeat(120) + '-_' + 'B'.repeat(60)
  );
  res = await fetch(`${base}/projects/${projectId}/devices/register`, {
    method: 'POST',
    headers: { ...headersJson, ...authHeaders },
    body: JSON.stringify({
      token: deviceToken,
      platform: 'android',
      tags: ['smoke'],
      properties: { appVersion: '1.0.0' },
    }),
  });
  const device = await res.json();
  if (!res.ok) throw new Error(`Device register failed: ${res.status} ${JSON.stringify(device)}`);
  logJson(device);
  const deviceId = device._id;
  if (!deviceId) throw new Error('Missing deviceId');

  // 5) Send Notification (instant)
  logStep('Send Notification (instant)');
  res = await fetch(`${base}/projects/${projectId}/notifications/send`, {
    method: 'POST',
    headers: { ...headersJson, ...authHeaders },
    body: JSON.stringify({
      title: 'Hello from Smoke Test',
      body: 'Quick flow test',
      type: 'instant',
      targetDevices: [deviceId],
    }),
  });
  const notif = await res.json();
  if (!res.ok) throw new Error(`Notification send failed: ${res.status} ${JSON.stringify(notif)}`);
  logJson(notif);
  const notificationId = notif._id;

  // 6) Track Analytics Event
  logStep('Track Analytics Event');
  res = await fetch(`${base}/projects/${projectId}/analytics/events`, {
    method: 'POST',
    headers: { ...headersJson, ...authHeaders },
    body: JSON.stringify({ type: 'notification.sent', notificationId, data: { source: 'smoke' } }),
  });
  const track = await res.json();
  if (!res.ok) throw new Error(`Track event failed: ${res.status} ${JSON.stringify(track)}`);
  logJson(track);

  // 7) Analytics Overview
  logStep('Analytics Overview');
  res = await fetch(`${base}/projects/${projectId}/analytics/overview`, { headers: authHeaders });
  const overview = await res.json();
  logJson(overview);

  console.log('\n✅ Smoke test completed. Swagger:', base.replace('/api/v1', '/api/docs'));
}

function logStep(name) {
  console.log(`\n=== ${name} ===`);
}

function logJson(obj) {
  try {
    console.log(JSON.stringify(obj, null, 2));
  } catch {
    console.log(obj);
  }
}

main().catch((err) => {
  console.error('\n❌ Smoke test failed:', err?.message || err);
  process.exit(1);
});
