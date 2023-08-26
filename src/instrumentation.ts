export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { boot } = await import('@services/boot');
    await boot();
  }
}
