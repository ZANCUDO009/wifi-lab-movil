# Wi-Fi Lab · App Android

Este proyecto empaqueta el simulador web (carpeta `www/`) como app Android con Capacitor.
El APK se compila **en GitHub Actions** (no necesitas Android Studio).

- Cambios hechos para móvil: exportar/guardar archivos con la hoja «Compartir» de Android,
  sin selección de texto ni «tirar para refrescar», márgenes seguros y color de barra.
- Icono y pantalla de inicio: carpeta `assets/` (icon-only, icon-foreground, icon-background, splash).
  Para cambiar el icono, reemplaza esos PNG (1024×1024) y vuelve a subir.
- Para actualizar la app: edita archivos en `www/`, haz commit y GitHub genera un APK nuevo.
