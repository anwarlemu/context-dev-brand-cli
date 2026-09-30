import { Command } from 'commander';
import { loadConfig } from './lib/config.js';
import { registerAdd } from './commands/add.js';
import { registerCheck } from './commands/check.js';
import { registerDiff } from './commands/diff.js';
import { registerDocs } from './commands/docs.js';
import { registerHook } from './commands/hook.js';
import { registerInfo } from './commands/info.js';
import { registerInit } from './commands/init.js';
import { registerResolve } from './commands/resolve.js';
import { registerReview } from './commands/review.js';
import { registerScaffold } from './commands/scaffold.js';
import { registerTokens } from './commands/tokens.js';
import { PKG_ROOT } from './lib/paths.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const config = loadConfig();
const version = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version as string;

const program = new Command()
	.name(config.bin)
	.description(`${config.brand} design system harness. Templates, docs at the right time, and checks that block off-brand code.`)
	.version(version)
	.showHelpAfterError();

registerInit(program);
registerInfo(program);
registerResolve(program);
registerScaffold(program);
registerDocs(program);
registerAdd(program);
registerTokens(program);
registerCheck(program);
registerReview(program);
registerDiff(program);
registerHook(program);

program.parseAsync(process.argv).catch((error) => {
	process.stderr.write(`${config.bin}: ${(error as Error).message}\n`);
	process.exit(1);
});
