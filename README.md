# Tailwind Utopia Library V4

A Tailwind CSS library that implements Utopia's fluid responsive design methodology, providing smooth, responsive typography and spacing without breakpoints.

## Features

- 🎯 **Fluid Typography**: Text sizes that scale smoothly between viewport sizes
- 📏 **Fluid Spacing**: Responsive spacing utilities that adapt to screen size
- 🎨 **Tailwind Integration**: Seamless integration with Tailwind CSS
- ⚡ **Performance**: Zero runtime overhead, pure CSS solution
- 🛠️ **Customizable**: Flexible configuration for your design needs

## Installation

bash
npm install -D @andreibratila/tailwind-utopia

or
bash install -g @andreibratila/tailwind-utopia

## Quick Start

2. Use the CLI to generate a config file:

bash
npx tailwind-utopia config

3. Start using fluid utilities in your HTML:

html

<h1 class="text-fs-2xl mb-fs-l">
  Fluid Typography
</h1>

## Configuration

The plugin uses a configuration file (tailwind-utopia.config.json) to define your fluid typography and spacing scales. You can generate a default configuration using:

bash
npx tailwind-utopia config

### Typography Scale

The typography scale is defined by:

- Base size (min and max)
- Scale ratio (min and max)
- Custom steps

Example configuration:

javascript
{
"utopia": {
"minWidth": 320,
"maxWidth": 1240,
"minSize": 16,
"maxSize": 20,
"minScale": 1.2,
"maxScale": 1.333,
"baseKey": "base",
"fontSize": {
"xs": { "min": 12, "max": 14 },
"sm": { "min": 14, "max": 16 },
"base": { "min": 16, "max": 20 },
"lg": { "min": 18, "max": 24 },
"xl": { "min": 20, "max": 28 },
"2xl": { "min": 24, "max": 36 },
"3xl": { "min": 30, "max": 48 },
"4xl": { "min": 36, "max": 64 }
}
}
}

### Spacing Scale

The spacing scale works similarly to typography, providing fluid values for margins, padding, and gaps:

javascript
{
"spacing": {
"3xs": 0.25,
"2xs": 0.5,
"xs": 0.75,
"s": 1,
"m": 1.5,
"l": 2,
"xl": 3,
"2xl": 4,
"3xl": 6
}
}

## Usage

### Typography

html

<h1 class="text-{prefix(optional}sm">Large Fluid Heading</h1>
<p class="text-fs-sm">Body text that scales smoothly</p>
<small class="text-sm">Smaller text</small>

### Spacing

html

<div class="mb-{prefix(optional}xs">
  <h2 class="mb-fs-xs">Title</h2>
  <p class="mb-xs">Content</p>
</div>

## CLI Commands

The plugin includes a CLI with the following commands:

bash

# Generate configuration file

npx tailwind-utopia config

# Generate CSS file

npx tailwind-utopia generate

# Display help

npx tailwind-utopia --help

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Credits

This project was created by [Andrei Florian Brătila](https://github.com/andreibratila) and maintained by the open-source community.  
Inspired by [Utopia](https://utopia.fyi/), a methodology for fluid responsive design.

Special thanks to all contributors who helped improve this plugin. If you’d like to contribute, check out our [CONTRIBUTING.md](CONTRIBUTING.md).

By contributing to this project, you agree that your code will be licensed under the MIT License.

Consider supporting this project by starring the repository or sponsoring via [GitHub Sponsors](https://github.com/sponsors/tuusuario).
