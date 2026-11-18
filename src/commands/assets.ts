import type { Command } from 'commander';
import { deckCommand } from './deck.js';
import { imageCommand } from './image.js';
import { merchCommand } from './merch.js';

// The asset commands: image (share images and social posts), video, deck and merch, and manifest (describe), the one
// document that lists them all for agents.

export function assets(program: Command) {
	imageCommand(program);
	deckCommand(program);
	merchCommand(program);
}
