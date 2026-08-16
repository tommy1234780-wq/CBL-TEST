import fs from 'node:fs';

const checks = [];
function requireText(file, text, label) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(text)) checks.push(`${file}: ${label}`);
}

requireText('assets/pwa.js', 'registration.pushManager.getSubscription()', 'must reuse an existing push subscription before creating a new one');
requireText('assets/pwa.js', '"apikey": config.supabasePublishableKey', 'must send Supabase apikey when subscribing/unsubscribing');
requireText('assets/pwa.js', 'subscribe_409', 'must keep endpoint conflict diagnostics');
requireText('assets/pwa.js', 'anonymous_signin_failed', 'must keep anonymous auth failure handling');
requireText('assets/pwa.js', 'push_subscription_failed', 'must keep push subscription failure handling');
requireText('sw.js', 'const CACHE_NAME = "cbl-season-3-v7"', 'cache version must not regress below the current protected version');
requireText('sw.js', './assets/pwa.js?v=20260816-pushfix2', 'service worker must cache the protected push client version');
requireText('index.html', 'assets/pwa.js?v=20260816-pushfix2', 'homepage must load the protected push client version');

if (checks.length) {
  console.error('\n❌ Push notification integrity check failed:\n');
  for (const item of checks) console.error(`- ${item}`);
  console.error('\nNotification files may have been overwritten by an older bulk update.\n');
  process.exit(1);
}

console.log('✅ Push notification integrity check passed.');
