# GUIDANCE Styleguide Viewer

Guidance is a streamlined frontend for [thopra/styleguide](https://github.com/thopra/styleguide) designed to help develop, maintain, present and control CSS code documented with [KSS](http://warpspire.com/kss/).

## Install

The easiest way to create a new project with guidance is using the [guidance-kickstart](https://github.com/thopra/guidance-kickstart) package. Just download it and run `composer install`.

## Features

* Uses [kss-php](https://github.com/scaninc/kss-php) to display documented CSS/LESS/SASS code
* Shows a preview, markup examples and additional information for each documentation section
* Each section can be individually resized and viewed isolated (includes QR codes for each markup example for quick testing on different mobile devices)
* Supports Partials (currently either as plain phtml files or fluid templates)
* HTML Validation using the W3C Markup Validation Web Service API

### Partials
In Addition to the "Markup:" comment provided by kss-php you can use the Keyword "Partial" that specifies a path to a partial which should be rendered as the example markup.

    /*
     * Partial: Components/Dropdown
     *
     * PartialParams: {"foo": "bar"}
     */
     
Should render the contents of <Path to Partials>/Components/Dropdown.phtml while setting the variable $foo to "bar".

### Tags

Guidance uses the KSS annotation for parameters to provide tags for a section. A tag must start with `@` and end on a `!`

    /* 
     * @todo! - Write awesome code
     */

The following tags impact the behaviour of the displayed section:

<table>
  <tr>
    <th>tag</th>
    <th>value</th>
    <th></th>
  <tr>
    <td>@todo!</td>
    <td>string</td>
    <td>Will mark the section headline with a "ToDo" label and list the values in the info tab</td>
  </tr>
  <tr>
    <td>@blank!</td>
    <td>none</td>
    <td>The example will be rendered without any wrapping markup, including `<html>` or `<body>`. Use this if you want to use your own html structure, e.g. when presenting the module in a more complex layout or dummy.</td>
  </tr>
  <tr>
    <td>@nostandalone!</td>
    <td>none</td>
    <td>By default the example will render the element without a modifier as well as each given modifier applied to it. This option suppresses the rendering of the element without a modifier.</td>
  </tr>
  <tr>
    <td>@align!</td>
    <td>[1-12],[1-12],[1-12],[1-12]</td>
    <td>Controls the alignment of modifiers. Comma seperated list of the amount of columns for each of four media query (mobile,tablet,medium-desktop,large-desktop). For example `@align! - 1,2,2,3` wolud display the modifiers in 3 columns on large desktop, 2 columns on tablets and each modifer in a new line on mobile devices. This is helpul for arranging modifiers of smaller components in a more convinient way.</td>
  </tr>
</table>

## Configuration

Guidance uses a configuration file named "guidance.json" in the root directory of your project. The scheme looks like this:

    {
    	"title": "Example Styleguide",
    	"cache": {
    		"enable": true,
    		"dir": "guidance/cache/",
    		"lifetime": 5
    	},
    	"settings": {
    		"loadPreviewsAtStart": 3,
    		"enableValidation": true
    	},
    	"sources": [
    		{
    			"key": "example",
    			"title": "Example Styles",
    			"dir":"assets/css",
    			"partialDir": "../Partials",
    			"partialType": "php",
    			"resources": [
    				"Assets/css/main.css"
    			] 
    		}
    	]
    }
    
    
### The "cache" section

Guidance uses zend cache for the output of markup examples to reduce the load when reading files and parsing comments. This is especially important if your project consists of many different files or when a style guide chapter includes a large amount of different sections.
You can disable this feature here by setting `enable`to false. `lifetime` is the ttl of the cache in seconds.

### the "sources" section

This is where the actual magic happens: You can specify multiple sources of documented files. Each source can be configured differnetly. This allows you to create different subdivisions of your styleguide, each using different resources.
Each source must include the following options:

<table>
  <tr>
    <td>key</td>
    <td>alphanumeric string</td>
    <td>A unique identifier. No white spaces.</td>
  </tr>
  <tr>
    <td>title</td>
    <td>string</td>
    <td>A name of the style guide subdivision</td>
  </tr>
  <tr>
    <td>dir</td>
    <td>string</td>
    <td>The path (relative to your root path) to the css files that include the documentation</td>
  </tr>
  <tr>
    <td>partialDir</td>
    <td>string</td>
    <td>The path (relative to your root path) to your partial files</td>
  </tr>
  <tr>
    <td>partialType</td>
    <td>php | fluid</td>
    <td>The template type of your partials. Can be either php (for .phtml files) or fluid (for .html files containing fluid code)</td>
  </tr>
  <tr>
    <td>resources</td>
    <td>array</td>
    <td>Provide a list of css / javascript files that should be added when a markup example is rendered.</td>
  </tr>
</table>

    
