
See: [smarter_options.jpg](smarter_options.jpg)

### non-pie:
* masking 
* highlighter 
* mark for review 
* student comments / notepad
* strikethrough

### pie needs to know about the setting (in env)
* color contrast 
* streamlined interface
* language? atm we have the locales in the comp - could do it outside of the comp?

### some pie interaction required??
* glossary - content that may be inside the component may need to be glossarised.
* text-to-speech

### unknown
* expandable passages
* asl videos - feels like its probably suited to content - not pie.
* close captioning
* permissive mode
* zoom? - can't you just use the browser?


## Glossary options

1. as part of the content: 
    
    ```html 
    <label><glossary en_US="exhaust">deplete</glossary></label>
    ```

The drawback to this is that the content that is inside a component is referencing a dependency (glossary). So either it'll always need to be loaded or we'd define a way to know that it needs to be loaded for this content.

2. As a global entity that find's the word in the page's html?

    ```html
       <glossary root="content">
         <entry id="deplete">...</entry>
       </glossary>
       ...
       <checkbox label="hi there deplete"></checkbox>
    ```
Then wait for the dom to render - then dig through the dom looking for the word - and hooking up the glossary. There's a risk that it may interfere with content that we don't want it to interfere with? Will it work with shadowDom?
