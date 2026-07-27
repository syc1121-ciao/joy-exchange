import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const routePath = path.join(process.cwd(), 'app', 'travel', '[slug]', 'page.tsx');

test('travel city route should exist at the Next.js dynamic route path', () => {
  assert.equal(existsSync(routePath), true, `Expected route file at ${routePath}`);

  const content = readFileSync(routePath, 'utf8');
  assert.match(content, /export default async function TravelPage/);
});
