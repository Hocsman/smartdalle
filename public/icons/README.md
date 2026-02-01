# Icônes PWA SmartDalle

Dépose tes fichiers PNG ici avec ces noms exacts :

| Fichier | Taille | Usage |
|---------|--------|-------|
| `icon-72x72.png` | 72x72 | Android legacy |
| `icon-96x96.png` | 96x96 | Android legacy |
| `icon-128x128.png` | 128x128 | Chrome Web Store |
| `icon-144x144.png` | 144x144 | iOS / Windows |
| `icon-152x152.png` | 152x152 | iPad |
| `icon-192x192.png` | 192x192 | Android (requis) |
| `icon-384x384.png` | 384x384 | Android splash |
| `icon-512x512.png` | 512x512 | Android (requis) / PWA |

## Conseils

1. **Format** : PNG avec transparence
2. **Safe zone** : Pour les icônes "maskable", garde une marge de 10% sur les bords
3. **Couleur de fond** : Noir `#0a0a0a` ou transparent
4. **Outil recommandé** : [PWA Asset Generator](https://github.com/nicholasbraun/pwa-asset-generator)

```bash
npx pwa-asset-generator ./logo.png ./public/icons --background "#0a0a0a" --padding "10%"
```

## Apple Touch Icon

Copie aussi `icon-192x192.png` en tant que `/public/apple-icon.png` pour iOS.
