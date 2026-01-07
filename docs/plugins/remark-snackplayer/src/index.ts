'use strict';

import {visitParents as visit} from 'unist-util-visit-parents';
import type {Code} from 'mdast';
import type {Node} from 'unist';

function parseParams(paramString = '') {
  const params = Object.fromEntries(new URLSearchParams(paramString));

  if (!params.platform) {
    params.platform = 'web';
  }

  return params;
}

function attr(name: string, value: string) {
  return {
    type: 'mdxJsxAttribute',
    name,
    value,
  };
}

async function toJsxNode(node: Code) {
  const params = parseParams(node.meta ?? undefined);

  // Gather necessary Params
  const name = params.name ? decodeURIComponent(params.name) : 'Example';
  const description = params.description
    ? decodeURIComponent(params.description)
    : 'Example usage';
  const dependencies = params.dependencies ?? 'sectionflow';
  const platform = params.platform ?? 'web';
  const supportedPlatforms = params.supportedPlatforms ?? 'ios,android,web';
  const theme = params.theme ?? 'light';
  const preview = params.preview ?? 'true';
  const loading = params.loading ?? 'lazy';

  const jsxNode = {
    type: 'mdxJsxTextElement',
    name: 'div',
    attributes: [
      attr('className', 'snack-player'),
      attr('data-snack-name', name),
      attr('data-snack-description', description),
      attr('data-snack-code', node.value),
      attr('data-snack-dependencies', dependencies),
      attr('data-snack-platform', platform),
      attr('data-snack-supported-platforms', supportedPlatforms),
      attr('data-snack-theme', theme),
      attr('data-snack-preview', preview),
      attr('data-snack-loading', loading),
    ],
    children: [],
  };

  Object.assign(node, jsxNode as Node);
}

export default function SnackPlayer() {
  return async (tree: Node) => {
    const nodesToProcess: Promise<void>[] = [];
    visit(tree, 'code', (node: Node) => {
      if ('lang' in node && node.lang === 'SnackPlayer') {
        nodesToProcess.push(toJsxNode(node as Code));
      }
    });
    await Promise.all(nodesToProcess);
  };
}
