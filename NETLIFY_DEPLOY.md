# Guide de déploiement sur Netlify

## Prérequis

1. Un compte Netlify (gratuit)
2. Un compte GitHub/GitLab/Bitbucket (pour connecter le repo)
3. Toutes les variables d'environnement prêtes

## Étapes de déploiement

### 1. Préparer le repository Git

```bash
# S'assurer que tout est commité
git add .
git commit -m "Préparation déploiement Netlify"
git push
```

### 2. Connecter le projet à Netlify

1. Va sur [netlify.com](https://netlify.com) et connecte-toi
2. Clique sur **"Add new site"** → **"Import an existing project"**
3. Connecte ton repository (GitHub/GitLab/Bitbucket)
4. Sélectionne le repository `soiree-app`

### 3. Configuration du build

Netlify devrait détecter automatiquement :
- **Build command** : `pnpm build`
- **Publish directory** : `.next`
- **Plugin** : `@netlify/plugin-nextjs` (installé automatiquement)

### 4. Variables d'environnement

Dans les paramètres du site Netlify, va dans **Site settings** → **Environment variables** et ajoute :

```
NEXT_PUBLIC_SUPABASE_URL=ton-url-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton-anon-key-supabase
SUPABASE_SERVICE_ROLE_KEY=ton-service-role-key-supabase
OPENAI_API_KEY=sk-proj-ton-openai-api-key
STRIPE_SECRET_KEY=sk_live_ton-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_ton-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_ton-stripe-publishable-key
NEXT_PUBLIC_APP_URL=https://ton-site.netlify.app
```

⚠️ **Important** : Remplace `NEXT_PUBLIC_APP_URL` par l'URL réelle de ton site Netlify après le premier déploiement.

### 5. Configuration du webhook Stripe

Une fois le site déployé :

1. Va dans **Site settings** → **Functions** → note l'URL de base
2. Va sur [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
3. Ajoute un endpoint : `https://ton-site.netlify.app/api/stripe/webhook`
4. Sélectionne les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie le **Signing secret** et mets-le dans les variables d'environnement Netlify

### 6. Déployer

1. Clique sur **"Deploy site"**
2. Netlify va installer les dépendances et builder le projet
3. Une fois terminé, tu auras une URL du type : `https://random-name-123.netlify.app`

### 7. Mettre à jour NEXT_PUBLIC_APP_URL

1. Copie l'URL de ton site Netlify
2. Va dans **Site settings** → **Environment variables**
3. Mets à jour `NEXT_PUBLIC_APP_URL` avec cette URL
4. Redéploie (ou attends le prochain commit)

## Vérifications post-déploiement

- [ ] Le site charge correctement
- [ ] L'authentification Supabase fonctionne
- [ ] La génération IA fonctionne
- [ ] Le checkout Stripe fonctionne
- [ ] Les webhooks Stripe sont configurés
- [ ] L'export PDF fonctionne

## Commandes utiles

```bash
# Build local pour tester
pnpm build

# Tester le build localement
pnpm start

# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
```

## Dépannage

### Build échoue
- Vérifie que toutes les dépendances sont dans `package.json`
- Vérifie les logs de build dans Netlify

### Erreurs 500
- Vérifie les variables d'environnement
- Vérifie les logs dans **Site settings** → **Functions logs**

### Webhooks Stripe ne fonctionnent pas
- Vérifie que l'URL du webhook est correcte
- Vérifie que `STRIPE_WEBHOOK_SECRET` est correct
- Teste avec Stripe CLI en local d'abord

