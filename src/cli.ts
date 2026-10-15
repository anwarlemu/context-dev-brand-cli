import { Command } from 'commander';
import { loadConfig } from './lib/config.js';
import { registerAdd } from './commands/add.js';
import { registerApply } from './commands/apply.js';
import { registerApprove } from './commands/approve.js';
import { registerCheck } from './commands/check.js';
import { registerDiff } from './commands/diff.js';
import { registerDocs } from './commands/docs.js';
import { registerHook } from './commands/hook.js';
import { registerInfo } from './commands/info.js';
import { registerInit } from './commands/init.js';
import { registerResolve } from './commands/resolve.js';
import { registerReview } from './commands/review.js';
import { registerScaffold } from './commands/scaffold.js';
import { registerStyle } from './commands/style.js';
import { registerTokens } from './commands/tokens.js';
import { registerUpdate } from './commands/update.js';
import { registerWatch } from './commands/watch.js';
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
registerApply(program);
registerStyle(program);
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
registerWatch(program);
registerApprove(program);
registerUpdate(program);

// Bare `<bin>`: say what this is and the few commands that matter, for a person or an agent seeing it for the first time.
if (process.argv.length <= 2) {
	const c = config.cli;
	process.stdout.write(
		[
			`${config.brand} design system (${config.bin} ${version})`,
			'',
			`Puts the ${config.brand} brand's styling onto a project and keeps coding agents on it. Hooks check every file an agent writes`,
			'and block off-brand values (raw colors, spacing, fonts, motion); the pre-commit hook and CI do the same.',
			'',
			`  ${c} init              install into this project (tokens, agent rules, hooks). An existing site looks the same.`,
			`  ${c} apply             restyle the existing site with the brand: colors, type, spacing and so on.`,
			'                                  Styling only; copy, content and structure stay as they are.',
			`  ${c} apply --list      the style values still off-brand, with the token for each`,
			`  ${c} style <element>   how the brand styles a kind of element: button-primary, card-clickable,`,
			'                                  app-table-row... (`style` alone lists them; --detect <file> matches a file)',
			`  ${c} check             what is off-brand right now (--no-baseline includes code from before init)`,
			`  ${c} tokens --search   find the token for a value: tokens --search blue`,
			`  ${c} resolve "<task>"  new React + Tailwind 4 apps: which page template to start from`,
			`  ${c} update            get the latest design system`,
			'',
			`Everything: ${c} --help`,
		].join('\n') + '\n',
	);
	process.exit(0);
}

program.parseAsync(process.argv).catch((error) => {
	process.stderr.write(`${config.bin}: ${(error as Error).message}\n`);
	process.exit(1);
});
