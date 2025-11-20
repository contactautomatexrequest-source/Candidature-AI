# Configuration des emails de confirmation Supabase

## Problème résolu

Les liens de confirmation d'email ne fonctionnaient pas car l'URL de redirection n'était pas configurée correctement.

## Solution implémentée

1. **Page de callback créée** : `/auth/callback`
2. **URL de redirection ajoutée** lors de l'inscription
3. **Gestion automatique** des tokens de confirmation

## Configuration requise dans Supabase Dashboard

### 1. Aller dans Authentication → URL Configuration

1. Va sur [supabase.com](https://supabase.com) → Ton projet
2. Va dans **Authentication** → **URL Configuration**

### 2. Ajouter les URLs autorisées

Dans **Site URL**, ajoute :
```
https://candidatureai.netlify.app
```

Dans **Redirect URLs**, ajoute :
```
https://candidatureai.netlify.app/auth/callback
https://candidatureai.netlify.app/**
```

### 3. Vérifier les templates d'email

1. Va dans **Authentication** → **Email Templates**
2. Vérifie que le template **Confirm signup** contient bien le lien de confirmation
3. Le lien devrait ressembler à : `{{ .ConfirmationURL }}`

## Test

1. Crée un nouveau compte depuis `/compte?mode=signup`
2. Vérifie que l'email de confirmation est reçu
3. Clique sur le lien dans l'email
4. Tu devrais être redirigé vers `/auth/callback` puis automatiquement vers `/compte`

## Dépannage

### Le lien ne fonctionne toujours pas

1. Vérifie que les URLs sont bien configurées dans Supabase Dashboard
2. Vérifie que `NEXT_PUBLIC_APP_URL` est bien configuré dans Netlify
3. Vérifie les logs dans Supabase Dashboard → Logs → Auth

### L'email n'arrive pas

1. Vérifie les spams
2. Vérifie que l'email SMTP est configuré dans Supabase (Settings → Auth → SMTP Settings)
3. En développement, vérifie les logs Supabase pour voir les emails envoyés

