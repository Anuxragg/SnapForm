const sessionSecret: string = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('SESSION_SECRET must be set to a secret of at least 32 bytes');
  }
  return secret;
})();

export default sessionSecret;
