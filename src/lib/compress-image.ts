export async function compressImageBuffer(
  input: Buffer,
  _maxEdge = 900,
  _quality = 72
): Promise<{ bytes: Buffer; contentType: string }> {
  return { bytes: input, contentType: "" };
}
