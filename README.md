# Tailwindcss V4 Utopia Library

A Tailwind CSS library that implements Utopia's fluid responsive design methodology, providing smooth, responsive typography and spacing without breakpoints.

## Features

- 🎯 **Fluid Typography**: Text sizes that scale smoothly between viewport sizes
- 📏 **Fluid Spacing**: Responsive spacing utilities that adapt to screen size
- 🎨 **Tailwind Integration**: Seamless integration with Tailwind CSS
- ⚡ **Performance**: Zero runtime overhead, pure CSS solution
- 🛠️ **Customizable**: Flexible configuration for your design needs

## Installation

Project instalation

```
npm install -D @andreibratila/tailwind-utopia
```

or

Global instalation

```
npm install -g @andreibratila/tailwind-utopia
```

## Quick Start

1. Use the CLI to generate a config file:

```
npx tailwind-utopia config
```

I recomend use prefix in configFile example: "fs-"

2. Create the css

```
npx tailwind-utopia generate
```

with flags if you want to read de config file

```
npx tailwind-utopia generate configPath=./src/configs
```

3. Start using fluid utilities in your HTML:

```
<h1 class="text-fs-2xl mb-fs-l">
  Fluid Typography
</h1>
```

## Configuration

The library uses a configuration file (tailwind-utopia.config.json) to define your fluid typography and spacing scales. You can generate a default configuration using:

bash
npx tailwind-utopia config

### Typography Scale

The typography scale is defined by:

- Base size (min and max)
- Scale ratio (min and max)
- Custom steps

Example configuration:

```
json
{
  "prefix": "",
  "baseKey": "base",
  "utopia": {
    "minWidth": 320,
    "minSize": 21,
    "minScale": 1.2,
    "maxWidth": 1140,
    "maxSize": 24,
    "maxScale": 1.25,
    "fontSize": {
      "xs": "inherit",
      "sm": "inherit",
      "base": 1.4,
      "lg": 1.33,
      "xl": 1.2,
      "2xl": 1.11,
      "3xl": 1,
      "4xl": 1
    },
    "spacing": {
      "3xs": 0.25,
      "2xs": 0.5,
      "xs": 0.75,
      "sm": 1,
      "md": 1.5,
      "lg": 2,
      "xl": 3,
      "2xl": 4,
      "3xl": 6
    }
  }
}

```

### Spacing Scale

The spacing scale works similarly to typography, providing fluid values for margins, padding, and gaps:

## Usage

!!! IMPORTANT!!!
I recomend create prefix always example: "fs-"

### Typography

```
<h1 class="text-{prefix(optional}sm">Large Fluid Heading</h1>
<p class="text-fs-sm">Body text that scales smoothly</p>
<small class="text-sm">Smaller text</small>
```

### Spacing

```
<div class="mb-{prefix(optional}xs">
  <h2 class="mb-fs-xs">Title</h2>
  <p class="mb-xs">Content</p>
</div>
```

## CLI Commands

The library includes a CLI with the following commands:

# Generate configuration file

```
npx tailwind-utopia config
```

# Generate CSS file

```
npx tailwind-utopia generate
```

# Display help

```
npx tailwind-utopia --help
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE.md) for details.

## Acknowledgements

Inspired by [Utopia](https://utopia.fyi/), a methodology for fluid responsive design and @domchristie/tailwind-utopia plugin, [domchristie/tailwind-utopia](https://github.com/domchristie/tailwind-utopia).

```
Utopia: James Gilyead & Trys Mudford
Original Tailwind Utopia plugin: Chris Pymm & CWS Digital
Plugin I based my work on: Dom Christie
```

## Credits

This project was created by [Andrei Florian Brătila](https://github.com/andreibratila), [andreiflorianbratila.com](https://andreibratila.com).

Special thanks to all contributors who helped improve this library. If you’d like to contribute, check out our [CONTRIBUTING.md](CONTRIBUTING.md).

By contributing to this project, you agree that your code will be licensed under the MIT License.

Consider supporting this project by starring the repository or sponsoring via [GitHub Sponsors](https://github.com/sponsors/andreibratila).
