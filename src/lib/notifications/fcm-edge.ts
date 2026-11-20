// src/lib/notifications/fcm-edge.ts — Zero-Dependency Edge-Compatible FCM v1 Push Client.
// Runs natively on Cloudflare Workers, Next.js Server Actions, and Node.js without the heavy firebase-admin SDK.
// Uses native Web Crypto API (crypto.subtle) for RS256 JWT signing and Google OAuth2 token exchange.

export interface FcmMessagePayload {
  token: string; // The target Android device FCM registration token
  title: string;
  body: string;
  data?: Record<string, string>;
  channelId?: string; // High-priority Android notification channel
  clickAction?: string; // Deep-link or action intent
}

export interface FcmSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

// Convert base64 / PEM string to ArrayBuffer for Web Crypto
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN[A-Z\s]+-----/, '')
    .replace(/-----END[A-Z\s]+-----/, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    buf[i] = raw.charCodeAt(i);
  }
  return buf.buffer;
}

// Base64URL encoding
function base64UrlEncode(data: string | Uint8Array): string {
  let str = '';
  if (typeof data === 'string') {
    str = btoa(unescape(encodeURIComponent(data)));
  } else {
    let binary = '';
    for (let i = 0; i < data.byteLength; i++) {
      binary += String.fromCharCode(data[i]);
    }
    str = btoa(binary);
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate Google OAuth2 Access Token for FCM v1 using Web Crypto RS256
async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if valid for at least 5 more minutes
  if (tokenCache && tokenCache.expiresAt > now + 300) {
    return tokenCache.token;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claim));
  const signInput = `${encodedHeader}.${encodedClaim}`;

  const binaryDer = pemToArrayBuffer(privateKeyPem);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signInput)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  const assertion = `${signInput}.${encodedSignature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Google OAuth2 token exchange failed: ${errText}`);
  }

  const data = (await tokenResponse.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in,
  };

  return data.access_token;
}

/**
 * Dispatches an FCM v1 Push Notification to an Android device.
 * Automatically runs in Mock/Dry-run mode if FCM credentials are not configured.
 */
export async function sendAndroidPushNotification(
  payload: FcmMessagePayload
): Promise<FcmSendResult> {
  const projectId = process.env.FCM_PROJECT_ID;
  const clientEmail = process.env.FCM_CLIENT_EMAIL;
  const privateKey = process.env.FCM_PRIVATE_KEY;

  // Dry-run mode for local dev or when keys aren't yet provisioned
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      `[fcm-edge] FCM credentials not set. Simulated push to: ${payload.token.slice(0, 8)}... (${payload.title})`
    );
    return { ok: true, messageId: `mock-fcm-${Date.now()}` };
  }

  try {
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const message = {
      message: {
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'HIGH' as const,
          notification: {
            channel_id: payload.channelId || 'high_priority_alerts',
            click_action: payload.clickAction || 'OPEN_APP',
            sound: 'default',
          },
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { ok: false, error: `FCM dispatch error: ${errorBody}` };
    }

    const resData = (await response.json()) as { name: string };
    return { ok: true, messageId: resData.name };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}
