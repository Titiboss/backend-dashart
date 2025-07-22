# 🎨 DashArt Backend

**DashArt** est une application interactive permettant de visualiser et analyser la popularité d'œuvres d'art provenant de deux musées : le **Musée du Louvre** et le **Musée Guimet**. Ce dépôt contient le **backend Node.js** de l'application, qui fournit des données, collecte les interactions utilisateurs, et génère des statistiques en temps réel.

---

## 🚀 Fonctionnalités principales

- ✅ API REST construite avec **Koa.js**
- 📷 Récupération des liens d’images des œuvres d’art
- 📈 Suivi des clics/vues par œuvre
- 🧠 Génération de statistiques :
  - Œuvres les plus populaires
  - Requêtes les plus récentes
  - Musées les plus visités
  - Distribution des vues (faible, moyenne, élevée)
- 💾 Données persistées via fichiers JSON

---

## 🛠️ Technologies

- **Node.js** + **Koa.js**
- **Ramda** et **Lodash** pour la manipulation fonctionnelle des données
- **fs-extra** pour la gestion des fichiers
- **koa-logger**, **koa-router**, **koa-bodyparser**, **CORS**

---

## 📁 Structure des données

```bash

├── datasets/
│   ├── ImageLinksLouvres.json       # Liens d’images du Louvre
│   └── ImageLinksGuimet.json        # Liens d’images du Guimet
├── data/
│   ├── clickCountsLouvres.json      # Données de clics Louvre
│   └── clickCountsGuimet.json       # Données de clics Guimet
├── dashart-backend.js               # Serveur principal
