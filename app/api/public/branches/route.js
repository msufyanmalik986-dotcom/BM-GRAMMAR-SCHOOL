import { ok } from '../../../../lib/api.js';
import { q } from '../../../../lib/db.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  return ok(q.branches().map(({ latitude, longitude, ...b }) => b));
}
