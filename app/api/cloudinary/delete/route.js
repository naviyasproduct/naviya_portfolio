import { NextResponse } from 'next/server';

function extractPublicId(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    // last part contains folder/.../public_id.ext
    const last = parts.pop();
    const withoutExt = last.split('.').slice(0, -1).join('.');
    // include preceding folder segments if any
    const idx = parts.indexOf('upload');
    if (idx >= 0) return parts.slice(idx + 1).concat([withoutExt]).join('/');
    return withoutExt;
  } catch (e) { return null; }
}

export async function POST(req) {
  const { url } = await req.json();
  const public_id = extractPublicId(url);
  if (!public_id) return NextResponse.json({ message: 'Invalid url' }, { status: 400 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ message: 'Server not configured' }, { status: 500 });

  // build signature timestamp and call
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
  // simple sha1
  const crypto = await import('crypto');
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const form = new URLSearchParams();
  form.append('public_id', public_id);
  form.append('timestamp', String(timestamp));
  form.append('api_key', apiKey);
  form.append('signature', signature);

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/destroy`, { method: 'POST', body: form });
  const data = await resp.json();
  return NextResponse.json(data);
}
