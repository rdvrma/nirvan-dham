import { loadEnvConfig } from '@next/env';
import { readFileSync, writeFileSync } from 'node:fs';
import ts from 'typescript';
import { BOT_LANGUAGES, type BotLanguage } from '../src/lib/telegram/languages';
import { translateControlDictionary } from '../src/lib/telegram/answer';

loadEnvConfig(process.cwd());

async function main() {
  const source = readFileSync('src/lib/telegram/bot.ts', 'utf8');
  const ast = ts.createSourceFile('bot.ts', source, ts.ScriptTarget.Latest, true);
  const copy: Record<string, string> = {};
  function collect(node: ts.Node) {
    if (ts.isStringLiteral(node) && node.text.length > 18 && (node.text.match(/[A-Za-z]/g) ?? []).length > 10 && !/[\u0900-\u097F]/.test(node.text)) copy[node.text] = node.text;
    ts.forEachChild(node, collect);
  }
  collect(ast);
  const file = 'src/lib/telegram/ui-translations.json';
  const output: Record<string, Record<string, string>> = JSON.parse(readFileSync(file, 'utf8'));
  const codes = (Object.keys(BOT_LANGUAGES) as BotLanguage[]).filter((code) => code !== 'hi' && code !== 'en');
  let index = 0;
  let failures = 0;
  async function worker() {
    while (index < codes.length) {
      const code = codes[index++];
      if (output[code] && Object.keys(copy).every((key) => output[code][key])) { console.log(`${code}: cached`); continue; }
      try {
        const missing = Object.fromEntries(Object.entries(copy).filter(([key]) => !output[code]?.[key]));
        const translated = await translateControlDictionary(missing, code);
        output[code] = Object.fromEntries(Object.keys(copy).map((key) => [key, translated[key] || output[code][key]]));
        writeFileSync(file, JSON.stringify(output, null, 2) + '\n');
        console.log(`${code}: command text translated`);
      } catch {
        failures += 1;
        console.warn(`${code}: translation failed; rerun to retry`);
      }
    }
  }
  console.log(`Preparing ${Object.keys(copy).length} public command strings in ${codes.length} languages.`);
  await Promise.all([worker(), worker()]);
  if (failures) process.exitCode = 1;
}

main().catch(() => { console.error('Language publishing failed.'); process.exitCode = 1; });
