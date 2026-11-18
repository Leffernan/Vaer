# Vêrmelding

Bygdebladet si vising av vêrvarsel frå Yr for Vestnes, Haram, Stordal, Skodje og Ørskog.

## Innbygging i nettavisa

Lim inn heile blokka i HTML-feltet i artikkelen.

```html
<div data-bb-vaer>
  <iframe
    src="https://leffernan.github.io/Vaer/"
    title="Vêrmelding frå Bygdebladet"
    height="1440"
    style="display:block;width:100%;border:0;background:#F7F3E9"
  ></iframe>
</div>
<script src="https://leffernan.github.io/Vaer/embed-host.js" defer></script>
```

Ramma tilpassar høgda etter breidda på artikkelen. «Sjå langtidsvarsel» opnar varselet i eit eige vindauge over artikkelen.

Korta for det neste døgnet og langtidsvarsla kjem frå [Yr sine vêrmodular](https://developer.yr.no/doc/guides/available-widgets/).
