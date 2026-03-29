<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="DinoCards — Estude com repetição espaçada">
    <title>DinoCards</title>

    {{-- Google Fonts --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lexend:wght@400;500;600;700&display=swap" rel="stylesheet">

    {{-- Google Material Icons (used by class="material-icons") --}}
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    {{-- Google Material Symbols Outlined (used by class="material-symbols-outlined") --}}
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">

    {{-- PWA Manifest & Theme --}}
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#09090b">
    <link rel="icon" type="image/png" href="/icons/logo.png">
    <link rel="apple-touch-icon" href="/icons/logo.png">

    {{-- Vite Assets --}}
    @viteReactRefresh
    @vite('resources/js/main.jsx')
</head>
<body>
    <div id="root"></div>
</body>
</html>
