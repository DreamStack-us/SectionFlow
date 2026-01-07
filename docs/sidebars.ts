import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/props',
        'api/ref-methods',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic-list',
        'examples/sticky-headers',
        'examples/collapsible-sections',
        'examples/performance',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/cell-recycling',
        'architecture/performance',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/integration',
      ],
    },
  ],
};

export default sidebars;
